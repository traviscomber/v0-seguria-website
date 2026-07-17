import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { canAccessProperty, getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  sessionId: z.string().uuid(),
})

export async function GET(request: NextRequest, context: { params: Promise<{ deviceId: string }> }) {
  const auth = await getCurrentAuthSession()
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const { deviceId } = await context.params
  const parsed = querySchema.safeParse({
    sessionId: request.nextUrl.searchParams.get('sessionId'),
  })
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Sesion invalida.' }, { status: 400 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })

  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .select('id, organization_id, property_id, kind')
    .eq('id', deviceId)
    .eq('kind', 'camera')
    .maybeSingle()

  if (deviceError || !device) return NextResponse.json({ success: false, error: 'Camara no encontrada.' }, { status: 404 })
  if (!canAccessProperty(auth.user, device.property_id)) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 403 })
  }

  const now = new Date().toISOString()
  const { data: session, error: sessionError } = await supabase
    .from('camera_stream_sessions')
    .select('id, requested_by, status, expires_at')
    .eq('id', parsed.data.sessionId)
    .eq('device_id', device.id)
    .eq('property_id', device.property_id)
    .eq('organization_id', device.organization_id)
    .in('status', ['requested', 'active'])
    .gt('expires_at', now)
    .maybeSingle()

  if (sessionError || !session) {
    return NextResponse.json({ success: false, error: 'Vista no disponible.' }, { status: 404 })
  }

  const isRequester = session.requested_by === auth.user.id
  const isStaff = auth.user.role === 'admin' || auth.user.role === 'technician'
  if (!isRequester && !isStaff) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 403 })
  }

  const { data: snapshot, error: snapshotError } = await supabase
    .from('camera_snapshots')
    .select('object_path, captured_at, mime_type')
    .eq('device_id', device.id)
    .order('captured_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (snapshotError || !snapshot) {
    return NextResponse.json({ success: false, error: 'Sin imagen disponible.' }, { status: 404 })
  }

  const { data: frame, error: frameError } = await supabase.storage
    .from('seguria-evidence')
    .download(snapshot.object_path)

  if (frameError || !frame) {
    return NextResponse.json({ success: false, error: 'Imagen no disponible.' }, { status: 503 })
  }

  const bytes = await frame.arrayBuffer()
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Type': snapshot.mime_type || frame.type || 'image/jpeg',
      'Content-Length': String(bytes.byteLength),
      'X-Seguria-Captured-At': snapshot.captured_at,
    },
  })
}

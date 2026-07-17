import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { canAccessProperty, getCurrentAuthSession } from '@/lib/auth-store'
import { getCameraStreamHlsObjectPath, isSafeHlsFileName } from '@/lib/camera-stream'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  sessionId: z.string().uuid(),
})

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ deviceId: string; segment: string }> }
) {
  const auth = await getCurrentAuthSession()
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const { deviceId, segment } = await context.params
  const parsed = querySchema.safeParse({ sessionId: request.nextUrl.searchParams.get('sessionId') })
  if (!parsed.success || !isSafeHlsFileName(segment)) {
    return NextResponse.json({ success: false, error: 'Segmento invalido.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })

  const { data: device } = await supabase
    .from('devices')
    .select('id, organization_id, property_id, kind')
    .eq('id', deviceId)
    .eq('kind', 'camera')
    .maybeSingle()

  if (!device) return NextResponse.json({ success: false, error: 'Camara no encontrada.' }, { status: 404 })
  if (!canAccessProperty(auth.user, device.property_id)) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 403 })

  const { data: session } = await supabase
    .from('camera_stream_sessions')
    .select('id, requested_by, status, expires_at')
    .eq('id', parsed.data.sessionId)
    .eq('device_id', device.id)
    .eq('property_id', device.property_id)
    .eq('organization_id', device.organization_id)
    .in('status', ['requested', 'active'])
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!session) return NextResponse.json({ success: false, error: 'Vista no disponible.' }, { status: 404 })
  const isStaff = auth.user.role === 'admin' || auth.user.role === 'technician'
  if (session.requested_by !== auth.user.id && !isStaff) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 403 })

  const objectPath = getCameraStreamHlsObjectPath(device.organization_id, device.property_id, session.id, segment)
  const { data, error } = await supabase.storage.from('seguria-evidence').download(objectPath)
  if (error || !data) return NextResponse.json({ success: false, error: 'Segmento no disponible.' }, { status: 404 })

  const bytes = await data.arrayBuffer()
  return new NextResponse(bytes, {
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Type': 'video/mp2t',
      'Content-Length': String(bytes.byteLength),
    },
  })
}

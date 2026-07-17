import { NextRequest, NextResponse } from 'next/server'
import { canAccessProperty, getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: Promise<{ deviceId: string }> }) {
  const auth = await getCurrentAuthSession()
  if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const { deviceId } = await context.params
  const admin = createSupabaseAdminClient()
  if (!admin) return NextResponse.json({ error: 'Servicio no configurado.' }, { status: 503 })

  const { data: device } = await admin
    .from('devices')
    .select('id, property_id')
    .eq('id', deviceId)
    .eq('kind', 'camera')
    .maybeSingle()
  if (!device) return NextResponse.json({ error: 'Camara no encontrada.' }, { status: 404 })
  if (!canAccessProperty(auth.user, device.property_id)) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })

  const { data: snapshot } = await admin
    .from('camera_snapshots')
    .select('object_path, captured_at, mime_type')
    .eq('device_id', device.id)
    .order('captured_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!snapshot) return NextResponse.json({ error: 'Sin imagen disponible.' }, { status: 404 })

  const { data: image, error } = await admin.storage
    .from('seguria-evidence')
    .download(snapshot.object_path)
  if (error || !image) return NextResponse.json({ error: 'Imagen no disponible.' }, { status: 503 })

  return new NextResponse(image, {
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Type': snapshot.mime_type || image.type || 'image/jpeg',
      'X-Seguria-Captured-At': snapshot.captured_at,
    },
  })
}

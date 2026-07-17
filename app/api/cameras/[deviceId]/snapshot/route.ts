import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: Promise<{ deviceId: string }> }) {
  const auth = await getCurrentAuthSession()
  if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const { deviceId } = await context.params
  const supabase = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()
  if (!supabase || !admin) return NextResponse.json({ error: 'Servicio no configurado.' }, { status: 503 })

  const { data: device } = await supabase
    .from('devices')
    .select('id')
    .eq('id', deviceId)
    .eq('kind', 'camera')
    .maybeSingle()
  if (!device) return NextResponse.json({ error: 'Camara no encontrada.' }, { status: 404 })

  const { data: snapshot } = await supabase
    .from('camera_snapshots')
    .select('object_path, captured_at')
    .eq('device_id', device.id)
    .order('captured_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!snapshot) return NextResponse.json({ error: 'Sin imagen disponible.' }, { status: 404 })

  const { data: signed, error } = await admin.storage
    .from('seguria-evidence')
    .createSignedUrl(snapshot.object_path, 60)
  if (error) return NextResponse.json({ error: 'Imagen no disponible.' }, { status: 503 })

  return NextResponse.json(
    { data: { url: signed.signedUrl, capturedAt: snapshot.captured_at } },
    { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
  )
}

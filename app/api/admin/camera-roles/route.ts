import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const roleSchema = z.object({
  deviceId: z.string().uuid(),
  role: z.enum(['security', 'wildlife', 'mixed']),
})

export async function PATCH(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'camera.role.manage' })
  if (guard) return guard

  const auth = await getAuthorizedRequest(request, ['admin'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsed = roleSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Rol de camara invalido.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .select('id, organization_id, property_id, kind, metadata')
    .eq('id', parsed.data.deviceId)
    .maybeSingle()

  if (deviceError) {
    console.error('Camera role lookup failed:', deviceError.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar la camara.' }, { status: 500 })
  }
  if (!device || device.kind !== 'camera') {
    return NextResponse.json({ success: false, error: 'Camara no encontrada.' }, { status: 404 })
  }

  const metadata = device.metadata && typeof device.metadata === 'object' && !Array.isArray(device.metadata)
    ? { ...(device.metadata as Record<string, unknown>) }
    : {}
  metadata.camera_role = parsed.data.role

  const { data: updated, error: updateError } = await supabase
    .from('devices')
    .update({ metadata })
    .eq('id', device.id)
    .select('id, name, external_id, metadata, updated_at')
    .single()

  if (updateError) {
    console.error('Camera role update failed:', updateError.message)
    return NextResponse.json({ success: false, error: 'No fue posible actualizar el rol de la camara.' }, { status: 500 })
  }

  await supabase.from('audit_log').insert({
    organization_id: device.organization_id,
    property_id: device.property_id,
    actor_user_id: auth.user.id,
    action: 'camera.role.updated',
    target_type: 'device',
    target_id: device.id,
    payload: { cameraRole: parsed.data.role },
  })

  return NextResponse.json({ success: true, data: updated, message: 'Rol de camara actualizado.' })
}

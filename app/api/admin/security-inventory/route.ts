import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { canAccessProperty } from '@/lib/auth-store'
import { getAccessiblePortalSites } from '@/lib/client-portal'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  try {
    const sites = await getAccessiblePortalSites(auth.user)
    return NextResponse.json({
      properties: sites.map((site) => ({ id: site.propertyId, name: site.label })),
      spaces: sites.flatMap((site) => site.spaces.map((space) => ({ ...space, propertyId: site.propertyId }))),
      devices: sites.flatMap((site) => site.devices),
    })
  } catch (error) {
    console.error('Security inventory query failed', error)
    return NextResponse.json({ error: 'No fue posible cargar el inventario seguro.' }, { status: 503 })
  }
}

const assignmentSchema = z.object({
  deviceId: z.string().uuid(),
  spaceId: z.string().uuid().nullable(),
})

export async function PATCH(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'security_inventory.assign_space' })
  if (guard) return guard

  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const parsed = assignmentSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Datos invalidos.' }, { status: 400 })

  const supabase = await createSupabaseServerClient()
  if (!supabase) return NextResponse.json({ error: 'Servicio no configurado.' }, { status: 503 })

  const { data: currentDevice, error: currentError } = await supabase
    .from('devices')
    .select('id, organization_id, property_id, space_id, name, kind, status')
    .eq('id', parsed.data.deviceId)
    .maybeSingle()

  if (currentError) {
    console.error('Device lookup before space assignment failed', currentError)
    return NextResponse.json({ error: 'No fue posible leer el equipo.' }, { status: 400 })
  }
  if (!currentDevice) return NextResponse.json({ error: 'Equipo no encontrado.' }, { status: 404 })
  if (!canAccessProperty(auth.user, currentDevice.property_id)) {
    return NextResponse.json({ error: 'No autorizado para este sitio.' }, { status: 403 })
  }

  if (parsed.data.spaceId) {
    const { data: targetSpace, error: spaceError } = await supabase
      .from('spaces')
      .select('id')
      .eq('id', parsed.data.spaceId)
      .eq('property_id', currentDevice.property_id)
      .maybeSingle()

    if (spaceError) {
      console.error('Target space lookup before assignment failed', spaceError)
      return NextResponse.json({ error: 'No fue posible validar el espacio.' }, { status: 400 })
    }
    if (!targetSpace) return NextResponse.json({ error: 'El espacio no pertenece a este sitio.' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('devices')
    .update({ space_id: parsed.data.spaceId })
    .eq('id', parsed.data.deviceId)
    .select('id, space_id')
    .maybeSingle()

  if (error) {
    console.error('Device space assignment failed', error)
    return NextResponse.json({ error: 'No fue posible asignar el espacio.' }, { status: 400 })
  }
  if (!data) return NextResponse.json({ error: 'Equipo no encontrado.' }, { status: 404 })

  const auditClient = createSupabaseAdminClient()
  if (auditClient) {
    const { error: auditError } = await auditClient.from('audit_log').insert({
      organization_id: currentDevice.organization_id,
      property_id: currentDevice.property_id,
      actor_user_id: auth.user.id,
      actor_label: auth.user.email || 'staff',
      action: 'device.space_assigned',
      target_type: 'device',
      target_id: currentDevice.id,
      payload: {
        deviceName: currentDevice.name,
        deviceKind: currentDevice.kind,
        deviceStatus: currentDevice.status,
        previousSpaceId: currentDevice.space_id,
        nextSpaceId: parsed.data.spaceId,
      },
    })

    if (auditError) {
      console.error('Device space assignment audit failed', auditError)
      return NextResponse.json({ error: 'Espacio asignado, pero no fue posible registrar auditoria.' }, { status: 500 })
    }
  }

  return NextResponse.json({ data })
}

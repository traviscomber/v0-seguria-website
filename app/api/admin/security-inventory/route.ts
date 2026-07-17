import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { getAccessiblePortalSites } from '@/lib/client-portal'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
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

  return NextResponse.json({ data })
}

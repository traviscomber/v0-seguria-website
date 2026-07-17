import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { canAccessProperty } from '@/lib/auth-store'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const updateSchema = z.object({
  incidentId: z.string().uuid(),
  status: z.enum(['new', 'validating', 'confirmed', 'responding', 'resolved', 'false_alarm']).optional(),
  assignedTo: z.string().uuid().optional(),
  note: z.string().trim().max(2000).optional(),
}).refine((value) => value.status || value.assignedTo || value.note, 'No changes requested')

async function getVisibleOperatorIds(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  auth: NonNullable<Awaited<ReturnType<typeof getAuthorizedRequest>>>
) {
  if (auth.user.role === 'admin') return null
  if (auth.user.clientIds.length === 0) return new Set<string>([auth.user.id])

  const { data } = await supabase
    .from('memberships')
    .select('user_id')
    .in('organization_id', auth.user.clientIds)
    .in('role', ['owner', 'admin', 'operator', 'technician'])

  return new Set<string>([auth.user.id, ...((data || []).map((row) => row.user_id as string))])
}

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  if (auth.user.role !== 'admin' && auth.user.propertyIds.length === 0) {
    return NextResponse.json({ success: true, data: { incidents: [], operators: [] } })
  }

  let incidentsQuery = supabase
    .from('incidents')
    .select('id,organization_id,property_id,assigned_to,title,description,severity,status,acknowledged_at,resolved_at,created_at,updated_at,properties(name,address),incident_actions(id,actor_user_id,actor_label,action_type,from_status,to_status,comment,created_at),notifications(id,status,due_at,acknowledged_at,escalated_at,recipient_user_id)')
    .order('created_at', { ascending: false })
    .limit(300)

  if (auth.user.role !== 'admin') incidentsQuery = incidentsQuery.in('property_id', auth.user.propertyIds)

  const [{ data: incidents, error }, usersResult] = await Promise.all([
    incidentsQuery,
    supabase.auth.admin.listUsers({ page: 1, perPage: 500 }),
  ])
  if (error) return NextResponse.json({ success: false, error: 'No fue posible cargar los incidentes.' }, { status: 500 })

  const visibleOperatorIds = await getVisibleOperatorIds(supabase, auth)
  const operators = (usersResult.data?.users || [])
    .filter((user) => ['admin', 'technician'].includes(user.app_metadata?.platform_role) || visibleOperatorIds?.has(user.id))
    .filter((user) => !visibleOperatorIds || visibleOperatorIds.has(user.id))
    .map((user) => ({ id: user.id, email: user.email, name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Operador' }))
  return NextResponse.json({ success: true, data: { incidents, operators } })
}

export async function PATCH(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'incident.manage' })
  if (guard) return guard

  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  const parsed = updateSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Cambio invalido.' }, { status: 400 })
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { data: incident } = await supabase
    .from('incidents')
    .select('id, property_id')
    .eq('id', parsed.data.incidentId)
    .maybeSingle()

  if (!incident) return NextResponse.json({ success: false, error: 'Incidente no encontrado.' }, { status: 404 })
  if (!canAccessProperty(auth.user, incident.property_id)) {
    return NextResponse.json({ success: false, error: 'No autorizado para este sitio.' }, { status: 403 })
  }

  if (parsed.data.assignedTo && auth.user.role !== 'admin') {
    const visibleOperatorIds = await getVisibleOperatorIds(supabase, auth)
    if (!visibleOperatorIds?.has(parsed.data.assignedTo)) {
      return NextResponse.json({ success: false, error: 'Responsable fuera del alcance del tecnico.' }, { status: 403 })
    }
  }

  const { data, error } = await supabase.rpc('manage_incident', {
    target_incident_id: parsed.data.incidentId,
    actor_user_id: auth.user.id,
    requested_status: parsed.data.status || null,
    requested_assignee: parsed.data.assignedTo || null,
    note: parsed.data.note || null,
  })
  if (error) {
    console.error('Incident update failed:', error.message)
    const invalid = error.message.includes('transition') || error.message.includes('authorized')
    return NextResponse.json({ success: false, error: invalid ? 'La transicion o asignacion no esta permitida.' : 'No fue posible actualizar el incidente.' }, { status: invalid ? 409 : 500 })
  }
  return NextResponse.json({ success: true, data, message: 'Incidente actualizado.' })
}

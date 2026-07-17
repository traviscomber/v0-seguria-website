import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const updateSchema = z.object({
  incidentId: z.string().uuid(),
  status: z.enum(['new', 'validating', 'confirmed', 'responding', 'resolved', 'false_alarm']).optional(),
  assignedTo: z.string().uuid().optional(),
  note: z.string().trim().max(2000).optional(),
}).refine((value) => value.status || value.assignedTo || value.note, 'No changes requested')

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const [{ data: incidents, error }, usersResult] = await Promise.all([
    supabase.from('incidents').select('id,organization_id,property_id,assigned_to,title,description,severity,status,acknowledged_at,resolved_at,created_at,updated_at,properties(name,address),incident_actions(id,actor_user_id,actor_label,action_type,from_status,to_status,comment,created_at),notifications(id,status,due_at,acknowledged_at,escalated_at,recipient_user_id)').order('created_at', { ascending: false }).limit(300),
    supabase.auth.admin.listUsers({ page: 1, perPage: 500 }),
  ])
  if (error) return NextResponse.json({ success: false, error: 'No fue posible cargar los incidentes.' }, { status: 500 })

  const operators = (usersResult.data?.users || []).filter((user) => ['admin', 'technician'].includes(user.app_metadata?.platform_role)).map((user) => ({ id: user.id, email: user.email, name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Operador' }))
  return NextResponse.json({ success: true, data: { incidents, operators } })
}

export async function PATCH(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'incident.manage' })
  if (guard) return guard

  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  const parsed = updateSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Cambio inválido.' }, { status: 400 })
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

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
    return NextResponse.json({ success: false, error: invalid ? 'La transición o asignación no está permitida.' : 'No fue posible actualizar el incidente.' }, { status: invalid ? 409 : 500 })
  }
  return NextResponse.json({ success: true, data, message: 'Incidente actualizado.' })
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const assignmentSchema = z.object({
  leadId: z.string().uuid(),
  owner: z.string().trim().max(160).nullable().optional(),
  assignToMe: z.boolean().optional().default(false),
})

type CrmActivity = {
  type: string
  at: string
  by: string
  fromOwner?: string
  toOwner?: string
}

const MAX_CRM_ACTIVITY_EVENTS = 100

export async function PATCH(request: NextRequest) {
  try {
    const guard = getOperationalGuardResponse({ operation: 'lead.assign' })
    if (guard) return guard

    const auth = await getAuthorizedRequest(request, ['admin'])
    if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

    const parsed = assignmentSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Datos de asignación inválidos.' }, { status: 400 })

    const supabase = createSupabaseAdminClient()
    if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

    const { data: current, error: readError } = await supabase
      .from('leads')
      .select('id,message')
      .eq('id', parsed.data.leadId)
      .maybeSingle()

    if (readError) throw readError
    if (!current) return NextResponse.json({ success: false, error: 'Solicitud no encontrada.' }, { status: 404 })

    let details: Record<string, unknown> = {}
    try { details = current.message ? JSON.parse(String(current.message)) : {} } catch { details = { mensaje: current.message || '' } }

    const actor = auth.user.email || auth.user.id
    const previousOwner = String(details.crmOwner || '')
    const requestedOwner = parsed.data.assignToMe ? actor : String(parsed.data.owner || '').trim()
    const now = new Date().toISOString()
    const previousActivity = Array.isArray(details.crmActivityLog) ? details.crmActivityLog as CrmActivity[] : []
    const changed = previousOwner !== requestedOwner
    const nextActivity = changed
      ? [...previousActivity, { type: 'owner_changed', at: now, by: actor, fromOwner: previousOwner, toOwner: requestedOwner }].slice(-MAX_CRM_ACTIVITY_EVENTS)
      : previousActivity

    const { data, error } = await supabase
      .from('leads')
      .update({
        message: JSON.stringify({
          ...details,
          crmOwner: requestedOwner,
          crmUpdatedAt: now,
          crmUpdatedBy: actor,
          crmLastActivityAt: changed ? now : details.crmLastActivityAt || null,
          crmActivityLog: nextActivity,
        }),
        updated_at: now,
      })
      .eq('id', parsed.data.leadId)
      .select('id,name,email,phone,property_type,message,source,status,created_at,updated_at')
      .single()

    if (error) throw error

    return NextResponse.json(
      { success: true, data, owner: requestedOwner },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0, must-revalidate' } },
    )
  } catch (error) {
    console.error('Error assigning lead:', error)
    return NextResponse.json({ success: false, error: 'No fue posible asignar la solicitud.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const ALERT_STATUSES = ['open', 'acknowledged', 'resolved', 'dismissed'] as const
const ALERT_SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'] as const

const actionSchema = z.object({
  alertId: z.string().uuid(),
  action: z.enum(['acknowledge', 'resolve', 'dismiss', 'reopen']),
  note: z.string().trim().max(1000).optional().nullable(),
})

type AlertStatus = typeof ALERT_STATUSES[number]

function nextStatus(action: z.infer<typeof actionSchema>['action']): AlertStatus {
  if (action === 'acknowledge') return 'acknowledged'
  if (action === 'resolve') return 'resolved'
  if (action === 'dismiss') return 'dismissed'
  return 'open'
}

function transitionAllowed(current: AlertStatus, action: z.infer<typeof actionSchema>['action']) {
  if (action === 'acknowledge') return current === 'open'
  if (action === 'resolve' || action === 'dismiss') return current === 'open' || current === 'acknowledged'
  return current === 'resolved' || current === 'dismissed'
}

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const limitParam = Number(request.nextUrl.searchParams.get('limit') || 50)
  const limit = Number.isFinite(limitParam) ? Math.min(100, Math.max(1, Math.trunc(limitParam))) : 50

  let query = supabase
    .from('seguria_alerts')
    .select('id, module, alert_type, severity, status, source_type, source_id, camera_id, title, summary, zone_label, detected_at, payload, acknowledged_at, resolved_at, created_at, updated_at, wildlife_cameras(code, name, zone_label)')
    .eq('owner_user_id', auth.user.id)
    .order('detected_at', { ascending: false })
    .limit(limit)

  const moduleName = request.nextUrl.searchParams.get('module')?.trim()
  if (moduleName) query = query.eq('module', moduleName)

  const status = request.nextUrl.searchParams.get('status')
  if (status === 'active') query = query.in('status', ['open', 'acknowledged'])
  else if (status && ALERT_STATUSES.includes(status as AlertStatus)) query = query.eq('status', status)

  const severity = request.nextUrl.searchParams.get('severity')
  if (severity && ALERT_SEVERITIES.includes(severity as typeof ALERT_SEVERITIES[number])) query = query.eq('severity', severity)

  const cameraId = request.nextUrl.searchParams.get('camera_id')
  if (cameraId && z.string().uuid().safeParse(cameraId).success) query = query.eq('camera_id', cameraId)

  const { data, error } = await query
  if (error) {
    console.error('SegurIA alert listing failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar las alertas.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: data || [] })
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsed = actionSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Accion invalida.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { data: current, error: loadError } = await supabase
    .from('seguria_alerts')
    .select('id, status')
    .eq('id', parsed.data.alertId)
    .eq('owner_user_id', auth.user.id)
    .maybeSingle()

  if (loadError) {
    console.error('SegurIA alert transition load failed:', loadError.message)
    return NextResponse.json({ success: false, error: 'No fue posible verificar la alerta.' }, { status: 500 })
  }
  if (!current) return NextResponse.json({ success: false, error: 'Alerta no encontrada.' }, { status: 404 })

  const currentStatus = current.status as AlertStatus
  if (!transitionAllowed(currentStatus, parsed.data.action)) {
    return NextResponse.json({ success: false, error: 'La alerta ya no admite esa transicion.' }, { status: 409 })
  }

  const now = new Date().toISOString()
  const status = nextStatus(parsed.data.action)
  const payload: Record<string, unknown> = { status, updated_at: now }

  if (parsed.data.action === 'acknowledge') {
    payload.acknowledged_by_user_id = auth.user.id
    payload.acknowledged_at = now
  }
  if (parsed.data.action === 'resolve' || parsed.data.action === 'dismiss') {
    payload.resolved_by_user_id = auth.user.id
    payload.resolved_at = now
  }
  if (parsed.data.action === 'reopen') {
    payload.acknowledged_by_user_id = null
    payload.acknowledged_at = null
    payload.resolved_by_user_id = null
    payload.resolved_at = null
  }

  const { data, error } = await supabase
    .from('seguria_alerts')
    .update(payload)
    .eq('id', parsed.data.alertId)
    .eq('owner_user_id', auth.user.id)
    .select('id, module, alert_type, severity, status, source_type, source_id, camera_id, title, summary, zone_label, detected_at, payload, acknowledged_at, resolved_at, created_at, updated_at, wildlife_cameras(code, name, zone_label)')
    .single()

  if (error) {
    console.error('SegurIA alert transition failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible actualizar la alerta.' }, { status: 500 })
  }

  const action = parsed.data.action === 'acknowledge'
    ? 'acknowledged'
    : parsed.data.action === 'resolve'
      ? 'resolved'
      : parsed.data.action === 'dismiss'
        ? 'dismissed'
        : 'reopened'

  const { error: activityError } = await supabase.from('seguria_alert_activity').insert({
    alert_id: parsed.data.alertId,
    actor_user_id: auth.user.id,
    action,
    previous_status: currentStatus,
    new_status: status,
    note: parsed.data.note || null,
    metadata: { source: 'seguria-alert-api-v1' },
  })
  if (activityError) console.error('SegurIA alert activity insert failed:', activityError.message)

  return NextResponse.json({ success: true, data })
}

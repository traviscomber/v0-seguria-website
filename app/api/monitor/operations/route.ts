import { NextRequest, NextResponse } from 'next/server'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { secretsMatch } from '@/lib/secret-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'monitor.operations', requireProductionDeployment: true })
  if (guard) return guard

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const authorized = secretsMatch(token, process.env.CRON_SECRET) || secretsMatch(token, process.env.SEGURIA_MONITOR_SECRET)
  if (!authorized) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })
  const now = new Date()
  const expiredDeploymentBefore = new Date(now.getTime() - 10 * 60 * 1000).toISOString()
  const [gateways, notifications] = await Promise.all([
    supabase.rpc('mark_stale_gateways', { stale_before: new Date(now.getTime() - 3 * 60 * 1000).toISOString() }),
    supabase.rpc('escalate_overdue_notifications', { check_at: now.toISOString() }),
  ])
  const error = gateways.error || notifications.error
  if (error) {
    console.error('Operations monitor failed:', error.message)
    return NextResponse.json({ success: false, error: 'Monitor no disponible.' }, { status: 500 })
  }
  const { data: expiredAutomations, error: expiredError } = await supabase
    .from('property_automations')
    .select('id,organization_id,property_id,desired_status,deployment_requested_at')
    .eq('status', 'ready')
    .not('deployment_token', 'is', null)
    .lte('deployment_requested_at', expiredDeploymentBefore)

  if (expiredError) {
    console.error('Automation rollback scan failed:', expiredError.message)
    return NextResponse.json({ success: false, error: 'Monitor no disponible.' }, { status: 500 })
  }

  for (const automation of expiredAutomations || []) {
    const reason = 'Rollback automatico: el sitio no confirmo el despliegue dentro de 10 minutos.'
    const { data: gateway } = await supabase
      .from('gateways')
      .select('id')
      .eq('organization_id', automation.organization_id)
      .eq('property_id', automation.property_id)
      .in('status', ['online', 'degraded', 'offline'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const { data: run } = await supabase.from('automation_runs').insert({
      organization_id: automation.organization_id,
      property_id: automation.property_id,
      automation_id: automation.id,
      result: 'failed',
      details: { rollback: true, source: 'monitor', reason, desiredStatus: automation.desired_status, deploymentRequestedAt: automation.deployment_requested_at },
      completed_at: now.toISOString(),
    }).select('id').single()
    await supabase.from('property_automations').update({
      status: 'error',
      desired_status: null,
      deployment_token: null,
      deployment_requested_at: null,
      last_error: reason,
    }).eq('id', automation.id)
    if (gateway) {
      await supabase.from('audit_log').insert({
        organization_id: automation.organization_id,
        property_id: automation.property_id,
        actor_gateway_id: gateway.id,
        action: 'automation.rollback_timeout',
        target_type: 'property_automation',
        target_id: automation.id,
        payload: { run_id: run?.id, reason },
      })
    }
  }

  return NextResponse.json({ success: true, data: { gatewaysMarkedOffline: gateways.data || 0, notificationsEscalated: notifications.data || 0, automationsRolledBack: expiredAutomations?.length || 0 } })
}

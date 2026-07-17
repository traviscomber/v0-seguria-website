import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { verifyGatewayCredential } from '@/lib/secret-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const acknowledgementSchema = z.object({
  automationId: z.string().uuid(),
  deploymentToken: z.string().uuid(),
  result: z.enum(['applied', 'failed']),
  message: z.string().trim().max(500).optional(),
})

async function authorize(request: NextRequest) {
  const publicId = request.headers.get('x-seguria-gateway-id')
  if (!(await verifyGatewayCredential(publicId, request.headers.get('x-seguria-gateway-secret')))) return null
  const supabase = createSupabaseAdminClient()
  if (!supabase || !publicId) return null
  const { data } = await supabase.from('gateways').select('id,organization_id,property_id').eq('public_id', publicId).single()
  return data ? { supabase, gateway: data } : null
}

export async function GET(request: NextRequest) {
  const auth = await authorize(request)
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  const { data, error } = await auth.supabase
    .from('property_automations')
    .select('id,name,config,desired_status,deployment_token,deployment_requested_at,automation_templates(template_key,trigger_kind,version)')
    .eq('organization_id', auth.gateway.organization_id)
    .eq('property_id', auth.gateway.property_id)
    .eq('status', 'ready')
    .not('deployment_token', 'is', null)
    .order('deployment_requested_at')
  if (error) return NextResponse.json({ success: false, error: 'No fue posible cargar la configuración.' }, { status: 500 })
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'gateway.automation_acknowledge' })
  if (guard) return guard

  const auth = await authorize(request)
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  const parsed = acknowledgementSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Confirmación inválida.' }, { status: 400 })

  const { data: automation } = await auth.supabase
    .from('property_automations')
    .select('id,organization_id,property_id,desired_status,deployment_token,automation_templates(version)')
    .eq('id', parsed.data.automationId)
    .eq('organization_id', auth.gateway.organization_id)
    .eq('property_id', auth.gateway.property_id)
    .eq('deployment_token', parsed.data.deploymentToken)
    .single()
  if (!automation) return NextResponse.json({ success: false, error: 'Despliegue no encontrado o ya confirmado.' }, { status: 404 })

  const applied = parsed.data.result === 'applied'
  const now = new Date().toISOString()
  const nextStatus = applied ? automation.desired_status : 'error'
  const template = Array.isArray(automation.automation_templates)
    ? automation.automation_templates[0]
    : automation.automation_templates
  const { error } = await auth.supabase.from('property_automations').update({
    status: nextStatus,
    deployed_version: applied ? template?.version : null,
    last_deployed_at: applied ? now : null,
    last_error: applied ? null : parsed.data.message || 'La instalación rechazó el cambio.',
    desired_status: null,
    deployment_token: null,
  }).eq('id', automation.id)
  if (error) return NextResponse.json({ success: false, error: 'No fue posible confirmar el despliegue.' }, { status: 500 })

  const { data: run } = await auth.supabase.from('automation_runs').insert({
    organization_id: automation.organization_id,
    property_id: automation.property_id,
    automation_id: automation.id,
    result: applied ? 'executed' : 'failed',
    details: { deployment: true, message: parsed.data.message || null },
    completed_at: now,
  }).select('id').single()
  await auth.supabase.from('audit_log').insert({
    organization_id: automation.organization_id,
    property_id: automation.property_id,
    actor_gateway_id: auth.gateway.id,
    action: applied ? 'automation.deployment_applied' : 'automation.deployment_failed',
    target_type: 'property_automation',
    target_id: automation.id,
    payload: { run_id: run?.id, message: parsed.data.message || null },
  })
  return NextResponse.json({ success: true, message: applied ? 'Despliegue confirmado.' : 'Falla registrada.' })
}

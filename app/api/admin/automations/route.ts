import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { securityAutomationLibrary } from '@/lib/automation-templates'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const commandSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('seed'), organizationId: z.string().uuid() }),
  z.object({ action: z.literal('create'), propertyId: z.string().uuid(), templateId: z.string().uuid(), name: z.string().trim().min(3).max(120), config: z.record(z.unknown()).default({}) }),
  z.object({ action: z.literal('deploy'), automationId: z.string().uuid(), desiredStatus: z.enum(['active', 'paused']) }),
  z.object({ action: z.literal('rollback'), automationId: z.string().uuid(), reason: z.string().trim().max(500).optional() }),
  z.object({ action: z.literal('simulate'), automationId: z.string().uuid() }),
])

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })
  const [organizations, properties, templates, automations, runs] = await Promise.all([
    supabase.from('organizations').select('id,name').eq('status', 'active').order('name'),
    supabase.from('properties').select('id,organization_id,name,address,status').order('name'),
    supabase.from('automation_templates').select('*').order('name'),
    supabase.from('property_automations').select('*,automation_templates(name,description,trigger_kind,version),properties(name),automation_runs(id,result,started_at,completed_at)').order('updated_at', { ascending: false }),
    supabase.from('automation_runs').select('id,automation_id,result,details,started_at,completed_at').order('started_at', { ascending: false }).limit(50),
  ])
  const error = organizations.error || properties.error || templates.error || automations.error || runs.error
  if (error) return NextResponse.json({ success: false, error: 'No fue posible cargar las automatizaciones.' }, { status: 500 })
  return NextResponse.json({ success: true, data: { organizations: organizations.data, properties: properties.data, templates: templates.data, automations: automations.data, runs: runs.data } })
}

export async function POST(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'automation.mutate' })
  if (guard) return guard

  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  const parsed = commandSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Comando inválido.' }, { status: 400 })
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  if (parsed.data.action === 'seed') {
    const organizationId = parsed.data.organizationId
    const rows = securityAutomationLibrary.map((template) => ({ ...template, organization_id: organizationId, created_by: auth.user.id }))
    const { error } = await supabase.from('automation_templates').upsert(rows, { onConflict: 'organization_id,template_key,version', ignoreDuplicates: true })
    if (error) return NextResponse.json({ success: false, error: 'No fue posible preparar las plantillas.' }, { status: 500 })
    return NextResponse.json({ success: true, message: 'Biblioteca de reglas preparada.' })
  }

  if (parsed.data.action === 'create') {
    const { data: property } = await supabase.from('properties').select('id,organization_id').eq('id', parsed.data.propertyId).single()
    const { data: template } = await supabase.from('automation_templates').select('id,organization_id,default_config').eq('id', parsed.data.templateId).single()
    if (!property || !template || property.organization_id !== template.organization_id) return NextResponse.json({ success: false, error: 'La plantilla no pertenece a este sitio.' }, { status: 409 })
    const { data, error } = await supabase.from('property_automations').insert({ organization_id: property.organization_id, property_id: property.id, template_id: template.id, name: parsed.data.name, config: { ...(template.default_config || {}), ...parsed.data.config }, created_by: auth.user.id }).select().single()
    if (error) return NextResponse.json({ success: false, error: error.code === '23505' ? 'La regla ya existe para este sitio.' : 'No fue posible crear la regla.' }, { status: error.code === '23505' ? 409 : 500 })
    await supabase.from('audit_log').insert({ organization_id: property.organization_id, property_id: property.id, actor_user_id: auth.user.id, action: 'automation.created', target_type: 'property_automation', target_id: data.id, payload: { template_id: template.id } })
    return NextResponse.json({ success: true, data, message: 'Regla creada en borrador.' })
  }

  const { data: automation } = await supabase.from('property_automations').select('*,automation_templates(version,name)').eq('id', parsed.data.automationId).single()
  if (!automation) return NextResponse.json({ success: false, error: 'Regla no encontrada.' }, { status: 404 })

  if (parsed.data.action === 'simulate') {
    const now = new Date().toISOString()
    const { data, error } = await supabase.from('automation_runs').insert({ organization_id: automation.organization_id, property_id: automation.property_id, automation_id: automation.id, result: 'simulated', details: { safe: true, config: automation.config, predictedAction: 'Crear alerta y registrar respuesta local; no se envió ningún comando.' }, completed_at: now }).select().single()
    if (error) return NextResponse.json({ success: false, error: 'No fue posible simular la regla.' }, { status: 500 })
    await supabase.from('property_automations').update({ last_run_at: now }).eq('id', automation.id)
    await supabase.from('audit_log').insert({ organization_id: automation.organization_id, property_id: automation.property_id, actor_user_id: auth.user.id, action: 'automation.simulated', target_type: 'property_automation', target_id: automation.id, payload: { run_id: data.id } })
    return NextResponse.json({ success: true, data, message: 'Simulación segura completada.' })
  }

  if (parsed.data.action === 'rollback') {
    const now = new Date().toISOString()
    const reason = parsed.data.reason || 'Rollback manual: despliegue cancelado antes de confirmacion del sitio.'
    const { data, error } = await supabase.from('property_automations').update({ status: 'error', desired_status: null, deployment_token: null, deployment_requested_at: null, last_error: reason }).eq('id', automation.id).select().single()
    if (error) return NextResponse.json({ success: false, error: 'No fue posible revertir la regla.' }, { status: 500 })
    const { data: run } = await supabase.from('automation_runs').insert({ organization_id: automation.organization_id, property_id: automation.property_id, automation_id: automation.id, result: 'failed', details: { rollback: true, source: 'admin', reason }, completed_at: now }).select('id').single()
    await supabase.from('audit_log').insert({ organization_id: automation.organization_id, property_id: automation.property_id, actor_user_id: auth.user.id, action: 'automation.rollback_manual', target_type: 'property_automation', target_id: automation.id, payload: { run_id: run?.id, reason } })
    return NextResponse.json({ success: true, data, message: 'Rollback registrado. La regla quedo bloqueada hasta nueva revision.' })
  }

  if (automation.status === 'ready' && automation.deployment_token) {
    return NextResponse.json({ success: false, error: 'Ya existe un despliegue pendiente. Confirma, espera vencimiento o ejecuta rollback.' }, { status: 409 })
  }

  const { count } = await supabase.from('gateways').select('id', { count: 'exact', head: true }).eq('property_id', automation.property_id).in('status', ['online', 'degraded'])
  if (!count) return NextResponse.json({ success: false, error: 'El sitio necesita un gateway operativo para recibir este cambio.' }, { status: 409 })
  const deploymentToken = crypto.randomUUID()
  const { data, error } = await supabase.from('property_automations').update({ status: 'ready', desired_status: parsed.data.desiredStatus, deployment_token: deploymentToken, deployment_requested_at: new Date().toISOString(), last_error: null }).eq('id', automation.id).select().single()
  if (error) return NextResponse.json({ success: false, error: 'No fue posible preparar el despliegue.' }, { status: 500 })
  await supabase.from('audit_log').insert({ organization_id: automation.organization_id, property_id: automation.property_id, actor_user_id: auth.user.id, action: 'automation.deployment_requested', target_type: 'property_automation', target_id: automation.id, payload: { desired_status: parsed.data.desiredStatus } })
  return NextResponse.json({ success: true, data, message: 'Cambio enviado. Quedará confirmado cuando el sitio responda.' })
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveWildlifeAccess, writeTerritorialAudit } from '@/lib/wildlife/server-access'

const toggleSchema = z.object({ enabled: z.boolean() })

async function loadDemoState(operationId: string) {
  const supabase = createSupabaseAdminClient()
  if (!supabase) return { data: null, error: new Error('Base de datos no configurada.') }

  const [profile, cameras, jobs, batches, alerts, evaluations] = await Promise.all([
    supabase
      .from('wildlife_demo_profiles')
      .select('enabled, version, updated_at')
      .eq('operation_id', operationId)
      .maybeSingle(),
    supabase
      .from('wildlife_cameras')
      .select('id', { count: 'exact', head: true })
      .eq('operation_id', operationId)
      .eq('is_demo', true),
    supabase
      .from('wildlife_inference_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('operation_id', operationId)
      .eq('is_demo', true),
    supabase
      .from('wildlife_pilot_batches')
      .select('id', { count: 'exact', head: true })
      .eq('operation_id', operationId)
      .eq('is_demo', true),
    supabase
      .from('seguria_alerts')
      .select('id', { count: 'exact', head: true })
      .eq('operation_id', operationId)
      .eq('is_demo', true),
    supabase
      .from('wildlife_evaluation_sets')
      .select('id', { count: 'exact', head: true })
      .eq('operation_id', operationId)
      .eq('is_demo', true),
  ])

  const firstError = profile.error || cameras.error || jobs.error || batches.error || alerts.error || evaluations.error
  if (firstError) return { data: null, error: firstError }

  return {
    data: {
      enabled: Boolean(profile.data?.enabled),
      version: profile.data?.version || 'huilo-huilo-v1',
      updatedAt: profile.data?.updated_at || null,
      counts: {
        cameras: cameras.count || 0,
        jobs: jobs.count || 0,
        batches: batches.count || 0,
        alerts: alerts.count || 0,
        evaluationSets: evaluations.count || 0,
      },
    },
    error: null,
  }
}

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const access = await resolveWildlifeAccess(auth, request.nextUrl.searchParams.get('operation_id'))
  if (!access.operationId) {
    return NextResponse.json({ success: true, data: { available: false, enabled: false, canManage: false } })
  }

  const available = access.operationName?.toLocaleLowerCase('es-CL').includes('huilo huilo') ?? false
  if (!available) {
    return NextResponse.json({ success: true, data: { available: false, enabled: false, canManage: false } })
  }

  const state = await loadDemoState(access.operationId)
  if (state.error) {
    console.error('Wildlife demo state load failed:', state.error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar el modo demo.' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data: {
      available: true,
      canManage: access.capabilities.manageMembers,
      operationId: access.operationId,
      operationName: access.operationName,
      ...state.data,
    },
  })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const access = await resolveWildlifeAccess(auth)
  if (!access.operationId || !access.operationName?.toLocaleLowerCase('es-CL').includes('huilo huilo')) {
    return NextResponse.json({ success: false, error: 'El modo demo solo esta disponible para Huilo Huilo.' }, { status: 409 })
  }
  if (!access.capabilities.manageMembers) {
    return NextResponse.json({ success: false, error: 'Solo propietarios y administradores pueden cambiar el modo demo.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = toggleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Estado demo invalido.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { data, error } = await supabase.rpc('set_huilo_huilo_demo_mode', {
    p_operation_id: access.operationId,
    p_actor_user_id: auth.user.id,
    p_enabled: parsed.data.enabled,
  })

  if (error) {
    console.error('Wildlife demo mode update failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible actualizar los datos demo.' }, { status: 500 })
  }

  await writeTerritorialAudit({
    request,
    auth,
    access,
    action: parsed.data.enabled ? 'demo.enabled' : 'demo.disabled',
    resourceType: 'wildlife_demo_dataset',
    payload: { version: 'huilo-huilo-v1', result: data },
  })

  const state = await loadDemoState(access.operationId)
  if (state.error) {
    return NextResponse.json({ success: true, data: { enabled: parsed.data.enabled, canManage: true } })
  }

  return NextResponse.json({
    success: true,
    data: {
      available: true,
      canManage: true,
      operationId: access.operationId,
      operationName: access.operationName,
      ...state.data,
    },
  })
}

import { NextRequest, NextResponse } from 'next/server'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  buildQualityReport,
  type QualityCameraInput,
  type QualityJobInput,
} from '@/lib/wildlife/quality-diagnostics'

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const requestedDays = Number(request.nextUrl.searchParams.get('days') || 30)
  const days = Number.isFinite(requestedDays) ? Math.min(365, Math.max(7, Math.trunc(requestedDays))) : 30
  const from = new Date(Date.now() - days * 86400000).toISOString()
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const [cameraResult, jobResult] = await Promise.all([
    supabase
      .from('wildlife_cameras')
      .select('id, code, name, zone_label, active')
      .eq('created_by_user_id', auth.user.id)
      .order('code', { ascending: true }),
    supabase
      .from('wildlife_inference_jobs')
      .select('id, camera_id, status, result_json, error_code, captured_at, created_at')
      .eq('submitted_by_user_id', auth.user.id)
      .gte('created_at', from)
      .order('created_at', { ascending: false })
      .limit(5000),
  ])

  if (cameraResult.error) {
    console.error('Wildlife quality camera load failed:', cameraResult.error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar las camaras.' }, { status: 500 })
  }
  if (jobResult.error) {
    console.error('Wildlife quality job load failed:', jobResult.error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar la evidencia.' }, { status: 500 })
  }

  const cameras = (cameraResult.data || []) as QualityCameraInput[]
  const jobs = (jobResult.data || []) as QualityJobInput[]
  const report = buildQualityReport(cameras, jobs)

  return NextResponse.json({
    success: true,
    data: {
      periodDays: days,
      from,
      generatedAt: new Date().toISOString(),
      unassignedAnalyses: jobs.filter((job) => !job.camera_id).length,
      ...report,
    },
  })
}

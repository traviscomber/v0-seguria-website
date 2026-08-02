import { NextRequest, NextResponse } from 'next/server'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveWildlifeAccess } from '@/lib/wildlife/server-access'

type Detection = {
  species?: unknown
  confidence?: unknown
}

type JobRow = {
  status: 'queued' | 'processing' | 'completed' | 'failed'
  review_status: 'pending' | 'confirmed' | 'corrected' | 'rejected' | 'unidentifiable'
  result_json: { detections?: Detection[] } | null
  created_at: string
}

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const access = await resolveWildlifeAccess(auth, request.nextUrl.searchParams.get('operation_id'))
  if (!access.capabilities.viewEvidence) {
    return NextResponse.json({ success: false, error: 'Tu rol no permite consultar metricas.' }, { status: 403 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const daysParam = Number(request.nextUrl.searchParams.get('days') || 30)
  const days = Number.isFinite(daysParam) ? Math.min(365, Math.max(1, Math.trunc(daysParam))) : 30
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from('wildlife_inference_jobs')
    .select('status, review_status, result_json, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(5000)

  query = access.operationId
    ? query.eq('operation_id', access.operationId)
    : query.eq('submitted_by_user_id', auth.user.id)

  const { data, error } = await query

  if (error) {
    console.error('Wildlife metrics load failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible calcular las metricas.' }, { status: 500 })
  }

  const jobs = (data || []) as JobRow[]
  const status = { queued: 0, processing: 0, completed: 0, failed: 0 }
  const review = { pending: 0, confirmed: 0, corrected: 0, rejected: 0, unidentifiable: 0 }
  const species = new Map<string, { detections: number; confidenceTotal: number; confidenceCount: number }>()
  let detectionsTotal = 0

  for (const job of jobs) {
    status[job.status] += 1
    review[job.review_status] += 1

    for (const detection of job.result_json?.detections || []) {
      const name = typeof detection.species === 'string' && detection.species.trim()
        ? detection.species.trim()
        : 'unknown_animal'
      const confidence = typeof detection.confidence === 'number' && Number.isFinite(detection.confidence)
        ? Math.min(1, Math.max(0, detection.confidence))
        : null
      const current = species.get(name) || { detections: 0, confidenceTotal: 0, confidenceCount: 0 }
      current.detections += 1
      if (confidence !== null) {
        current.confidenceTotal += confidence
        current.confidenceCount += 1
      }
      species.set(name, current)
      detectionsTotal += 1
    }
  }

  const completed = status.completed
  const reviewed = review.confirmed + review.corrected + review.rejected + review.unidentifiable
  const estimatedUnitCost = Number(process.env.OPENAI_VISION_ESTIMATED_COST_USD)
  const costPerAnalysisUsd = Number.isFinite(estimatedUnitCost) && estimatedUnitCost >= 0
    ? estimatedUnitCost
    : null

  return NextResponse.json({
    success: true,
    data: {
      period_days: days,
      generated_at: new Date().toISOString(),
      totals: {
        analyses: jobs.length,
        completed,
        failed: status.failed,
        detections: detectionsTotal,
        reviewed,
        pending_review: review.pending,
      },
      rates: {
        completion: jobs.length ? completed / jobs.length : 0,
        failure: jobs.length ? status.failed / jobs.length : 0,
        review: completed ? reviewed / completed : 0,
      },
      status,
      review,
      species: Array.from(species.entries())
        .map(([name, value]) => ({
          name,
          detections: value.detections,
          average_confidence: value.confidenceCount
            ? value.confidenceTotal / value.confidenceCount
            : null,
        }))
        .sort((a, b) => b.detections - a.detections || a.name.localeCompare(b.name)),
      cost: {
        configured: costPerAnalysisUsd !== null,
        estimated_cost_per_analysis_usd: costPerAnalysisUsd,
        estimated_total_usd: costPerAnalysisUsd === null ? null : completed * costPerAnalysisUsd,
      },
    },
    access: {
      operationId: access.operationId,
      operationName: access.operationName,
      role: access.role,
    },
  })
}

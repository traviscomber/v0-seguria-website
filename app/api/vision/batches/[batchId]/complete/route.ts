import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const paramsSchema = z.object({ batchId: z.string().uuid() })

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ batchId: string }> },
) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsedParams = paramsSchema.safeParse(await context.params)
  if (!parsedParams.success) {
    return NextResponse.json({ success: false, error: 'Lote invalido.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { batchId } = parsedParams.data
  const { data: batch, error: batchError } = await supabase
    .from('wildlife_pilot_batches')
    .select('id, status')
    .eq('id', batchId)
    .eq('created_by_user_id', auth.user.id)
    .maybeSingle()

  if (batchError) {
    console.error('Wildlife pilot completion lookup failed:', batchError.message)
    return NextResponse.json({ success: false, error: 'No fue posible verificar el lote.' }, { status: 500 })
  }
  if (!batch) return NextResponse.json({ success: false, error: 'Lote no encontrado.' }, { status: 404 })
  if (batch.status === 'cancelled') return NextResponse.json({ success: false, error: 'El lote esta cancelado.' }, { status: 409 })

  const { data: jobs, error: jobsError } = await supabase
    .from('wildlife_inference_jobs')
    .select('id, status, review_status')
    .eq('pilot_batch_id', batchId)
    .eq('submitted_by_user_id', auth.user.id)

  if (jobsError) {
    console.error('Wildlife pilot completion jobs failed:', jobsError.message)
    return NextResponse.json({ success: false, error: 'No fue posible verificar los analisis.' }, { status: 500 })
  }

  const rows = jobs || []
  const active = rows.filter((job) => ['queued', 'processing'].includes(job.status)).length
  const pendingReview = rows.filter((job) => job.status === 'completed' && job.review_status === 'pending').length
  const failed = rows.filter((job) => job.status === 'failed').length

  const criteria = {
    hasAnalyses: rows.length > 0,
    noActiveProcessing: active === 0,
    allCompletedReviewed: pendingReview === 0,
  }

  if (!criteria.hasAnalyses || !criteria.noActiveProcessing || !criteria.allCompletedReviewed) {
    return NextResponse.json({
      success: false,
      error: !criteria.hasAnalyses
        ? 'El lote no tiene analisis.'
        : !criteria.noActiveProcessing
          ? 'Todavia existen imagenes en procesamiento.'
          : 'Todavia existen analisis pendientes de revision.',
      data: { criteria, totals: { total: rows.length, active, pendingReview, failed } },
    }, { status: 409 })
  }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('wildlife_pilot_batches')
    .update({ status: 'completed', completed_at: now, updated_at: now })
    .eq('id', batchId)
    .eq('created_by_user_id', auth.user.id)
    .select('id, status, completed_at')
    .single()

  if (error) {
    console.error('Wildlife pilot completion update failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cerrar el lote.' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data: {
      ...data,
      criteria,
      totals: { total: rows.length, active, pendingReview, failed },
    },
  })
}

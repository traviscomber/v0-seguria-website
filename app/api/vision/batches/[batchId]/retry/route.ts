import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveWildlifeAccess, writeTerritorialAudit } from '@/lib/wildlife/server-access'

export const runtime = 'nodejs'
export const maxDuration = 60

const retrySchema = z.object({ jobId: z.string().uuid() })

type CameraRelation = {
  code?: string | null
  name?: string | null
  zone_label?: string | null
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ batchId: string }> },
) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const access = await resolveWildlifeAccess(auth)
  if (!access.capabilities.processEvidence) {
    return NextResponse.json({ success: false, error: 'Tu rol no permite reintentar analisis.' }, { status: 403 })
  }

  const { batchId } = await context.params
  if (!z.string().uuid().safeParse(batchId).success) {
    return NextResponse.json({ success: false, error: 'Lote invalido.' }, { status: 400 })
  }

  const parsed = retrySchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Analisis invalido.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  let batchQuery = supabase
    .from('wildlife_pilot_batches')
    .select('id, status')
    .eq('id', batchId)

  batchQuery = access.operationId
    ? batchQuery.eq('operation_id', access.operationId)
    : batchQuery.eq('created_by_user_id', auth.user.id)

  const { data: batch, error: batchError } = await batchQuery.maybeSingle()

  if (batchError) return NextResponse.json({ success: false, error: 'No fue posible verificar el lote.' }, { status: 500 })
  if (!batch) return NextResponse.json({ success: false, error: 'Lote no encontrado.' }, { status: 404 })
  if (['completed', 'cancelled'].includes(batch.status)) {
    return NextResponse.json({ success: false, error: 'El lote esta cerrado.' }, { status: 409 })
  }

  let jobQuery = supabase
    .from('wildlife_inference_jobs')
    .select('id, original_filename, mime_type, storage_bucket, storage_path, camera_id, zone_label, captured_at, status, wildlife_cameras(code, name, zone_label)')
    .eq('id', parsed.data.jobId)
    .eq('pilot_batch_id', batchId)

  jobQuery = access.operationId
    ? jobQuery.eq('operation_id', access.operationId)
    : jobQuery.eq('submitted_by_user_id', auth.user.id)

  const { data: job, error: jobError } = await jobQuery.maybeSingle()

  if (jobError) return NextResponse.json({ success: false, error: 'No fue posible verificar el analisis.' }, { status: 500 })
  if (!job) return NextResponse.json({ success: false, error: 'Analisis no encontrado en este lote.' }, { status: 404 })
  if (job.status !== 'failed') return NextResponse.json({ success: false, error: 'Solo se pueden reintentar analisis fallidos.' }, { status: 409 })
  if (!job.storage_bucket || !job.storage_path || !job.mime_type) {
    return NextResponse.json({ success: false, error: 'El analisis no tiene evidencia recuperable.' }, { status: 409 })
  }

  const { data: evidence, error: downloadError } = await supabase.storage
    .from(job.storage_bucket)
    .download(job.storage_path)

  if (downloadError || !evidence) {
    console.error('Wildlife batch retry evidence download failed:', downloadError?.message)
    return NextResponse.json({ success: false, error: 'No fue posible recuperar la evidencia.' }, { status: 500 })
  }

  const cameraRelation = job.wildlife_cameras as CameraRelation | CameraRelation[] | null
  const camera = Array.isArray(cameraRelation) ? cameraRelation[0] || null : cameraRelation
  const headers = new Headers({
    'x-image-content-type': job.mime_type,
    'x-image-filename': encodeURIComponent(job.original_filename),
  })
  const cookie = request.headers.get('cookie')
  const authorization = request.headers.get('authorization')
  if (cookie) headers.set('cookie', cookie)
  if (authorization) headers.set('authorization', authorization)
  if (camera?.code) headers.set('x-camera-code', encodeURIComponent(camera.code))
  if (camera?.name) headers.set('x-camera-name', encodeURIComponent(camera.name))
  if (job.zone_label || camera?.zone_label) headers.set('x-zone-label', encodeURIComponent(job.zone_label || camera?.zone_label || ''))
  if (job.captured_at) headers.set('x-captured-at', job.captured_at)

  const upstream = await fetch(new URL('/api/vision/openai/infer-with-metadata', request.nextUrl.origin), {
    method: 'POST',
    headers,
    body: Buffer.from(await evidence.arrayBuffer()),
    cache: 'no-store',
  })
  const payload = await upstream.json() as Record<string, unknown>
  const retriedJobId = typeof payload.job_id === 'string' ? payload.job_id : job.id

  let attachQuery = supabase
    .from('wildlife_inference_jobs')
    .update({ pilot_batch_id: batchId, operation_id: access.operationId, updated_at: new Date().toISOString() })
    .eq('id', retriedJobId)

  attachQuery = access.operationId
    ? attachQuery.eq('operation_id', access.operationId)
    : attachQuery.eq('submitted_by_user_id', auth.user.id)

  const { error: attachError } = await attachQuery
  if (attachError) console.error('Wildlife batch retry reassociation failed:', attachError.message)

  const { error: auditError } = await supabase.from('wildlife_ai_audit_log').insert({
    job_id: retriedJobId,
    actor_user_id: auth.user.id,
    action: 'pilot_batch_retry',
    old_values: { status: job.status, batch_id: batchId },
    new_values: { upstream_status: upstream.status, batch_id: batchId },
  })
  if (auditError) console.error('Wildlife batch retry audit failed:', auditError.message)

  await writeTerritorialAudit({
    request,
    auth,
    access,
    action: 'pilot_batch.retry',
    resourceType: 'wildlife_inference_job',
    resourceId: retriedJobId,
    payload: { batchId, upstreamStatus: upstream.status },
  })

  return NextResponse.json({
    success: upstream.ok,
    data: payload,
    error: upstream.ok ? null : String(payload.message || payload.error || 'No fue posible completar el reintento.'),
  }, { status: upstream.status })
}

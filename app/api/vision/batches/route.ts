import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const createSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).optional().nullable(),
  zoneLabel: z.string().trim().max(160).optional().nullable(),
  targetImageCount: z.number().int().min(1).max(100).default(100),
  cameraId: z.string().uuid().optional().nullable(),
})

const patchSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('attach_job'),
    batchId: z.string().uuid(),
    jobId: z.string().uuid(),
  }),
  z.object({
    action: z.literal('set_status'),
    batchId: z.string().uuid(),
    status: z.enum(['draft', 'processing', 'completed', 'cancelled']),
  }),
])

type Detection = { species?: unknown; confidence?: unknown }
type JobRow = {
  id: string
  original_filename: string
  status: string
  review_status: string
  result_json: { detections?: Detection[] } | null
  error_code: string | null
  error_message: string | null
  estimated_cost_usd: number | string | null
  latency_ms: number | null
  created_at: string
  updated_at: string
}

type BatchRow = {
  id: string
  name: string
  description: string | null
  zone_label: string | null
  target_image_count: number
  status: string
  camera_id: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  wildlife_cameras?: { code?: string | null; name?: string | null; zone_label?: string | null } | Array<{ code?: string | null; name?: string | null; zone_label?: string | null }> | null
  wildlife_inference_jobs?: JobRow[] | null
}

function summarizeBatch(batch: BatchRow) {
  const jobs = batch.wildlife_inference_jobs || []
  const species = new Map<string, number>()
  let detections = 0
  let emptyFrames = 0
  let unidentifiable = 0
  let totalLatency = 0
  let latencySamples = 0
  let estimatedCostUsd = 0

  for (const job of jobs) {
    const jobDetections = Array.isArray(job.result_json?.detections) ? job.result_json?.detections || [] : []
    for (const detection of jobDetections) {
      const name = typeof detection.species === 'string' ? detection.species : 'unknown_animal'
      species.set(name, (species.get(name) || 0) + 1)
      detections += 1
      if (name === 'empty_frame') emptyFrames += 1
      if (name === 'unknown_animal') unidentifiable += 1
    }
    const numericCost = Number(job.estimated_cost_usd)
    if (Number.isFinite(numericCost) && numericCost >= 0) estimatedCostUsd += numericCost
    if (typeof job.latency_ms === 'number' && job.latency_ms >= 0) {
      totalLatency += job.latency_ms
      latencySamples += 1
    }
  }

  return {
    ...batch,
    jobs,
    summary: {
      total: jobs.length,
      completed: jobs.filter((job) => job.status === 'completed').length,
      failed: jobs.filter((job) => job.status === 'failed').length,
      processing: jobs.filter((job) => ['queued', 'processing'].includes(job.status)).length,
      pendingReview: jobs.filter((job) => job.status === 'completed' && job.review_status === 'pending').length,
      reviewed: jobs.filter((job) => job.review_status !== 'pending').length,
      detections,
      emptyFrames,
      unidentifiable,
      estimatedCostUsd,
      averageLatencyMs: latencySamples ? Math.round(totalLatency / latencySamples) : null,
      species: Array.from(species.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((left, right) => right.count - left.count),
    },
  }
}

async function loadBatches(userId: string, batchId?: string | null) {
  const supabase = createSupabaseAdminClient()
  if (!supabase) return { data: null, error: new Error('Base de datos no configurada.') }

  let query = supabase
    .from('wildlife_pilot_batches')
    .select('id, name, description, zone_label, target_image_count, status, camera_id, started_at, completed_at, created_at, updated_at, wildlife_cameras(code, name, zone_label), wildlife_inference_jobs(id, original_filename, status, review_status, result_json, error_code, error_message, estimated_cost_usd, latency_ms, created_at, updated_at)')
    .eq('created_by_user_id', userId)
    .order('created_at', { ascending: false })
    .order('created_at', { referencedTable: 'wildlife_inference_jobs', ascending: false })
    .limit(50)

  if (batchId) query = query.eq('id', batchId)
  const result = await query
  if (result.error) return { data: null, error: result.error }
  return { data: (result.data || []).map((batch) => summarizeBatch(batch as unknown as BatchRow)), error: null }
}

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const batchId = request.nextUrl.searchParams.get('id')
  if (batchId && !z.string().uuid().safeParse(batchId).success) {
    return NextResponse.json({ success: false, error: 'Lote invalido.' }, { status: 400 })
  }

  const loaded = await loadBatches(auth.user.id, batchId)
  if (loaded.error) {
    console.error('Wildlife pilot batch listing failed:', loaded.error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar los lotes.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: loaded.data || [] })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Datos de lote invalidos.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  if (parsed.data.cameraId) {
    const { data: camera, error: cameraError } = await supabase
      .from('wildlife_cameras')
      .select('id')
      .eq('id', parsed.data.cameraId)
      .eq('created_by_user_id', auth.user.id)
      .maybeSingle()
    if (cameraError) return NextResponse.json({ success: false, error: 'No fue posible verificar la camara.' }, { status: 500 })
    if (!camera) return NextResponse.json({ success: false, error: 'Camara no encontrada.' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('wildlife_pilot_batches')
    .insert({
      organization_id: auth.user.clientIds[0] ?? null,
      created_by_user_id: auth.user.id,
      camera_id: parsed.data.cameraId || null,
      name: parsed.data.name,
      description: parsed.data.description || null,
      zone_label: parsed.data.zoneLabel || null,
      target_image_count: parsed.data.targetImageCount,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Wildlife pilot batch creation failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible crear el lote.' }, { status: 500 })
  }

  const loaded = await loadBatches(auth.user.id, data.id)
  return NextResponse.json({ success: true, data: loaded.data?.[0] || { id: data.id } }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsed = patchSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Accion invalida.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { data: batch, error: batchError } = await supabase
    .from('wildlife_pilot_batches')
    .select('id, status, target_image_count, started_at')
    .eq('id', parsed.data.batchId)
    .eq('created_by_user_id', auth.user.id)
    .maybeSingle()

  if (batchError) return NextResponse.json({ success: false, error: 'No fue posible verificar el lote.' }, { status: 500 })
  if (!batch) return NextResponse.json({ success: false, error: 'Lote no encontrado.' }, { status: 404 })

  if (parsed.data.action === 'attach_job') {
    if (['completed', 'cancelled'].includes(batch.status)) {
      return NextResponse.json({ success: false, error: 'El lote esta cerrado.' }, { status: 409 })
    }

    const { data: job, error: jobError } = await supabase
      .from('wildlife_inference_jobs')
      .select('id, pilot_batch_id')
      .eq('id', parsed.data.jobId)
      .eq('submitted_by_user_id', auth.user.id)
      .maybeSingle()

    if (jobError) return NextResponse.json({ success: false, error: 'No fue posible verificar el analisis.' }, { status: 500 })
    if (!job) return NextResponse.json({ success: false, error: 'Analisis no encontrado.' }, { status: 404 })

    if (job.pilot_batch_id !== batch.id) {
      const { count, error: countError } = await supabase
        .from('wildlife_inference_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('pilot_batch_id', batch.id)
      if (countError) return NextResponse.json({ success: false, error: 'No fue posible verificar la capacidad del lote.' }, { status: 500 })
      if ((count || 0) >= batch.target_image_count) {
        return NextResponse.json({ success: false, error: 'El lote alcanzo su cantidad objetivo.' }, { status: 409 })
      }
    }

    const { error: attachError } = await supabase
      .from('wildlife_inference_jobs')
      .update({ pilot_batch_id: batch.id, updated_at: new Date().toISOString() })
      .eq('id', job.id)
      .eq('submitted_by_user_id', auth.user.id)
    if (attachError) return NextResponse.json({ success: false, error: 'No fue posible asociar el analisis al lote.' }, { status: 500 })

    const now = new Date().toISOString()
    const { error: startError } = await supabase
      .from('wildlife_pilot_batches')
      .update({ status: 'processing', started_at: batch.started_at || now, completed_at: null })
      .eq('id', batch.id)
      .eq('created_by_user_id', auth.user.id)
    if (startError) return NextResponse.json({ success: false, error: 'El analisis fue guardado, pero el lote no pudo actualizar su estado.' }, { status: 500 })
  } else {
    if (parsed.data.status === 'completed') {
      const { count, error: activeError } = await supabase
        .from('wildlife_inference_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('pilot_batch_id', batch.id)
        .in('status', ['queued', 'processing'])
      if (activeError) return NextResponse.json({ success: false, error: 'No fue posible verificar el procesamiento activo.' }, { status: 500 })
      if ((count || 0) > 0) return NextResponse.json({ success: false, error: 'Todavia existen imagenes en procesamiento.' }, { status: 409 })
    }

    const now = new Date().toISOString()
    const updates = {
      status: parsed.data.status,
      started_at: parsed.data.status === 'processing' ? batch.started_at || now : batch.started_at,
      completed_at: parsed.data.status === 'completed' ? now : null,
    }
    const { error: statusError } = await supabase
      .from('wildlife_pilot_batches')
      .update(updates)
      .eq('id', batch.id)
      .eq('created_by_user_id', auth.user.id)
    if (statusError) return NextResponse.json({ success: false, error: 'No fue posible actualizar el lote.' }, { status: 500 })
  }

  const loaded = await loadBatches(auth.user.id, batch.id)
  return NextResponse.json({ success: true, data: loaded.data?.[0] || null })
}

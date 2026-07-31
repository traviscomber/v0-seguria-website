import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_IMAGE_BYTES = 12 * 1024 * 1024
const STORAGE_BUCKET = 'wildlife-evidence'
const PROMPT_VERSION = 'seguria-vision-v1'
const PIPELINE_VERSION = 'vision-pipeline-v2'
const MAX_RETRIES = 2
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const detectionSchema = z.object({
  species: z.enum([
    'person', 'vehicle', 'cat', 'dog', 'puma', 'huemul', 'pudu', 'guanaco',
    'vicuña', 'ñandú', 'fox', 'culpeo', 'zorro_chilla', 'zorro_gris_chileno',
    'gato_montés', 'coipu', 'chinchilla', 'vizcacha', 'livestock', 'unknown_animal',
  ]),
  confidence: z.number().min(0).max(1),
  box: z.object({
    x1: z.number().min(0).max(1),
    y1: z.number().min(0).max(1),
    x2: z.number().min(0).max(1),
    y2: z.number().min(0).max(1),
  }),
  description: z.string().max(300),
})

const analysisSchema = z.object({
  detections: z.array(detectionSchema).max(30),
  scene_summary: z.string().max(800),
  operational_risks: z.array(z.string().max(300)).max(10),
  limitations: z.array(z.string().max(300)).max(10),
})

type OpenAiPayload = {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

const speciesAliases: Record<string, z.infer<typeof detectionSchema>['species']> = {
  cougar: 'puma', 'mountain lion': 'puma', 'andean deer': 'huemul',
  'south andean deer': 'huemul', 'dwarf deer': 'pudu', vicuna: 'vicuña',
  nandu: 'ñandú', rhea: 'ñandú', 'culpeo fox': 'culpeo', 'andean fox': 'culpeo',
  chilla: 'zorro_chilla', 'zorro chilla': 'zorro_chilla', 'zorro gris': 'zorro_gris_chileno',
  wildcat: 'gato_montés', nutria: 'coipu', cow: 'livestock', cattle: 'livestock',
  horse: 'livestock', sheep: 'livestock', goat: 'livestock', pig: 'livestock',
  llama: 'livestock', alpaca: 'livestock', donkey: 'livestock', leopard: 'unknown_animal',
  jaguar: 'unknown_animal', bear: 'unknown_animal', wolf: 'unknown_animal',
}

function normalizeAnalysis(outputText: string) {
  const raw = JSON.parse(outputText) as Record<string, unknown>
  const detections = Array.isArray(raw.detections) ? raw.detections : []
  raw.detections = detections
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => {
      const rawSpecies = String(item.species || 'unknown_animal').toLowerCase().trim()
      const box = item.box && typeof item.box === 'object' ? item.box as Record<string, unknown> : {}
      return {
        species: speciesAliases[rawSpecies] ?? rawSpecies,
        confidence: typeof item.confidence === 'number' ? Math.min(1, Math.max(0, item.confidence)) : 0.5,
        box: {
          x1: Math.min(1, Math.max(0, Number(box.x1) || 0)),
          y1: Math.min(1, Math.max(0, Number(box.y1) || 0)),
          x2: Math.min(1, Math.max(0, Number(box.x2) || 1)),
          y2: Math.min(1, Math.max(0, Number(box.y2) || 1)),
        },
        description: String(item.description || '').slice(0, 300),
      }
    })
  raw.operational_risks = Array.isArray(raw.operational_risks)
    ? raw.operational_risks
    : typeof raw.operational_risks === 'string' ? [raw.operational_risks] : []
  raw.limitations = Array.isArray(raw.limitations)
    ? raw.limitations
    : typeof raw.limitations === 'string' ? [raw.limitations] : []
  return analysisSchema.parse(raw)
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function fetchOpenAiWithRetry(apiKey: string, body: unknown) {
  let lastResponse: Response | null = null
  let lastPayload: OpenAiPayload = {}

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = await response.json() as OpenAiPayload
    lastResponse = response
    lastPayload = payload

    if (response.ok || ![408, 429, 500, 502, 503, 504].includes(response.status) || attempt === MAX_RETRIES) {
      return { response, payload, retryCount: attempt }
    }
    await sleep(350 * 2 ** attempt)
  }

  return { response: lastResponse as Response, payload: lastPayload, retryCount: MAX_RETRIES }
}

async function enforceQuota(userId: string, organizationId: string | null) {
  const supabase = createSupabaseAdminClient()
  if (!supabase) return { allowed: true, limit: null as number | null, used: 0 }

  let quotaQuery = supabase
    .from('wildlife_ai_quotas')
    .select('monthly_image_limit')
    .eq('active', true)
    .limit(1)

  quotaQuery = organizationId
    ? quotaQuery.eq('organization_id', organizationId).is('user_id', null)
    : quotaQuery.eq('user_id', userId).is('organization_id', null)

  const { data: quotaRows } = await quotaQuery
  const limit = quotaRows?.[0]?.monthly_image_limit ?? null
  if (limit === null) return { allowed: true, limit: null, used: 0 }

  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)

  let usageQuery = supabase
    .from('wildlife_inference_jobs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', monthStart.toISOString())

  usageQuery = organizationId
    ? usageQuery.eq('organization_id', organizationId)
    : usageQuery.eq('submitted_by_user_id', userId)

  const { count } = await usageQuery
  const used = count ?? 0
  return { allowed: used < limit, limit, used }
}

async function resolveCamera(input: { userId: string; organizationId: string | null; code: string | null; name: string | null; zoneLabel: string | null }) {
  if (!input.code) return null
  const supabase = createSupabaseAdminClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('wildlife_cameras')
    .upsert({
      organization_id: input.organizationId,
      created_by_user_id: input.userId,
      code: input.code,
      name: input.name || input.code,
      zone_label: input.zoneLabel,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'created_by_user_id,code' })
    .select('id')
    .single()
  if (error) {
    console.error('Wildlife camera resolution failed:', error.message)
    return null
  }
  return data.id as string
}

async function storeEvidence(input: { userId: string; sha256: string; mimeType: string; image: Buffer }) {
  const supabase = createSupabaseAdminClient()
  if (!supabase) return null
  const storagePath = `${input.userId}/${input.sha256}.${EXTENSIONS[input.mimeType]}`
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, input.image, {
    contentType: input.mimeType,
    upsert: true,
    cacheControl: '3600',
  })
  if (error) {
    console.error('Wildlife evidence upload failed:', error.message)
    return null
  }
  return { bucket: STORAGE_BUCKET, path: storagePath }
}

async function persistJob(input: {
  userId: string
  organizationId: string | null
  filename: string
  mimeType: string
  byteSize: number
  sha256: string
  model: string
  status: 'completed' | 'failed'
  cameraId: string | null
  zoneLabel: string | null
  capturedAt: string | null
  storageBucket: string | null
  storagePath: string | null
  retryCount: number
  latencyMs: number
  estimatedCostUsd: number | null
  processingStartedAt: string
  processingCompletedAt: string
  result?: unknown
  errorCode?: string
  errorMessage?: string
}) {
  const supabase = createSupabaseAdminClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('wildlife_inference_jobs')
    .upsert({
      submitted_by_user_id: input.userId,
      organization_id: input.organizationId,
      original_filename: input.filename,
      mime_type: input.mimeType,
      byte_size: input.byteSize,
      sha256: input.sha256,
      provider: 'openai',
      model_name: input.model,
      prompt_version: PROMPT_VERSION,
      pipeline_version: PIPELINE_VERSION,
      retry_count: input.retryCount,
      latency_ms: input.latencyMs,
      estimated_cost_usd: input.estimatedCostUsd,
      processing_started_at: input.processingStartedAt,
      processing_completed_at: input.processingCompletedAt,
      status: input.status,
      review_status: 'pending',
      camera_id: input.cameraId,
      zone_label: input.zoneLabel,
      captured_at: input.capturedAt,
      storage_bucket: input.storageBucket,
      storage_path: input.storagePath,
      result_json: input.result ?? null,
      error_code: input.errorCode ?? null,
      error_message: input.errorMessage ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'submitted_by_user_id,sha256,model_name' })
    .select('id')
    .single()
  if (error) {
    console.error('Wildlife inference persistence failed:', error.message)
    return null
  }
  return data.id as string
}

function safeHeader(request: NextRequest, name: string, maxLength: number) {
  const value = request.headers.get(name)?.trim()
  return value ? decodeURIComponent(value).slice(0, maxLength) : null
}

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'openai_not_configured', message: 'OPENAI_API_KEY is required.' }, { status: 503 })

  const contentType = (request.headers.get('x-image-content-type') || '').toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(contentType)) return NextResponse.json({ error: 'unsupported_image_type' }, { status: 422 })

  const image = Buffer.from(await request.arrayBuffer())
  if (image.length === 0 || image.length > MAX_IMAGE_BYTES) return NextResponse.json({ error: 'invalid_image_size' }, { status: 422 })

  const organizationId = auth.user.clientIds[0] ?? null
  const quota = await enforceQuota(auth.user.id, organizationId)
  if (!quota.allowed) {
    return NextResponse.json({ error: 'monthly_quota_exceeded', limit: quota.limit, used: quota.used }, { status: 429 })
  }

  const startedAt = new Date()
  const model = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini'
  const unitCost = Number(process.env.OPENAI_VISION_ESTIMATED_COST_USD)
  const estimatedCostUsd = Number.isFinite(unitCost) && unitCost >= 0 ? unitCost : null
  const filename = decodeURIComponent(request.headers.get('x-image-filename') || 'camera-trap-image').replace(/[\\/\0]/g, '_').slice(0, 240)
  const cameraCode = safeHeader(request, 'x-camera-code', 80)
  const cameraName = safeHeader(request, 'x-camera-name', 160)
  const zoneLabel = safeHeader(request, 'x-zone-label', 160)
  const capturedAtHeader = request.headers.get('x-captured-at')
  const capturedAt = capturedAtHeader && !Number.isNaN(Date.parse(capturedAtHeader)) ? new Date(capturedAtHeader).toISOString() : null
  const sha256 = createHash('sha256').update(image).digest('hex')
  const cameraId = await resolveCamera({ userId: auth.user.id, organizationId, code: cameraCode, name: cameraName, zoneLabel })
  const evidence = await storeEvidence({ userId: auth.user.id, sha256, mimeType: contentType, image })
  const imageUrl = `data:${contentType};base64,${image.toString('base64')}`

  const body = {
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You are SegurIA Vision. Identify only visible Chilean fauna, people, vehicles and livestock. Use the allowed species names. Return valid JSON with detections, scene_summary, operational_risks and limitations. Do not invent hidden objects. Use unknown_animal when uncertain.' },
      { role: 'user', content: [
        { type: 'text', text: 'Analyze this camera-trap image. Return species, confidence, normalized bounding box and description for each visible subject.' },
        { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
      ] },
    ],
    max_tokens: 2000,
  }

  const { response, payload, retryCount } = await fetchOpenAiWithRetry(apiKey, body)
  const completedAt = new Date()
  const latencyMs = completedAt.getTime() - startedAt.getTime()

  if (!response.ok) {
    const message = payload.error?.message || `OpenAI returned ${response.status}`
    const jobId = await persistJob({
      userId: auth.user.id, organizationId, filename, mimeType: contentType,
      byteSize: image.length, sha256, model, status: 'failed', cameraId,
      zoneLabel, capturedAt, storageBucket: evidence?.bucket || null,
      storagePath: evidence?.path || null, retryCount, latencyMs, estimatedCostUsd,
      processingStartedAt: startedAt.toISOString(), processingCompletedAt: completedAt.toISOString(),
      errorCode: 'openai_request_failed', errorMessage: message,
    })
    return NextResponse.json({ error: 'openai_request_failed', message, job_id: jobId, retry_count: retryCount }, { status: 502 })
  }

  const outputText = payload.choices?.[0]?.message?.content
  if (!outputText) return NextResponse.json({ error: 'openai_empty_output' }, { status: 502 })

  let analysis: z.infer<typeof analysisSchema>
  try {
    analysis = normalizeAnalysis(outputText)
  } catch (error) {
    return NextResponse.json({ error: 'openai_invalid_output', message: error instanceof Error ? error.message : 'Invalid structured output' }, { status: 502 })
  }

  const detections = analysis.detections.filter((item) => item.box.x2 > item.box.x1 && item.box.y2 > item.box.y1)
  const result = {
    detections,
    scene_summary: analysis.scene_summary,
    operational_risks: analysis.operational_risks,
    limitations: [...analysis.limitations, 'OpenAI Vision entrega una predicción asistida que requiere validación humana.'],
  }
  const jobId = await persistJob({
    userId: auth.user.id, organizationId, filename, mimeType: contentType,
    byteSize: image.length, sha256, model, status: 'completed', cameraId,
    zoneLabel, capturedAt, storageBucket: evidence?.bucket || null,
    storagePath: evidence?.path || null, retryCount, latencyMs, estimatedCostUsd,
    processingStartedAt: startedAt.toISOString(), processingCompletedAt: completedAt.toISOString(), result,
  })

  return NextResponse.json({
    ok: true,
    job_id: jobId,
    provider: 'openai',
    model_version: model,
    prompt_version: PROMPT_VERSION,
    pipeline_version: PIPELINE_VERSION,
    retry_count: retryCount,
    latency_ms: latencyMs,
    estimated_cost_usd: estimatedCostUsd,
    quota: { limit: quota.limit, used_before_request: quota.used },
    camera_id: cameraId,
    zone_label: zoneLabel,
    captured_at: capturedAt,
    evidence_stored: Boolean(evidence),
    detections_count: detections.length,
    ...result,
    timestamp: completedAt.toISOString(),
  })
}

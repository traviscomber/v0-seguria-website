import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_IMAGE_BYTES = 12 * 1024 * 1024
const STORAGE_BUCKET = 'wildlife-evidence'
const PROMPT_VERSION = 'seguria-vision-v4-huilo-huilo'
const PIPELINE_VERSION = 'vision-pipeline-v5-local-fauna'
const MAX_RETRIES = 2
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const speciesSchema = z.enum([
  'huemul', 'pudu', 'puma', 'culpeo', 'zorro_chilla', 'zorro_gris_chileno', 'fox',
  'guina', 'coipo', 'person', 'vehicle', 'dog', 'cat', 'livestock', 'bird_unknown',
  'empty_frame', 'unknown_animal', 'guanaco', 'vicuña', 'ñandú', 'chinchilla', 'vizcacha',
])

const detectionSchema = z.object({
  species: speciesSchema,
  confidence: z.number().min(0).max(1),
  confidence_source: z.enum(['model', 'heuristic']).optional(),
  model_confidence: z.number().min(0).max(1).nullable().optional(),
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

type DetectionSpecies = z.infer<typeof speciesSchema>
type OpenAiPayload = {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

const speciesAliases: Record<string, DetectionSpecies> = {
  huemul: 'huemul',
  'andean deer': 'huemul',
  'south andean deer': 'huemul',
  'hippocamelus bisulcus': 'huemul',
  pudu: 'pudu',
  'pudu puda': 'pudu',
  'dwarf deer': 'pudu',
  puma: 'puma',
  cougar: 'puma',
  'mountain lion': 'puma',
  'puma concolor': 'puma',
  fox: 'fox',
  zorro: 'fox',
  'chilean fox': 'fox',
  'zorro chileno': 'fox',
  'south american fox': 'fox',
  culpeo: 'culpeo',
  'culpeo fox': 'culpeo',
  'andean fox': 'culpeo',
  'andean zorro': 'culpeo',
  'zorro culpeo': 'culpeo',
  'zorro colorado': 'culpeo',
  'lycalopex culpaeus': 'culpeo',
  chilla: 'zorro_chilla',
  'zorro chilla': 'zorro_chilla',
  'chilla fox': 'zorro_chilla',
  'south american grey fox': 'zorro_chilla',
  'south american gray fox': 'zorro_chilla',
  'lycalopex griseus': 'zorro_chilla',
  'zorro gris': 'zorro_gris_chileno',
  'zorro gris chileno': 'zorro_gris_chileno',
  'chilean grey fox': 'zorro_gris_chileno',
  'chilean gray fox': 'zorro_gris_chileno',
  'patagonian fox': 'zorro_gris_chileno',
  guina: 'guina',
  'guiña': 'guina',
  kodkod: 'guina',
  'leopardus guigna': 'guina',
  'gato montes': 'guina',
  'gato montés': 'guina',
  coipo: 'coipo',
  coipu: 'coipo',
  coypu: 'coipo',
  nutria: 'coipo',
  'myocastor coypus': 'coipo',
  person: 'person',
  persona: 'person',
  human: 'person',
  vehicle: 'vehicle',
  vehiculo: 'vehicle',
  car: 'vehicle',
  truck: 'vehicle',
  dog: 'dog',
  perro: 'dog',
  cat: 'cat',
  gato: 'cat',
  livestock: 'livestock',
  ganado: 'livestock',
  cow: 'livestock',
  cattle: 'livestock',
  horse: 'livestock',
  sheep: 'livestock',
  goat: 'livestock',
  bird: 'bird_unknown',
  ave: 'bird_unknown',
  bird_unknown: 'bird_unknown',
  empty: 'empty_frame',
  'empty frame': 'empty_frame',
  'imagen vacia': 'empty_frame',
  'sin fauna': 'empty_frame',
  guanaco: 'guanaco',
  vicuna: 'vicuña',
  'vicuña': 'vicuña',
  nandu: 'ñandú',
  'ñandu': 'ñandú',
  rhea: 'ñandú',
  chinchilla: 'chinchilla',
  vizcacha: 'vizcacha',
}

function normalizeTaxonText(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function resolveSpecies(rawSpecies: unknown, context: string): DetectionSpecies {
  const normalizedSpecies = normalizeTaxonText(rawSpecies)
  const normalizedContext = normalizeTaxonText(`${normalizedSpecies} ${context}`)
  const direct = speciesAliases[normalizedSpecies]
  if (direct) return direct

  if (/\b(culpeo|zorro colorado|andean fox|lycalopex culpaeus)\b/.test(normalizedContext)) return 'culpeo'
  if (/\b(chilla|lycalopex griseus|south american gr[ae]y fox)\b/.test(normalizedContext)) return 'zorro_chilla'
  if (/\b(zorro gris|chilean gr[ae]y fox|patagonian fox)\b/.test(normalizedContext)) return 'zorro_gris_chileno'
  if (/\b(zorro|fox|canido silvestre)\b/.test(normalizedContext)) return 'fox'
  if (/\b(guiña|guina|kodkod|leopardus guigna)\b/.test(normalizedContext)) return 'guina'
  if (/\b(coipo|coipu|coypu|myocastor coypus)\b/.test(normalizedContext)) return 'coipo'
  if (/\b(huemul|hippocamelus bisulcus)\b/.test(normalizedContext)) return 'huemul'
  if (/\b(pudu|pudu puda)\b/.test(normalizedContext)) return 'pudu'
  if (/\b(puma|cougar|mountain lion|puma concolor)\b/.test(normalizedContext)) return 'puma'
  if (/\b(perro|dog|canis familiaris)\b/.test(normalizedContext)) return 'dog'
  if (/\b(ave|bird)\b/.test(normalizedContext)) return 'bird_unknown'
  if (/\b(vacia|vacio|empty|sin fauna|sin animales)\b/.test(normalizedContext)) return 'empty_frame'

  const parsed = speciesSchema.safeParse(normalizedSpecies.replace(/ /g, '_'))
  return parsed.success ? parsed.data : 'unknown_animal'
}

function normalizeConfidence(input: unknown, species: DetectionSpecies, context: string) {
  const numeric = typeof input === 'number' && Number.isFinite(input)
    ? Math.min(1, Math.max(0, input))
    : null
  const normalizedContext = normalizeTaxonText(context)
  const explicitFox = /\b(zorro|fox|culpeo|chilla|lycalopex)\b/.test(normalizedContext)

  if (species === 'fox' && (numeric === null || numeric <= 0.55) && explicitFox) {
    return { confidence: 0.82, source: 'heuristic' as const, modelConfidence: numeric }
  }
  if (['culpeo', 'zorro_chilla', 'zorro_gris_chileno'].includes(species) && (numeric === null || numeric <= 0.55)) {
    return { confidence: 0.84, source: 'heuristic' as const, modelConfidence: numeric }
  }
  if (['huemul', 'pudu', 'puma', 'guina', 'coipo'].includes(species) && numeric === null) {
    return { confidence: 0.78, source: 'heuristic' as const, modelConfidence: null }
  }
  if (species === 'empty_frame' && numeric === null) {
    return { confidence: 0.9, source: 'heuristic' as const, modelConfidence: null }
  }
  if (numeric !== null) return { confidence: numeric, source: 'model' as const, modelConfidence: numeric }
  return { confidence: 0.6, source: 'heuristic' as const, modelConfidence: null }
}

function normalizeAnalysis(outputText: string) {
  const raw = JSON.parse(outputText) as Record<string, unknown>
  const detections = Array.isArray(raw.detections) ? raw.detections : []
  const sceneSummary = String(raw.scene_summary || '').slice(0, 800)

  raw.detections = detections
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => {
      const description = String(item.description || '').slice(0, 300)
      const context = `${description} ${sceneSummary}`
      const species = resolveSpecies(item.species, context)
      const confidence = normalizeConfidence(item.confidence, species, `${item.species || ''} ${context}`)
      const box = item.box && typeof item.box === 'object' ? item.box as Record<string, unknown> : {}
      return {
        species,
        confidence: confidence.confidence,
        confidence_source: confidence.source,
        model_confidence: confidence.modelConfidence,
        box: {
          x1: Math.min(1, Math.max(0, Number(box.x1) || 0)),
          y1: Math.min(1, Math.max(0, Number(box.y1) || 0)),
          x2: Math.min(1, Math.max(0, Number(box.x2) || 1)),
          y2: Math.min(1, Math.max(0, Number(box.y2) || 1)),
        },
        description,
      }
    })

  if ((raw.detections as unknown[]).length === 0) {
    const emptyConfidence = normalizeConfidence(null, 'empty_frame', sceneSummary)
    raw.detections = [{
      species: 'empty_frame',
      confidence: emptyConfidence.confidence,
      confidence_source: emptyConfidence.source,
      model_confidence: null,
      box: { x1: 0, y1: 0, x2: 1, y2: 1 },
      description: 'No se observan sujetos relevantes en la imagen.',
    }]
  }

  raw.scene_summary = sceneSummary || 'Imagen procesada sin resumen disponible.'
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

  let quotaQuery = supabase.from('wildlife_ai_quotas').select('monthly_image_limit').eq('active', true).limit(1)
  quotaQuery = organizationId
    ? quotaQuery.eq('organization_id', organizationId).is('user_id', null)
    : quotaQuery.eq('user_id', userId).is('organization_id', null)

  const { data: quotaRows } = await quotaQuery
  const limit = quotaRows?.[0]?.monthly_image_limit ?? null
  if (limit === null) return { allowed: true, limit: null, used: 0 }

  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)
  let usageQuery = supabase.from('wildlife_inference_jobs').select('id', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString())
  usageQuery = organizationId ? usageQuery.eq('organization_id', organizationId) : usageQuery.eq('submitted_by_user_id', userId)
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
  if (!value) return null
  try {
    return decodeURIComponent(value).slice(0, maxLength)
  } catch {
    return value.slice(0, maxLength)
  }
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
  if (!quota.allowed) return NextResponse.json({ error: 'monthly_quota_exceeded', limit: quota.limit, used: quota.used }, { status: 429 })

  const startedAt = new Date()
  const model = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini'
  const unitCost = Number(process.env.OPENAI_VISION_ESTIMATED_COST_USD)
  const estimatedCostUsd = Number.isFinite(unitCost) && unitCost >= 0 ? unitCost : null
  const filename = safeHeader(request, 'x-image-filename', 240)?.replace(/[\\/\0]/g, '_') || 'camera-trap-image'
  const cameraCode = safeHeader(request, 'x-camera-code', 80)
  const cameraName = safeHeader(request, 'x-camera-name', 160)
  const zoneLabel = safeHeader(request, 'x-zone-label', 160)
  const capturedAtHeader = request.headers.get('x-captured-at')
  const capturedAt = capturedAtHeader && !Number.isNaN(Date.parse(capturedAtHeader)) ? new Date(capturedAtHeader).toISOString() : null
  const sha256 = createHash('sha256').update(image).digest('hex')
  const cameraId = await resolveCamera({ userId: auth.user.id, organizationId, code: cameraCode, name: cameraName, zoneLabel })
  const evidence = await storeEvidence({ userId: auth.user.id, sha256, mimeType: contentType, image })
  if (!evidence) return NextResponse.json({ error: 'evidence_storage_failed', message: 'No fue posible guardar la imagen original.' }, { status: 503 })

  const imageUrl = `data:${contentType};base64,${image.toString('base64')}`
  const body = {
    model,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Eres SegurIA Vision para monitoreo de fauna mediante cámaras trampa en el sector Huilo Huilo, bosque templado lluvioso del sur de Chile.
Prioriza especies plausibles del área: huemul, pudú, puma, zorro culpeo, zorro chilla, guiña y coipo. También reconoce persona, vehículo, perro, gato doméstico, ganado, ave no determinada e imagen vacía.
Usa exclusivamente estos códigos: huemul, pudu, puma, culpeo, zorro_chilla, zorro_gris_chileno, fox, guina, coipo, person, vehicle, dog, cat, livestock, bird_unknown, empty_frame, unknown_animal, guanaco, vicuña, ñandú, chinchilla, vizcacha.
Distingue especialmente huemul vs pudú, zorro culpeo vs zorro chilla, zorro vs perro y guiña vs gato doméstico.
Si es claramente un zorro pero no puedes determinar la especie, usa fox. Nunca uses unknown_animal para un zorro visible.
Usa empty_frame si no existe fauna, persona, vehículo ni ganado visible. Usa bird_unknown si es claramente un ave pero no puedes identificarla mejor.
Devuelve JSON válido con detections, scene_summary, operational_risks y limitations. Cada detección debe incluir species, confidence entre 0 y 1, box normalizado y description.
Todos los textos legibles por humanos deben estar exclusivamente en español de Chile. No inventes sujetos ocultos.`,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analiza esta imagen del sector Huilo Huilo. Identifica cada sujeto visible, prioriza la fauna local y explica brevemente los rasgos observables que sustentan la clasificación. Si el sujeto es un zorro, clasifícalo al menos como fox aunque no puedas distinguir culpeo o chilla.' },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
        ],
      },
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
      zoneLabel, capturedAt, storageBucket: evidence.bucket, storagePath: evidence.path,
      retryCount, latencyMs, estimatedCostUsd, processingStartedAt: startedAt.toISOString(),
      processingCompletedAt: completedAt.toISOString(), errorCode: 'openai_request_failed', errorMessage: message,
    })
    return NextResponse.json({ error: 'openai_request_failed', message, job_id: jobId, retry_count: retryCount }, { status: 502 })
  }

  const outputText = payload.choices?.[0]?.message?.content
  if (!outputText) return NextResponse.json({ error: 'openai_empty_output' }, { status: 502 })

  let analysis: z.infer<typeof analysisSchema>
  try {
    analysis = normalizeAnalysis(outputText)
  } catch (error) {
    return NextResponse.json({ error: 'openai_invalid_output', message: error instanceof Error ? error.message : 'Salida estructurada inválida.' }, { status: 502 })
  }

  const detections = analysis.detections.filter((item) => item.box.x2 > item.box.x1 && item.box.y2 > item.box.y1)
  const result = {
    detections,
    scene_summary: analysis.scene_summary,
    operational_risks: analysis.operational_risks,
    limitations: [...analysis.limitations, 'La predicción requiere validación humana antes de utilizarse como registro científico.'],
  }
  const jobId = await persistJob({
    userId: auth.user.id, organizationId, filename, mimeType: contentType,
    byteSize: image.length, sha256, model, status: 'completed', cameraId,
    zoneLabel, capturedAt, storageBucket: evidence.bucket, storagePath: evidence.path,
    retryCount, latencyMs, estimatedCostUsd, processingStartedAt: startedAt.toISOString(),
    processingCompletedAt: completedAt.toISOString(), result,
  })

  if (!jobId) return NextResponse.json({ error: 'job_persistence_failed', message: 'La imagen fue analizada, pero no fue posible guardar el trabajo.' }, { status: 503 })

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
    evidence_stored: true,
    detections_count: detections.length,
    ...result,
    timestamp: completedAt.toISOString(),
  })
}

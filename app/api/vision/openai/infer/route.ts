import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_IMAGE_BYTES = 12 * 1024 * 1024
const STORAGE_BUCKET = 'wildlife-evidence'
const PROMPT_VERSION = 'seguria-vision-v8-gpt5-mini'
const PIPELINE_VERSION = 'vision-pipeline-v9-gpt5-mini'
const PRIMARY_MODEL = 'gpt-5-mini'
const FALLBACK_MODEL = 'gpt-4o-mini'
const MAX_RETRIES = 2
const SCOPE_CONFLICT = '__scope_conflict__'
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const speciesSchema = z.enum([
  'huemul', 'pudu', 'puma', 'culpeo', 'zorro_chilla', 'zorro_gris_chileno', 'fox',
  'guina', 'coipo', 'person', 'vehicle', 'dog', 'cat', 'livestock', 'bird_unknown',
  'empty_frame', 'unknown_animal', 'guanaco', 'vicuna', 'nandu', 'chinchilla', 'vizcacha',
])

type DetectionSpecies = z.infer<typeof speciesSchema>

const detectionSchema = z.object({
  species: speciesSchema,
  confidence: z.number().min(0).max(1),
  confidence_source: z.enum(['model', 'heuristic', 'verification']).optional(),
  model_confidence: z.number().min(0).max(1).nullable().optional(),
  box: z.object({
    x1: z.number().min(0).max(1),
    y1: z.number().min(0).max(1),
    x2: z.number().min(0).max(1),
    y2: z.number().min(0).max(1),
  }),
  description: z.string().transform((value) => value.slice(0, 300)),
})

const boundedText = z.string().transform((value) => value.slice(0, 300))

const analysisSchema = z.object({
  detections: z.array(detectionSchema).max(30),
  scene_summary: z.string().transform((value) => value.slice(0, 800)),
  operational_risks: z.array(boundedText).max(10),
  limitations: z.array(boundedText).max(10),
})

const verificationSchema = z.object({
  species: speciesSchema,
  confidence: z.number().min(0).max(1),
  description: z.string().transform((value) => value.slice(0, 300)),
  scene_summary: z.string().transform((value) => value.slice(0, 500)),
})

type OpenAiPayload = {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

type Detection = z.infer<typeof detectionSchema>

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
  fox: 'fox',
  zorro: 'fox',
  culpeo: 'culpeo',
  'zorro culpeo': 'culpeo',
  'zorro colorado': 'culpeo',
  'lycalopex culpaeus': 'culpeo',
  chilla: 'zorro_chilla',
  'zorro chilla': 'zorro_chilla',
  'lycalopex griseus': 'zorro_chilla',
  'zorro gris': 'zorro_gris_chileno',
  guina: 'guina',
  kodkod: 'guina',
  'leopardus guigna': 'guina',
  'gato montes': 'guina',
  coipo: 'coipo',
  coipu: 'coipo',
  coypu: 'coipo',
  person: 'person',
  persona: 'person',
  vehicle: 'vehicle',
  vehiculo: 'vehicle',
  dog: 'dog',
  perro: 'dog',
  cat: 'cat',
  gato: 'cat',
  livestock: 'livestock',
  ganado: 'livestock',
  bird: 'bird_unknown',
  ave: 'bird_unknown',
  empty: 'empty_frame',
  'empty frame': 'empty_frame',
  'imagen vacia': 'empty_frame',
  guanaco: 'guanaco',
  vicuna: 'vicuna',
  nandu: 'nandu',
  chinchilla: 'chinchilla',
  vizcacha: 'vizcacha',
}

function normalizeText(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function explicitSpeciesFromNarrative(context: string): DetectionSpecies | null {
  const text = normalizeText(context)
  if (/\bhuemul\b|\bhippocamelus bisulcus\b/.test(text)) return 'huemul'
  if (/\bpudu\b|\bpudu puda\b/.test(text)) return 'pudu'
  if (/\bpuma\b|\bcougar\b|\bmountain lion\b/.test(text)) return 'puma'
  if (/\bguina\b|\bkodkod\b|\bleopardus guigna\b/.test(text)) return 'guina'
  if (/\bcoipo\b|\bcoipu\b|\bcoypu\b/.test(text)) return 'coipo'
  if (/\bculpeo\b|\bzorro colorado\b|\blycalopex culpaeus\b/.test(text)) return 'culpeo'
  if (/\bchilla\b|\blycalopex griseus\b/.test(text)) return 'zorro_chilla'
  if (/\bzorro gris\b|\bpatagonian fox\b/.test(text)) return 'zorro_gris_chileno'
  if (/\bzorro\b|\bfox\b|\bcanido silvestre\b/.test(text)) return 'fox'
  if (/\bperro\b|\bdog\b/.test(text)) return 'dog'
  if (/\bgato\b|\bcat\b/.test(text)) return 'cat'
  if (/\bave\b|\bbird\b/.test(text)) return 'bird_unknown'
  if (/\bvacia\b|\bvacio\b|\bempty\b|\bsin fauna\b/.test(text)) return 'empty_frame'
  return null
}

function resolveSpecies(rawSpecies: unknown, context: string): DetectionSpecies {
  const normalized = normalizeText(rawSpecies)
  const direct = speciesAliases[normalized]
  const narrative = explicitSpeciesFromNarrative(context)
  const generic = new Set<DetectionSpecies>(['fox', 'unknown_animal', 'bird_unknown'])

  if (narrative && (!direct || generic.has(direct) || narrative === direct)) return narrative
  if (direct) return direct
  if (narrative) return narrative

  const parsed = speciesSchema.safeParse(normalized.replace(/ /g, '_'))
  return parsed.success ? parsed.data : 'unknown_animal'
}

function normalizeConfidence(input: unknown, species: DetectionSpecies, context: string) {
  const numeric = typeof input === 'number' && Number.isFinite(input)
    ? Math.min(1, Math.max(0, input))
    : null
  const text = normalizeText(context)

  if (species === 'fox' && (numeric === null || numeric <= 0.55) && /\bzorro\b|\bfox\b/.test(text)) {
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

function normalizeStringList(value: unknown) {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? [value] : []
  return list
    .map((item) => String(item || '').trim().slice(0, 300))
    .filter(Boolean)
    .slice(0, 10)
}

function normalizeAnalysis(outputText: string) {
  const raw = JSON.parse(outputText) as Record<string, unknown>
  const sceneSummary = String(raw.scene_summary || '').slice(0, 800)
  const detections = Array.isArray(raw.detections) ? raw.detections : []

  raw.detections = detections
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .slice(0, 30)
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
    raw.detections = [{
      species: 'empty_frame',
      confidence: 0.9,
      confidence_source: 'heuristic',
      model_confidence: null,
      box: { x1: 0, y1: 0, x2: 1, y2: 1 },
      description: 'No se observan sujetos relevantes en la imagen.',
    }]
  }

  raw.scene_summary = sceneSummary || 'Imagen procesada sin resumen disponible.'
  raw.operational_risks = normalizeStringList(raw.operational_risks)
  raw.limitations = normalizeStringList(raw.limitations)
  return analysisSchema.parse(raw)
}

function needsVerification(detections: Detection[]) {
  return detections.some((item) => [
    'huemul', 'pudu', 'fox', 'culpeo', 'zorro_chilla', 'zorro_gris_chileno',
    'dog', 'guina', 'cat', 'unknown_animal',
  ].includes(item.species))
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function fetchOpenAiWithRetry(apiKey: string, body: Record<string, unknown>) {
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

async function requestWithFallback(apiKey: string, body: Record<string, unknown>) {
  const primary = await fetchOpenAiWithRetry(apiKey, { ...body, model: PRIMARY_MODEL })
  if (primary.response.ok) return { ...primary, model: PRIMARY_MODEL, fallbackUsed: false }

  const shouldFallback = [400, 404, 422].includes(primary.response.status)
  if (!shouldFallback) return { ...primary, model: PRIMARY_MODEL, fallbackUsed: false }

  const fallbackBody: Record<string, unknown> = { ...body, model: FALLBACK_MODEL }
  delete fallbackBody.max_completion_tokens
  fallbackBody.max_tokens = body.max_completion_tokens
  const fallback = await fetchOpenAiWithRetry(apiKey, fallbackBody)
  return { ...fallback, model: FALLBACK_MODEL, fallbackUsed: true }
}

async function verifyConfusableSpecies(apiKey: string, imageUrl: string) {
  const body: Record<string, unknown> = {
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Actua como segundo revisor visual independiente para fauna de Huilo Huilo. Debes elegir una sola especie usando solo rasgos visibles. Usa solo codigos ASCII permitidos. Diferencias criticas: huemul es un ciervo grande, de patas largas y cuerpo robusto; el macho puede tener astas desarrolladas y ramificadas. Pudu es un ciervo muy pequeno, compacto, de patas cortas; sus astas son muy cortas y simples. Zorro tiene hocico fino, orejas triangulares y cola muy peluda; perro domestico presenta morfologia y pelaje variables. Guina es un felino silvestre pequeno con manchas; gato domestico puede tener patrones variados. Devuelve JSON con species, confidence, description y scene_summary. Textos en espanol ASCII, sin tildes.`,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Verifica la especie principal. No uses el nombre del archivo. Basa la decision solo en anatomia, proporcion corporal, astas, patas, cabeza, cola y pelaje visibles.' },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
        ],
      },
    ],
    max_completion_tokens: 1400,
  }

  const requested = await requestWithFallback(apiKey, body)
  if (!requested.response.ok) return { verification: null, retryCount: requested.retryCount, model: requested.model, fallbackUsed: requested.fallbackUsed }
  const content = requested.payload.choices?.[0]?.message?.content
  if (!content) return { verification: null, retryCount: requested.retryCount, model: requested.model, fallbackUsed: requested.fallbackUsed }

  try {
    const raw = JSON.parse(content) as Record<string, unknown>
    const species = resolveSpecies(raw.species, `${raw.description || ''} ${raw.scene_summary || ''}`)
    const verification = verificationSchema.parse({
      species,
      confidence: typeof raw.confidence === 'number' ? raw.confidence : 0.75,
      description: String(raw.description || '').slice(0, 300),
      scene_summary: String(raw.scene_summary || '').slice(0, 500),
    })
    return { verification, retryCount: requested.retryCount, model: requested.model, fallbackUsed: requested.fallbackUsed }
  } catch {
    return { verification: null, retryCount: requested.retryCount, model: requested.model, fallbackUsed: requested.fallbackUsed }
  }
}

function applyVerification(analysis: z.infer<typeof analysisSchema>, verification: z.infer<typeof verificationSchema> | null) {
  if (!verification || verification.confidence < 0.7 || analysis.detections.length === 0) return analysis

  const primary = analysis.detections[0]
  const confusable = new Set<DetectionSpecies>([
    'huemul', 'pudu', 'fox', 'culpeo', 'zorro_chilla', 'zorro_gris_chileno',
    'dog', 'guina', 'cat', 'unknown_animal',
  ])
  if (!confusable.has(primary.species) && !confusable.has(verification.species)) return analysis

  const corrected: Detection = {
    ...primary,
    species: verification.species,
    confidence: verification.confidence,
    confidence_source: 'verification',
    model_confidence: primary.confidence,
    description: verification.description,
  }

  return {
    ...analysis,
    detections: [corrected, ...analysis.detections.slice(1)],
    scene_summary: verification.scene_summary,
    limitations: [
      ...analysis.limitations,
      primary.species !== verification.species
        ? `La segunda verificacion corrigio ${primary.species} a ${verification.species}.`
        : 'La segunda verificacion confirmo la especie principal.',
    ].slice(0, 10),
  }
}

async function resolveOperationContext(
  auth: NonNullable<Awaited<ReturnType<typeof getAuthorizedRequest>>>,
  rawOperationId: string | null,
) {
  const parsed = z.string().uuid().safeParse(rawOperationId)
  if (!parsed.success) {
    return { ok: false as const, status: 400, error: 'operation_required', message: 'x-operation-id must be a valid operation UUID.' }
  }

  const operationId = parsed.data
  if (auth.user.role !== 'admin' && !auth.user.operationIds.includes(operationId)) {
    return { ok: false as const, status: 403, error: 'operation_forbidden', message: 'No autorizado para esta operacion.' }
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return { ok: false as const, status: 503, error: 'database_not_configured', message: 'Base de datos no configurada.' }
  }

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id,organization_id,operation_id')
    .eq('operation_id', operationId)
    .maybeSingle()

  if (propertyError) {
    console.error('Vision operation property lookup failed:', propertyError.message)
    return { ok: false as const, status: 500, error: 'operation_lookup_failed', message: 'No fue posible resolver la operacion.' }
  }
  if (!property) {
    return { ok: false as const, status: 422, error: 'operation_unlinked', message: 'La operacion no esta vinculada a una propiedad canonica.' }
  }

  if (auth.user.role !== 'admin') {
    const { data: link, error: linkError } = await supabase
      .from('user_operations')
      .select('role')
      .eq('user_id', auth.user.id)
      .eq('operation_id', operationId)
      .maybeSingle()

    if (linkError) {
      console.error('Vision operation authorization lookup failed:', linkError.message)
      return { ok: false as const, status: 500, error: 'operation_access_lookup_failed', message: 'No fue posible validar el acceso a la operacion.' }
    }
    if (!link || !['owner', 'admin', 'operator'].includes(link.role || '')) {
      return { ok: false as const, status: 403, error: 'operation_forbidden', message: 'El rol de la operacion no permite inferencia directa.' }
    }
  }

  return {
    ok: true as const,
    operationId,
    propertyId: property.id as string,
    organizationId: property.organization_id as string,
  }
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

async function resolveCamera(input: { userId: string; operationId: string; organizationId: string; code: string | null; name: string | null; zoneLabel: string | null }) {
  if (!input.code) return null
  const supabase = createSupabaseAdminClient()
  if (!supabase) return null

  const { data: scopedCamera, error: scopedError } = await supabase
    .from('wildlife_cameras')
    .select('id,operation_id')
    .eq('operation_id', input.operationId)
    .eq('code', input.code)
    .maybeSingle()
  if (scopedError) {
    console.error('Wildlife camera scope lookup failed:', scopedError.message)
    return null
  }

  if (scopedCamera) {
    const { data, error } = await supabase
      .from('wildlife_cameras')
      .update({ name: input.name || input.code, zone_label: input.zoneLabel, updated_at: new Date().toISOString() })
      .eq('id', scopedCamera.id)
      .select('id')
      .single()
    if (error) {
      console.error('Wildlife camera update failed:', error.message)
      return null
    }
    return data.id as string
  }

  const { data: legacyCollision, error: collisionError } = await supabase
    .from('wildlife_cameras')
    .select('id,operation_id')
    .eq('created_by_user_id', input.userId)
    .eq('code', input.code)
    .maybeSingle()
  if (collisionError) {
    console.error('Wildlife camera collision lookup failed:', collisionError.message)
    return null
  }
  if (legacyCollision) {
    console.error('Wildlife camera scope conflict:', legacyCollision.id)
    return SCOPE_CONFLICT
  }

  const { data, error } = await supabase.from('wildlife_cameras').insert({
    operation_id: input.operationId,
    organization_id: input.organizationId,
    created_by_user_id: input.userId,
    code: input.code,
    name: input.name || input.code,
    zone_label: input.zoneLabel,
  }).select('id').single()
  if (error) {
    console.error('Wildlife camera creation failed:', error.message)
    return null
  }
  return data.id as string
}

async function storeEvidence(input: { userId: string; operationId: string; sha256: string; mimeType: string; image: Buffer }) {
  const supabase = createSupabaseAdminClient()
  if (!supabase) return null
  const storagePath = `${input.operationId}/${input.userId}/${input.sha256}.${EXTENSIONS[input.mimeType]}`
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
  operationId: string
  organizationId: string
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

  const { data: existing, error: lookupError } = await supabase
    .from('wildlife_inference_jobs')
    .select('id,operation_id')
    .eq('submitted_by_user_id', input.userId)
    .eq('sha256', input.sha256)
    .eq('model_name', input.model)
    .maybeSingle()
  if (lookupError) {
    console.error('Wildlife inference idempotency lookup failed:', lookupError.message)
    return null
  }
  if (existing && existing.operation_id !== input.operationId) {
    console.error('Wildlife inference scope conflict:', existing.id)
    return SCOPE_CONFLICT
  }

  const payload = {
    submitted_by_user_id: input.userId,
    operation_id: input.operationId,
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
  }

  const result = existing
    ? await supabase.from('wildlife_inference_jobs').update(payload).eq('id', existing.id).select('id').single()
    : await supabase.from('wildlife_inference_jobs').insert(payload).select('id').single()
  if (result.error) {
    console.error('Wildlife inference persistence failed:', result.error.message)
    return null
  }
  return result.data.id as string
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

  const operationContext = await resolveOperationContext(auth, safeHeader(request, 'x-operation-id', 64))
  if (!operationContext.ok) {
    return NextResponse.json({ error: operationContext.error, message: operationContext.message }, { status: operationContext.status })
  }
  const { operationId, organizationId } = operationContext
  const quota = await enforceQuota(auth.user.id, organizationId)
  if (!quota.allowed) return NextResponse.json({ error: 'monthly_quota_exceeded', limit: quota.limit, used: quota.used }, { status: 429 })

  const startedAt = new Date()
  const unitCost = Number(process.env.OPENAI_VISION_ESTIMATED_COST_USD)
  const estimatedCostUsd = Number.isFinite(unitCost) && unitCost >= 0 ? unitCost : null
  const filename = safeHeader(request, 'x-image-filename', 240)?.replace(/[\\/\0]/g, '_') || 'camera-trap-image'
  const cameraCode = safeHeader(request, 'x-camera-code', 80)
  const cameraName = safeHeader(request, 'x-camera-name', 160)
  const zoneLabel = safeHeader(request, 'x-zone-label', 160)
  const capturedAtHeader = request.headers.get('x-captured-at')
  const capturedAt = capturedAtHeader && !Number.isNaN(Date.parse(capturedAtHeader))
    ? new Date(capturedAtHeader).toISOString()
    : null
  const sha256 = createHash('sha256').update(image).digest('hex')
  const cameraId = await resolveCamera({ userId: auth.user.id, operationId, organizationId, code: cameraCode, name: cameraName, zoneLabel })
  if (cameraId === SCOPE_CONFLICT) return NextResponse.json({ error: 'camera_scope_conflict', message: 'El codigo de camara ya existe en otro scope.' }, { status: 409 })
  const evidence = await storeEvidence({ userId: auth.user.id, operationId, sha256, mimeType: contentType, image })
  if (!evidence) return NextResponse.json({ error: 'evidence_storage_failed', message: 'No fue posible guardar la imagen original.' }, { status: 503 })

  const imageUrl = `data:${contentType};base64,${image.toString('base64')}`

  const body: Record<string, unknown> = {
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Eres SegurIA Vision para camaras trampa de Huilo Huilo. Prioriza huemul, pudu, puma, zorro culpeo, zorro chilla, guina y coipo. Usa solo codigos ASCII permitidos. Para huemul vs pudu analiza tamano corporal, longitud de patas y astas: huemul es grande y robusto, con patas largas; machos pueden tener astas desarrolladas y ramificadas. Pudu es muy pequeno y compacto, con patas cortas y astas muy cortas y simples. Cada deteccion debe ser coherente: species, description y scene_summary deben referirse a la misma especie. Devuelve JSON valido con detections, scene_summary, operational_risks y limitations. Todos los textos en espanol ASCII sin tildes. Cada descripcion, riesgo y limitacion debe tener menos de 300 caracteres.`,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analiza la imagen por rasgos anatomicos visibles. No uses el nombre del archivo como evidencia. Verifica especialmente huemul vs pudu, zorro vs perro y guina vs gato.' },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
        ],
      },
    ],
    max_completion_tokens: 4000,
  }

  const first = await requestWithFallback(apiKey, body)
  const model = first.model
  if (!first.response.ok) {
    const completedAt = new Date()
    const message = first.payload.error?.message || `OpenAI returned ${first.response.status}`
    const jobId = await persistJob({
      userId: auth.user.id, operationId, organizationId, filename, mimeType: contentType,
      byteSize: image.length, sha256, model, status: 'failed', cameraId,
      zoneLabel, capturedAt, storageBucket: evidence.bucket, storagePath: evidence.path,
      retryCount: first.retryCount, latencyMs: completedAt.getTime() - startedAt.getTime(), estimatedCostUsd,
      processingStartedAt: startedAt.toISOString(), processingCompletedAt: completedAt.toISOString(),
      errorCode: 'openai_request_failed', errorMessage: message,
    })
    if (jobId === SCOPE_CONFLICT) return NextResponse.json({ error: 'inference_scope_conflict', message: 'La misma evidencia ya existe en otra operacion.' }, { status: 409 })
    return NextResponse.json({ error: 'openai_request_failed', message, job_id: jobId, model_version: model }, { status: 502 })
  }

  const outputText = first.payload.choices?.[0]?.message?.content
  if (!outputText) return NextResponse.json({ error: 'openai_empty_output', message: 'El modelo no devolvio un resultado util. Intenta nuevamente.' }, { status: 502 })

  let analysis: z.infer<typeof analysisSchema>
  try {
    analysis = normalizeAnalysis(outputText)
  } catch (error) {
    console.error('Wildlife structured output validation failed:', error)
    return NextResponse.json({
      error: 'openai_invalid_output',
      message: 'La respuesta del modelo no pudo normalizarse. Intenta procesar la imagen nuevamente.',
    }, { status: 502 })
  }

  let verificationRetryCount = 0
  let verificationModel = model
  let verificationFallbackUsed = false
  if (needsVerification(analysis.detections)) {
    const verified = await verifyConfusableSpecies(apiKey, imageUrl)
    verificationRetryCount = verified.retryCount
    verificationModel = verified.model
    verificationFallbackUsed = verified.fallbackUsed
    analysis = applyVerification(analysis, verified.verification)
  }

  const completedAt = new Date()
  const latencyMs = completedAt.getTime() - startedAt.getTime()
  const detections = analysis.detections.filter((item) => item.box.x2 > item.box.x1 && item.box.y2 > item.box.y1)
  const result = {
    detections,
    scene_summary: analysis.scene_summary,
    operational_risks: analysis.operational_risks,
    limitations: [...analysis.limitations, 'La prediccion requiere validacion humana antes de utilizarse como registro cientifico.'].slice(0, 10),
  }

  const jobId = await persistJob({
    userId: auth.user.id, operationId, organizationId, filename, mimeType: contentType,
    byteSize: image.length, sha256, model, status: 'completed', cameraId,
    zoneLabel, capturedAt, storageBucket: evidence.bucket, storagePath: evidence.path,
    retryCount: first.retryCount + verificationRetryCount, latencyMs, estimatedCostUsd,
    processingStartedAt: startedAt.toISOString(), processingCompletedAt: completedAt.toISOString(), result,
  })

  if (jobId === SCOPE_CONFLICT) return NextResponse.json({ error: 'inference_scope_conflict', message: 'La misma evidencia ya existe en otra operacion.' }, { status: 409 })
  if (!jobId) return NextResponse.json({ error: 'job_persistence_failed', message: 'La imagen fue analizada, pero no fue posible guardar el trabajo.' }, { status: 503 })

  return NextResponse.json({
    ok: true,
    job_id: jobId,
    provider: 'openai',
    model_version: model,
    requested_model: PRIMARY_MODEL,
    fallback_model: FALLBACK_MODEL,
    fallback_used: first.fallbackUsed,
    verification_model: verificationModel,
    verification_fallback_used: verificationFallbackUsed,
    prompt_version: PROMPT_VERSION,
    pipeline_version: PIPELINE_VERSION,
    retry_count: first.retryCount + verificationRetryCount,
    latency_ms: latencyMs,
    estimated_cost_usd: estimatedCostUsd,
    operation_id: operationId,
    organization_id: organizationId,
    quota: { limit: quota.limit, used_before_request: quota.used },
    camera_id: cameraId,
    zone_label: zoneLabel,
    captured_at: capturedAt,
    evidence_stored: true,
    verification_applied: needsVerification(detections),
    detections_count: detections.length,
    ...result,
    timestamp: completedAt.toISOString(),
  })
}
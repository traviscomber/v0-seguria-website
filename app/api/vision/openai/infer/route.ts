import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_IMAGE_BYTES = 12 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

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

async function resolveCamera(input: {
  userId: string
  organizationId: string | null
  code: string | null
  name: string | null
  zoneLabel: string | null
}) {
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
      status: input.status,
      review_status: 'pending',
      camera_id: input.cameraId,
      zone_label: input.zoneLabel,
      captured_at: input.capturedAt,
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

  const model = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini'
  const filename = decodeURIComponent(request.headers.get('x-image-filename') || 'camera-trap-image').replace(/[\\/\0]/g, '_').slice(0, 240)
  const cameraCode = safeHeader(request, 'x-camera-code', 80)
  const cameraName = safeHeader(request, 'x-camera-name', 160)
  const zoneLabel = safeHeader(request, 'x-zone-label', 160)
  const capturedAtHeader = request.headers.get('x-captured-at')
  const capturedAt = capturedAtHeader && !Number.isNaN(Date.parse(capturedAtHeader)) ? new Date(capturedAtHeader).toISOString() : null
  const sha256 = createHash('sha256').update(image).digest('hex')
  const organizationId = auth.user.clientIds[0] ?? null
  const cameraId = await resolveCamera({ userId: auth.user.id, organizationId, code: cameraCode, name: cameraName, zoneLabel })
  const imageUrl = `data:${contentType};base64,${image.toString('base64')}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
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
    }),
  })

  const payload = await response.json() as OpenAiPayload
  if (!response.ok) {
    const message = payload.error?.message || `OpenAI returned ${response.status}`
    const jobId = await persistJob({ userId: auth.user.id, organizationId, filename, mimeType: contentType, byteSize: image.length, sha256, model, status: 'failed', cameraId, zoneLabel, capturedAt, errorCode: 'openai_request_failed', errorMessage: message })
    return NextResponse.json({ error: 'openai_request_failed', message, job_id: jobId }, { status: 502 })
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
  const jobId = await persistJob({ userId: auth.user.id, organizationId, filename, mimeType: contentType, byteSize: image.length, sha256, model, status: 'completed', cameraId, zoneLabel, capturedAt, result })

  return NextResponse.json({ ok: true, job_id: jobId, provider: 'openai', model_version: model, camera_id: cameraId, zone_label: zoneLabel, captured_at: capturedAt, detections_count: detections.length, ...result, timestamp: new Date().toISOString() })
}

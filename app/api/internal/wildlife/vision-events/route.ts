import 'server-only'

import { createHash, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_IMAGE_BYTES = 12 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const payloadSchema = z.object({
  context: z.object({
    organization_id: z.string().uuid(),
    site_id: z.string().uuid(),
    submitted_by_user_id: z.string().uuid(),
    camera_id: z.string().min(1).max(100),
    source: z.enum(['camera_trap', 'rtsp_event', 'external_api']),
    external_reference: z.string().min(1).max(200).nullable().optional(),
  }),
  observation: z.object({
    external_reference: z.string().min(1).max(200),
    organization_id: z.string().uuid(),
    site_id: z.string().uuid(),
    submitted_by_user_id: z.string().uuid(),
    status: z.enum(['analyzed', 'review_required']),
    source: z.enum(['camera_trap', 'rtsp_event', 'external_api']),
    title: z.string().max(500).nullable().optional(),
    user_description: z.string().max(2000).nullable().optional(),
  }),
  evidence: z.object({
    mime_type: z.string(),
    byte_size: z.number().int().positive().max(MAX_IMAGE_BYTES),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    asset_kind: z.literal('original'),
    source: z.enum(['camera_trap', 'rtsp_event', 'external_api']),
  }),
  analysis: z.object({
    schema_version: z.string().min(1).max(100),
    provider: z.string().min(1).max(100),
    model_name: z.string().min(1).max(100),
    model_version: z.string().min(1).max(100),
    detected_at: z.string().datetime(),
    detections: z.array(z.record(z.unknown())).max(100),
    primary_species: z.string().nullable(),
    maximum_confidence: z.number().min(0).max(1),
    review_status: z.enum(['not_required', 'pending', 'confirmed', 'rejected', 'uncertain']),
    risk_level: z.enum(['low', 'medium', 'high', 'critical']),
    limitations: z.array(z.string().max(1000)).max(20),
  }),
  audit_event: z.object({
    event_type: z.string().min(1).max(200),
    event_version: z.string().min(1).max(50),
    actor_user_id: z.string().uuid(),
    payload: z.record(z.unknown()),
  }),
})

function unauthorized() {
  return NextResponse.json(
    { error: 'unauthorized' },
    { status: 401 }
  )
}

function hasValidInternalToken(request: Request) {
  const configuredToken = process.env.VISION_BACKEND_TOKEN
  const authorization = request.headers.get('authorization')
  if (!configuredToken || !authorization?.startsWith('Bearer ')) return false

  const suppliedToken = authorization.slice('Bearer '.length)
  const expected = Buffer.from(configuredToken)
  const supplied = Buffer.from(suppliedToken)
  return expected.length === supplied.length && timingSafeEqual(expected, supplied)
}

function extensionForMimeType(mimeType: string) {
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  return 'jpg'
}

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100)
}

export async function POST(request: Request) {
  if (!hasValidInternalToken(request)) return unauthorized()

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json(
      { error: 'supabase_admin_not_configured' },
      { status: 503 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'invalid_multipart_body' }, { status: 400 })
  }

  const metadataValue = formData.get('metadata')
  const evidenceValue = formData.get('evidence')
  if (typeof metadataValue !== 'string' || !(evidenceValue instanceof File)) {
    return NextResponse.json(
      { error: 'metadata_and_evidence_are_required' },
      { status: 422 }
    )
  }

  let metadata: z.infer<typeof payloadSchema>
  try {
    metadata = payloadSchema.parse(JSON.parse(metadataValue))
  } catch (error) {
    return NextResponse.json(
      {
        error: 'invalid_metadata',
        details: error instanceof Error ? error.message : 'unknown validation error',
      },
      { status: 422 }
    )
  }

  const mimeType = evidenceValue.type.toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json({ error: 'unsupported_evidence_type' }, { status: 422 })
  }
  if (evidenceValue.size <= 0 || evidenceValue.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'invalid_evidence_size' }, { status: 422 })
  }
  if (
    metadata.evidence.mime_type !== mimeType ||
    metadata.evidence.byte_size !== evidenceValue.size
  ) {
    return NextResponse.json({ error: 'evidence_metadata_mismatch' }, { status: 422 })
  }

  const evidenceBytes = Buffer.from(await evidenceValue.arrayBuffer())
  const digest = createHash('sha256').update(evidenceBytes).digest('hex')
  if (digest !== metadata.evidence.sha256) {
    return NextResponse.json({ error: 'evidence_hash_mismatch' }, { status: 422 })
  }

  if (
    metadata.context.organization_id !== metadata.observation.organization_id ||
    metadata.context.site_id !== metadata.observation.site_id ||
    metadata.context.submitted_by_user_id !== metadata.observation.submitted_by_user_id
  ) {
    return NextResponse.json({ error: 'context_mismatch' }, { status: 422 })
  }

  const bucket = process.env.WILDLIFE_EVIDENCE_BUCKET || 'wildlife-evidence'
  const extension = extensionForMimeType(mimeType)
  const safeFilename = `${digest}.${extension}`
  const now = new Date()
  const storagePath = [
    metadata.context.organization_id,
    metadata.context.site_id,
    safeSegment(metadata.context.camera_id),
    String(now.getUTCFullYear()),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
    safeFilename,
  ].join('/')

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, evidenceBytes, {
      contentType: mimeType,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError && !uploadError.message.toLowerCase().includes('already exists')) {
    return NextResponse.json(
      { error: 'evidence_upload_failed', details: uploadError.message },
      { status: 502 }
    )
  }

  const evidencePayload = {
    ...metadata.evidence,
    original_filename: evidenceValue.name || safeFilename,
    safe_filename: safeFilename,
    storage_bucket: bucket,
    storage_path: storagePath,
  }

  const { data, error } = await supabase.schema('private').rpc(
    'persist_wildlife_vision_event',
    {
      p_observation: metadata.observation,
      p_evidence: evidencePayload,
      p_analysis: metadata.analysis,
      p_audit_event: metadata.audit_event,
    }
  )

  if (error) {
    if (!uploadError) {
      await supabase.storage.from(bucket).remove([storagePath])
    }
    return NextResponse.json(
      { error: 'wildlife_persistence_failed', details: error.message },
      { status: 500 }
    )
  }

  const result = Array.isArray(data) ? data[0] : data
  if (!result) {
    return NextResponse.json({ error: 'empty_persistence_result' }, { status: 500 })
  }

  return NextResponse.json({
    observation_id: result.observation_id,
    evidence_asset_id: result.evidence_asset_id,
    analysis_id: result.analysis_id,
    status: result.status,
  })
}

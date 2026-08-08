import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { extractEmbeddedImageMetadata } from '@/lib/wildlife/image-metadata'
import { resolveWildlifeAccess, writeTerritorialAudit } from '@/lib/wildlife/server-access'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_IMAGE_BYTES = 12 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsedOperationId = z.string().uuid().safeParse(request.headers.get('x-operation-id')?.trim() || null)
  if (!parsedOperationId.success) {
    return NextResponse.json({ error: 'operation_required', message: 'x-operation-id must be a valid operation UUID.' }, { status: 400 })
  }

  const operationId = parsedOperationId.data
  const access = await resolveWildlifeAccess(auth, operationId)
  if (access.operationId !== operationId || !access.capabilities.processEvidence) {
    return NextResponse.json({ error: 'operation_forbidden', message: 'Tu rol no permite procesar evidencia en esta operacion.' }, { status: 403 })
  }

  const contentType = (request.headers.get('x-image-content-type') || '').toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(contentType)) return NextResponse.json({ error: 'unsupported_image_type' }, { status: 422 })

  const image = Buffer.from(await request.arrayBuffer())
  if (image.length === 0 || image.length > MAX_IMAGE_BYTES) return NextResponse.json({ error: 'invalid_image_size' }, { status: 422 })

  const metadata = extractEmbeddedImageMetadata(image, contentType)
  const headers = new Headers()
  for (const [key, value] of request.headers.entries()) headers.set(key, value)
  headers.delete('content-length')
  headers.set('x-operation-id', operationId)

  const manualCapturedAt = request.headers.get('x-captured-at')
  if (!manualCapturedAt && metadata.capturedAt) headers.set('x-captured-at', metadata.capturedAt)

  const upstream = await fetch(new URL('/api/vision/openai/infer', request.nextUrl.origin), {
    method: 'POST',
    headers,
    body: image,
    cache: 'no-store',
  })

  const payload = await upstream.json() as Record<string, unknown>
  const jobId = typeof payload.job_id === 'string' ? payload.job_id : null
  const upstreamOperationId = typeof payload.operation_id === 'string' ? payload.operation_id : null

  if (upstream.ok && upstreamOperationId !== operationId) {
    console.error('Wildlife metadata inference scope mismatch:', { operationId, upstreamOperationId, jobId })
    return NextResponse.json({
      error: 'upstream_scope_mismatch',
      message: 'La inferencia no confirmo la operacion solicitada.',
    }, { status: 502 })
  }

  if (jobId && upstream.ok) {
    const supabase = createSupabaseAdminClient()
    if (supabase) {
      const { data: existing, error: existingError } = await supabase
        .from('wildlife_inference_jobs')
        .select('result_json, camera_id, operation_id')
        .eq('id', jobId)
        .eq('submitted_by_user_id', auth.user.id)
        .maybeSingle()

      if (existingError) {
        console.error('Wildlife EXIF job lookup failed:', existingError.message)
        return NextResponse.json({ error: 'job_lookup_failed', message: 'No fue posible validar el trabajo procesado.' }, { status: 503 })
      }
      if (!existing || existing.operation_id !== operationId) {
        console.error('Wildlife EXIF job scope conflict:', { jobId, operationId, persistedOperationId: existing?.operation_id || null })
        return NextResponse.json({ error: 'job_scope_conflict', message: 'El trabajo procesado pertenece a otra operacion.' }, { status: 409 })
      }

      const currentResult = existing.result_json && typeof existing.result_json === 'object'
        ? existing.result_json as Record<string, unknown>
        : {}

      const imageMetadata = {
        ...metadata,
        capturedAtSource: metadata.capturedAt ? 'exif' : manualCapturedAt ? 'manual' : 'processing_fallback',
        locationStatus: metadata.latitude !== null && metadata.longitude !== null ? 'validated_exif' : 'not_validated',
      }

      const { error } = await supabase
        .from('wildlife_inference_jobs')
        .update({
          result_json: { ...currentResult, image_metadata: imageMetadata },
          captured_at: metadata.capturedAt || manualCapturedAt || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)
        .eq('submitted_by_user_id', auth.user.id)
        .eq('operation_id', operationId)

      if (error) {
        console.error('Wildlife EXIF persistence failed:', error.message)
        return NextResponse.json({ error: 'metadata_persistence_failed', message: 'La inferencia termino, pero no fue posible guardar sus metadatos.' }, { status: 503 })
      }

      payload.image_metadata = imageMetadata
      payload.captured_at = metadata.capturedAt || manualCapturedAt || payload.captured_at || null

      await writeTerritorialAudit({
        request,
        auth,
        access,
        action: 'evidence.processed',
        resourceType: 'wildlife_inference_job',
        resourceId: jobId,
        payload: {
          mimeType: contentType,
          byteSize: image.length,
          upstreamStatus: upstream.status,
          hasEmbeddedCoordinates: metadata.latitude !== null && metadata.longitude !== null,
        },
      })
    }
  } else {
    payload.image_metadata = metadata
  }

  return NextResponse.json(payload, { status: upstream.status })
}

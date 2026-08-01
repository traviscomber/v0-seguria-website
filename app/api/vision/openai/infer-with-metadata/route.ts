import { NextRequest, NextResponse } from 'next/server'

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

  const access = await resolveWildlifeAccess(auth)
  if (!access.capabilities.processEvidence) {
    return NextResponse.json({ error: 'forbidden', message: 'Tu rol no permite procesar evidencia.' }, { status: 403 })
  }

  const contentType = (request.headers.get('x-image-content-type') || '').toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'unsupported_image_type' }, { status: 422 })
  }

  const image = Buffer.from(await request.arrayBuffer())
  if (image.length === 0 || image.length > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'invalid_image_size' }, { status: 422 })
  }

  const metadata = extractEmbeddedImageMetadata(image, contentType)
  const headers = new Headers()
  for (const [key, value] of request.headers.entries()) headers.set(key, value)
  headers.delete('content-length')

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

  if (upstream.ok && jobId) {
    const supabase = createSupabaseAdminClient()
    if (supabase) {
      let lookup = supabase
        .from('wildlife_inference_jobs')
        .select('result_json')
        .eq('id', jobId)

      lookup = access.operationId
        ? lookup.eq('organization_id', access.operationId)
        : lookup.eq('submitted_by_user_id', auth.user.id)

      const { data: existing } = await lookup.maybeSingle()

      const currentResult = existing?.result_json && typeof existing.result_json === 'object'
        ? existing.result_json as Record<string, unknown>
        : {}

      const imageMetadata = {
        ...metadata,
        capturedAtSource: metadata.capturedAt
          ? 'exif'
          : manualCapturedAt
            ? 'manual'
            : 'processing_fallback',
        locationStatus: metadata.latitude !== null && metadata.longitude !== null
          ? 'validated_exif'
          : 'not_validated',
      }

      let update = supabase
        .from('wildlife_inference_jobs')
        .update({
          result_json: { ...currentResult, image_metadata: imageMetadata },
          captured_at: metadata.capturedAt || manualCapturedAt || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      update = access.operationId
        ? update.eq('organization_id', access.operationId)
        : update.eq('submitted_by_user_id', auth.user.id)

      const { error } = await update
      if (error) console.error('Wildlife EXIF persistence failed:', error.message)
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
          hasEmbeddedCoordinates: metadata.latitude !== null && metadata.longitude !== null,
        },
      })
    }
  } else {
    payload.image_metadata = metadata
  }

  return NextResponse.json(payload, { status: upstream.status })
}

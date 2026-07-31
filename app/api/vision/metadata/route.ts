import { NextRequest, NextResponse } from 'next/server'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { extractEmbeddedImageMetadata } from '@/lib/wildlife/image-metadata'

export const runtime = 'nodejs'

const MAX_IMAGE_BYTES = 12 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const contentType = (request.headers.get('x-image-content-type') || '').toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    return NextResponse.json({ success: false, error: 'Tipo de imagen no compatible.' }, { status: 422 })
  }

  const image = Buffer.from(await request.arrayBuffer())
  if (image.length === 0 || image.length > MAX_IMAGE_BYTES) {
    return NextResponse.json({ success: false, error: 'Tamano de imagen invalido.' }, { status: 422 })
  }

  const metadata = extractEmbeddedImageMetadata(image, contentType)
  const temporalStatus = metadata.capturedAt ? 'validated_exif' : 'missing'
  const locationStatus = metadata.latitude !== null && metadata.longitude !== null
    ? 'validated_exif'
    : 'missing'

  return NextResponse.json({
    success: true,
    data: {
      ...metadata,
      temporal_status: temporalStatus,
      location_status: locationStatus,
      inspected_at: new Date().toISOString(),
    },
  })
}

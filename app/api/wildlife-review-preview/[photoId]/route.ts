import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { reviewedImageMatchesPhotoId } from '@/lib/wildlife/review-image-source'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ photoId: string }> }
) {
  const auth = await getAuthorizedRequest(request, ['admin'])
  if (!auth) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const { photoId } = await context.params
  if (!/^\d+$/.test(photoId)) {
    return NextResponse.json({ error: 'Imagen no autorizada.' }, { status: 404 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Base de datos no configurada.' }, { status: 503 })
  }

  const { data: candidates, error } = await supabase
    .from('wildlife_occurrence_media')
    .select('identifier_url, mime_type, wildlife_media_reviews!inner(id)')
    .ilike('identifier_url', `%/photos/${photoId}/%`)
    .limit(10)

  if (error) {
    console.error('Wildlife review preview lookup failed:', error.message)
    return NextResponse.json({ error: 'No fue posible validar la imagen.' }, { status: 500 })
  }

  const media = candidates?.find((candidate) =>
    reviewedImageMatchesPhotoId(candidate.identifier_url, photoId)
  )

  if (!media) {
    return NextResponse.json({ error: 'Imagen no autorizada.' }, { status: 404 })
  }

  const response = await fetch(media.identifier_url, {
    cache: 'force-cache',
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok || !response.body) {
    return NextResponse.json({ error: 'No fue posible cargar la imagen.' }, { status: 502 })
  }

  const upstreamType = response.headers.get('content-type') || media.mime_type || 'image/jpeg'
  if (!upstreamType.toLowerCase().startsWith('image/')) {
    return NextResponse.json({ error: 'El recurso remoto no es una imagen valida.' }, { status: 502 })
  }

  return new NextResponse(response.body, {
    status: 200,
    headers: {
      'Content-Type': upstreamType,
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Disposition': `inline; filename="wildlife-${photoId}.jpg"`,
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'same-origin',
    },
  })
}

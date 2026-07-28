import { NextRequest, NextResponse } from 'next/server'

const allowedPhotoIds = new Set([
  '613942273',
  '613943394',
  '613973095',
  '614064618',
  '614360234',
  '614065687',
  '614065784',
  '622425146',
  '622425175',
  '622254775',
  '622254778',
  '622254808',
])

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ photoId: string }> }
) {
  const { photoId } = await context.params
  if (!allowedPhotoIds.has(photoId)) {
    return NextResponse.json({ error: 'Imagen no autorizada.' }, { status: 404 })
  }

  const source = `https://inaturalist-open-data.s3.amazonaws.com/photos/${photoId}/original.jpg`
  const response = await fetch(source, { next: { revalidate: 86400 } })
  if (!response.ok || !response.body) {
    return NextResponse.json({ error: 'No fue posible cargar la imagen.' }, { status: 502 })
  }

  return new NextResponse(response.body, {
    status: 200,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      'Content-Disposition': `inline; filename="wildlife-${photoId}.jpg"`,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

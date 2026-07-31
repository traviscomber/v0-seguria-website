const INATURALIST_MEDIA_HOST = 'inaturalist-open-data.s3.amazonaws.com'
const PHOTO_PATH = /^\/photos\/(\d+)\/(original|large|medium|small|square)\.(jpg|jpeg|png|webp)$/i

export type ReviewedImageSource = {
  photoId: string
  sourceUrl: string
}

export function parseReviewedImageSource(value: string): ReviewedImageSource | null {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }

  if (url.protocol !== 'https:' || url.hostname !== INATURALIST_MEDIA_HOST) return null
  if (url.username || url.password || url.port || url.search || url.hash) return null

  const match = PHOTO_PATH.exec(url.pathname)
  if (!match) return null

  return {
    photoId: match[1],
    sourceUrl: url.toString(),
  }
}

export function reviewedImageMatchesPhotoId(value: string, photoId: string): boolean {
  if (!/^\d+$/.test(photoId)) return false
  const parsed = parseReviewedImageSource(value)
  return parsed?.photoId === photoId
}

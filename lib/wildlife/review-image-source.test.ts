import assert from 'node:assert/strict'
import test from 'node:test'
import {
  parseReviewedImageSource,
  reviewedImageMatchesPhotoId,
} from './review-image-source.ts'

test('accepts a canonical iNaturalist open-data image URL', () => {
  assert.deepEqual(
    parseReviewedImageSource('https://inaturalist-open-data.s3.amazonaws.com/photos/613942273/original.jpg'),
    {
      photoId: '613942273',
      sourceUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/613942273/original.jpg',
    }
  )
})

test('accepts supported renditions and image extensions', () => {
  assert.equal(
    reviewedImageMatchesPhotoId(
      'https://inaturalist-open-data.s3.amazonaws.com/photos/42/large.webp',
      '42'
    ),
    true
  )
})

test('rejects alternate hosts, insecure URLs and URL decorations', () => {
  const rejected = [
    'http://inaturalist-open-data.s3.amazonaws.com/photos/42/original.jpg',
    'https://example.com/photos/42/original.jpg',
    'https://inaturalist-open-data.s3.amazonaws.com.evil.example/photos/42/original.jpg',
    'https://inaturalist-open-data.s3.amazonaws.com/photos/42/original.jpg?redirect=https://evil.example',
    'https://inaturalist-open-data.s3.amazonaws.com/photos/42/original.jpg#fragment',
  ]

  for (const value of rejected) assert.equal(parseReviewedImageSource(value), null)
})

test('rejects path traversal, unsupported files and mismatched IDs', () => {
  const rejected = [
    'https://inaturalist-open-data.s3.amazonaws.com/photos/42/../../secret.jpg',
    'https://inaturalist-open-data.s3.amazonaws.com/photos/42/original.svg',
    'https://inaturalist-open-data.s3.amazonaws.com/photos/not-a-number/original.jpg',
  ]

  for (const value of rejected) assert.equal(parseReviewedImageSource(value), null)
  assert.equal(
    reviewedImageMatchesPhotoId(
      'https://inaturalist-open-data.s3.amazonaws.com/photos/42/original.jpg',
      '43'
    ),
    false
  )
})

import 'server-only'

import crypto from 'node:crypto'

export const CAMERA_STREAM_TTL_SECONDS = 120

export function generateCameraStreamToken() {
  return crypto.randomBytes(32).toString('base64url')
}

export function hashCameraStreamToken(token: string) {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex')
}

export function getCameraStreamExpiry(now = Date.now()) {
  return new Date(now + CAMERA_STREAM_TTL_SECONDS * 1000).toISOString()
}

import 'server-only'

import crypto from 'node:crypto'

export const CAMERA_STREAM_TTL_SECONDS = 120
export const CAMERA_STREAM_MAX_ACTIVE_PER_DEVICE = 1
export const CAMERA_STREAM_MAX_ACTIVE_PER_PROPERTY = 6
export const CAMERA_STREAM_HLS_MANIFEST = 'index.m3u8'

const SAFE_HLS_FILE = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,119}$/

export function generateCameraStreamToken() {
  return crypto.randomBytes(32).toString('base64url')
}

export function hashCameraStreamToken(token: string) {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex')
}

export function getCameraStreamExpiry(now = Date.now()) {
  return new Date(now + CAMERA_STREAM_TTL_SECONDS * 1000).toISOString()
}

export function isSafeHlsFileName(value: string) {
  return SAFE_HLS_FILE.test(value) && !value.includes('..') && !value.includes('/')
}

export function getCameraStreamHlsObjectPath(
  organizationId: string,
  propertyId: string,
  sessionId: string,
  fileName = CAMERA_STREAM_HLS_MANIFEST
) {
  return `streams/${organizationId}/${propertyId}/${sessionId}/${fileName}`
}

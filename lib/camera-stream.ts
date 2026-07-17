import 'server-only'

import crypto from 'node:crypto'

export const CAMERA_STREAM_TTL_SECONDS = 120
export const CAMERA_STREAM_MAX_ACTIVE_PER_DEVICE = 1
export const CAMERA_STREAM_MAX_ACTIVE_PER_PROPERTY = 6
export const CAMERA_STREAM_HLS_MANIFEST = 'index.m3u8'
export const CAMERA_STREAM_TRANSPORTS = ['hls', 'webrtc'] as const

const SAFE_HLS_FILE = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,119}$/

export type CameraStreamTransport = (typeof CAMERA_STREAM_TRANSPORTS)[number]
export type CameraStreamSignalingState = 'hls_ready' | 'offer_pending' | 'answer_ready' | 'failed'

export type CameraStreamIceCandidate = {
  candidate: string
  sdpMid?: string
  sdpMLineIndex?: number
}

export type CameraStreamMetadata = {
  requestedByRole?: string
  deviceName?: string
  preferredTransport?: CameraStreamTransport
  signalingState?: CameraStreamSignalingState
  clientOffer?: string
  gatewayAnswer?: string
  clientIceCandidates?: CameraStreamIceCandidate[]
  gatewayIceCandidates?: CameraStreamIceCandidate[]
  gatewayError?: string
}

export function generateCameraStreamToken() {
  return crypto.randomBytes(32).toString('base64url')
}

export function hashCameraStreamToken(token: string) {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex')
}

export function getCameraStreamExpiry(now = Date.now()) {
  return new Date(now + CAMERA_STREAM_TTL_SECONDS * 1000).toISOString()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, maxLength)
}

function normalizeIceCandidates(value: unknown): CameraStreamIceCandidate[] {
  if (!Array.isArray(value)) return []
  return value
    .slice(0, 20)
    .map((candidate): CameraStreamIceCandidate | null => {
      if (!isRecord(candidate)) return null
      const candidateValue = normalizeString(candidate.candidate, 2000)
      if (!candidateValue) return null
      const sdpMid = normalizeString(candidate.sdpMid, 120)
      const sdpMLineIndex = typeof candidate.sdpMLineIndex === 'number'
        ? Math.max(0, Math.min(20, Math.trunc(candidate.sdpMLineIndex)))
        : undefined
      return { candidate: candidateValue, sdpMid, sdpMLineIndex }
    })
    .filter((candidate): candidate is CameraStreamIceCandidate => Boolean(candidate))
}

export function normalizeCameraStreamTransport(value: unknown): CameraStreamTransport {
  return value === 'webrtc' ? 'webrtc' : 'hls'
}

export function readCameraStreamMetadata(value: unknown): CameraStreamMetadata {
  if (!isRecord(value)) return {}
  const preferredTransport = normalizeCameraStreamTransport(value.preferredTransport)
  const signalingState = ['hls_ready', 'offer_pending', 'answer_ready', 'failed'].includes(String(value.signalingState))
    ? value.signalingState as CameraStreamSignalingState
    : preferredTransport === 'webrtc'
      ? 'offer_pending'
      : 'hls_ready'

  return {
    requestedByRole: normalizeString(value.requestedByRole, 80),
    deviceName: normalizeString(value.deviceName, 160),
    preferredTransport,
    signalingState,
    clientOffer: normalizeString(value.clientOffer, 20000),
    gatewayAnswer: normalizeString(value.gatewayAnswer, 20000),
    clientIceCandidates: normalizeIceCandidates(value.clientIceCandidates),
    gatewayIceCandidates: normalizeIceCandidates(value.gatewayIceCandidates),
    gatewayError: normalizeString(value.gatewayError, 500),
  }
}

export function buildCameraStreamClientMetadata(input: {
  requestedByRole: string
  deviceName: string
  preferredTransport: CameraStreamTransport
  clientOffer?: string
  clientIceCandidates?: CameraStreamIceCandidate[]
}): CameraStreamMetadata {
  return {
    requestedByRole: input.requestedByRole,
    deviceName: input.deviceName,
    preferredTransport: input.preferredTransport,
    signalingState: input.preferredTransport === 'webrtc' ? 'offer_pending' : 'hls_ready',
    clientOffer: normalizeString(input.clientOffer, 20000),
    clientIceCandidates: normalizeIceCandidates(input.clientIceCandidates),
  }
}

export function mergeCameraStreamGatewayMetadata(
  current: unknown,
  input: {
    status: 'active' | 'ended' | 'failed'
    transport?: CameraStreamTransport
    gatewayAnswer?: string
    gatewayIceCandidates?: CameraStreamIceCandidate[]
    error?: string
  }
): CameraStreamMetadata {
  const metadata = readCameraStreamMetadata(current)
  const preferredTransport = input.transport || metadata.preferredTransport || 'hls'
  return {
    ...metadata,
    preferredTransport,
    signalingState: input.status === 'failed'
      ? 'failed'
      : input.gatewayAnswer
        ? 'answer_ready'
        : preferredTransport === 'webrtc'
          ? metadata.signalingState || 'offer_pending'
          : 'hls_ready',
    gatewayAnswer: normalizeString(input.gatewayAnswer, 20000) || metadata.gatewayAnswer,
    gatewayIceCandidates: normalizeIceCandidates(input.gatewayIceCandidates).length
      ? normalizeIceCandidates(input.gatewayIceCandidates)
      : metadata.gatewayIceCandidates,
    gatewayError: normalizeString(input.error, 500),
  }
}

export function getClientCameraStreamSignaling(metadata: unknown) {
  const parsed = readCameraStreamMetadata(metadata)
  return {
    preferredTransport: parsed.preferredTransport || 'hls',
    signalingState: parsed.signalingState || 'hls_ready',
    gatewayAnswer: parsed.gatewayAnswer,
    gatewayIceCandidates: parsed.gatewayIceCandidates || [],
    gatewayError: parsed.gatewayError,
  }
}

export function getGatewayCameraStreamSignaling(metadata: unknown) {
  const parsed = readCameraStreamMetadata(metadata)
  return {
    preferredTransport: parsed.preferredTransport || 'hls',
    signalingState: parsed.signalingState || 'hls_ready',
    clientOffer: parsed.clientOffer,
    clientIceCandidates: parsed.clientIceCandidates || [],
  }
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

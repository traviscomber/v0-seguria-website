import assert from 'node:assert/strict'
import test from 'node:test'

import { deriveVisionAlertCandidates, type VisionCameraInput, type VisionJobInput } from './vision-alerts.ts'

const NOW = new Date('2026-07-31T22:00:00.000Z')

function camera(overrides: Partial<VisionCameraInput> = {}): VisionCameraInput {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    code: 'HH-001',
    name: 'Pampa Pilmaiquen',
    zone_label: 'Centro de Conservacion del Huemul',
    latitude: -39.937,
    longitude: -71.904,
    active: true,
    created_at: '2026-07-01T00:00:00.000Z',
    ...overrides,
  }
}

function job(overrides: Partial<VisionJobInput> = {}): VisionJobInput {
  return {
    id: '22222222-2222-4222-8222-222222222222',
    status: 'completed',
    review_status: 'pending',
    camera_id: '11111111-1111-4111-8111-111111111111',
    zone_label: 'Centro de Conservacion del Huemul',
    captured_at: '2026-07-31T21:00:00.000Z',
    created_at: '2026-07-31T21:01:00.000Z',
    result_json: { detections: [{ species: 'huemul', confidence: 0.94 }] },
    ...overrides,
  }
}

test('creates a high-priority alert for a confident huemul detection', () => {
  const alerts = deriveVisionAlertCandidates([job()], [camera()], NOW)
  const priority = alerts.find((alert) => alert.alertType === 'priority_species')

  assert.ok(priority)
  assert.equal(priority.severity, 'high')
  assert.equal(priority.title, 'Huemul detectado')
  assert.equal(priority.cameraId, camera().id)
})

test('creates a critical intrusion alert for a person inside the sensitive zone', () => {
  const alerts = deriveVisionAlertCandidates([
    job({
      id: '33333333-3333-4333-8333-333333333333',
      result_json: { detections: [{ species: 'person', confidence: 0.98 }] },
    }),
  ], [camera()], NOW)

  const intrusion = alerts.find((alert) => alert.alertType === 'human_intrusion')
  assert.ok(intrusion)
  assert.equal(intrusion.severity, 'critical')
})

test('does not create an intrusion alert for a person outside the sensitive zone', () => {
  const outsideCamera = camera({
    id: '44444444-4444-4444-8444-444444444444',
    zone_label: 'Hotel Nothofagus',
    latitude: -39.86924,
    longitude: -71.91447,
  })
  const alerts = deriveVisionAlertCandidates([
    job({
      id: '55555555-5555-4555-8555-555555555555',
      camera_id: outsideCamera.id,
      zone_label: 'Hotel Nothofagus',
      result_json: { detections: [{ species: 'person', confidence: 0.98 }] },
    }),
  ], [outsideCamera], NOW)

  assert.equal(alerts.some((alert) => alert.alertType === 'human_intrusion'), false)
})

test('creates an inference failure alert', () => {
  const alerts = deriveVisionAlertCandidates([
    job({
      id: '66666666-6666-4666-8666-666666666666',
      status: 'failed',
      error_code: 'openai_request_failed',
      error_message: 'Provider timeout',
      result_json: null,
    }),
  ], [camera()], NOW)

  const failure = alerts.find((alert) => alert.alertType === 'inference_failure')
  assert.ok(failure)
  assert.equal(failure.severity, 'high')
})

test('creates a camera inactivity alert after 72 hours without evidence', () => {
  const staleCamera = camera({
    id: '77777777-7777-4777-8777-777777777777',
    created_at: '2026-07-20T00:00:00.000Z',
  })
  const alerts = deriveVisionAlertCandidates([], [staleCamera], NOW)

  const inactive = alerts.find((alert) => alert.alertType === 'camera_inactive')
  assert.ok(inactive)
  assert.equal(inactive.cameraId, staleCamera.id)
})

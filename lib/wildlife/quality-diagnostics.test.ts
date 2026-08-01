import assert from 'node:assert/strict'
import test from 'node:test'

import { assessImageQuality, buildQualityReport, diagnoseCameraQuality } from './quality-diagnostics.ts'

test('marks dark blurred evidence as poor quality', () => {
  const quality = assessImageQuality({
    captured_at: null,
    result_json: {
      detections: [{ species: 'unknown_animal', description: 'Sujeto parcialmente oculto.' }],
      scene_summary: 'Imagen muy oscura y borrosa.',
      limitations: ['Baja visibilidad por falta de iluminacion.'],
    },
  })

  assert.equal(quality.level, 'poor')
  assert.ok(quality.flags.includes('low_visibility'))
  assert.ok(quality.flags.includes('blurred'))
  assert.ok(quality.flags.includes('occluded'))
  assert.ok(quality.flags.includes('uncertain_subject'))
  assert.ok(quality.flags.includes('metadata_missing'))
})

test('does not penalize a clear infrared capture as poor by itself', () => {
  const quality = assessImageQuality({
    captured_at: '2026-07-31T04:00:00.000Z',
    result_json: {
      detections: [{ species: 'puma', description: 'Puma visible de cuerpo completo.' }],
      scene_summary: 'Captura infrarroja nocturna con sujeto nitido.',
      limitations: [],
      image_metadata: { capturedAt: '2026-07-31T04:00:00.000Z', capturedAtSource: 'exif' },
    },
  })

  assert.equal(quality.level, 'good')
  assert.ok(quality.flags.includes('infrared'))
  assert.equal(quality.flags.includes('low_visibility'), false)
})

test('escalates a camera with prolonged inactivity to critical', () => {
  const diagnostic = diagnoseCameraQuality({
    id: 'camera-1', code: 'CAM-001', name: 'Sendero norte', active: true,
  }, [{
    id: 'job-1', camera_id: 'camera-1', status: 'completed', captured_at: '2026-07-20T12:00:00.000Z',
    created_at: '2026-07-20T12:05:00.000Z', result_json: { detections: [{ species: 'puma' }] },
  }], new Date('2026-08-01T12:00:00.000Z'))

  assert.equal(diagnostic.status, 'critical')
  assert.ok(diagnostic.recommendations.some((item) => item.includes('energia')))
})

test('builds a camera report without inventing hardware telemetry', () => {
  const report = buildQualityReport([
    { id: 'camera-1', code: 'CAM-001', name: 'Sendero norte', active: true },
    { id: 'camera-2', code: 'CAM-002', name: 'Bosque sur', active: true },
  ], [{
    id: 'job-1', camera_id: 'camera-1', status: 'completed', captured_at: '2026-08-01T10:00:00.000Z',
    created_at: '2026-08-01T10:05:00.000Z', result_json: { detections: [{ species: 'empty_frame' }] },
  }], new Date('2026-08-01T12:00:00.000Z'))

  assert.equal(report.totals.cameras, 2)
  assert.equal(report.totals.noData, 1)
  assert.equal(report.methodology.hardwareTelemetry, false)
})

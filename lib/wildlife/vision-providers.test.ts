import assert from 'node:assert/strict'
import test from 'node:test'

import {
  selectVisionProvider,
  visionProviderEndpoint,
  visionProviderLabel,
} from './vision-providers.ts'

test('prefers ONNX when both providers are ready', () => {
  assert.equal(selectVisionProvider({ onnxReady: true, openaiReady: true }), 'onnx')
})

test('falls back to OpenAI when ONNX is unavailable', () => {
  assert.equal(selectVisionProvider({ onnxReady: false, openaiReady: true }), 'openai')
  assert.equal(visionProviderEndpoint('openai'), '/api/vision/openai/infer')
  assert.equal(visionProviderLabel('openai', 'gpt-5-mini'), 'OpenAI Vision temporal · gpt-5-mini')
})

test('returns no provider when nothing is configured', () => {
  assert.equal(selectVisionProvider({ onnxReady: false, openaiReady: false }), null)
  assert.equal(visionProviderEndpoint(null), null)
  assert.equal(visionProviderLabel(null), 'Ningún proveedor configurado')
})

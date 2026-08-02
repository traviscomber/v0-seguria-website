import assert from 'node:assert/strict'
import test from 'node:test'

import { classifyMediaLicense } from './gbif-license.mjs'

test('CC0 media is eligible after human review', () => {
  const result = classifyMediaLicense('https://creativecommons.org/publicdomain/zero/1.0/')
  assert.equal(result.verified, true)
  assert.equal(result.commercialUseAllowed, true)
  assert.equal(result.derivativesAllowed, true)
  assert.equal(result.trainingEligible, true)
})

test('CC BY media permits commercial derivatives', () => {
  const result = classifyMediaLicense('https://creativecommons.org/licenses/by/4.0/')
  assert.equal(result.code, 'CC-BY-4.0')
  assert.equal(result.trainingEligible, true)
})

test('non-commercial media is rejected for training', () => {
  const result = classifyMediaLicense('https://creativecommons.org/licenses/by-nc/4.0/')
  assert.equal(result.verified, true)
  assert.equal(result.commercialUseAllowed, false)
  assert.equal(result.trainingEligible, false)
})

test('unknown license stays ineligible', () => {
  const result = classifyMediaLicense('all rights reserved')
  assert.equal(result.verified, false)
  assert.equal(result.trainingEligible, false)
})

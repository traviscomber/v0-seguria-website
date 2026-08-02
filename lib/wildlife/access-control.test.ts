import assert from 'node:assert/strict'
import test from 'node:test'

import {
  generalizeCoordinate,
  getWildlifeCapabilities,
  normalizeWildlifeRole,
  protectCoordinates,
} from './access-control.ts'

test('owners receive exact coordinates and full operation controls', () => {
  const capabilities = getWildlifeCapabilities('owner')
  assert.equal(capabilities.coordinatePrecision, 'exact')
  assert.equal(capabilities.manageMembers, true)
  assert.equal(capabilities.manageCameras, true)
  assert.equal(capabilities.reviewEvidence, true)
})

test('reviewers can validate evidence but receive generalized coordinates', () => {
  const capabilities = getWildlifeCapabilities('reviewer')
  assert.equal(capabilities.coordinatePrecision, 'generalized')
  assert.equal(capabilities.manageCameras, false)
  assert.equal(capabilities.reviewEvidence, true)
})

test('viewers remain read only', () => {
  const capabilities = getWildlifeCapabilities('viewer')
  assert.equal(capabilities.processEvidence, false)
  assert.equal(capabilities.reviewEvidence, false)
  assert.equal(capabilities.viewEvidence, true)
})

test('generalized coordinates reduce precision to approximately one kilometre', () => {
  assert.equal(generalizeCoordinate(-39.93781), -39.94)
  assert.equal(generalizeCoordinate(-71.90372), -71.9)
  assert.deepEqual(protectCoordinates(-39.93781, -71.90372, 'generalized'), {
    latitude: -39.94,
    longitude: -71.9,
  })
})

test('unknown operation roles fail closed as viewer', () => {
  assert.equal(normalizeWildlifeRole('scientist'), 'viewer')
  assert.equal(normalizeWildlifeRole(null), 'viewer')
})

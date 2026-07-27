import test from 'node:test'
import assert from 'node:assert/strict'
import { buildProposalDocument } from './builder.ts'
import { findProposalVariables, resolveProposalDocument, resolveProposalText } from './resolver.ts'
import { validateProposalDocument } from './validator.ts'
import type { ProposalBlock } from '../types.ts'

const requiredSections: ProposalBlock[] = [
  { id: 'cover', type: 'cover', title: 'Propuesta para {{client.name}}', body: 'Fecha: {{proposal.date}}', layout: 'feature', imageIds: [] },
  { id: 'summary', type: 'executive-summary', title: 'Resumen ejecutivo', body: 'Contexto', layout: 'editorial', imageIds: [] },
  { id: 'solution', type: 'solution', title: 'Solución propuesta', body: 'Solución', layout: 'split', imageIds: [] },
  { id: 'scope', type: 'scope', title: 'Alcance', body: 'Alcance', layout: 'editorial', imageIds: [] },
  { id: 'pricing', type: 'pricing', title: 'Inversión', body: 'Valores', layout: 'feature', imageIds: [] },
  { id: 'closing', type: 'closing', title: 'Próximos pasos', body: 'Cierre', layout: 'feature', imageIds: [] },
]

test('builds a versioned proposal document with default variables', () => {
  const document = buildProposalDocument({ title: 'Propuesta', clientName: 'Hotel Norte', sections: requiredSections })
  assert.equal(document.schemaVersion, 1)
  assert.equal(document.metadata.clientName, 'Hotel Norte')
  assert.equal(document.variables['client.name'], 'Hotel Norte')
  assert.equal(typeof document.variables['proposal.date'], 'string')
})

test('resolves known variables and preserves unknown variables', () => {
  assert.equal(resolveProposalText('Hola {{client.name}}', { 'client.name': 'Acme' }), 'Hola Acme')
  assert.equal(resolveProposalText('Valor {{missing.value}}', {}), 'Valor {{missing.value}}')
})

test('finds unique variables', () => {
  assert.deepEqual(findProposalVariables('{{client.name}} / {{client.name}} / {{proposal.date}}'), ['client.name', 'proposal.date'])
})

test('resolves a complete document without mutating the source', () => {
  const source = buildProposalDocument({ title: 'Propuesta', clientName: 'Hotel Norte', sections: requiredSections })
  const resolved = resolveProposalDocument(source)
  assert.equal(resolved.sections[0].title, 'Propuesta para Hotel Norte')
  assert.equal(source.sections[0].title, 'Propuesta para {{client.name}}')
})

test('accepts a complete document', () => {
  const document = buildProposalDocument({ title: 'Propuesta', clientName: 'Hotel Norte', sections: requiredSections })
  const result = validateProposalDocument(document)
  assert.equal(result.valid, true)
  assert.equal(result.issues.length, 0)
})

test('rejects missing required sections and forbidden brand terms', () => {
  const document = buildProposalDocument({
    title: 'Propuesta',
    clientName: 'Hotel Norte',
    sections: [{ ...requiredSections[0], body: 'Ofrecemos riesgo cero.' }],
  })
  const result = validateProposalDocument(document)
  assert.equal(result.valid, false)
  assert.ok(result.issues.some((issue) => issue.code === 'missing-required-section'))
  assert.ok(result.issues.some((issue) => issue.code === 'forbidden-brand-term'))
})

test('warns about unresolved variables and duplicate section ids', () => {
  const sections = requiredSections.map((section) => ({ ...section }))
  sections[1] = { ...sections[1], id: 'cover', body: '{{unknown.value}}' }
  const document = buildProposalDocument({ title: 'Propuesta', clientName: 'Hotel Norte', sections })
  const result = validateProposalDocument(document)
  assert.equal(result.valid, false)
  assert.ok(result.issues.some((issue) => issue.code === 'duplicate-section-id'))
  assert.ok(result.issues.some((issue) => issue.code === 'unresolved-variable'))
})

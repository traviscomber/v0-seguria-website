import { PROPOSAL_BRANDBOOK } from '@/lib/proposals/brandbook'
import type { ProposalDocument } from '@/lib/proposals/types'
import { findProposalVariables } from './resolver'

export type ProposalValidationIssue = {
  code: string
  message: string
  sectionId?: string
  severity: 'error' | 'warning'
}

export type ProposalValidationResult = {
  valid: boolean
  issues: ProposalValidationIssue[]
}

export function validateProposalDocument(document: ProposalDocument): ProposalValidationResult {
  const issues: ProposalValidationIssue[] = []
  const sectionTypes = new Set(document.sections.map((section) => section.type))
  const sectionIds = new Set<string>()

  for (const required of PROPOSAL_BRANDBOOK.proposalRules.requiredBlocks) {
    if (!sectionTypes.has(required)) {
      issues.push({
        code: 'missing-required-section',
        message: `Falta la sección obligatoria: ${required}`,
        severity: 'error',
      })
    }
  }

  for (const section of document.sections) {
    if (sectionIds.has(section.id)) {
      issues.push({
        code: 'duplicate-section-id',
        message: `La sección ${section.title || section.id} tiene un identificador duplicado.`,
        sectionId: section.id,
        severity: 'error',
      })
    }
    sectionIds.add(section.id)

    if (!section.title.trim()) {
      issues.push({
        code: 'empty-section-title',
        message: 'La sección no tiene título.',
        sectionId: section.id,
        severity: 'warning',
      })
    }

    const referencedVariables = [
      ...findProposalVariables(section.title),
      ...findProposalVariables(section.body),
    ]

    for (const variable of referencedVariables) {
      if (!(variable in document.variables)) {
        issues.push({
          code: 'unresolved-variable',
          message: `La variable {{${variable}}} no tiene un valor definido.`,
          sectionId: section.id,
          severity: 'warning',
        })
      }
    }

    for (const forbidden of PROPOSAL_BRANDBOOK.voice.forbiddenTerms) {
      if (`${section.title} ${section.body}`.toLowerCase().includes(forbidden.toLowerCase())) {
        issues.push({
          code: 'forbidden-brand-term',
          message: `La sección contiene el término no autorizado “${forbidden}”.`,
          sectionId: section.id,
          severity: 'error',
        })
      }
    }
  }

  return {
    valid: !issues.some((issue) => issue.severity === 'error'),
    issues,
  }
}

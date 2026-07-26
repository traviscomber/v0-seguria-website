import type { ProposalBlock, ProposalDocument, ProposalVariables } from '@/lib/proposals/types'

const VARIABLE_PATTERN = /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g

export function resolveProposalText(text: string, variables: ProposalVariables): string {
  return text.replace(VARIABLE_PATTERN, (_match, key: string) => {
    const value = variables[key]
    if (value === undefined || value === null) return ''
    return String(value)
  })
}

export function findProposalVariables(text: string): string[] {
  const variables = new Set<string>()
  for (const match of text.matchAll(VARIABLE_PATTERN)) variables.add(match[1])
  return [...variables]
}

export function resolveProposalBlock(block: ProposalBlock, variables: ProposalVariables): ProposalBlock {
  return {
    ...block,
    title: resolveProposalText(block.title, variables),
    body: resolveProposalText(block.body, variables),
  }
}

export function resolveProposalDocument(document: ProposalDocument): ProposalDocument {
  return {
    ...document,
    metadata: {
      ...document.metadata,
      title: resolveProposalText(document.metadata.title, document.variables),
      clientName: resolveProposalText(document.metadata.clientName, document.variables),
    },
    sections: document.sections.map((section) => resolveProposalBlock(section, document.variables)),
  }
}

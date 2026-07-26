import { PROPOSAL_BRANDBOOK } from '../brandbook'
import type {
  ProposalAsset,
  ProposalBlock,
  ProposalDocument,
  ProposalStatus,
  ProposalVariables,
} from '../types'

type BuildProposalDocumentInput = {
  title: string
  clientName: string
  sections: ProposalBlock[]
  assets?: ProposalAsset[]
  variables?: ProposalVariables
  status?: ProposalStatus
  leadId?: string | null
}

export function createProposalVariables(clientName: string, extra: ProposalVariables = {}): ProposalVariables {
  return {
    'client.name': clientName,
    'proposal.date': new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date()),
    ...extra,
  }
}

export function buildProposalDocument({
  title,
  clientName,
  sections,
  assets = [],
  variables = {},
  status = 'draft',
  leadId = null,
}: BuildProposalDocumentInput): ProposalDocument {
  return {
    schemaVersion: 1,
    metadata: {
      title,
      clientName,
      status,
      brandbookVersion: PROPOSAL_BRANDBOOK.version,
      leadId,
    },
    variables: createProposalVariables(clientName, variables),
    sections,
    assets,
  }
}

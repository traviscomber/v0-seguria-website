export type ProposalStatus = 'draft' | 'review' | 'approved' | 'sent' | 'archived'

export type ProposalBlockType =
  | 'cover'
  | 'executive-summary'
  | 'challenge'
  | 'solution'
  | 'gallery'
  | 'scope'
  | 'timeline'
  | 'pricing'
  | 'terms'
  | 'closing'

export type ProposalLayout = 'editorial' | 'split' | 'feature' | 'gallery'

export type ProposalVariableValue = string | number | boolean | null
export type ProposalVariables = Record<string, ProposalVariableValue>

export interface ProposalAsset {
  id: string
  url: string
  name: string
  altText: string
}

export interface ProposalBlock {
  id: string
  type: ProposalBlockType
  title: string
  body: string
  layout: ProposalLayout
  imageIds: string[]
}

export interface ProposalDocumentMetadata {
  title: string
  clientName: string
  status: ProposalStatus
  brandbookVersion: string
  leadId?: string | null
}

export interface ProposalDocument {
  schemaVersion: 1
  metadata: ProposalDocumentMetadata
  variables: ProposalVariables
  sections: ProposalBlock[]
  assets: ProposalAsset[]
}

export interface ProposalDraft {
  id: string
  title: string
  clientName: string
  status: ProposalStatus
  brandbookVersion: string
  blocks: ProposalBlock[]
  assets: ProposalAsset[]
  variables?: ProposalVariables
  updatedAt: string
}

export interface ProposalAgentCommand {
  instruction: string
  proposalId?: string
}

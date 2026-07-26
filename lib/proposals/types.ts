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
  layout: 'editorial' | 'split' | 'feature' | 'gallery'
  imageIds: string[]
}

export interface ProposalDraft {
  id: string
  title: string
  clientName: string
  status: ProposalStatus
  brandbookVersion: string
  blocks: ProposalBlock[]
  assets: ProposalAsset[]
  updatedAt: string
}

export interface ProposalAgentCommand {
  instruction: string
  proposalId?: string
}

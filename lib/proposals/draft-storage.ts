import type { ProposalBlock } from '@/lib/proposals/types'

export const PROPOSAL_DRAFT_STORAGE_KEY = 'seguria:proposal-draft:v1'

export interface StoredProposalDraft {
  title: string
  clientName: string
  blocks: ProposalBlock[]
  updatedAt: string
}

export function readStoredProposalDraft(): StoredProposalDraft | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(PROPOSAL_DRAFT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredProposalDraft
    if (!parsed || !Array.isArray(parsed.blocks)) return null
    return parsed
  } catch {
    return null
  }
}

export function writeStoredProposalDraft(draft: StoredProposalDraft) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(PROPOSAL_DRAFT_STORAGE_KEY, JSON.stringify(draft))
}

export function clearStoredProposalDraft() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(PROPOSAL_DRAFT_STORAGE_KEY)
}

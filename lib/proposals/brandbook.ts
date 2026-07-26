export const PROPOSAL_BRANDBOOK = {
  version: '1.0.0',
  companyName: 'SegurIA',
  logos: {
    primary: '/logo-seguria.png',
    inverse: '/logo-seguria-white.png',
  },
  colors: {
    primary: '#071524',
    secondary: '#0E2A43',
    accent: '#4DA3D9',
    success: '#10B981',
    surface: '#102236',
    text: '#F8FAFC',
    mutedText: '#94A3B8',
  },
  typography: {
    heading: 'var(--font-sans)',
    body: 'var(--font-sans)',
  },
  voice: {
    tone: ['claro', 'profesional', 'confiable', 'tecnológico', 'orientado a resultados'],
    preferredTerms: ['protección', 'monitoreo', 'continuidad operacional', 'respuesta', 'evidencia'],
    forbiddenTerms: ['infalible', 'riesgo cero', 'garantía absoluta'],
  },
  proposalRules: {
    requiredBlocks: ['cover', 'executive-summary', 'solution', 'scope', 'pricing', 'closing'],
    allowedLayouts: ['editorial', 'split', 'feature', 'gallery'],
    footerText: 'SegurIA · Seguridad inteligente para operaciones críticas',
  },
} as const

export type ProposalBrandbook = typeof PROPOSAL_BRANDBOOK

export function getProposalBrandCompliance(blockTypes: string[]) {
  const required = PROPOSAL_BRANDBOOK.proposalRules.requiredBlocks
  const missing = required.filter((block) => !blockTypes.includes(block))
  const score = Math.round(((required.length - missing.length) / required.length) * 100)

  return {
    score,
    missing,
    valid: missing.length === 0,
  }
}

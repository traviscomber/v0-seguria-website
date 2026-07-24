import type { PortalSite } from '@/types/client-portal'

export type PortalSiteSummary = PortalSite & {
  organizationId: string
  projectId: string
  imageCredit: string
  imageCreditUrl: string
  imageIsRepresentative: boolean
  accessCount: number
  documentCount: number
  alertCount: number
  documents: unknown[]
  events: unknown[]
  spaces: unknown[]
  gatewayHealth: string
  report: unknown | null
}

export function mapPortalSiteToSummary(site: PortalSite): PortalSiteSummary {
  return {
    ...site,
    organizationId: site.organizationName || site.propertyId,
    projectId: site.propertyId,
    imageCredit: '',
    imageCreditUrl: '',
    imageIsRepresentative: Boolean(site.imageUrl),
    accessCount: 0,
    documentCount: 0,
    alertCount: site.incidents?.length || 0,
    documents: [],
    events: [],
    spaces: [],
    gatewayHealth: 'unknown',
    report: null,
  }
}

export function mapPortalSitesToSummaries(sites: PortalSite[]) {
  return sites.map(mapPortalSiteToSummary)
}

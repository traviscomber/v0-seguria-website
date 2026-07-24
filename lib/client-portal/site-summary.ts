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
  }
}

export function mapPortalSitesToSummaries(sites: PortalSite[]) {
  return sites.map(mapPortalSiteToSummary)
}

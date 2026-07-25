import type {
  PortalIncident as CanonicalPortalIncident,
  PortalSiteSummary,
} from '@/lib/client-portal'
import type { Device } from '@/lib/types'

export type PortalTimestamp = Date | string | null | undefined

/** Canonical device contract used by the portal domain. */
export type PortalDevice = Device

/** Canonical site contract returned by the portal data layer. */
export type PortalSite = PortalSiteSummary

/** Canonical incident contract used by portal feeds and views. */
export type PortalIncident = CanonicalPortalIncident

export interface PortalActivityItem {
  id?: string
  title?: string
  label?: string
  description?: string
  detail?: string
  siteLabel?: string
  createdAt?: PortalTimestamp
  updatedAt?: PortalTimestamp
}

export interface PortalEvidenceItem {
  id?: string
  title?: string
  label?: string
  type?: string
  description?: string
  evidence?: string
  action?: string
  createdAt?: PortalTimestamp
  updatedAt?: PortalTimestamp
}

export interface PortalSiteDeviceItem {
  site: PortalSite
  device: PortalDevice
}

export interface PortalSiteIncidentItem {
  site: PortalSite
  incident: PortalIncident
}

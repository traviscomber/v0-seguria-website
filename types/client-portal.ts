export type PortalTimestamp = Date | string | null | undefined

export interface PortalDevice {
  id?: string
  name?: string
  nombre?: string
  label?: string
  tipo?: string
  status?: string
  estado?: string
  statusLabel?: string
  location?: string
  ubicacion?: string
  zone?: string
  zona?: string
  updatedAt?: PortalTimestamp
  lastSeenAt?: PortalTimestamp
}

export interface PortalIncident {
  id?: string
  title?: string
  type?: string
  description?: string
  status?: string
  statusLabel?: string
  responsible?: string
  assignee?: string
  createdAt?: PortalTimestamp
  updatedAt?: PortalTimestamp
}

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

export interface PortalSiteProfile {
  summary?: string
}

export interface PortalSite {
  propertyId: string
  name?: string
  label?: string
  organizationName?: string
  address?: string
  location?: string
  imageUrl?: string
  imageAlt?: string
  status?: string
  statusLabel?: string
  lastUpdatedAt?: PortalTimestamp
  deviceCount?: number
  cameraCount?: number
  sensorCount?: number
  profile?: PortalSiteProfile
  devices?: PortalDevice[]
  incidents?: PortalIncident[]
}

export interface PortalSiteDeviceItem {
  site: PortalSite
  device: PortalDevice
}

export interface PortalSiteIncidentItem {
  site: PortalSite
  incident: PortalIncident
}

import {
  getPortalActivityFeed,
  getPortalEvidenceGallery,
  getPortalSiteForUser,
  isOpenPortalIncident,
} from '@/lib/client-portal'
import type {
  PortalActivityItem,
  PortalDevice,
  PortalEvidenceItem,
  PortalIncident,
  PortalSite,
} from '@/types/client-portal'

type PortalUser = Parameters<typeof getPortalSiteForUser>[0]

export interface ClientPropertyView {
  site: PortalSite
  devices: PortalDevice[]
  cameras: PortalDevice[]
  activity: PortalActivityItem[]
  evidence: PortalEvidenceItem[]
  incidents: PortalIncident[]
  activeDevices: number
  devicesWithAttention: number
  overallStatus: 'Atención requerida' | 'Operativo'
}

export async function buildClientPropertyView(
  user: PortalUser,
  propertyId: string
): Promise<ClientPropertyView | null> {
  const site = (await getPortalSiteForUser(user, propertyId)) as PortalSite | null

  if (!site) return null

  const devices = (site.devices || []) as PortalDevice[]
  const incidents = ((site.incidents || []) as PortalIncident[])
    .filter(isOpenPortalIncident)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

  const cameras = devices.filter(
    (device) => device.tipo === 'camara_ip' || device.tipo === 'camara_analogica'
  )

  const activeDevices = devices.filter((device) =>
    ['activo', 'active', 'online', 'ok'].includes(String(device.estado || device.status || '').toLowerCase())
  ).length

  const devicesWithAttention = Math.max(0, devices.length - activeDevices)

  return {
    site,
    devices,
    cameras,
    activity: getPortalActivityFeed([site]).slice(0, 10) as PortalActivityItem[],
    evidence: getPortalEvidenceGallery(site).slice(0, 8) as PortalEvidenceItem[],
    incidents,
    activeDevices,
    devicesWithAttention,
    overallStatus: incidents.length > 0 || devicesWithAttention > 0 ? 'Atención requerida' : 'Operativo',
  }
}

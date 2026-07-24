import {
  getAccessiblePortalSites,
  getPortalActivityFeed,
  getPortalAlertDevices,
  getPortalDashboardTotals,
} from '@/lib/client-portal'
import type {
  PortalActivityItem,
  PortalSite,
  PortalSiteDeviceItem,
  PortalSiteIncidentItem,
} from '@/types/client-portal'

type PortalUser = Parameters<typeof getAccessiblePortalSites>[0]
type DashboardSiteSummary = Parameters<typeof getPortalDashboardTotals>[0][number]

export interface ClientDashboardView {
  sites: PortalSite[]
  totals: ReturnType<typeof getPortalDashboardTotals>
  alerts: PortalSiteDeviceItem[]
  activity: PortalActivityItem[]
  incidents: PortalSiteIncidentItem[]
  cameras: PortalSiteDeviceItem[]
  attentionRequired: number
  overallStatus: 'Atención requerida' | 'Todo operativo'
}

function isOpenIncident(incident: NonNullable<PortalSite['incidents']>[number]) {
  const status = String(incident.status || '').toLowerCase()
  return status !== 'closed' && status !== 'resolved' && status !== 'resuelto'
}

function toDashboardSiteSummary(site: PortalSite): DashboardSiteSummary {
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
    cameraCount: site.cameraCount || 0,
    sensorCount: site.sensorCount || 0,
    deviceCount: site.deviceCount || site.devices?.length || 0,
  } as DashboardSiteSummary
}

export async function buildClientDashboardView(user: PortalUser): Promise<ClientDashboardView> {
  let sites: PortalSite[] = []

  try {
    sites = (await getAccessiblePortalSites(user)) as PortalSite[]
  } catch {
    sites = []
  }

  const totals = getPortalDashboardTotals(sites.map(toDashboardSiteSummary))
  const alerts = getPortalAlertDevices(sites) as PortalSiteDeviceItem[]
  const activity = getPortalActivityFeed(sites).slice(0, 8) as PortalActivityItem[]
  const incidents = sites
    .flatMap((site) =>
      (site.incidents || [])
        .filter(isOpenIncident)
        .map((incident) => ({ site, incident }))
    )
    .sort((left, right) => {
      const leftDate = new Date(left.incident.createdAt || 0).getTime()
      const rightDate = new Date(right.incident.createdAt || 0).getTime()
      return rightDate - leftDate
    })
    .slice(0, 6) as PortalSiteIncidentItem[]

  const cameras = sites
    .flatMap((site) =>
      (site.devices || [])
        .filter((device) => device.tipo === 'camara_ip' || device.tipo === 'camara_analogica')
        .map((device) => ({ site, device }))
    )
    .slice(0, 4) as PortalSiteDeviceItem[]

  const attentionRequired = alerts.length + incidents.length

  return {
    sites,
    totals,
    alerts,
    activity,
    incidents,
    cameras,
    attentionRequired,
    overallStatus: attentionRequired > 0 ? 'Atención requerida' : 'Todo operativo',
  }
}

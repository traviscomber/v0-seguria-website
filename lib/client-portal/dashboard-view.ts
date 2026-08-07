import {
  getAccessiblePortalSites,
  getPortalActivityFeed,
  getPortalAlertDevices,
  getPortalDashboardTotals,
} from '@/lib/client-portal'
import { mergeVisionIntoClientDashboard } from '@/lib/client-portal/vision-dashboard'
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
  return status !== 'closed'
    && status !== 'resolved'
    && status !== 'resuelto'
    && status !== 'false_alarm'
    && status !== 'dismissed'
}

function activityTime(item: PortalActivityItem) {
  const value = item.createdAt || item.updatedAt
  const parsed = value ? new Date(value) : new Date(0)
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

function mergeActivity(primary: PortalActivityItem[], secondary: PortalActivityItem[]) {
  const items = new Map<string, PortalActivityItem>()
  for (const item of [...primary, ...secondary]) {
    const key = item.id ? String(item.id) : `${item.title || item.label || 'activity'}-${activityTime(item)}`
    if (!items.has(key)) items.set(key, item)
  }
  return Array.from(items.values())
    .sort((left, right) => activityTime(right) - activityTime(left))
    .slice(0, 8)
}

function toDashboardSiteSummary(site: PortalSite): DashboardSiteSummary {
  const operational = site as PortalSite & {
    events?: unknown[]
    gatewayHealth?: {
      total: number
      online: number
      degraded: number
      offline: number
      lastSeenAt?: Date
    }
    report?: {
      eventsToday: number
      criticalEventsToday: number
      incidentsThisMonth: number
      resolvedThisMonth: number
      overdueConfirmations: number
      averageConfirmationMinutes?: number
      averageResolutionHours?: number
    }
  }

  return {
    ...site,
    organizationId: site.organizationName || site.propertyId,
    projectId: site.propertyId,
    imageCredit: '',
    imageCreditUrl: '',
    imageIsRepresentative: Boolean(site.imageUrl),
    accessCount: 0,
    documentCount: 0,
    alertCount: (site.incidents || []).filter(isOpenIncident).length,
    cameraCount: site.cameraCount || 0,
    sensorCount: site.sensorCount || 0,
    deviceCount: site.deviceCount || site.devices?.length || 0,
    events: operational.events || [],
    gatewayHealth: operational.gatewayHealth || {
      total: 0,
      online: 0,
      degraded: 0,
      offline: 0,
    },
    report: operational.report || {
      eventsToday: 0,
      criticalEventsToday: 0,
      incidentsThisMonth: 0,
      resolvedThisMonth: 0,
      overdueConfirmations: 0,
    },
  } as DashboardSiteSummary
}

export async function buildClientDashboardView(user: PortalUser): Promise<ClientDashboardView> {
  let sites: PortalSite[] = []

  try {
    sites = (await getAccessiblePortalSites(user)) as PortalSite[]
  } catch (error) {
    console.error(
      '[portal] Legacy dashboard data failed; continuing with canonical projections:',
      error instanceof Error ? error.message : 'unknown error',
    )
  }

  let visionActivity: PortalActivityItem[] = []
  try {
    const projection = await mergeVisionIntoClientDashboard(user, sites)
    sites = projection.sites
    visionActivity = projection.activity
  } catch (error) {
    console.error(
      '[portal] Vision dashboard projection failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
  }

  const dashboardSites = sites.map(toDashboardSiteSummary)
  const totals = getPortalDashboardTotals(dashboardSites)
  const alerts = getPortalAlertDevices(dashboardSites) as PortalSiteDeviceItem[]
  const legacyActivity = getPortalActivityFeed(dashboardSites).slice(0, 8) as PortalActivityItem[]
  const activity = mergeActivity(visionActivity, legacyActivity)

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

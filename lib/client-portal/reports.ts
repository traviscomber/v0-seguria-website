import type {
  PortalOperationalReport,
  PortalSiteSummary,
} from '@/lib/client-portal'
import {
  getPortalDeviceBuckets,
  isOpenPortalIncident,
} from '@/lib/client-portal/devices'

function getAverage(values: number[]) {
  if (values.length === 0) return undefined
  return values.reduce((total, value) => total + value, 0) / values.length
}

export function getPortalDashboardTotals(sites: PortalSiteSummary[]) {
  const buckets = sites.flatMap((site) => getPortalDeviceBuckets(site.devices))

  return {
    organizations: new Set(sites.map((site) => site.organizationId)).size,
    sites: sites.length,
    devices: sites.reduce((total, site) => total + site.deviceCount, 0),
    cameras: buckets
      .filter((bucket) => bucket.key === 'camera')
      .reduce((total, bucket) => total + bucket.count, 0),
    sensors: buckets
      .filter((bucket) => bucket.key === 'sensor')
      .reduce((total, bucket) => total + bucket.count, 0),
    alerts: sites.reduce((total, site) => total + site.alertCount, 0),
    documents: sites.reduce((total, site) => total + site.documentCount, 0),
    openIncidents: sites.reduce(
      (total, site) => total + site.incidents.filter(isOpenPortalIncident).length,
      0
    ),
    onlineGateways: sites.reduce((total, site) => total + site.gatewayHealth.online, 0),
    offlineGateways: sites.reduce(
      (total, site) => total + site.gatewayHealth.offline + site.gatewayHealth.degraded,
      0
    ),
    eventsToday: sites.reduce((total, site) => total + site.report.eventsToday, 0),
    criticalEventsToday: sites.reduce(
      (total, site) => total + site.report.criticalEventsToday,
      0
    ),
    incidentsThisMonth: sites.reduce(
      (total, site) => total + site.report.incidentsThisMonth,
      0
    ),
    resolvedThisMonth: sites.reduce(
      (total, site) => total + site.report.resolvedThisMonth,
      0
    ),
    overdueConfirmations: sites.reduce(
      (total, site) => total + site.report.overdueConfirmations,
      0
    ),
  }
}

export function getPortalPortfolioReport(
  sites: PortalSiteSummary[]
): PortalOperationalReport {
  const confirmationValues = sites
    .map((site) => site.report.averageConfirmationMinutes)
    .filter((value): value is number => typeof value === 'number')
  const resolutionValues = sites
    .map((site) => site.report.averageResolutionHours)
    .filter((value): value is number => typeof value === 'number')

  return {
    eventsToday: sites.reduce((total, site) => total + site.report.eventsToday, 0),
    criticalEventsToday: sites.reduce(
      (total, site) => total + site.report.criticalEventsToday,
      0
    ),
    incidentsThisMonth: sites.reduce(
      (total, site) => total + site.report.incidentsThisMonth,
      0
    ),
    resolvedThisMonth: sites.reduce(
      (total, site) => total + site.report.resolvedThisMonth,
      0
    ),
    overdueConfirmations: sites.reduce(
      (total, site) => total + site.report.overdueConfirmations,
      0
    ),
    averageConfirmationMinutes: getAverage(confirmationValues),
    averageResolutionHours: getAverage(resolutionValues),
  }
}

import { getAccessiblePortalSites } from '@/lib/client-portal'
import { mapPortalSitesToSummaries } from '@/lib/client-portal/site-summary'
import type { PortalDevice, PortalSite } from '@/types/client-portal'

type PortalUser = Parameters<typeof getAccessiblePortalSites>[0]

export interface ClientDevicesView {
  sites: PortalSite[]
  devices: PortalDevice[]
  cameras: PortalDevice[]
  sensors: PortalDevice[]
  alerts: PortalDevice[]
  access: PortalDevice[]
  onlineDevices: PortalDevice[]
  offlineDevices: PortalDevice[]
  attentionRequired: PortalDevice[]
  overallStatus: 'Atención requerida' | 'Todo operativo'
}

function isOnline(device: PortalDevice) {
  return ['activo', 'active', 'online', 'ok'].includes(
    String(device.estado || device.status || '').toLowerCase()
  )
}

function getDeviceGroup(device: PortalDevice) {
  const type = String(device.tipo || '').toLowerCase()

  if (type.includes('camara')) return 'camera'
  if (type.includes('sensor') || type.includes('temperatura') || type.includes('movimiento')) return 'sensor'
  if (type.includes('access') || type.includes('puerta') || type.includes('acceso')) return 'access'
  if (type.includes('alert')) return 'alert'

  return 'other'
}

export async function buildClientDevicesView(user: PortalUser): Promise<ClientDevicesView> {
  const sites = (await getAccessiblePortalSites(user)) as PortalSite[]
  const summaries = mapPortalSitesToSummaries(sites)
  const devices = summaries.flatMap((site) => site.devices || []) as PortalDevice[]

  const cameras = devices.filter((device) => getDeviceGroup(device) === 'camera')
  const sensors = devices.filter((device) => getDeviceGroup(device) === 'sensor')
  const alerts = devices.filter((device) => getDeviceGroup(device) === 'alert')
  const access = devices.filter((device) => getDeviceGroup(device) === 'access')
  const onlineDevices = devices.filter(isOnline)
  const offlineDevices = devices.filter((device) => !isOnline(device))
  const attentionRequired = [...offlineDevices, ...alerts]

  return {
    sites,
    devices,
    cameras,
    sensors,
    alerts,
    access,
    onlineDevices,
    offlineDevices,
    attentionRequired,
    overallStatus: attentionRequired.length > 0 ? 'Atención requerida' : 'Todo operativo',
  }
}

import { getAccessiblePortalSites } from '@/lib/client-portal'
import type { PortalDevice, PortalSite } from '@/types/client-portal'

type PortalUser = Parameters<typeof getAccessiblePortalSites>[0]

type DeviceGroup = 'camera' | 'sensor' | 'alert' | 'access' | 'other'

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
  return device.estado === 'activo'
}

function getDeviceGroup(device: PortalDevice): DeviceGroup {
  const type = device.tipo.toLowerCase()

  if (type.includes('camara')) return 'camera'
  if (type.includes('sensor') || type.includes('temperatura') || type.includes('movimiento')) return 'sensor'
  if (type.includes('access') || type.includes('puerta') || type.includes('acceso')) return 'access'
  if (type.includes('alert')) return 'alert'

  return 'other'
}

function uniqueDevices(devices: PortalDevice[]) {
  return [...new Map(devices.map((device) => [device.id, device])).values()]
}

export async function buildClientDevicesView(user: PortalUser): Promise<ClientDevicesView> {
  const sites = await getAccessiblePortalSites(user)
  const devices = sites.flatMap((site) => site.devices)

  const cameras = devices.filter((device) => getDeviceGroup(device) === 'camera')
  const sensors = devices.filter((device) => getDeviceGroup(device) === 'sensor')
  const alerts = devices.filter((device) => getDeviceGroup(device) === 'alert')
  const access = devices.filter((device) => getDeviceGroup(device) === 'access')
  const onlineDevices = devices.filter(isOnline)
  const offlineDevices = devices.filter((device) => !isOnline(device))
  const attentionRequired = uniqueDevices([...offlineDevices, ...alerts])

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

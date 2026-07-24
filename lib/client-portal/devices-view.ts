import { getAccessiblePortalSites } from '@/lib/client-portal'
import type { PortalDevice, PortalSite } from '@/types/client-portal'

type PortalUser = Parameters<typeof getAccessiblePortalSites>[0]

export interface ClientDevicesView {
  sites: PortalSite[]
  devices: PortalDevice[]
  cameras: PortalDevice[]
  sensors: PortalDevice[]
  onlineDevices: PortalDevice[]
  offlineDevices: PortalDevice[]
  attentionRequired: PortalDevice[]
  overallStatus: 'Atención requerida' | 'Operativo'
}

function isCamera(device: PortalDevice) {
  return device.tipo === 'camara_ip' || device.tipo === 'camara_analogica'
}

function isOnline(device: PortalDevice) {
  return ['activo', 'active', 'online', 'ok'].includes(
    String(device.estado || device.status || '').toLowerCase()
  )
}

export async function buildClientDevicesView(
  user: PortalUser
): Promise<ClientDevicesView> {
  const sites = (await getAccessiblePortalSites(user)) as PortalSite[]
  const devices = sites.flatMap((site) => site.devices || [])

  const cameras = devices.filter(isCamera)
  const sensors = devices.filter((device) => !isCamera(device))
  const onlineDevices = devices.filter(isOnline)
  const offlineDevices = devices.filter((device) => !isOnline(device))

  return {
    sites,
    devices,
    cameras,
    sensors,
    onlineDevices,
    offlineDevices,
    attentionRequired: offlineDevices,
    overallStatus: offlineDevices.length > 0 ? 'Atención requerida' : 'Operativo',
  }
}

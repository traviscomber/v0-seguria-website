import { getDocuments, getDevices, getProjectById, getProjects } from '@/lib/store'
import type { AuthUser } from '@/lib/auth-store'
import type { Device, Document, Project } from '@/lib/types'

type PortalSiteStatus = 'operativo' | 'atencion' | 'revision'

export interface PortalSiteSummary {
  propertyId: string
  projectId?: string
  label: string
  location: string
  status: PortalSiteStatus
  statusLabel: string
  deviceCount: number
  cameraCount: number
  sensorCount: number
  accessCount: number
  documentCount: number
  alertCount: number
  lastUpdatedAt?: Date
  project?: Project
  devices: Device[]
  documents: Document[]
}

export interface PortalDeviceBucket {
  key: 'camera' | 'sensor' | 'alert' | 'access' | 'other'
  label: string
  count: number
  devices: Device[]
}

const PROPERTY_TO_PROJECT: Record<string, string> = {
  'demo-property': '1',
}

function resolveProjectId(propertyId: string) {
  return PROPERTY_TO_PROJECT[propertyId] || propertyId
}

function formatPropertyLabel(propertyId: string) {
  return propertyId
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function determineStatus(devices: Device[]): { status: PortalSiteStatus; label: string } {
  const hasAlert = devices.some((device) => device.estado === 'falla')
  const hasReview = devices.some((device) => device.estado === 'mantencion')

  if (hasAlert) {
    return { status: 'atencion', label: 'Requiere atención' }
  }

  if (hasReview) {
    return { status: 'revision', label: 'En revisión' }
  }

  return { status: 'operativo', label: 'Operativo' }
}

function isCamera(device: Device) {
  return device.tipo === 'camara_ip' || device.tipo === 'camara_analogica'
}

function isSensor(device: Device) {
  return ['sensor_movimiento', 'sensor_temperatura', 'sensor_humedad', 'sensor_puerta'].includes(device.tipo)
}

function isAccess(device: Device) {
  return device.tipo === 'control_acceso'
}

function getPortalGroup(device: Device): PortalDeviceBucket['key'] {
  const explicitGroup = device.metadata?.portalGroup
  if (
    explicitGroup === 'camera' ||
    explicitGroup === 'sensor' ||
    explicitGroup === 'alert' ||
    explicitGroup === 'access' ||
    explicitGroup === 'other'
  ) {
    return explicitGroup
  }

  if (isCamera(device)) return 'camera'
  if (isSensor(device)) return 'sensor'
  if (isAccess(device)) return 'access'
  if (device.estado === 'falla' || device.estado === 'mantencion') return 'alert'
  return 'other'
}

export function getPortalDeviceBuckets(devices: Device[]): PortalDeviceBucket[] {
  const buckets: PortalDeviceBucket[] = [
    { key: 'camera', label: 'Cámaras', count: 0, devices: [] },
    { key: 'sensor', label: 'Sensores', count: 0, devices: [] },
    { key: 'alert', label: 'Alertas', count: 0, devices: [] },
    { key: 'access', label: 'Accesos', count: 0, devices: [] },
    { key: 'other', label: 'Otros', count: 0, devices: [] },
  ]

  for (const device of devices) {
    const bucket = buckets.find((entry) => entry.key === getPortalGroup(device))
    if (!bucket) continue
    bucket.devices.push(device)
  }

  return buckets.map((bucket) => ({
    ...bucket,
    count: bucket.devices.length,
    devices: bucket.devices.sort((left, right) => {
      const leftAt = left.lastSeenAt || left.fechaActualizacion
      const rightAt = right.lastSeenAt || right.fechaActualizacion
      return rightAt.getTime() - leftAt.getTime()
    }),
  }))
}

export function getAccessiblePortalSites(user: AuthUser): PortalSiteSummary[] {
  const allProjects = getProjects()
  const accessiblePropertyIds = user.propertyIds.length > 0 ? user.propertyIds : [allProjects[0]?.id].filter(Boolean) as string[]

  return accessiblePropertyIds.map((propertyId) => {
    const projectId = resolveProjectId(propertyId)
    const project = getProjectById(projectId)
    const devices = getDevices(projectId)
    const documents = getDocuments(projectId)
    const buckets = getPortalDeviceBuckets(devices)
    const { status, label } = determineStatus(devices)
    const lastDeviceUpdate = devices
      .map((device) => device.lastSeenAt || device.fechaActualizacion)
      .filter((value): value is Date => Boolean(value))
      .sort((left, right) => right.getTime() - left.getTime())[0]
    const lastDocumentUpdate = documents
      .map((document) => document.fechaActualizacion)
      .sort((left, right) => right.getTime() - left.getTime())[0]

    return {
      propertyId,
      projectId: project ? project.id : projectId,
      label: project?.clienteNombre || formatPropertyLabel(propertyId),
      location: project?.ubicacion || 'Ubicación por definir',
      status,
      statusLabel: label,
      deviceCount: devices.length,
      cameraCount: buckets.find((bucket) => bucket.key === 'camera')?.count || 0,
      sensorCount: buckets.find((bucket) => bucket.key === 'sensor')?.count || 0,
      accessCount: buckets.find((bucket) => bucket.key === 'access')?.count || 0,
      documentCount: documents.length,
      alertCount: buckets.find((bucket) => bucket.key === 'alert')?.count || 0,
      lastUpdatedAt:
        [lastDeviceUpdate, lastDocumentUpdate]
          .filter((value): value is Date => Boolean(value))
          .sort((left, right) => right.getTime() - left.getTime())[0],
      project: project || undefined,
      devices,
      documents,
    }
  })
}

export function getPortalSiteForUser(user: AuthUser, propertyId: string) {
  return getAccessiblePortalSites(user).find((site) => site.propertyId === propertyId)
}

export function getPortalDashboardTotals(sites: PortalSiteSummary[]) {
  const devices = sites.flatMap((site) => site.devices)
  const allBuckets = sites.flatMap((site) => getPortalDeviceBuckets(site.devices))

  return {
    sites: sites.length,
    devices: devices.length,
    cameras: allBuckets.filter((bucket) => bucket.key === 'camera').reduce((total, bucket) => total + bucket.count, 0),
    sensors: allBuckets.filter((bucket) => bucket.key === 'sensor').reduce((total, bucket) => total + bucket.count, 0),
    alerts: allBuckets.filter((bucket) => bucket.key === 'alert').reduce((total, bucket) => total + bucket.count, 0),
    documents: sites.reduce((total, site) => total + site.documentCount, 0),
  }
}

export function getPortalAlertDevices(sites: PortalSiteSummary[]) {
  return sites
    .flatMap((site) =>
      site.devices
        .filter((device) => device.estado === 'falla' || device.estado === 'mantencion')
        .map((device) => ({ site, device }))
    )
    .sort((left, right) => {
      const leftAt = left.device.lastSeenAt || left.device.fechaActualizacion
      const rightAt = right.device.lastSeenAt || right.device.fechaActualizacion
      return rightAt.getTime() - leftAt.getTime()
    })
}

export function getPortalActivityFeed(sites: PortalSiteSummary[]) {
  const activities = sites.flatMap((site) => [
    ...site.devices.map((device) => ({
      id: `${site.propertyId}-device-${device.id}`,
      title: device.displayName || device.marca || 'Dispositivo',
      detail: device.ubicacionDescripcion || 'Equipo del sitio',
      kind: 'device' as const,
      status: device.estado,
      at: device.lastSeenAt || device.fechaActualizacion,
    })),
    ...site.documents.map((document) => ({
      id: `${site.propertyId}-document-${document.id}`,
      title: document.titulo,
      detail: document.autor,
      kind: 'document' as const,
      status: document.estado,
      at: document.fechaActualizacion,
    })),
  ])

  return activities
    .filter((activity) => activity.at)
    .sort((left, right) => right.at!.getTime() - left.at!.getTime())
    .slice(0, 8)
}

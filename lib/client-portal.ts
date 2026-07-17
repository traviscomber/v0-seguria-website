import type { AuthUser } from '@/lib/auth-store'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Device, Document } from '@/lib/types'

type PortalSiteStatus = 'operativo' | 'atencion' | 'revision'

export interface PortalSiteSummary {
  propertyId: string
  projectId: string
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
  devices: Device[]
  documents: Document[]
  events: PortalEvent[]
  spaces: PortalSpace[]
}

export interface PortalSpace {
  id: string
  name: string
  cameraCount: number
  sensorCount: number
  alertCount: number
  lastUpdatedAt?: Date
}

export interface PortalEvent {
  id: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  state?: string
  title: string
  occurredAt: Date
}

export interface PortalDeviceBucket {
  key: 'camera' | 'sensor' | 'alert' | 'access' | 'other'
  label: string
  count: number
  devices: Device[]
}

function determineStatus(devices: Device[]): { status: PortalSiteStatus; label: string } {
  if (devices.some((device) => device.estado === 'falla')) {
    return { status: 'atencion', label: 'Requiere atencion' }
  }
  if (devices.some((device) => device.estado === 'mantencion' || device.estado === 'inactivo')) {
    return { status: 'revision', label: 'En revision' }
  }
  return { status: 'operativo', label: 'Operativo' }
}

function isCamera(device: Device) {
  return device.tipo === 'camara_ip' || device.tipo === 'camara_analogica'
}

function isSensor(device: Device) {
  return [
    'sensor_movimiento',
    'sensor_temperatura',
    'sensor_humedad',
    'sensor_puerta',
    'sensor_humo',
    'sensor_gas',
    'sensor_agua',
    'sensor_vibracion',
    'sensor_sabotaje',
  ].includes(device.tipo)
}

function getPortalGroup(device: Device): PortalDeviceBucket['key'] {
  const explicitGroup = device.metadata?.portalGroup
  if (['camera', 'sensor', 'alert', 'access', 'other'].includes(String(explicitGroup))) {
    return explicitGroup as PortalDeviceBucket['key']
  }
  if (isCamera(device)) return 'camera'
  if (isSensor(device)) return 'sensor'
  if (device.tipo === 'control_acceso') return 'access'
  if (device.estado === 'falla' || device.estado === 'mantencion') return 'alert'
  return 'other'
}

export function getPortalDeviceBuckets(devices: Device[]): PortalDeviceBucket[] {
  const buckets: PortalDeviceBucket[] = [
    { key: 'camera', label: 'Camaras', count: 0, devices: [] },
    { key: 'sensor', label: 'Sensores', count: 0, devices: [] },
    { key: 'alert', label: 'Alertas', count: 0, devices: [] },
    { key: 'access', label: 'Accesos', count: 0, devices: [] },
    { key: 'other', label: 'Otros', count: 0, devices: [] },
  ]

  for (const device of devices) {
    buckets.find((entry) => entry.key === getPortalGroup(device))?.devices.push(device)
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

function mapDeviceKind(kind: string, metadata: Record<string, unknown>): Device['tipo'] {
  if (kind === 'camera') return 'camara_ip'
  if (kind === 'entry') return 'sensor_puerta'
  if (kind === 'motion') return 'sensor_movimiento'
  if (kind === 'smoke') return 'sensor_humo'
  if (kind === 'gas') return 'sensor_gas'
  if (kind === 'water') return 'sensor_agua'
  if (kind === 'access') return 'control_acceso'
  if (kind === 'gateway') return 'gateway_iot'
  if (kind === 'environment' && metadata.deviceClass === 'temperature') return 'sensor_temperatura'
  if (kind === 'environment' && metadata.deviceClass === 'humidity') return 'sensor_humedad'
  return 'otro'
}

function mapDeviceStatus(status: string): Device['estado'] {
  if (status === 'online') return 'activo'
  if (status === 'offline') return 'inactivo'
  if (status === 'alert') return 'falla'
  return 'mantencion'
}

function getSafeEvidenceName(objectPath: string) {
  return objectPath.split('/').filter(Boolean).at(-1) || 'evidencia-capturada'
}

export async function getAccessiblePortalSites(user: AuthUser): Promise<PortalSiteSummary[]> {
  if (user.propertyIds.length === 0) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Portal data service is not configured.')

  const [propertiesResult, spacesResult, devicesResult, eventsResult, snapshotsResult] = await Promise.all([
    supabase.from('properties').select('id, name, address, updated_at').in('id', user.propertyIds),
    supabase.from('spaces').select('id, property_id, name').in('property_id', user.propertyIds),
    supabase
      .from('devices')
      .select('id, property_id, space_id, external_id, name, kind, status, last_seen_at, metadata, created_at, updated_at')
      .in('property_id', user.propertyIds),
    supabase
      .from('events')
      .select('id, property_id, event_type, severity, state, occurred_at, payload')
      .in('property_id', user.propertyIds)
      .order('occurred_at', { ascending: false })
      .limit(100),
    supabase
      .from('camera_snapshots')
      .select('id, property_id, device_id, object_path, mime_type, size_bytes, captured_at, created_at')
      .in('property_id', user.propertyIds)
      .order('captured_at', { ascending: false })
      .limit(100),
  ])

  const queryError = propertiesResult.error || spacesResult.error || devicesResult.error || eventsResult.error || snapshotsResult.error
  if (queryError) throw new Error(`Portal data query failed: ${queryError.message}`)

  const spaces = new Map((spacesResult.data || []).map((space) => [space.id, space.name]))
  const spacesByProperty = new Map<string, PortalSpace[]>()
  const devicesByProperty = new Map<string, Device[]>()
  const eventsByProperty = new Map<string, PortalEvent[]>()
  const documentsByProperty = new Map<string, Document[]>()

  for (const row of spacesResult.data || []) {
    spacesByProperty.set(row.property_id, [
      ...(spacesByProperty.get(row.property_id) || []),
      { id: row.id, name: row.name, cameraCount: 0, sensorCount: 0, alertCount: 0 },
    ])
  }

  for (const row of devicesResult.data || []) {
    const metadata = (row.metadata || {}) as Record<string, unknown>
    const device: Device = {
      id: row.id,
      proyectoId: row.property_id,
      tipo: mapDeviceKind(row.kind, metadata),
      externalId: row.external_id,
      displayName: row.name,
      marca: 'Equipo conectado',
      protocolo: 'http',
      ubicacionDescripcion: row.space_id ? spaces.get(row.space_id) || 'Espacio vigilado' : 'Espacio por asignar',
      estado: mapDeviceStatus(row.status),
      lastSeenAt: row.last_seen_at ? new Date(row.last_seen_at) : undefined,
      metadata: {
        ...metadata,
        spaceId: row.space_id || undefined,
        portalGroup: row.kind === 'camera' ? 'camera' : undefined,
      },
      fechaCreacion: new Date(row.created_at),
      fechaActualizacion: new Date(row.updated_at),
    }
    devicesByProperty.set(row.property_id, [...(devicesByProperty.get(row.property_id) || []), device])
  }

  for (const row of eventsResult.data || []) {
    const payload = (row.payload || {}) as Record<string, unknown>
    const event: PortalEvent = {
      id: row.id,
      type: row.event_type,
      severity: row.severity as PortalEvent['severity'],
      state: row.state || undefined,
      title: typeof payload.title === 'string'
        ? payload.title
        : typeof payload.description === 'string'
          ? payload.description
          : row.event_type.replace(/[._]/g, ' '),
      occurredAt: new Date(row.occurred_at),
    }
    eventsByProperty.set(row.property_id, [...(eventsByProperty.get(row.property_id) || []), event])
  }

  for (const row of snapshotsResult.data || []) {
    const evidenceName = getSafeEvidenceName(row.object_path)
    const document: Document = {
      id: row.id,
      proyectoId: row.property_id,
      tipo: 'fotografia_evidencia',
      titulo: `Evidencia capturada - ${evidenceName}`,
      version: '1',
      estado: 'aprobado',
      archivoNombre: evidenceName,
      resumenIA: row.mime_type || 'Evidencia operativa',
      autor: 'SegurIA',
      fechaCreacion: new Date(row.created_at),
      fechaActualizacion: new Date(row.captured_at),
    }
    documentsByProperty.set(row.property_id, [
      ...(documentsByProperty.get(row.property_id) || []),
      document,
    ])
  }

  return (propertiesResult.data || []).map((property) => {
    const devices = devicesByProperty.get(property.id) || []
    const events = eventsByProperty.get(property.id) || []
    const documents = documentsByProperty.get(property.id) || []
    const buckets = getPortalDeviceBuckets(devices)
    const siteSpaces = (spacesByProperty.get(property.id) || []).map((space) => {
      const spaceDevices = devices.filter((device) => device.metadata?.spaceId === space.id)
      const lastUpdatedAt = spaceDevices
        .map((device) => device.lastSeenAt || device.fechaActualizacion)
        .sort((left, right) => right.getTime() - left.getTime())[0]

      return {
        ...space,
        cameraCount: spaceDevices.filter(isCamera).length,
        sensorCount: spaceDevices.filter(isSensor).length,
        alertCount: spaceDevices.filter((device) => device.estado === 'falla' || device.estado === 'mantencion').length,
        lastUpdatedAt,
      }
    })
    const { status, label } = determineStatus(devices)
    const lastDeviceUpdate = devices
      .map((device) => device.lastSeenAt || device.fechaActualizacion)
      .sort((left, right) => right.getTime() - left.getTime())[0]

    return {
      propertyId: property.id,
      projectId: property.id,
      label: property.name,
      location: property.address || 'Ubicacion por definir',
      status,
      statusLabel: label,
      deviceCount: devices.length,
      cameraCount: buckets.find((bucket) => bucket.key === 'camera')?.count || 0,
      sensorCount: buckets.find((bucket) => bucket.key === 'sensor')?.count || 0,
      accessCount: buckets.find((bucket) => bucket.key === 'access')?.count || 0,
      documentCount: documents.length,
      alertCount: devices.filter((device) => device.estado === 'falla').length,
      lastUpdatedAt: lastDeviceUpdate || new Date(property.updated_at),
      devices,
      documents,
      events,
      spaces: siteSpaces,
    }
  })
}

export async function getPortalSiteForUser(user: AuthUser, propertyId: string) {
  const sites = await getAccessiblePortalSites(user)
  return sites.find((site) => site.propertyId === propertyId)
}

export function getPortalDashboardTotals(sites: PortalSiteSummary[]) {
  const buckets = sites.flatMap((site) => getPortalDeviceBuckets(site.devices))
  return {
    sites: sites.length,
    devices: sites.reduce((total, site) => total + site.deviceCount, 0),
    cameras: buckets.filter((bucket) => bucket.key === 'camera').reduce((total, bucket) => total + bucket.count, 0),
    sensors: buckets.filter((bucket) => bucket.key === 'sensor').reduce((total, bucket) => total + bucket.count, 0),
    alerts: sites.reduce((total, site) => total + site.alertCount, 0),
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
  const eventActivity = sites.flatMap((site) =>
    site.events.map((event) => ({
      id: event.id,
      title: event.title,
      detail: site.label,
      kind: 'event' as const,
      status: event.severity,
      at: event.occurredAt,
    }))
  )

  const deviceActivity = sites.flatMap((site) =>
    site.devices.map((device) => ({
      id: `${site.propertyId}-device-${device.id}`,
      title: device.displayName || 'Dispositivo',
      detail: device.ubicacionDescripcion || 'Equipo del sitio',
      kind: 'device' as const,
      status: device.estado,
      at: device.lastSeenAt || device.fechaActualizacion,
    }))
  )

  const documentActivity = sites.flatMap((site) =>
    site.documents.map((document) => ({
      id: `${site.propertyId}-document-${document.id}`,
      title: document.titulo,
      detail: site.label,
      kind: 'document' as const,
      status: document.estado,
      at: document.fechaActualizacion,
    }))
  )

  return [...eventActivity, ...deviceActivity, ...documentActivity]
    .sort((left, right) => right.at.getTime() - left.at.getTime())
    .slice(0, 8)
}

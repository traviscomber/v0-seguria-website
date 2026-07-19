import type { AuthUser } from '@/lib/auth-store'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Device, Document } from '@/lib/types'

type PortalSiteStatus = 'operativo' | 'atencion' | 'revision'
type PortalIncidentStatus = 'new' | 'validating' | 'confirmed' | 'responding' | 'resolved' | 'false_alarm'

export interface PortalSiteSummary {
  organizationId: string
  organizationName: string
  propertyId: string
  projectId: string
  label: string
  location: string
  imageUrl: string
  imageAlt: string
  imageCredit: string
  imageCreditUrl: string
  imageIsRepresentative: boolean
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
  incidents: PortalIncident[]
  gatewayHealth: PortalGatewayHealth
  report: PortalOperationalReport
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

export interface PortalIncident {
  id: string
  propertyId: string
  title: string
  description?: string
  severity: 'warning' | 'critical'
  status: PortalIncidentStatus
  statusLabel: string
  acknowledgedAt?: Date
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PortalGatewayHealth {
  total: number
  online: number
  degraded: number
  offline: number
  lastSeenAt?: Date
}

export interface PortalSensorRisk {
  stable: number
  attention: number
  critical: number
}

export interface PortalOperationalReport {
  eventsToday: number
  criticalEventsToday: number
  incidentsThisMonth: number
  resolvedThisMonth: number
  overdueConfirmations: number
  averageConfirmationMinutes?: number
  averageResolutionHours?: number
}

type PortalNotificationMetric = {
  propertyId: string
  severity: 'warning' | 'critical'
  status: string
  dueAt: Date
  createdAt: Date
  acknowledgedAt?: Date
  escalatedAt?: Date
}

const openIncidentStatuses: PortalIncidentStatus[] = ['new', 'validating', 'confirmed', 'responding']

const incidentStatusLabels: Record<PortalIncidentStatus, string> = {
  new: 'Nuevo',
  validating: 'Validando',
  confirmed: 'Confirmado',
  responding: 'En respuesta',
  resolved: 'Resuelto',
  false_alarm: 'Falsa alarma',
}

function getPortalSiteVisual(organizationName: string, propertyName: string) {
  const key = `${organizationName} ${propertyName}`.toLowerCase()

  if (key.includes('huilo')) {
    return {
      imageUrl: '/portal/huilo-huilo.jpg',
      imageAlt: 'Hotel en la Reserva Huilo Huilo rodeado de bosque nativo',
      imageCredit: 'Roberto Araya Barckhahn / CC BY-SA 3.0',
      imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Hotel_Baobab,_Huilo-Huilo.JPG',
      imageIsRepresentative: false,
    }
  }

  if (key.includes('santa elena')) {
    return {
      imageUrl: '/portal/santa-elena.jpg',
      imageAlt: 'Ganado lechero alimentandose en una pradera',
      imageCredit: 'Foto referencial: Gonzalo De La Rosa / CC BY-SA 4.0',
      imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Campo_de_vacas_alimentandose.JPG',
      imageIsRepresentative: true,
    }
  }

  return {
    imageUrl: '/portal/santa-elena.jpg',
    imageAlt: 'Operacion protegida por SegurIA',
    imageCredit: 'Foto referencial / Creative Commons',
    imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Campo_de_vacas_alimentandose.JPG',
    imageIsRepresentative: true,
  }
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

export function isOpenPortalIncident(incident: PortalIncident) {
  return openIncidentStatuses.includes(incident.status)
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

export function getPortalSensorRisk(devices: Device[]): PortalSensorRisk {
  return devices.filter(isSensor).reduce<PortalSensorRisk>(
    (risk, device) => {
      if (device.estado === 'falla') risk.critical += 1
      else if (device.estado === 'mantencion' || device.estado === 'inactivo') risk.attention += 1
      else risk.stable += 1
      return risk
    },
    { stable: 0, attention: 0, critical: 0 }
  )
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

function getAverage(values: number[]) {
  if (values.length === 0) return undefined
  return values.reduce((total, value) => total + value, 0) / values.length
}

function buildOperationalReport({
  events,
  incidents,
  notifications,
}: {
  events: PortalEvent[]
  incidents: PortalIncident[]
  notifications: PortalNotificationMetric[]
}): PortalOperationalReport {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const eventsToday = events.filter((event) => event.occurredAt >= todayStart)
  const monthIncidents = incidents.filter((incident) => incident.createdAt >= monthStart)
  const resolvedThisMonth = incidents.filter((incident) => incident.resolvedAt && incident.resolvedAt >= monthStart)
  const confirmationMinutes = notifications
    .filter((notification) => notification.acknowledgedAt)
    .map((notification) => (notification.acknowledgedAt!.getTime() - notification.createdAt.getTime()) / 60_000)
    .filter((value) => value >= 0)
  const resolutionHours = incidents
    .filter((incident) => incident.resolvedAt)
    .map((incident) => (incident.resolvedAt!.getTime() - incident.createdAt.getTime()) / 3_600_000)
    .filter((value) => value >= 0)

  return {
    eventsToday: eventsToday.length,
    criticalEventsToday: eventsToday.filter((event) => event.severity === 'critical').length,
    incidentsThisMonth: monthIncidents.length,
    resolvedThisMonth: resolvedThisMonth.length,
    overdueConfirmations: notifications.filter((notification) =>
      notification.status === 'escalated' ||
      Boolean(!notification.acknowledgedAt && notification.dueAt.getTime() <= now.getTime())
    ).length,
    averageConfirmationMinutes: getAverage(confirmationMinutes),
    averageResolutionHours: getAverage(resolutionHours),
  }
}

export async function getAccessiblePortalSites(user: AuthUser): Promise<PortalSiteSummary[]> {
  if (user.propertyIds.length === 0) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Portal data service is not configured.')

  const [
    propertiesResult,
    organizationsResult,
    spacesResult,
    devicesResult,
    eventsResult,
    snapshotsResult,
    gatewaysResult,
    incidentsResult,
    notificationsResult,
  ] = await Promise.all([
    supabase.from('properties').select('id, organization_id, name, address, updated_at').in('id', user.propertyIds),
    supabase.from('organizations').select('id, name').in('id', user.clientIds),
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
    supabase
      .from('gateways')
      .select('id, property_id, status, last_seen_at, updated_at')
      .in('property_id', user.propertyIds),
    supabase
      .from('incidents')
      .select('id, property_id, title, description, severity, status, acknowledged_at, resolved_at, created_at, updated_at')
      .in('property_id', user.propertyIds)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('notifications')
      .select('id, property_id, severity, status, due_at, acknowledged_at, escalated_at, created_at')
      .in('property_id', user.propertyIds)
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  const queryError =
    propertiesResult.error ||
    organizationsResult.error ||
    spacesResult.error ||
    devicesResult.error ||
    eventsResult.error ||
    snapshotsResult.error ||
    gatewaysResult.error ||
    incidentsResult.error ||
    notificationsResult.error
  if (queryError) throw new Error(`Portal data query failed: ${queryError.message}`)

  const organizationNames = new Map((organizationsResult.data || []).map((organization) => [
    organization.id,
    organization.name,
  ]))
  const spaces = new Map((spacesResult.data || []).map((space) => [space.id, space.name]))
  const spacesByProperty = new Map<string, PortalSpace[]>()
  const devicesByProperty = new Map<string, Device[]>()
  const eventsByProperty = new Map<string, PortalEvent[]>()
  const documentsByProperty = new Map<string, Document[]>()
  const gatewayHealthByProperty = new Map<string, PortalGatewayHealth>()
  const incidentsByProperty = new Map<string, PortalIncident[]>()
  const notificationsByProperty = new Map<string, PortalNotificationMetric[]>()

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

  for (const row of gatewaysResult.data || []) {
    const current = gatewayHealthByProperty.get(row.property_id) || {
      total: 0,
      online: 0,
      degraded: 0,
      offline: 0,
      lastSeenAt: undefined,
    }
    const lastSeenAt = row.last_seen_at ? new Date(row.last_seen_at) : row.updated_at ? new Date(row.updated_at) : undefined
    current.total += 1
    if (row.status === 'online') current.online += 1
    else if (row.status === 'degraded') current.degraded += 1
    else current.offline += 1
    if (lastSeenAt && (!current.lastSeenAt || lastSeenAt.getTime() > current.lastSeenAt.getTime())) {
      current.lastSeenAt = lastSeenAt
    }
    gatewayHealthByProperty.set(row.property_id, current)
  }

  for (const row of incidentsResult.data || []) {
    const status = row.status as PortalIncidentStatus
    const incident: PortalIncident = {
      id: row.id,
      propertyId: row.property_id,
      title: row.title,
      description: row.description || undefined,
      severity: row.severity as PortalIncident['severity'],
      status,
      statusLabel: incidentStatusLabels[status] || status,
      acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at) : undefined,
      resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
    incidentsByProperty.set(row.property_id, [...(incidentsByProperty.get(row.property_id) || []), incident])
  }

  for (const row of notificationsResult.data || []) {
    const notification: PortalNotificationMetric = {
      propertyId: row.property_id,
      severity: row.severity as PortalNotificationMetric['severity'],
      status: row.status,
      dueAt: new Date(row.due_at),
      createdAt: new Date(row.created_at),
      acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at) : undefined,
      escalatedAt: row.escalated_at ? new Date(row.escalated_at) : undefined,
    }
    notificationsByProperty.set(row.property_id, [...(notificationsByProperty.get(row.property_id) || []), notification])
  }

  return (propertiesResult.data || []).map((property) => {
    const organizationName = organizationNames.get(property.organization_id) || property.name
    const visual = getPortalSiteVisual(organizationName, property.name)
    const devices = devicesByProperty.get(property.id) || []
    const events = eventsByProperty.get(property.id) || []
    const documents = documentsByProperty.get(property.id) || []
    const incidents = incidentsByProperty.get(property.id) || []
    const notifications = notificationsByProperty.get(property.id) || []
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
      organizationId: property.organization_id,
      organizationName,
      propertyId: property.id,
      projectId: property.id,
      label: property.name,
      location: property.address || 'Ubicacion por definir',
      ...visual,
      status,
      statusLabel: label,
      deviceCount: devices.length,
      cameraCount: buckets.find((bucket) => bucket.key === 'camera')?.count || 0,
      sensorCount: buckets.find((bucket) => bucket.key === 'sensor')?.count || 0,
      accessCount: buckets.find((bucket) => bucket.key === 'access')?.count || 0,
      documentCount: documents.length,
      alertCount: devices.filter((device) => device.estado === 'falla').length + incidents.filter(isOpenPortalIncident).length,
      lastUpdatedAt: lastDeviceUpdate || new Date(property.updated_at),
      devices,
      documents,
      events,
      incidents,
      gatewayHealth: gatewayHealthByProperty.get(property.id) || { total: 0, online: 0, degraded: 0, offline: 0 },
      report: buildOperationalReport({ events, incidents, notifications }),
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
    organizations: new Set(sites.map((site) => site.organizationId)).size,
    sites: sites.length,
    devices: sites.reduce((total, site) => total + site.deviceCount, 0),
    cameras: buckets.filter((bucket) => bucket.key === 'camera').reduce((total, bucket) => total + bucket.count, 0),
    sensors: buckets.filter((bucket) => bucket.key === 'sensor').reduce((total, bucket) => total + bucket.count, 0),
    alerts: sites.reduce((total, site) => total + site.alertCount, 0),
    documents: sites.reduce((total, site) => total + site.documentCount, 0),
    openIncidents: sites.reduce((total, site) => total + site.incidents.filter(isOpenPortalIncident).length, 0),
    onlineGateways: sites.reduce((total, site) => total + site.gatewayHealth.online, 0),
    offlineGateways: sites.reduce((total, site) => total + site.gatewayHealth.offline + site.gatewayHealth.degraded, 0),
    eventsToday: sites.reduce((total, site) => total + site.report.eventsToday, 0),
    criticalEventsToday: sites.reduce((total, site) => total + site.report.criticalEventsToday, 0),
    incidentsThisMonth: sites.reduce((total, site) => total + site.report.incidentsThisMonth, 0),
    resolvedThisMonth: sites.reduce((total, site) => total + site.report.resolvedThisMonth, 0),
    overdueConfirmations: sites.reduce((total, site) => total + site.report.overdueConfirmations, 0),
  }
}

export function getPortalPortfolioReport(sites: PortalSiteSummary[]): PortalOperationalReport {
  const confirmationValues = sites
    .map((site) => site.report.averageConfirmationMinutes)
    .filter((value): value is number => typeof value === 'number')
  const resolutionValues = sites
    .map((site) => site.report.averageResolutionHours)
    .filter((value): value is number => typeof value === 'number')

  return {
    eventsToday: sites.reduce((total, site) => total + site.report.eventsToday, 0),
    criticalEventsToday: sites.reduce((total, site) => total + site.report.criticalEventsToday, 0),
    incidentsThisMonth: sites.reduce((total, site) => total + site.report.incidentsThisMonth, 0),
    resolvedThisMonth: sites.reduce((total, site) => total + site.report.resolvedThisMonth, 0),
    overdueConfirmations: sites.reduce((total, site) => total + site.report.overdueConfirmations, 0),
    averageConfirmationMinutes: getAverage(confirmationValues),
    averageResolutionHours: getAverage(resolutionValues),
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

import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type {
  PortalActivityItem,
  PortalDevice,
  PortalIncident,
  PortalSite,
} from '@/types/client-portal'

type PortalUserScope = {
  role: string
  organizationIds: string[]
  propertyIds: string[]
}

type PropertyRow = {
  id: string
  organization_id: string
  operation_id: string | null
  name: string
  address: string | null
  updated_at: string
}

type CameraRow = {
  id: string
  operation_id: string
  code: string
  name: string | null
  zone_label: string | null
  active: boolean
  updated_at: string
  is_demo: boolean | null
}

type AlertRow = {
  id: string
  operation_id: string
  alert_type: string
  severity: string
  status: string
  title: string
  summary: string
  zone_label: string | null
  detected_at: string
  is_demo: boolean | null
}

type JobRow = {
  id: string
  operation_id: string
  status: string
  review_status: string
  original_filename: string
  zone_label: string | null
  captured_at: string | null
  created_at: string
  result_json: {
    detections?: Array<{
      species?: string | null
      confidence?: number | null
    }>
  } | null
  is_demo: boolean | null
}

export type VisionDashboardProjection = {
  sites: PortalSite[]
  activity: PortalActivityItem[]
}

function toDate(value?: string | null) {
  const date = value ? new Date(value) : new Date(0)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function incidentStatus(status: string) {
  if (status === 'acknowledged') return 'validating'
  if (status === 'resolved') return 'resolved'
  if (status === 'dismissed') return 'false_alarm'
  return 'new'
}

function incidentStatusLabel(status: string) {
  if (status === 'acknowledged') return 'Reconocida'
  if (status === 'resolved') return 'Resuelta'
  if (status === 'dismissed') return 'Descartada'
  return 'Abierta'
}

function incidentSeverity(severity: string): 'warning' | 'critical' {
  return severity === 'critical' || severity === 'high' ? 'critical' : 'warning'
}

function speciesLabel(species?: string | null) {
  const labels: Record<string, string> = {
    huemul: 'Huemul',
    pudu: 'Pudú',
    guina: 'Güiña',
    fox: 'Zorro',
    human: 'Persona',
    vehicle: 'Vehículo',
    dog: 'Perro',
    empty_frame: 'Cuadro vacío',
    unknown_animal: 'Animal sin identificar',
  }
  if (!species) return null
  return labels[species] || species.replace(/_/g, ' ')
}

function fallbackImage(propertyName: string) {
  return propertyName.toLowerCase().includes('huilo') ? '/portal/huilo-huilo.jpg' : undefined
}

function buildFallbackSite(property: PropertyRow, organizationName: string): PortalSite {
  return {
    propertyId: property.id,
    name: property.name,
    label: property.name,
    organizationName,
    address: property.address || undefined,
    location: property.address || undefined,
    imageUrl: fallbackImage(property.name),
    imageAlt: property.name,
    status: 'operativo',
    statusLabel: 'Operativo',
    lastUpdatedAt: property.updated_at,
    deviceCount: 0,
    cameraCount: 0,
    sensorCount: 0,
    devices: [],
    incidents: [],
  }
}

function mergeById<T extends { id?: string }>(left: T[], right: T[]) {
  const result = new Map<string, T>()
  for (const item of [...left, ...right]) {
    const key = item.id ? String(item.id) : `anonymous-${result.size}`
    result.set(key, item)
  }
  return Array.from(result.values())
}

export async function mergeVisionIntoClientDashboard(
  user: PortalUserScope,
  currentSites: PortalSite[],
): Promise<VisionDashboardProjection> {
  const supabase = createSupabaseAdminClient()
  if (!supabase) return { sites: currentSites, activity: [] }

  let propertiesQuery = supabase
    .from('properties')
    .select('id, organization_id, operation_id, name, address, updated_at')

  if (user.propertyIds.length > 0) {
    propertiesQuery = propertiesQuery.in('id', user.propertyIds)
  } else if (user.organizationIds.length > 0) {
    propertiesQuery = propertiesQuery.in('organization_id', user.organizationIds)
  } else {
    return { sites: currentSites, activity: [] }
  }

  const { data: propertyData, error: propertyError } = await propertiesQuery
  if (propertyError) {
    console.error('[portal] Vision property projection failed:', propertyError.message)
    return { sites: currentSites, activity: [] }
  }

  const properties = (propertyData || []) as PropertyRow[]
  if (properties.length === 0) return { sites: currentSites, activity: [] }

  const organizationIds = Array.from(new Set(properties.map((property) => property.organization_id)))
  const { data: organizationData, error: organizationError } = await supabase
    .from('organizations')
    .select('id, name')
    .in('id', organizationIds)

  if (organizationError) {
    console.error('[portal] Vision organization projection failed:', organizationError.message)
  }

  const organizationNames = new Map(
    (organizationData || []).map((organization) => [organization.id as string, organization.name as string]),
  )

  const sitesByProperty = new Map(currentSites.map((site) => [site.propertyId, site]))
  for (const property of properties) {
    if (!sitesByProperty.has(property.id)) {
      sitesByProperty.set(
        property.id,
        buildFallbackSite(property, organizationNames.get(property.organization_id) || property.name),
      )
    }
  }

  const propertyByOperation = new Map(
    properties
      .filter((property): property is PropertyRow & { operation_id: string } => Boolean(property.operation_id))
      .map((property) => [property.operation_id, property]),
  )
  const operationIds = Array.from(propertyByOperation.keys())

  if (operationIds.length === 0) {
    return { sites: Array.from(sitesByProperty.values()), activity: [] }
  }

  const [cameraResult, alertResult, jobResult] = await Promise.all([
    supabase
      .from('wildlife_cameras')
      .select('id, operation_id, code, name, zone_label, active, updated_at, is_demo')
      .in('operation_id', operationIds),
    supabase
      .from('seguria_alerts')
      .select('id, operation_id, alert_type, severity, status, title, summary, zone_label, detected_at, is_demo')
      .in('operation_id', operationIds)
      .order('detected_at', { ascending: false })
      .limit(100),
    supabase
      .from('wildlife_inference_jobs')
      .select('id, operation_id, status, review_status, original_filename, zone_label, captured_at, created_at, result_json, is_demo')
      .in('operation_id', operationIds)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  if (cameraResult.error) console.error('[portal] Vision camera projection failed:', cameraResult.error.message)
  if (alertResult.error) console.error('[portal] Vision alert projection failed:', alertResult.error.message)
  if (jobResult.error) console.error('[portal] Vision activity projection failed:', jobResult.error.message)

  const camerasByProperty = new Map<string, PortalDevice[]>()
  for (const camera of (cameraResult.data || []) as CameraRow[]) {
    const property = propertyByOperation.get(camera.operation_id)
    if (!property) continue

    const projected: PortalDevice = {
      id: camera.id,
      name: camera.name || camera.code,
      label: camera.code,
      tipo: 'camara_ip',
      status: camera.active ? 'activo' : 'mantencion',
      estado: camera.active ? 'activo' : 'mantencion',
      statusLabel: camera.active ? 'Activa' : 'Revisar',
      location: camera.zone_label || property.address || undefined,
      zone: camera.zone_label || undefined,
      updatedAt: camera.updated_at,
      lastSeenAt: camera.updated_at,
    }

    camerasByProperty.set(property.id, [
      ...(camerasByProperty.get(property.id) || []),
      projected,
    ])
  }

  const incidentsByProperty = new Map<string, PortalIncident[]>()
  for (const alert of (alertResult.data || []) as AlertRow[]) {
    const property = propertyByOperation.get(alert.operation_id)
    if (!property) continue

    const projected: PortalIncident = {
      id: alert.id,
      title: alert.title,
      type: alert.alert_type,
      description: alert.summary,
      status: incidentStatus(alert.status),
      statusLabel: incidentStatusLabel(alert.status),
      createdAt: alert.detected_at,
      updatedAt: alert.detected_at,
    }

    ;(projected as PortalIncident & { severity?: 'warning' | 'critical'; location?: string }).severity = incidentSeverity(alert.severity)
    ;(projected as PortalIncident & { severity?: 'warning' | 'critical'; location?: string }).location = alert.zone_label || undefined

    incidentsByProperty.set(property.id, [
      ...(incidentsByProperty.get(property.id) || []),
      projected,
    ])
  }

  const activity: PortalActivityItem[] = []
  for (const job of (jobResult.data || []) as JobRow[]) {
    const property = propertyByOperation.get(job.operation_id)
    if (!property) continue
    const site = sitesByProperty.get(property.id)
    const detection = job.result_json?.detections?.[0]
    const label = speciesLabel(detection?.species)
    const title = job.status === 'failed'
      ? 'Análisis de evidencia con error'
      : label
        ? `Detección: ${label}`
        : 'Evidencia procesada por SegurIA Vision'
    const reviewDetail = job.review_status === 'pending'
      ? 'Pendiente de revisión humana'
      : job.review_status === 'confirmed'
        ? 'Detección confirmada'
        : job.review_status === 'corrected'
          ? 'Clasificación corregida'
          : job.review_status === 'unidentifiable'
            ? 'No identificable'
            : job.review_status === 'rejected'
              ? 'Detección rechazada'
              : job.status

    activity.push({
      id: `vision-${job.id}`,
      title,
      detail: `${job.zone_label || 'Zona sin etiqueta'} · ${reviewDetail}`,
      description: job.original_filename,
      siteLabel: site?.label || site?.name || property.name,
      createdAt: job.captured_at || job.created_at,
    })
  }

  for (const property of properties) {
    const current = sitesByProperty.get(property.id)
    if (!current) continue

    const projectedCameras = camerasByProperty.get(property.id) || []
    const projectedIncidents = incidentsByProperty.get(property.id) || []
    const devices = mergeById(current.devices || [], projectedCameras)
    const incidents = mergeById(current.incidents || [], projectedIncidents)
    const hasAttention = incidents.some((incident) => !['resolved', 'resuelto', 'closed', 'false_alarm'].includes(String(incident.status || '').toLowerCase()))
      || projectedCameras.some((camera) => camera.estado === 'mantencion' || camera.estado === 'falla')
    const latestVisionAt = [
      ...projectedCameras.map((camera) => toDate(camera.updatedAt as string | null | undefined)),
      ...projectedIncidents.map((incident) => toDate(incident.createdAt as string | null | undefined)),
    ].sort((left, right) => right.getTime() - left.getTime())[0]

    sitesByProperty.set(property.id, {
      ...current,
      devices,
      incidents,
      deviceCount: devices.length,
      cameraCount: devices.filter((device) => device.tipo === 'camara_ip' || device.tipo === 'camara_analogica').length,
      status: hasAttention ? 'atencion' : current.status || 'operativo',
      statusLabel: hasAttention ? 'Atención requerida' : current.statusLabel || 'Operativo',
      lastUpdatedAt: latestVisionAt && latestVisionAt.getTime() > 0 ? latestVisionAt : current.lastUpdatedAt,
    })
  }

  return {
    sites: Array.from(sitesByProperty.values()),
    activity: activity
      .sort((left, right) => toDate(right.createdAt as string | null | undefined).getTime() - toDate(left.createdAt as string | null | undefined).getTime())
      .slice(0, 12),
  }
}

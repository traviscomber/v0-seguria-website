export type SeguriaAlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'

export type VisionAlertType =
  | 'priority_species'
  | 'human_intrusion'
  | 'vehicle_intrusion'
  | 'domestic_animal'
  | 'inference_failure'
  | 'low_confidence'
  | 'metadata_gap'
  | 'camera_inactive'

export type VisionCameraInput = {
  id: string
  code: string
  name: string
  zone_label?: string | null
  latitude?: number | string | null
  longitude?: number | string | null
  active?: boolean
  created_at?: string | null
}

export type VisionJobInput = {
  id: string
  status: string
  review_status?: string | null
  camera_id?: string | null
  zone_label?: string | null
  captured_at?: string | null
  created_at: string
  error_code?: string | null
  error_message?: string | null
  result_json?: {
    detections?: Array<{
      species?: unknown
      confidence?: unknown
      description?: unknown
    }>
  } | null
  wildlife_cameras?: {
    code?: string | null
    name?: string | null
    zone_label?: string | null
    latitude?: number | string | null
    longitude?: number | string | null
  } | null
}

export type VisionAlertCandidate = {
  fingerprint: string
  alertType: VisionAlertType
  severity: SeguriaAlertSeverity
  sourceType: 'wildlife_inference_job' | 'wildlife_camera'
  sourceId: string
  cameraId: string | null
  title: string
  summary: string
  zoneLabel: string | null
  detectedAt: string
  payload: Record<string, unknown>
}

const SENSITIVE_ZONE_KEYWORDS = [
  'pampa pilmaiquen',
  'pilmaiquen',
  'huemul',
  'conservacion',
  'conservation',
  'zona sensible',
]

const CONSERVATION_POLYGON = [
  { latitude: -39.9265, longitude: -71.9195 },
  { latitude: -39.9208, longitude: -71.909 },
  { latitude: -39.9248, longitude: -71.8945 },
  { latitude: -39.9368, longitude: -71.8858 },
  { latitude: -39.9498, longitude: -71.8908 },
  { latitude: -39.9555, longitude: -71.9045 },
  { latitude: -39.9472, longitude: -71.9185 },
  { latitude: -39.9365, longitude: -71.922 },
]

const PRIORITY_SPECIES: Record<string, { label: string; severity: SeguriaAlertSeverity }> = {
  huemul: { label: 'Huemul', severity: 'high' },
  puma: { label: 'Puma', severity: 'high' },
  pudu: { label: 'Pudu', severity: 'medium' },
  guina: { label: 'Guina', severity: 'medium' },
}

function normalizeText(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function finiteNumber(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function validDate(value: string | null | undefined, fallback: string) {
  const candidate = value && !Number.isNaN(Date.parse(value)) ? value : fallback
  return new Date(candidate).toISOString()
}

function pointInPolygon(latitude: number, longitude: number) {
  let inside = false
  for (let current = 0, previous = CONSERVATION_POLYGON.length - 1; current < CONSERVATION_POLYGON.length; previous = current, current += 1) {
    const currentPoint = CONSERVATION_POLYGON[current]
    const previousPoint = CONSERVATION_POLYGON[previous]
    const intersects = ((currentPoint.latitude > latitude) !== (previousPoint.latitude > latitude))
      && (longitude < (previousPoint.longitude - currentPoint.longitude)
        * (latitude - currentPoint.latitude)
        / (previousPoint.latitude - currentPoint.latitude)
        + currentPoint.longitude)
    if (intersects) inside = !inside
  }
  return inside
}

function cameraForJob(job: VisionJobInput, camerasById: Map<string, VisionCameraInput>) {
  if (job.camera_id) return camerasById.get(job.camera_id) || null
  return null
}

function locationContext(job: VisionJobInput, camera: VisionCameraInput | null) {
  const latitude = finiteNumber(camera?.latitude ?? job.wildlife_cameras?.latitude)
  const longitude = finiteNumber(camera?.longitude ?? job.wildlife_cameras?.longitude)
  const zoneLabel = job.zone_label || camera?.zone_label || job.wildlife_cameras?.zone_label || null
  const normalizedZone = normalizeText(zoneLabel)
  const keywordMatch = SENSITIVE_ZONE_KEYWORDS.some((keyword) => normalizedZone.includes(keyword))
  const polygonMatch = latitude !== null && longitude !== null && pointInPolygon(latitude, longitude)

  return {
    zoneLabel,
    hasCoordinates: latitude !== null && longitude !== null,
    sensitiveZone: keywordMatch || polygonMatch,
  }
}

function primaryDetection(job: VisionJobInput) {
  const raw = job.result_json?.detections?.[0]
  if (!raw) return null
  const species = normalizeText(raw.species).replace(/\s+/g, '_')
  const confidence = finiteNumber(raw.confidence)
  return {
    species: species || 'unknown_animal',
    confidence: confidence === null ? null : Math.max(0, Math.min(1, confidence)),
    description: String(raw.description || '').slice(0, 300),
  }
}

function jobPayload(input: {
  job: VisionJobInput
  camera: VisionCameraInput | null
  species?: string | null
  confidence?: number | null
  sensitiveZone: boolean
  hasCoordinates: boolean
}) {
  return {
    jobId: input.job.id,
    species: input.species || null,
    confidence: input.confidence ?? null,
    reviewStatus: input.job.review_status || 'pending',
    cameraCode: input.camera?.code || input.job.wildlife_cameras?.code || null,
    cameraName: input.camera?.name || input.job.wildlife_cameras?.name || null,
    sensitiveZone: input.sensitiveZone,
    locationStatus: input.hasCoordinates ? 'validated_camera_coordinates' : 'not_validated',
    capturedAt: input.job.captured_at || null,
    requiresHumanReview: input.job.review_status === 'pending',
  }
}

function candidate(input: Omit<VisionAlertCandidate, 'fingerprint'> & { fingerprintSuffix: string }) {
  return {
    ...input,
    fingerprint: `vision:${input.sourceType}:${input.sourceId}:${input.fingerprintSuffix}`,
  }
}

export function deriveVisionAlertCandidates(
  jobs: VisionJobInput[],
  cameras: VisionCameraInput[],
  now: Date = new Date(),
) {
  const alerts: VisionAlertCandidate[] = []
  const camerasById = new Map(cameras.map((camera) => [camera.id, camera]))
  const lastJobByCamera = new Map<string, Date>()

  for (const job of jobs) {
    if (job.camera_id) {
      const eventDate = new Date(validDate(job.captured_at, job.created_at))
      const current = lastJobByCamera.get(job.camera_id)
      if (!current || eventDate > current) lastJobByCamera.set(job.camera_id, eventDate)
    }

    const camera = cameraForJob(job, camerasById)
    const location = locationContext(job, camera)
    const detectedAt = validDate(job.captured_at, job.created_at)

    if (job.status === 'failed') {
      alerts.push(candidate({
        fingerprintSuffix: 'inference_failure',
        alertType: 'inference_failure',
        severity: 'high',
        sourceType: 'wildlife_inference_job',
        sourceId: job.id,
        cameraId: job.camera_id || null,
        title: 'Fallo en analisis de evidencia',
        summary: job.error_message
          ? `La evidencia no pudo procesarse: ${job.error_message.slice(0, 240)}`
          : 'La evidencia no pudo procesarse y requiere reintento o revision tecnica.',
        zoneLabel: location.zoneLabel,
        detectedAt,
        payload: {
          ...jobPayload({ job, camera, sensitiveZone: location.sensitiveZone, hasCoordinates: location.hasCoordinates }),
          errorCode: job.error_code || null,
        },
      }))
      continue
    }

    if (job.status !== 'completed') continue
    const detection = primaryDetection(job)
    if (!detection || detection.species === 'empty_frame') continue

    const sharedPayload = jobPayload({
      job,
      camera,
      species: detection.species,
      confidence: detection.confidence,
      sensitiveZone: location.sensitiveZone,
      hasCoordinates: location.hasCoordinates,
    })

    if (detection.species === 'person' && location.sensitiveZone) {
      alerts.push(candidate({
        fingerprintSuffix: 'human_intrusion',
        alertType: 'human_intrusion',
        severity: 'critical',
        sourceType: 'wildlife_inference_job',
        sourceId: job.id,
        cameraId: job.camera_id || null,
        title: 'Persona detectada en zona sensible',
        summary: 'Presencia humana detectada dentro o junto al sector referencial de conservacion. Requiere verificacion inmediata.',
        zoneLabel: location.zoneLabel,
        detectedAt,
        payload: sharedPayload,
      }))
    }

    if (detection.species === 'vehicle' && location.sensitiveZone) {
      alerts.push(candidate({
        fingerprintSuffix: 'vehicle_intrusion',
        alertType: 'vehicle_intrusion',
        severity: 'high',
        sourceType: 'wildlife_inference_job',
        sourceId: job.id,
        cameraId: job.camera_id || null,
        title: 'Vehiculo detectado en zona sensible',
        summary: 'Se detecto un vehiculo en un sector de conservacion o acceso restringido. Requiere validacion operacional.',
        zoneLabel: location.zoneLabel,
        detectedAt,
        payload: sharedPayload,
      }))
    }

    if (['dog', 'cat', 'livestock'].includes(detection.species) && location.sensitiveZone) {
      alerts.push(candidate({
        fingerprintSuffix: 'domestic_animal',
        alertType: 'domestic_animal',
        severity: 'high',
        sourceType: 'wildlife_inference_job',
        sourceId: job.id,
        cameraId: job.camera_id || null,
        title: 'Animal domestico en zona sensible',
        summary: 'La presencia de animales domesticos puede representar una amenaza sanitaria o de perturbacion para fauna protegida.',
        zoneLabel: location.zoneLabel,
        detectedAt,
        payload: sharedPayload,
      }))
    }

    const prioritySpecies = PRIORITY_SPECIES[detection.species]
    if (prioritySpecies) {
      const lowConfidence = detection.confidence !== null && detection.confidence < 0.7
      alerts.push(candidate({
        fingerprintSuffix: `priority_species:${detection.species}`,
        alertType: 'priority_species',
        severity: lowConfidence ? 'medium' : prioritySpecies.severity,
        sourceType: 'wildlife_inference_job',
        sourceId: job.id,
        cameraId: job.camera_id || null,
        title: `${prioritySpecies.label} detectado`,
        summary: lowConfidence
          ? `Posible registro de ${prioritySpecies.label} con confianza limitada. Debe pasar a revision humana prioritaria.`
          : `Registro prioritario de ${prioritySpecies.label}. Validar evidencia, ubicacion y continuidad de actividad en el sector.`,
        zoneLabel: location.zoneLabel,
        detectedAt,
        payload: sharedPayload,
      }))
    } else if (
      job.review_status === 'pending'
      && (detection.species === 'unknown_animal' || detection.confidence === null || detection.confidence < 0.58)
    ) {
      alerts.push(candidate({
        fingerprintSuffix: 'low_confidence',
        alertType: 'low_confidence',
        severity: 'medium',
        sourceType: 'wildlife_inference_job',
        sourceId: job.id,
        cameraId: job.camera_id || null,
        title: 'Identificacion incierta',
        summary: 'El analisis no alcanzo una identificacion confiable. La evidencia debe revisarse antes de incorporarla al registro.',
        zoneLabel: location.zoneLabel,
        detectedAt,
        payload: sharedPayload,
      }))
    }

    const hasActionableAlert = alerts.some((alert) => alert.sourceId === job.id)
    if (hasActionableAlert && (!location.hasCoordinates || !job.captured_at)) {
      const missing = [!location.hasCoordinates ? 'ubicacion validada' : null, !job.captured_at ? 'fecha de captura' : null]
        .filter(Boolean)
        .join(' y ')
      alerts.push(candidate({
        fingerprintSuffix: 'metadata_gap',
        alertType: 'metadata_gap',
        severity: 'low',
        sourceType: 'wildlife_inference_job',
        sourceId: job.id,
        cameraId: job.camera_id || null,
        title: 'Metadata incompleta en evento prioritario',
        summary: `El evento requiere completar ${missing} para sostener su trazabilidad territorial.`,
        zoneLabel: location.zoneLabel,
        detectedAt,
        payload: sharedPayload,
      }))
    }
  }

  const inactivityThresholdMs = 72 * 60 * 60 * 1000
  for (const camera of cameras) {
    if (camera.active === false) continue
    const createdAt = camera.created_at && !Number.isNaN(Date.parse(camera.created_at))
      ? new Date(camera.created_at)
      : null
    const lastActivity = lastJobByCamera.get(camera.id) || createdAt
    if (!lastActivity || now.getTime() - lastActivity.getTime() < inactivityThresholdMs) continue

    const inactiveHours = Math.floor((now.getTime() - lastActivity.getTime()) / (60 * 60 * 1000))
    alerts.push(candidate({
      fingerprintSuffix: 'camera_inactive',
      alertType: 'camera_inactive',
      severity: inactiveHours >= 168 ? 'high' : 'medium',
      sourceType: 'wildlife_camera',
      sourceId: camera.id,
      cameraId: camera.id,
      title: 'Camara sin actividad reciente',
      summary: `${camera.code} no registra evidencia desde hace ${inactiveHours} horas. Verificar energia, conectividad, almacenamiento y campo visual.`,
      zoneLabel: camera.zone_label || null,
      detectedAt: lastActivity.toISOString(),
      payload: {
        cameraCode: camera.code,
        cameraName: camera.name,
        lastActivityAt: lastActivity.toISOString(),
        inactiveHours,
        locationStatus: finiteNumber(camera.latitude) !== null && finiteNumber(camera.longitude) !== null
          ? 'validated_camera_coordinates'
          : 'not_validated',
      },
    }))
  }

  const severityOrder: Record<SeguriaAlertSeverity, number> = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    info: 1,
  }

  return alerts.sort((left, right) => {
    const severityDifference = severityOrder[right.severity] - severityOrder[left.severity]
    if (severityDifference !== 0) return severityDifference
    return new Date(right.detectedAt).getTime() - new Date(left.detectedAt).getTime()
  })
}

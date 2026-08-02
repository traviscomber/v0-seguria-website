export type ImageQualityLevel = 'good' | 'usable' | 'poor'
export type CameraHealthStatus = 'healthy' | 'watch' | 'maintenance' | 'critical' | 'inactive' | 'no_data'

export type ImageQualityFlag =
  | 'empty_frame'
  | 'low_visibility'
  | 'blurred'
  | 'occluded'
  | 'weather'
  | 'infrared'
  | 'uncertain_subject'
  | 'metadata_missing'

export type ImageQualityDiagnostic = {
  score: number
  level: ImageQualityLevel
  flags: ImageQualityFlag[]
  reasons: string[]
}

export type QualityJobInput = {
  id: string
  camera_id: string | null
  status: string
  result_json: unknown
  error_code?: string | null
  captured_at?: string | null
  created_at: string
}

export type QualityCameraInput = {
  id: string
  code: string
  name: string
  zone_label?: string | null
  active: boolean
}

export type CameraQualityDiagnostic = {
  cameraId: string
  code: string
  name: string
  zoneLabel: string | null
  active: boolean
  status: CameraHealthStatus
  analyses: number
  completed: number
  failed: number
  poorQuality: number
  qualityIssues: number
  emptyFrames: number
  uncertainSubjects: number
  missingMetadata: number
  failureRate: number
  poorQualityRate: number
  qualityIssueRate: number
  emptyFrameRate: number
  averageQualityScore: number | null
  lastActivityAt: string | null
  daysSinceActivity: number | null
  dominantFlags: Array<{ flag: ImageQualityFlag; count: number }>
  recommendations: string[]
}

type ResultShape = {
  detections?: Array<{ species?: unknown; description?: unknown }>
  scene_summary?: unknown
  limitations?: unknown
  image_metadata?: { capturedAt?: unknown; capturedAtSource?: unknown }
}

const FLAG_LABELS: Record<ImageQualityFlag, string> = {
  empty_frame: 'Cuadro vacio',
  low_visibility: 'Baja visibilidad',
  blurred: 'Desenfoque',
  occluded: 'Oclusion',
  weather: 'Clima adverso',
  infrared: 'Captura infrarroja',
  uncertain_subject: 'Sujeto incierto',
  metadata_missing: 'Metadata incompleta',
}

function normalize(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function resultShape(value: unknown): ResultShape {
  return value && typeof value === 'object' ? value as ResultShape : {}
}

function resultText(result: ResultShape) {
  const limitations = Array.isArray(result.limitations) ? result.limitations.join(' ') : String(result.limitations || '')
  const descriptions = Array.isArray(result.detections)
    ? result.detections.map((item) => String(item?.description || '')).join(' ')
    : ''
  return normalize(`${result.scene_summary || ''} ${limitations} ${descriptions}`)
}

function includesPattern(text: string, pattern: RegExp) {
  return pattern.test(text)
}

export function assessImageQuality(input: Pick<QualityJobInput, 'result_json' | 'captured_at'>): ImageQualityDiagnostic {
  const result = resultShape(input.result_json)
  const detections = Array.isArray(result.detections) ? result.detections : []
  const species = detections.map((item) => normalize(item?.species)).filter(Boolean)
  const text = resultText(result)
  const flags = new Set<ImageQualityFlag>()
  const reasons: string[] = []
  let score = 100

  if (species.length > 0 && species.every((item) => item === 'empty frame')) {
    flags.add('empty_frame')
    reasons.push('La imagen no contiene sujetos detectables.')
  }

  if (includesPattern(text, /baja visibilidad|low visibility|muy oscur|too dark|iluminacion insuficiente|insufficient light|detalle limitado por oscuridad/)) {
    flags.add('low_visibility')
    reasons.push('La visibilidad limita la identificacion.')
    score -= 30
  }

  if (includesPattern(text, /desenfoc|borros|blur|out of focus|motion blur|movimiento de camara/)) {
    flags.add('blurred')
    reasons.push('El desenfoque reduce el detalle util.')
    score -= 30
  }

  if (includesPattern(text, /oclu|obstru|vegetacion cubre|partially hidden|parcialmente ocult|sujeto parcial/)) {
    flags.add('occluded')
    reasons.push('La escena o el sujeto estan parcialmente obstruidos.')
    score -= 20
  }

  if (includesPattern(text, /lluv|rain|nieve|snow|niebla|fog|condensacion|agua en el lente/)) {
    flags.add('weather')
    reasons.push('Las condiciones ambientales afectan la captura.')
    score -= 15
  }

  if (includesPattern(text, /infrarro|infrared|ir nocturn|vision nocturna|night vision/)) {
    flags.add('infrared')
    reasons.push('Captura realizada en modo infrarrojo o nocturno.')
  }

  if (species.some((item) => ['unknown animal', 'bird unknown', 'fox'].includes(item))) {
    flags.add('uncertain_subject')
    reasons.push('La identificacion taxonomica requiere revision humana.')
    score -= 10
  }

  const capturedAtSource = normalize(result.image_metadata?.capturedAtSource)
  const hasCapturedAt = Boolean(input.captured_at || result.image_metadata?.capturedAt)
  if (!hasCapturedAt || capturedAtSource === 'processing fallback') {
    flags.add('metadata_missing')
    reasons.push('La fecha de captura no proviene de metadata validada.')
    score -= 10
  }

  score = Math.max(0, Math.min(100, score))
  const level: ImageQualityLevel = score >= 80 ? 'good' : score >= 55 ? 'usable' : 'poor'

  return { score, level, flags: Array.from(flags), reasons }
}

function validDate(value: string | null | undefined) {
  if (!value || Number.isNaN(Date.parse(value))) return null
  return new Date(value)
}

function rate(value: number, total: number) {
  return total > 0 ? value / total : 0
}

function rounded(value: number) {
  return Math.round(value * 1000) / 1000
}

function priority(status: CameraHealthStatus) {
  return { critical: 0, maintenance: 1, watch: 2, healthy: 3, no_data: 4, inactive: 5 }[status]
}

export function diagnoseCameraQuality(
  camera: QualityCameraInput,
  jobs: QualityJobInput[],
  now = new Date(),
): CameraQualityDiagnostic {
  const completedJobs = jobs.filter((job) => job.status === 'completed')
  const failed = jobs.filter((job) => job.status === 'failed').length
  const assessments = completedJobs.map((job) => assessImageQuality(job))
  const flagCounts = new Map<ImageQualityFlag, number>()

  for (const assessment of assessments) {
    for (const flag of assessment.flags) flagCounts.set(flag, (flagCounts.get(flag) || 0) + 1)
  }

  const poorQuality = assessments.filter((item) => item.level === 'poor').length
  const qualityIssues = assessments.filter((item) => item.level !== 'good').length
  const emptyFrames = assessments.filter((item) => item.flags.includes('empty_frame')).length
  const uncertainSubjects = assessments.filter((item) => item.flags.includes('uncertain_subject')).length
  const missingMetadata = assessments.filter((item) => item.flags.includes('metadata_missing')).length
  const activityDates = jobs
    .map((job) => validDate(job.captured_at) || validDate(job.created_at))
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => right.getTime() - left.getTime())
  const lastActivity = activityDates[0] || null
  const daysSinceActivity = lastActivity
    ? Math.max(0, Math.floor((now.getTime() - lastActivity.getTime()) / 86400000))
    : null

  const failureRate = rate(failed, jobs.length)
  const poorQualityRate = rate(poorQuality, completedJobs.length)
  const qualityIssueRate = rate(qualityIssues, completedJobs.length)
  const emptyFrameRate = rate(emptyFrames, completedJobs.length)
  const metadataMissingRate = rate(missingMetadata, completedJobs.length)
  const averageQualityScore = assessments.length
    ? Math.round(assessments.reduce((sum, item) => sum + item.score, 0) / assessments.length)
    : null

  let status: CameraHealthStatus = 'healthy'
  if (!camera.active) status = 'inactive'
  else if (jobs.length === 0) status = 'no_data'
  else if ((daysSinceActivity !== null && daysSinceActivity > 7) || (jobs.length >= 3 && (failureRate >= 0.35 || poorQualityRate >= 0.5))) status = 'critical'
  else if ((daysSinceActivity !== null && daysSinceActivity > 3) || (jobs.length >= 3 && (failureRate >= 0.2 || qualityIssueRate >= 0.4))) status = 'maintenance'
  else if ((completedJobs.length >= 5 && emptyFrameRate >= 0.8) || (completedJobs.length >= 3 && metadataMissingRate >= 0.5)) status = 'watch'

  const recommendations: string[] = []
  if (status === 'no_data') recommendations.push('Cargar evidencia reciente para habilitar el diagnostico.')
  if (status === 'inactive') recommendations.push('La camara esta desactivada en el registro operativo.')
  if (daysSinceActivity !== null && daysSinceActivity > 3) recommendations.push('Verificar en terreno energia, conectividad, almacenamiento y activacion.')
  if ((flagCounts.get('low_visibility') || 0) >= 2) recommendations.push('Revisar iluminacion nocturna, orientacion y alcance infrarrojo.')
  if ((flagCounts.get('blurred') || 0) >= 2) recommendations.push('Limpiar el lente y asegurar montaje, enfoque y estabilidad.')
  if ((flagCounts.get('occluded') || 0) >= 2) recommendations.push('Retirar vegetacion u obstaculos y reconsiderar el encuadre.')
  if ((flagCounts.get('weather') || 0) >= 2) recommendations.push('Inspeccionar sellado, condensacion y proteccion frente al clima.')
  if (completedJobs.length >= 5 && emptyFrameRate >= 0.8) recommendations.push('Revisar sensibilidad, altura, orientacion y zona de paso.')
  if (completedJobs.length >= 3 && metadataMissingRate >= 0.5) recommendations.push('Configurar fecha, hora y asociacion de camara en origen.')
  if (jobs.length >= 3 && failureRate >= 0.2) recommendations.push('Revisar formato de archivos y estabilidad del flujo de carga.')
  if (recommendations.length === 0) recommendations.push('Sin acciones de mantenimiento derivadas de la evidencia disponible.')

  const dominantFlags = Array.from(flagCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([flag, count]) => ({ flag, count }))

  return {
    cameraId: camera.id,
    code: camera.code,
    name: camera.name,
    zoneLabel: camera.zone_label || null,
    active: camera.active,
    status,
    analyses: jobs.length,
    completed: completedJobs.length,
    failed,
    poorQuality,
    qualityIssues,
    emptyFrames,
    uncertainSubjects,
    missingMetadata,
    failureRate: rounded(failureRate),
    poorQualityRate: rounded(poorQualityRate),
    qualityIssueRate: rounded(qualityIssueRate),
    emptyFrameRate: rounded(emptyFrameRate),
    averageQualityScore,
    lastActivityAt: lastActivity?.toISOString() || null,
    daysSinceActivity,
    dominantFlags,
    recommendations: Array.from(new Set(recommendations)).slice(0, 4),
  }
}

export function buildQualityReport(
  cameras: QualityCameraInput[],
  jobs: QualityJobInput[],
  now = new Date(),
) {
  const diagnostics = cameras
    .map((camera) => diagnoseCameraQuality(camera, jobs.filter((job) => job.camera_id === camera.id), now))
    .sort((left, right) => priority(left.status) - priority(right.status) || left.code.localeCompare(right.code))
  const completedJobs = jobs.filter((job) => job.status === 'completed')
  const assessments = completedJobs.map((job) => assessImageQuality(job))

  return {
    totals: {
      cameras: diagnostics.length,
      healthy: diagnostics.filter((item) => item.status === 'healthy').length,
      watch: diagnostics.filter((item) => item.status === 'watch').length,
      maintenance: diagnostics.filter((item) => item.status === 'maintenance').length,
      critical: diagnostics.filter((item) => item.status === 'critical').length,
      noData: diagnostics.filter((item) => item.status === 'no_data').length,
      analyses: jobs.length,
      completed: completedJobs.length,
      failed: jobs.filter((job) => job.status === 'failed').length,
      poorQuality: assessments.filter((item) => item.level === 'poor').length,
      qualityIssues: assessments.filter((item) => item.level !== 'good').length,
      emptyFrames: assessments.filter((item) => item.flags.includes('empty_frame')).length,
    },
    diagnostics,
    methodology: {
      source: 'analysis_and_activity',
      hardwareTelemetry: false,
      flagLabels: FLAG_LABELS,
    },
  }
}

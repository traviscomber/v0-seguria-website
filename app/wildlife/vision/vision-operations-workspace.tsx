'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock3,
  FileSearch,
  LocateFixed,
  RefreshCw,
  ShieldCheck,
  Siren,
} from 'lucide-react'

import { getSpeciesLocalization } from '@/lib/wildlife/species-localization'

type TimelineFilter = 'all' | 'alerts' | 'detections'
type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'
type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed'

type Detection = {
  species?: string
  confidence?: number
  description?: string
}

type JobRecord = {
  id: string
  original_filename: string
  status: string
  review_status: string
  result_json?: {
    detections?: Detection[]
    scene_summary?: string
  } | null
  error_code?: string | null
  error_message?: string | null
  camera_id?: string | null
  zone_label?: string | null
  captured_at?: string | null
  created_at: string
  has_evidence?: boolean
  wildlife_cameras?: {
    code?: string | null
    name?: string | null
    zone_label?: string | null
  } | null
}

type CameraRecord = {
  id: string
  code: string
  name: string
  zone_label?: string | null
  latitude?: number | null
  longitude?: number | null
  active: boolean
  created_at?: string | null
}

type AlertRecord = {
  id: string
  alert_type: string
  severity: AlertSeverity
  status: AlertStatus
  source_type: string
  source_id?: string | null
  camera_id?: string | null
  title: string
  summary: string
  zone_label?: string | null
  detected_at: string
  payload?: {
    species?: string | null
    confidence?: number | null
    reviewStatus?: string | null
    locationStatus?: string | null
    cameraCode?: string | null
    cameraName?: string | null
    requiresHumanReview?: boolean
  } | null
  wildlife_cameras?: {
    code?: string | null
    name?: string | null
    zone_label?: string | null
  } | null
}

type TimelineEntry = {
  id: string
  kind: 'alert' | 'detection'
  timestamp: Date
  title: string
  summary: string
  severity?: AlertSeverity
  status?: string
  cameraId?: string | null
  cameraCode?: string | null
  cameraName?: string | null
  zone?: string | null
  jobId?: string | null
  species?: string | null
  scientificName?: string | null
  confidence?: number | null
  reviewStatus?: string | null
  evidenceAvailable?: boolean
  locationStatus?: string | null
  errorCode?: string | null
}

type CameraHealth = {
  camera: CameraRecord
  lastActivity: Date | null
  hoursWithoutActivity: number | null
  state: 'healthy' | 'attention' | 'critical' | 'new' | 'disabled'
  stateLabel: string
  locationValidated: boolean
  detections: number
}

function safeDate(value: string | null | undefined) {
  const parsed = value ? new Date(value) : null
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null
}

function formatDate(value: Date | null) {
  return value ? value.toLocaleString('es-CL') : 'Sin fecha validada'
}

function reviewLabel(value: string | null | undefined) {
  if (value === 'confirmed') return 'Confirmado'
  if (value === 'corrected') return 'Corregido'
  if (value === 'rejected') return 'Rechazado'
  if (value === 'unidentifiable') return 'No identificable'
  return 'Pendiente'
}

function severityLabel(value: AlertSeverity | undefined) {
  if (value === 'critical') return 'Critica'
  if (value === 'high') return 'Alta'
  if (value === 'medium') return 'Media'
  if (value === 'low') return 'Baja'
  return 'Informativa'
}

function severityClasses(value: AlertSeverity | undefined) {
  if (value === 'critical') return 'border-red-300/25 bg-red-300/[0.08] text-red-100'
  if (value === 'high') return 'border-orange-300/25 bg-orange-300/[0.08] text-orange-100'
  if (value === 'medium') return 'border-amber-300/25 bg-amber-300/[0.07] text-amber-100'
  if (value === 'low') return 'border-sky-300/20 bg-sky-300/[0.06] text-sky-100'
  return 'border-white/12 bg-white/[0.04] text-white/70'
}

function healthClasses(state: CameraHealth['state']) {
  if (state === 'healthy') return 'bg-emerald-300/10 text-emerald-100'
  if (state === 'attention') return 'bg-amber-300/10 text-amber-100'
  if (state === 'critical') return 'bg-red-300/10 text-red-100'
  if (state === 'new') return 'bg-sky-300/10 text-sky-100'
  return 'bg-white/[0.05] text-white/50'
}

export function VisionOperationsWorkspace() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([])
  const [jobs, setJobs] = useState<JobRecord[]>([])
  const [cameras, setCameras] = useState<CameraRecord[]>([])
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [alertsResponse, jobsResponse, camerasResponse] = await Promise.all([
        fetch('/api/alerts?module=vision&limit=100', { cache: 'no-store' }),
        fetch('/api/vision/jobs?limit=100', { cache: 'no-store' }),
        fetch('/api/vision/cameras', { cache: 'no-store' }),
      ])
      const [alertsPayload, jobsPayload, camerasPayload] = await Promise.all([
        alertsResponse.json(),
        jobsResponse.json(),
        camerasResponse.json(),
      ])

      if (!alertsResponse.ok || !alertsPayload.success) throw new Error(alertsPayload.error || 'No fue posible cargar las alertas.')
      if (!jobsResponse.ok || !jobsPayload.success) throw new Error(jobsPayload.error || 'No fue posible cargar la actividad.')
      if (!camerasResponse.ok || !camerasPayload.success) throw new Error(camerasPayload.error || 'No fue posible cargar las camaras.')

      setAlerts(alertsPayload.data || [])
      setJobs(jobsPayload.data || [])
      setCameras(camerasPayload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar el espacio operacional.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    const handler = () => void loadData()
    window.addEventListener('wildlife-job-created', handler)
    return () => window.removeEventListener('wildlife-job-created', handler)
  }, [])

  const timeline = useMemo<TimelineEntry[]>(() => {
    const alertJobIds = new Set(
      alerts
        .filter((alert) => alert.source_type === 'wildlife_inference_job' && alert.source_id)
        .map((alert) => alert.source_id as string),
    )

    const alertEntries: TimelineEntry[] = alerts.map((alert) => {
      const speciesCode = alert.payload?.species || null
      const species = speciesCode ? getSpeciesLocalization(speciesCode) : null
      return {
        id: `alert:${alert.id}`,
        kind: 'alert',
        timestamp: safeDate(alert.detected_at) || new Date(0),
        title: alert.title,
        summary: alert.summary,
        severity: alert.severity,
        status: alert.status,
        cameraId: alert.camera_id,
        cameraCode: alert.wildlife_cameras?.code || alert.payload?.cameraCode || null,
        cameraName: alert.wildlife_cameras?.name || alert.payload?.cameraName || null,
        zone: alert.zone_label || alert.wildlife_cameras?.zone_label || null,
        jobId: alert.source_type === 'wildlife_inference_job' ? alert.source_id : null,
        species: species?.label || speciesCode,
        scientificName: species?.scientificName || null,
        confidence: typeof alert.payload?.confidence === 'number' ? alert.payload.confidence : null,
        reviewStatus: alert.payload?.reviewStatus || null,
        locationStatus: alert.payload?.locationStatus || null,
      }
    })

    const detectionEntries: TimelineEntry[] = jobs
      .filter((job) => !alertJobIds.has(job.id))
      .map((job) => {
        const detection = job.result_json?.detections?.[0]
        const species = getSpeciesLocalization(detection?.species || 'unknown_animal')
        const failed = job.status === 'failed'
        return {
          id: `job:${job.id}`,
          kind: 'detection',
          timestamp: safeDate(job.captured_at || job.created_at) || new Date(0),
          title: failed ? 'Analisis no completado' : species.label,
          summary: failed
            ? job.error_message || 'La evidencia no pudo procesarse.'
            : job.result_json?.scene_summary || detection?.description || 'Evidencia procesada sin resumen adicional.',
          status: failed ? 'failed' : job.review_status,
          cameraId: job.camera_id,
          cameraCode: job.wildlife_cameras?.code || null,
          cameraName: job.wildlife_cameras?.name || null,
          zone: job.zone_label || job.wildlife_cameras?.zone_label || null,
          jobId: job.id,
          species: failed ? null : species.label,
          scientificName: failed ? null : species.scientificName || null,
          confidence: typeof detection?.confidence === 'number' ? detection.confidence : null,
          reviewStatus: job.review_status,
          evidenceAvailable: job.has_evidence,
          errorCode: job.error_code,
        }
      })

    return [...alertEntries, ...detectionEntries]
      .filter((entry) => timelineFilter === 'all'
        || (timelineFilter === 'alerts' && entry.kind === 'alert')
        || (timelineFilter === 'detections' && entry.kind === 'detection'))
      .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
  }, [alerts, jobs, timelineFilter])

  useEffect(() => {
    if (!timeline.length) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !timeline.some((entry) => entry.id === selectedId)) setSelectedId(timeline[0].id)
  }, [selectedId, timeline])

  const selected = timeline.find((entry) => entry.id === selectedId) || timeline[0] || null

  const cameraHealth = useMemo<CameraHealth[]>(() => {
    const now = Date.now()
    return cameras.map((camera) => {
      const cameraJobs = jobs.filter((job) => job.camera_id === camera.id)
      const lastActivity = cameraJobs
        .map((job) => safeDate(job.captured_at || job.created_at))
        .filter((value): value is Date => Boolean(value))
        .sort((left, right) => right.getTime() - left.getTime())[0] || null
      const createdAt = safeDate(camera.created_at)
      const reference = lastActivity || createdAt
      const hoursWithoutActivity = reference ? Math.floor((now - reference.getTime()) / 3600000) : null

      let state: CameraHealth['state'] = 'new'
      let stateLabel = 'Sin historial'
      if (!camera.active) {
        state = 'disabled'
        stateLabel = 'Desactivada'
      } else if (lastActivity && hoursWithoutActivity !== null && hoursWithoutActivity <= 72) {
        state = 'healthy'
        stateLabel = 'Actividad reciente'
      } else if (hoursWithoutActivity !== null && hoursWithoutActivity > 168) {
        state = 'critical'
        stateLabel = 'Sin actividad prolongada'
      } else if (hoursWithoutActivity !== null && hoursWithoutActivity > 72) {
        state = 'attention'
        stateLabel = 'Revisar en terreno'
      }

      return {
        camera,
        lastActivity,
        hoursWithoutActivity,
        state,
        stateLabel,
        locationValidated: typeof camera.latitude === 'number' && typeof camera.longitude === 'number',
        detections: cameraJobs.filter((job) => job.status === 'completed').length,
      }
    }).sort((left, right) => {
      const order: Record<CameraHealth['state'], number> = { critical: 5, attention: 4, new: 3, healthy: 2, disabled: 1 }
      return order[right.state] - order[left.state]
    })
  }, [cameras, jobs])

  const metrics = useMemo(() => ({
    timeline: timeline.length,
    healthyCameras: cameraHealth.filter((item) => item.state === 'healthy').length,
    camerasRequiringAttention: cameraHealth.filter((item) => ['attention', 'critical'].includes(item.state)).length,
    pendingReviews: jobs.filter((job) => job.review_status === 'pending').length,
  }), [cameraHealth, jobs, timeline.length])

  function focusCamera(cameraId: string | null | undefined) {
    if (!cameraId) return
    window.dispatchEvent(new CustomEvent('seguria-map-focus', { detail: { cameraId } }))
    document.getElementById('territorial-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1d2c]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">Operacion integrada</p>
          <h2 className="mt-1 text-2xl font-medium text-white">Actividad, salud de camaras y detalle de evento</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-white/55">Vista de trabajo para conectar evidencia, alertas y estado de despliegue. La salud se calcula por actividad registrada; no reemplaza telemetria de conectividad o bateria.</p>
        </div>
        <button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.05] disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Actualizar
        </button>
      </div>

      <div className="grid gap-px bg-white/8 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Activity className="h-4 w-4" />} label="Eventos visibles" value={metrics.timeline} />
        <Metric icon={<ShieldCheck className="h-4 w-4" />} label="Camaras activas" value={metrics.healthyCameras} />
        <Metric icon={<AlertTriangle className="h-4 w-4" />} label="Requieren atencion" value={metrics.camerasRequiringAttention} />
        <Metric icon={<FileSearch className="h-4 w-4" />} label="Revision pendiente" value={metrics.pendingReviews} />
      </div>

      {error && <p className="m-5 rounded-xl border border-red-300/20 bg-red-300/[0.05] p-4 text-sm text-red-100/85 sm:m-6">{error}</p>}

      <div className="grid xl:grid-cols-[0.82fr_1.18fr]">
        <div className="border-b border-white/10 p-5 sm:p-6 xl:border-b-0 xl:border-r">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium text-white">Linea de tiempo territorial</h3>
              <p className="mt-1 text-xs text-white/40">Alertas prioritarias y detecciones sin alerta duplicada</p>
            </div>
            <div className="flex rounded-lg border border-white/10 bg-[#071622] p-1">
              {([['all', 'Todo'], ['alerts', 'Alertas'], ['detections', 'Detecciones']] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setTimelineFilter(value)} className={`rounded-md px-2.5 py-1.5 text-[11px] transition ${timelineFilter === value ? 'bg-[#68b4e3] text-[#06131d]' : 'text-white/55 hover:text-white'}`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="mt-4 max-h-[640px] space-y-2 overflow-y-auto pr-1">
            {!loading && timeline.length === 0 && <p className="rounded-xl border border-white/8 bg-white/[0.02] p-5 text-sm text-white/45">No hay actividad para este filtro.</p>}
            {timeline.map((entry) => (
              <button key={entry.id} type="button" onClick={() => setSelectedId(entry.id)} className={`w-full rounded-xl border p-3 text-left transition ${selected?.id === entry.id ? 'border-[#68b4e3]/40 bg-[#68b4e3]/[0.07]' : 'border-white/8 bg-[#071622] hover:border-white/15'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-white/35">{entry.kind === 'alert' ? 'Alerta' : 'Deteccion'}</span>
                      {entry.severity && <span className={`rounded-full border px-2 py-0.5 text-[10px] ${severityClasses(entry.severity)}`}>{severityLabel(entry.severity)}</span>}
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-white">{entry.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">{entry.summary}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-white/30">{entry.timestamp.toLocaleDateString('es-CL')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div>
            <h3 className="text-lg font-medium text-white">Detalle operacional</h3>
            <p className="mt-1 text-xs text-white/40">Contexto suficiente para decidir sin perder trazabilidad</p>
          </div>

          {selected ? (
            <article className="mt-4 rounded-2xl border border-white/10 bg-[#071622] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/50">{selected.kind === 'alert' ? 'Alerta SegurIA' : 'Evento Vision'}</span>
                    {selected.severity && <span className={`rounded-full border px-2.5 py-1 text-[10px] ${severityClasses(selected.severity)}`}>{severityLabel(selected.severity)}</span>}
                  </div>
                  <h4 className="mt-3 text-xl font-medium text-white">{selected.title}</h4>
                  {selected.scientificName && <p className="mt-1 text-sm italic text-white/45">{selected.scientificName}</p>}
                </div>
                <span className="text-xs text-white/35">{formatDate(selected.timestamp)}</span>
              </div>

              <p className="mt-4 text-sm leading-6 text-white/62">{selected.summary}</p>

              <div className="mt-5 grid gap-px overflow-hidden rounded-xl bg-white/8 sm:grid-cols-2">
                <Detail label="Camara" value={selected.cameraCode ? `${selected.cameraCode}${selected.cameraName ? ` · ${selected.cameraName}` : ''}` : 'Sin camara asociada'} />
                <Detail label="Sector" value={selected.zone || 'Sin sector validado'} />
                <Detail label="Confianza" value={typeof selected.confidence === 'number' ? `${Math.round(selected.confidence * 100)}%` : 'No disponible'} />
                <Detail label="Revision humana" value={reviewLabel(selected.reviewStatus)} />
                <Detail label="Ubicacion" value={selected.locationStatus === 'not_validated' ? 'No validada' : selected.cameraId ? 'Vinculada a camara' : 'No disponible'} />
                <Detail label="Evidencia" value={selected.evidenceAvailable === false ? 'No almacenada' : selected.jobId ? 'Registro disponible' : 'No aplica'} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/8 pt-4">
                {selected.cameraId && <button type="button" onClick={() => focusCamera(selected.cameraId)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#68b4e3]/20 bg-[#68b4e3]/[0.05] px-3 py-2 text-xs text-[#9bd3f3]"><LocateFixed className="h-3.5 w-3.5" />Ver en mapa</button>}
                {selected.jobId && <a href="/wildlife/review" className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-2 text-xs text-white/70 hover:bg-white/[0.05]"><FileSearch className="h-3.5 w-3.5" />Abrir revision</a>}
              </div>
            </article>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/8 bg-[#071622] p-7 text-center text-sm text-white/45">Selecciona un evento de la linea de tiempo.</div>
          )}

          <div className="mt-6 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium text-white">Salud por actividad de camaras</h3>
              <p className="mt-1 text-xs text-white/40">Estado derivado de evidencia reciente y metadata territorial</p>
            </div>
            <span className="text-xs text-white/35">{cameraHealth.length} camaras</span>
          </div>

          <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {!loading && cameraHealth.length === 0 && <p className="rounded-xl border border-white/8 bg-[#071622] p-5 text-sm text-white/45">No hay camaras registradas.</p>}
            {cameraHealth.map((item) => (
              <article key={item.camera.id} className="rounded-xl border border-white/8 bg-[#071622] p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-[#9bd3f3]" />
                      <p className="text-sm font-medium text-white">{item.camera.code} · {item.camera.name}</p>
                    </div>
                    <p className="mt-1 text-xs text-white/45">{item.camera.zone_label || 'Sin sector'} · {item.detections} detecciones</p>
                    <p className="mt-1 text-[11px] text-white/35">Ultima actividad: {formatDate(item.lastActivity)}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] ${healthClasses(item.state)}`}>{item.stateLabel}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] ${item.locationValidated ? 'bg-emerald-300/10 text-emerald-100' : 'bg-amber-300/10 text-amber-100'}`}>{item.locationValidated ? 'Ubicada' : 'Sin GPS'}</span>
                    {item.locationValidated && <button type="button" aria-label={`Ver ${item.camera.code} en mapa`} onClick={() => focusCamera(item.camera.id)} className="rounded-lg border border-white/10 p-2 text-white/55 hover:text-[#9bd3f3]"><LocateFixed className="h-3.5 w-3.5" /></button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="bg-[#0b1d2c] p-5"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.13em] text-white/40">{icon}{label}</div><p className="mt-2 text-3xl font-normal text-white">{value}</p></div>
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="bg-[#071622] p-4"><p className="text-[10px] uppercase tracking-[0.12em] text-white/30">{label}</p><p className="mt-1 text-sm text-white/75">{value}</p></div>
}

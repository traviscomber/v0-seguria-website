'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, Camera, CheckCircle2, MapPin, RefreshCw } from 'lucide-react'

import { getSpeciesLocalization } from '@/lib/wildlife/species-localization'

type Detection = { species?: string; confidence?: number }

type Job = {
  id: string
  original_filename: string
  status: string
  review_status: string
  result_json?: { detections?: Detection[] } | null
  camera_id?: string | null
  zone_label?: string | null
  captured_at?: string | null
  created_at: string
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
}

type MetadataStatus = 'validated' | 'estimated' | 'insufficient'

type MetadataRecord = {
  job: Job
  camera?: CameraRecord
  speciesLabel: string
  status: MetadataStatus
  statusLabel: string
  zone: string | null
  eventDate: Date
  dateSource: 'captured_at' | 'created_at'
  checks: {
    camera: boolean
    zone: boolean
    captureDate: boolean
    coordinates: boolean
    zoneConsistent: boolean
  }
}

function metadataStatus(record: Omit<MetadataRecord, 'status' | 'statusLabel'>) {
  if (record.checks.coordinates && record.checks.camera && record.checks.captureDate) {
    return { status: 'validated' as const, statusLabel: 'Ubicacion validada' }
  }
  if (record.checks.zone || record.checks.camera) {
    return { status: 'estimated' as const, statusLabel: 'Ubicacion no validada' }
  }
  return { status: 'insufficient' as const, statusLabel: 'Metadata territorial insuficiente' }
}

function statusClasses(status: MetadataStatus) {
  if (status === 'validated') return 'border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200'
  if (status === 'estimated') return 'border-amber-300/20 bg-amber-300/[0.06] text-amber-100'
  return 'border-red-300/20 bg-red-300/[0.05] text-red-100'
}

export function TerritorialMetadataValidation() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [cameras, setCameras] = useState<CameraRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [jobsResponse, camerasResponse] = await Promise.all([
        fetch('/api/vision/jobs?limit=100&status=completed', { cache: 'no-store' }),
        fetch('/api/vision/cameras', { cache: 'no-store' }),
      ])
      const jobsPayload = await jobsResponse.json()
      const camerasPayload = await camerasResponse.json()
      if (!jobsResponse.ok || !jobsPayload.success) throw new Error(jobsPayload.error || 'No fue posible verificar los avistamientos.')
      if (!camerasResponse.ok || !camerasPayload.success) throw new Error(camerasPayload.error || 'No fue posible verificar las camaras.')
      setJobs(jobsPayload.data || [])
      setCameras(camerasPayload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible verificar la metadata territorial.')
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

  const records = useMemo<MetadataRecord[]>(() => jobs.map((job) => {
    const camera = cameras.find((item) => item.id === job.camera_id)
    const zone = job.zone_label || camera?.zone_label || job.wildlife_cameras?.zone_label || null
    const cameraZone = camera?.zone_label || job.wildlife_cameras?.zone_label || null
    const jobZone = job.zone_label || null
    const coordinates = typeof camera?.latitude === 'number' && typeof camera?.longitude === 'number'
    const eventDate = new Date(job.captured_at || job.created_at)
    const primarySpecies = job.result_json?.detections?.[0]?.species || 'unknown_animal'
    const base = {
      job,
      camera,
      speciesLabel: getSpeciesLocalization(primarySpecies).label,
      zone,
      eventDate,
      dateSource: job.captured_at ? 'captured_at' as const : 'created_at' as const,
      checks: {
        camera: Boolean(camera || job.wildlife_cameras?.code),
        zone: Boolean(zone),
        captureDate: Boolean(job.captured_at),
        coordinates,
        zoneConsistent: !jobZone || !cameraZone || jobZone.trim().toLowerCase() === cameraZone.trim().toLowerCase(),
      },
    }
    return { ...base, ...metadataStatus(base) }
  }).sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime()), [jobs, cameras])

  const totals = useMemo(() => ({
    validated: records.filter((item) => item.status === 'validated').length,
    estimated: records.filter((item) => item.status === 'estimated').length,
    insufficient: records.filter((item) => item.status === 'insufficient').length,
  }), [records])

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1d2c]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">Control de metadata</p>
          <h2 className="mt-1 text-2xl font-light text-white">Validacion territorial de avistamientos</h2>
          <p className="mt-1 max-w-3xl text-sm text-white/45">Todos los registros permanecen visibles. La ausencia de coordenadas no elimina el avistamiento: lo clasifica como ubicacion no validada.</p>
        </div>
        <button onClick={() => void loadData()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.04] disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Verificar metadata
        </button>
      </div>

      <div className="grid gap-px bg-white/8 sm:grid-cols-3">
        <MetadataMetric label="Georreferenciados" value={totals.validated} detail="Camara, fecha y coordenadas" status="validated" />
        <MetadataMetric label="No validados" value={totals.estimated} detail="Visibles por camara o sector" status="estimated" />
        <MetadataMetric label="Metadata insuficiente" value={totals.insufficient} detail="Requieren completar datos" status="insufficient" />
      </div>

      {error && <p className="m-5 rounded-xl border border-red-300/15 bg-red-300/[0.04] p-4 text-sm text-red-100/80 sm:m-6">{error}</p>}

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-medium text-white">Cola de ubicaciones y metadata</h3>
            <p className="mt-1 text-xs text-white/35">Revision automatica de los ultimos {records.length} registros</p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {!loading && records.length === 0 && <p className="rounded-xl border border-white/8 bg-white/[0.02] p-5 text-sm text-white/40">No existen registros para verificar.</p>}
          {records.slice(0, 20).map((record) => (
            <article key={record.job.id} className="rounded-xl border border-white/8 bg-[#071622] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{record.speciesLabel}</p>
                  <p className="mt-0.5 text-xs text-white/35">{record.job.original_filename}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${statusClasses(record.status)}`}>
                  {record.status === 'validated' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {record.statusLabel}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-white/50 sm:grid-cols-2">
                <CheckRow icon={<Camera className="h-3.5 w-3.5" />} label="Camara" value={record.camera?.code || record.job.wildlife_cameras?.code || 'No asociada'} valid={record.checks.camera} />
                <CheckRow icon={<MapPin className="h-3.5 w-3.5" />} label="Sector" value={record.zone || 'No informado'} valid={record.checks.zone} />
                <CheckRow icon={<CalendarClock className="h-3.5 w-3.5" />} label="Fecha" value={record.eventDate.toLocaleString('es-CL')} valid={record.checks.captureDate} note={record.dateSource === 'captured_at' ? 'captura' : 'procesamiento'} />
                <CheckRow icon={<MapPin className="h-3.5 w-3.5" />} label="Coordenadas" value={record.checks.coordinates ? 'Registradas y protegidas' : 'No registradas'} valid={record.checks.coordinates} />
              </div>

              {!record.checks.zoneConsistent && (
                <p className="mt-3 rounded-lg border border-amber-300/15 bg-amber-300/[0.04] px-3 py-2 text-xs text-amber-100/75">La zona del avistamiento no coincide con la zona registrada en la camara. Requiere validacion humana.</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function MetadataMetric({ label, value, detail, status }: { label: string; value: number; detail: string; status: MetadataStatus }) {
  return (
    <div className="bg-[#0b1d2c] p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className={`mt-2 text-3xl font-light ${status === 'validated' ? 'text-emerald-200' : status === 'estimated' ? 'text-amber-100' : 'text-red-100'}`}>{value}</p>
      <p className="mt-1 text-xs text-white/30">{detail}</p>
    </div>
  )
}

function CheckRow({ icon, label, value, valid, note }: { icon: React.ReactNode; label: string; value: string; valid: boolean; note?: string }) {
  return (
    <div className="rounded-lg border border-white/7 bg-white/[0.02] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-white/35">{icon}<span>{label}</span></div>
      <div className="mt-1 flex items-center gap-2">
        <span className={valid ? 'text-white/75' : 'text-amber-100/75'}>{value}</span>
        {note && <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/35">{note}</span>}
      </div>
    </div>
  )
}

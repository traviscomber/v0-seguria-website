'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Camera, CheckCircle2, Clock3, MapPin, RefreshCw } from 'lucide-react'

type ImageMetadata = {
  available?: boolean
  source?: 'exif' | 'none'
  capturedAt?: string | null
  latitude?: number | null
  longitude?: number | null
  orientation?: number | null
  cameraMake?: string | null
  cameraModel?: string | null
  issues?: string[]
  locationStatus?: string
}

type Job = {
  id: string
  original_filename: string
  captured_at?: string | null
  created_at: string
  zone_label?: string | null
  camera_id?: string | null
  result_json?: {
    image_metadata?: ImageMetadata
  } | null
  wildlife_cameras?: {
    code?: string | null
    name?: string | null
    zone_label?: string | null
  } | null
}

function dateSource(job: Job) {
  const metadata = job.result_json?.image_metadata
  if (metadata?.capturedAt) return { label: 'Fecha EXIF validada', value: metadata.capturedAt, valid: true }
  if (job.captured_at) return { label: 'Fecha manual', value: job.captured_at, valid: false }
  return { label: 'Fecha de procesamiento', value: job.created_at, valid: false }
}

function locationState(job: Job) {
  const metadata = job.result_json?.image_metadata
  const hasGps = typeof metadata?.latitude === 'number' && typeof metadata?.longitude === 'number'
  if (hasGps) return { label: 'GPS EXIF validado', valid: true }
  if (job.zone_label || job.wildlife_cameras?.zone_label) return { label: 'Sector sin coordenadas validadas', valid: false }
  return { label: 'Ubicacion no validada', valid: false }
}

export function ImageMetadataActivity() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/vision/jobs?limit=30&status=completed', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar la metadata.')
      setJobs(payload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar la metadata.')
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

  const summary = useMemo(() => {
    const exif = jobs.filter((job) => job.result_json?.image_metadata?.available).length
    const gps = jobs.filter((job) => {
      const metadata = job.result_json?.image_metadata
      return typeof metadata?.latitude === 'number' && typeof metadata?.longitude === 'number'
    }).length
    return { exif, gps, pending: Math.max(0, jobs.length - gps) }
  }, [jobs])

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b1d2c] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">Validacion de metadata</p>
          <h2 className="mt-1 text-2xl font-light text-white">Origen temporal y territorial</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/45">Verifica EXIF, camara, fecha y ubicacion sin publicar coordenadas exactas.</p>
        </div>
        <button onClick={() => void loadData()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.04] disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/8 bg-[#071622] p-4"><p className="text-xs text-white/35">Con EXIF</p><p className="mt-1 text-2xl text-white">{summary.exif}</p></div>
        <div className="rounded-xl border border-white/8 bg-[#071622] p-4"><p className="text-xs text-white/35">Con GPS validado</p><p className="mt-1 text-2xl text-white">{summary.gps}</p></div>
        <div className="rounded-xl border border-white/8 bg-[#071622] p-4"><p className="text-xs text-white/35">Pendientes de ubicacion</p><p className="mt-1 text-2xl text-white">{summary.pending}</p></div>
      </div>

      {error && <p className="mt-4 rounded-xl border border-red-300/15 bg-red-300/[0.04] p-4 text-sm text-red-100/80">{error}</p>}

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {jobs.slice(0, 12).map((job) => {
          const metadata = job.result_json?.image_metadata
          const temporal = dateSource(job)
          const location = locationState(job)
          const cameraName = [metadata?.cameraMake, metadata?.cameraModel].filter(Boolean).join(' ') || job.wildlife_cameras?.code || 'Camara no identificada'
          const issues = metadata?.issues || []
          return (
            <article key={job.id} className="rounded-xl border border-white/8 bg-[#071622] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{job.original_filename}</p>
                  <p className="mt-1 text-xs text-white/35">{cameraName}</p>
                </div>
                {metadata?.available ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />}
              </div>

              <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                <span className={`inline-flex items-center gap-1.5 ${temporal.valid ? 'text-emerald-200/80' : 'text-white/45'}`}><Clock3 className="h-3.5 w-3.5" />{temporal.label}</span>
                <span className={`inline-flex items-center gap-1.5 ${location.valid ? 'text-emerald-200/80' : 'text-amber-200/75'}`}><MapPin className="h-3.5 w-3.5" />{location.label}</span>
                <span className="inline-flex items-center gap-1.5 text-white/45"><Camera className="h-3.5 w-3.5" />{job.wildlife_cameras?.code || 'Sin camara asociada'}</span>
                <span className="text-white/45">{new Date(temporal.value).toLocaleString('es-CL')}</span>
              </div>

              <p className="mt-3 text-xs text-white/40">Sector: {job.zone_label || job.wildlife_cameras?.zone_label || 'Sin sector validado'}</p>
              {issues.length > 0 && <p className="mt-3 text-xs leading-5 text-amber-100/55">{issues.slice(0, 2).join(' ')}</p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

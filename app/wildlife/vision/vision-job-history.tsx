'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, CircleAlert, Download, MapPin, RefreshCw, Search, X } from 'lucide-react'

type ReviewStatus = 'pending' | 'confirmed' | 'corrected' | 'rejected' | 'unidentifiable'
type JobStatus = 'queued' | 'processing' | 'completed' | 'failed'

type Detection = { species: string; confidence: number; description?: string }
type CameraRelation = { code?: string | null; name?: string | null; zone_label?: string | null }

type Job = {
  id: string
  original_filename: string
  provider: string
  model_name: string
  status: JobStatus
  review_status: ReviewStatus
  camera_id?: string | null
  zone_label?: string | null
  captured_at?: string | null
  wildlife_cameras?: CameraRelation | CameraRelation[] | null
  corrected_common_name?: string | null
  corrected_scientific_name?: string | null
  review_notes?: string | null
  result_json?: { detections?: Detection[]; scene_summary?: string; limitations?: string[] } | null
  error_message?: string | null
  created_at: string
}

type CorrectionDraft = { commonName: string; scientificName: string; notes: string }
type ExportRow = { job: Job; detection: Detection | null }

const reviewLabels: Record<ReviewStatus, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', corrected: 'Corregido', rejected: 'Rechazado', unidentifiable: 'No identificable',
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function cameraFor(job: Job) {
  if (Array.isArray(job.wildlife_cameras)) return job.wildlife_cameras[0] || null
  return job.wildlife_cameras || null
}

export function VisionJobHistory({ refreshKey = 0 }: { refreshKey?: number }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reviewFilter, setReviewFilter] = useState<ReviewStatus | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [zoneFilter, setZoneFilter] = useState('')
  const [capturedFrom, setCapturedFrom] = useState('')
  const [capturedTo, setCapturedTo] = useState('')
  const [editingJobId, setEditingJobId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CorrectionDraft>({ commonName: '', scientificName: '', notes: '' })

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (reviewFilter !== 'all') params.set('review_status', reviewFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (speciesFilter.trim()) params.set('species', speciesFilter.trim())
      if (zoneFilter.trim()) params.set('zone', zoneFilter.trim())
      if (capturedFrom) params.set('captured_from', new Date(`${capturedFrom}T00:00:00`).toISOString())
      if (capturedTo) params.set('captured_to', new Date(`${capturedTo}T23:59:59`).toISOString())
      const response = await fetch(`/api/vision/jobs?${params.toString()}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar el historial.')
      setJobs(payload.data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar el historial.')
    } finally {
      setLoading(false)
    }
  }, [capturedFrom, capturedTo, reviewFilter, speciesFilter, statusFilter, zoneFilter])

  useEffect(() => { void loadJobs() }, [loadJobs, refreshKey])

  const exportRows = useMemo<ExportRow[]>(() => jobs.flatMap<ExportRow>((job) => {
    const detections = job.result_json?.detections || []
    return detections.length ? detections.map((detection) => ({ job, detection })) : [{ job, detection: null }]
  }), [jobs])

  async function review(jobId: string, reviewStatus: Exclude<ReviewStatus, 'pending'>, correction?: CorrectionDraft) {
    setUpdating(jobId)
    setError(null)
    try {
      const response = await fetch('/api/vision/jobs', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, reviewStatus, correctedCommonName: correction?.commonName || null, correctedScientificName: correction?.scientificName || null, notes: correction?.notes || null }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible registrar la revisión.')
      setEditingJobId(null)
      await loadJobs()
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'No fue posible registrar la revisión.')
    } finally { setUpdating(null) }
  }

  function startCorrection(job: Job) {
    setEditingJobId(job.id)
    setDraft({ commonName: job.corrected_common_name || '', scientificName: job.corrected_scientific_name || '', notes: job.review_notes || '' })
  }

  function exportCsv() {
    const header = ['job_id','archivo','fecha_captura','fecha_proceso','camera_codigo','camera_nombre','zona','estado','revision','proveedor','modelo','especie_predicha','confianza','nombre_comun_corregido','nombre_cientifico_corregido','notas']
    const lines = exportRows.map(({ job, detection }) => {
      const camera = cameraFor(job)
      return [job.id, job.original_filename, job.captured_at || '', job.created_at, camera?.code || '', camera?.name || '', job.zone_label || camera?.zone_label || '', job.status, job.review_status, job.provider, job.model_name, detection?.species || '', detection?.confidence ?? '', job.corrected_common_name || '', job.corrected_scientific_name || '', job.review_notes || ''].map(csvCell).join(',')
    })
    const blob = new Blob([[header.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `seguria-wildlife-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-light text-white">Historial de análisis</h2><p className="mt-1 text-sm text-white/50">Predicciones, metadatos de captura y revisión humana.</p></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportCsv} disabled={!jobs.length} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 disabled:opacity-40"><Download className="h-4 w-4" /> Exportar CSV</button>
          <button type="button" onClick={() => void loadJobs()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 disabled:opacity-40"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar</button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="relative xl:col-span-2"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/35" /><input value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)} placeholder="Buscar especie" className="w-full rounded-lg border border-white/10 bg-[#081827] py-3 pl-10 pr-3 text-sm text-white" /></label>
        <input value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} placeholder="Zona" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-3 text-sm text-white" />
        <input type="date" value={capturedFrom} onChange={(e) => setCapturedFrom(e.target.value)} className="rounded-lg border border-white/10 bg-[#081827] px-3 py-3 text-sm text-white" />
        <input type="date" value={capturedTo} onChange={(e) => setCapturedTo(e.target.value)} className="rounded-lg border border-white/10 bg-[#081827] px-3 py-3 text-sm text-white" />
        <select value={reviewFilter} onChange={(e) => setReviewFilter(e.target.value as ReviewStatus | 'all')} className="rounded-lg border border-white/10 bg-[#081827] px-3 py-3 text-sm text-white"><option value="all">Todas las revisiones</option>{Object.entries(reviewLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')} className="rounded-lg border border-white/10 bg-[#081827] px-3 py-3 text-sm text-white"><option value="all">Todos los estados</option><option value="completed">Completado</option><option value="failed">Fallido</option><option value="queued">En cola</option><option value="processing">Procesando</option></select>
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-300/20 bg-red-300/[0.05] p-3 text-sm text-red-100">{error}</p>}
      {!loading && !jobs.length && <p className="mt-5 rounded-lg bg-black/20 p-4 text-sm text-white/50">No existen análisis para estos filtros.</p>}

      <div className="mt-5 space-y-4">
        {jobs.map((job) => {
          const detections = job.result_json?.detections || []
          const camera = cameraFor(job)
          const zone = job.zone_label || camera?.zone_label
          return (
            <article key={job.id} className="rounded-xl border border-white/8 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{job.original_filename}</p>
                  <p className="mt-1 text-xs text-white/40">Procesado {new Date(job.created_at).toLocaleString('es-CL')} · {job.provider} · {job.model_name}</p>
                  {(camera || zone || job.captured_at) && <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#9DD2F2]/80"><MapPin className="h-3.5 w-3.5" />{camera && <span>{camera.code || camera.name}{camera.code && camera.name ? ` · ${camera.name}` : ''}</span>}{zone && <span>· {zone}</span>}{job.captured_at && <span>· Captura {new Date(job.captured_at).toLocaleString('es-CL')}</span>}</div>}
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/65">{reviewLabels[job.review_status]}</span>
              </div>

              {job.status === 'failed' ? <div className="mt-4 flex gap-2 rounded-lg border border-red-300/15 bg-red-300/[0.04] p-3 text-sm text-red-100/75"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {job.error_message || 'El análisis falló.'}</div> : <><p className="mt-4 text-sm leading-6 text-white/60">{job.result_json?.scene_summary}</p><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{detections.map((detection,index) => <div key={`${detection.species}-${index}`} className="rounded-lg bg-white/[0.04] px-3 py-2"><div className="flex justify-between gap-3 text-sm"><span className="text-white">{detection.species}</span><span className="text-[#9DD2F2]">{Math.round(detection.confidence * 100)}%</span></div>{detection.description && <p className="mt-1 text-xs text-white/40">{detection.description}</p>}</div>)}</div></>}

              {job.review_status === 'corrected' && (job.corrected_common_name || job.corrected_scientific_name) && <div className="mt-4 rounded-lg border border-amber-300/15 bg-amber-300/[0.05] p-3 text-sm text-amber-100/80">Corrección: {[job.corrected_common_name, job.corrected_scientific_name].filter(Boolean).join(' · ')}{job.review_notes && <p className="mt-1 text-xs text-amber-100/55">{job.review_notes}</p>}</div>}

              {editingJobId === job.id ? <div className="mt-4 grid gap-3 rounded-lg border border-amber-300/15 bg-amber-300/[0.04] p-4 md:grid-cols-2"><input value={draft.commonName} onChange={(e) => setDraft((current) => ({ ...current, commonName: e.target.value }))} placeholder="Nombre común corregido" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2 text-sm text-white" /><input value={draft.scientificName} onChange={(e) => setDraft((current) => ({ ...current, scientificName: e.target.value }))} placeholder="Nombre científico corregido" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2 text-sm text-white" /><textarea value={draft.notes} onChange={(e) => setDraft((current) => ({ ...current, notes: e.target.value }))} placeholder="Notas de revisión" className="min-h-20 rounded-lg border border-white/10 bg-[#081827] px-3 py-2 text-sm text-white md:col-span-2" /><div className="flex gap-2 md:col-span-2"><button onClick={() => void review(job.id, 'corrected', draft)} disabled={updating === job.id || (!draft.commonName.trim() && !draft.scientificName.trim())} className="rounded-lg bg-amber-300/15 px-3 py-2 text-xs text-amber-100 disabled:opacity-40">Guardar corrección</button><button onClick={() => setEditingJobId(null)} className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70">Cancelar</button></div></div> : job.status === 'completed' && <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void review(job.id, 'confirmed')} disabled={updating === job.id} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300/15 px-3 py-2 text-xs text-emerald-100"><Check className="h-3.5 w-3.5" /> Confirmar</button><button onClick={() => startCorrection(job)} className="rounded-lg bg-amber-300/15 px-3 py-2 text-xs text-amber-100">Corregir</button><button onClick={() => void review(job.id, 'unidentifiable')} className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70">No identificable</button><button onClick={() => void review(job.id, 'rejected')} className="inline-flex items-center gap-2 rounded-lg bg-red-300/15 px-3 py-2 text-xs text-red-100"><X className="h-3.5 w-3.5" /> Rechazar</button></div>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, CircleAlert, Download, RefreshCw, Search, X } from 'lucide-react'

type ReviewStatus = 'pending' | 'confirmed' | 'corrected' | 'rejected' | 'unidentifiable'
type JobStatus = 'queued' | 'processing' | 'completed' | 'failed'

type Detection = {
  species: string
  confidence: number
  description?: string
}

type Job = {
  id: string
  original_filename: string
  provider: string
  model_name: string
  status: JobStatus
  review_status: ReviewStatus
  corrected_common_name?: string | null
  corrected_scientific_name?: string | null
  review_notes?: string | null
  result_json?: {
    detections?: Detection[]
    scene_summary?: string
    limitations?: string[]
  } | null
  error_message?: string | null
  created_at: string
}

type CorrectionDraft = {
  commonName: string
  scientificName: string
  notes: string
}

type ExportRow = {
  job: Job
  detection: Detection | null
}

const reviewLabels: Record<ReviewStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  corrected: 'Corregido',
  rejected: 'Rechazado',
  unidentifiable: 'No identificable',
}

function csvCell(value: unknown) {
  const text = String(value ?? '').replace(/"/g, '""')
  return `"${text}"`
}

export function VisionJobHistory({ refreshKey = 0 }: { refreshKey?: number }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reviewFilter, setReviewFilter] = useState<ReviewStatus | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')
  const [speciesFilter, setSpeciesFilter] = useState('')
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
      const response = await fetch(`/api/vision/jobs?${params.toString()}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar el historial.')
      setJobs(payload.data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar el historial.')
    } finally {
      setLoading(false)
    }
  }, [reviewFilter, speciesFilter, statusFilter])

  useEffect(() => {
    void loadJobs()
  }, [loadJobs, refreshKey])

  const exportRows = useMemo<ExportRow[]>(() => jobs.flatMap<ExportRow>((job) => {
    const detections = job.result_json?.detections || []
    if (detections.length === 0) return [{ job, detection: null }]
    return detections.map((detection) => ({ job, detection }))
  }), [jobs])

  async function review(jobId: string, reviewStatus: Exclude<ReviewStatus, 'pending'>, correction?: CorrectionDraft) {
    setUpdating(jobId)
    setError(null)
    try {
      const response = await fetch('/api/vision/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          reviewStatus,
          correctedCommonName: correction?.commonName || null,
          correctedScientificName: correction?.scientificName || null,
          notes: correction?.notes || null,
        }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible registrar la revisión.')
      setEditingJobId(null)
      await loadJobs()
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'No fue posible registrar la revisión.')
    } finally {
      setUpdating(null)
    }
  }

  function startCorrection(job: Job) {
    setEditingJobId(job.id)
    setDraft({
      commonName: job.corrected_common_name || '',
      scientificName: job.corrected_scientific_name || '',
      notes: job.review_notes || '',
    })
  }

  function exportCsv() {
    const header = [
      'job_id', 'archivo', 'fecha', 'estado', 'revision', 'proveedor', 'modelo',
      'especie_predicha', 'confianza', 'nombre_comun_corregido', 'nombre_cientifico_corregido', 'notas',
    ]
    const lines = exportRows.map(({ job, detection }) => [
      job.id,
      job.original_filename,
      job.created_at,
      job.status,
      job.review_status,
      job.provider,
      job.model_name,
      detection?.species || '',
      detection?.confidence ?? '',
      job.corrected_common_name || '',
      job.corrected_scientific_name || '',
      job.review_notes || '',
    ].map(csvCell).join(','))
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
        <div>
          <h2 className="text-xl font-light text-white">Historial de análisis</h2>
          <p className="mt-1 text-sm text-white/50">Predicciones, correcciones taxonómicas y revisión humana.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportCsv} disabled={jobs.length === 0} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/[0.05] disabled:opacity-40">
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
          <button type="button" onClick={() => void loadJobs()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/[0.05] disabled:opacity-40">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-white/35" />
          <input value={speciesFilter} onChange={(event) => setSpeciesFilter(event.target.value)} placeholder="Buscar especie" className="w-full rounded-lg border border-white/10 bg-[#081827] py-3 pl-10 pr-3 text-sm text-white outline-none" />
        </label>
        <select value={reviewFilter} onChange={(event) => setReviewFilter(event.target.value as ReviewStatus | 'all')} className="rounded-lg border border-white/10 bg-[#081827] px-3 py-3 text-sm text-white">
          <option value="all">Todas las revisiones</option>
          {Object.entries(reviewLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as JobStatus | 'all')} className="rounded-lg border border-white/10 bg-[#081827] px-3 py-3 text-sm text-white">
          <option value="all">Todos los estados</option>
          <option value="completed">Completado</option>
          <option value="failed">Fallido</option>
          <option value="queued">En cola</option>
          <option value="processing">Procesando</option>
        </select>
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-300/20 bg-red-300/[0.05] p-3 text-sm text-red-100">{error}</p>}
      {!loading && jobs.length === 0 && <p className="mt-5 rounded-lg bg-black/20 p-4 text-sm text-white/50">No existen análisis para estos filtros.</p>}

      <div className="mt-5 space-y-4">
        {jobs.map((job) => {
          const detections = job.result_json?.detections || []
          return (
            <article key={job.id} className="rounded-xl border border-white/8 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{job.original_filename}</p>
                  <p className="mt-1 text-xs text-white/40">{new Date(job.created_at).toLocaleString('es-CL')} · {job.provider} · {job.model_name}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/65">{reviewLabels[job.review_status]}</span>
              </div>

              {job.status === 'failed' ? (
                <div className="mt-4 flex gap-2 rounded-lg border border-red-300/15 bg-red-300/[0.04] p-3 text-sm text-red-100/75">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {job.error_message || 'El análisis falló.'}
                </div>
              ) : (
                <>
                  {job.result_json?.scene_summary && <p className="mt-4 text-sm leading-6 text-white/60">{job.result_json.scene_summary}</p>}
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {detections.map((detection, index) => (
                      <div key={`${detection.species}-${index}`} className="rounded-lg bg-white/[0.04] px-3 py-2">
                        <div className="flex justify-between gap-3 text-sm"><span className="text-white">{detection.species}</span><span className="text-[#9DD2F2]">{Math.round(detection.confidence * 100)}%</span></div>
                        {detection.description && <p className="mt-1 text-xs text-white/40">{detection.description}</p>}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {job.review_status === 'corrected' && (job.corrected_common_name || job.corrected_scientific_name) && (
                <div className="mt-4 rounded-lg border border-amber-300/15 bg-amber-300/[0.05] p-3 text-sm text-amber-100/80">
                  Corrección: {[job.corrected_common_name, job.corrected_scientific_name].filter(Boolean).join(' · ')}
                  {job.review_notes && <p className="mt-1 text-xs text-amber-100/55">{job.review_notes}</p>}
                </div>
              )}

              {editingJobId === job.id ? (
                <div className="mt-4 grid gap-3 rounded-lg border border-amber-300/15 bg-amber-300/[0.04] p-4 md:grid-cols-2">
                  <input value={draft.commonName} onChange={(event) => setDraft((current) => ({ ...current, commonName: event.target.value }))} placeholder="Nombre común corregido" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2 text-sm text-white" />
                  <input value={draft.scientificName} onChange={(event) => setDraft((current) => ({ ...current, scientificName: event.target.value }))} placeholder="Nombre científico corregido" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2 text-sm text-white" />
                  <textarea value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Notas de revisión" className="min-h-20 rounded-lg border border-white/10 bg-[#081827] px-3 py-2 text-sm text-white md:col-span-2" />
                  <div className="flex gap-2 md:col-span-2">
                    <button onClick={() => void review(job.id, 'corrected', draft)} disabled={updating === job.id || (!draft.commonName.trim() && !draft.scientificName.trim())} className="rounded-lg bg-amber-300/15 px-3 py-2 text-xs text-amber-100 disabled:opacity-40">Guardar corrección</button>
                    <button onClick={() => setEditingJobId(null)} className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70">Cancelar</button>
                  </div>
                </div>
              ) : job.status === 'completed' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => void review(job.id, 'confirmed')} disabled={updating === job.id} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300/15 px-3 py-2 text-xs text-emerald-100 disabled:opacity-40"><Check className="h-3.5 w-3.5" /> Confirmar</button>
                  <button onClick={() => startCorrection(job)} disabled={updating === job.id} className="rounded-lg bg-amber-300/15 px-3 py-2 text-xs text-amber-100 disabled:opacity-40">Corregir</button>
                  <button onClick={() => void review(job.id, 'unidentifiable')} disabled={updating === job.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70 disabled:opacity-40">No identificable</button>
                  <button onClick={() => void review(job.id, 'rejected')} disabled={updating === job.id} className="inline-flex items-center gap-2 rounded-lg bg-red-300/15 px-3 py-2 text-xs text-red-100 disabled:opacity-40"><X className="h-3.5 w-3.5" /> Rechazar</button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

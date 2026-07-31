'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, CircleAlert, RefreshCw, X } from 'lucide-react'

type ReviewStatus = 'pending' | 'confirmed' | 'corrected' | 'rejected' | 'unidentifiable'

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
  status: 'queued' | 'processing' | 'completed' | 'failed'
  review_status: ReviewStatus
  result_json?: {
    detections?: Detection[]
    scene_summary?: string
    limitations?: string[]
  } | null
  error_message?: string | null
  created_at: string
}

const reviewLabels: Record<ReviewStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  corrected: 'Requiere corrección',
  rejected: 'Rechazado',
  unidentifiable: 'No identificable',
}

export function VisionJobHistory({ refreshKey = 0 }: { refreshKey?: number }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/vision/jobs?limit=50', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar el historial.')
      setJobs(payload.data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar el historial.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadJobs()
  }, [loadJobs, refreshKey])

  async function review(jobId: string, reviewStatus: Exclude<ReviewStatus, 'pending'>) {
    setUpdating(jobId)
    try {
      const response = await fetch('/api/vision/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, reviewStatus }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible registrar la revisión.')
      setJobs((current) => current.map((job) => job.id === jobId ? { ...job, review_status: reviewStatus } : job))
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'No fue posible registrar la revisión.')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-light text-white">Historial de análisis</h2>
          <p className="mt-1 text-sm text-white/50">Predicciones registradas y estado de revisión humana.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadJobs()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/[0.05] disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-300/20 bg-red-300/[0.05] p-3 text-sm text-red-100">{error}</p>}

      {!loading && jobs.length === 0 && (
        <p className="mt-5 rounded-lg bg-black/20 p-4 text-sm text-white/50">Todavía no existen análisis registrados.</p>
      )}

      <div className="mt-5 space-y-4">
        {jobs.map((job) => {
          const detections = job.result_json?.detections || []
          return (
            <article key={job.id} className="rounded-xl border border-white/8 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{job.original_filename}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {new Date(job.created_at).toLocaleString('es-CL')} · {job.provider} · {job.model_name}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/65">
                  {reviewLabels[job.review_status]}
                </span>
              </div>

              {job.status === 'failed' ? (
                <div className="mt-4 flex gap-2 rounded-lg border border-red-300/15 bg-red-300/[0.04] p-3 text-sm text-red-100/75">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  {job.error_message || 'El análisis falló.'}
                </div>
              ) : (
                <>
                  {job.result_json?.scene_summary && (
                    <p className="mt-4 text-sm leading-6 text-white/60">{job.result_json.scene_summary}</p>
                  )}
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {detections.map((detection, index) => (
                      <div key={`${detection.species}-${index}`} className="rounded-lg bg-white/[0.04] px-3 py-2">
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="text-white">{detection.species}</span>
                          <span className="text-[#9DD2F2]">{Math.round(detection.confidence * 100)}%</span>
                        </div>
                        {detection.description && <p className="mt-1 text-xs text-white/40">{detection.description}</p>}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {job.status === 'completed' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => void review(job.id, 'confirmed')} disabled={updating === job.id} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300/15 px-3 py-2 text-xs text-emerald-100 disabled:opacity-40">
                    <Check className="h-3.5 w-3.5" /> Confirmar
                  </button>
                  <button onClick={() => void review(job.id, 'corrected')} disabled={updating === job.id} className="rounded-lg bg-amber-300/15 px-3 py-2 text-xs text-amber-100 disabled:opacity-40">Corregir</button>
                  <button onClick={() => void review(job.id, 'unidentifiable')} disabled={updating === job.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70 disabled:opacity-40">No identificable</button>
                  <button onClick={() => void review(job.id, 'rejected')} disabled={updating === job.id} className="inline-flex items-center gap-2 rounded-lg bg-red-300/15 px-3 py-2 text-xs text-red-100 disabled:opacity-40">
                    <X className="h-3.5 w-3.5" /> Rechazar
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

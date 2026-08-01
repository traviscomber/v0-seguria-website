'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, CheckCircle2, Download, FileText, Loader2, RefreshCw, X } from 'lucide-react'

import { getConfidenceLevel, getSpeciesLocalization } from '@/lib/wildlife/species-localization'
import { VisionEvidenceViewer } from '../../vision-evidence-viewer'

type ReviewStatus = 'pending' | 'confirmed' | 'corrected' | 'rejected' | 'unidentifiable'
type Detection = {
  species: string
  confidence: number
  description?: string
  box?: { x1: number; y1: number; x2: number; y2: number }
}
type Job = {
  id: string
  original_filename: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  review_status: ReviewStatus
  result_json?: { detections?: Detection[]; scene_summary?: string; limitations?: string[] } | null
  error_code?: string | null
  error_message?: string | null
  estimated_cost_usd?: number | string | null
  latency_ms?: number | null
  created_at: string
}
type Batch = {
  id: string
  name: string
  description?: string | null
  zone_label?: string | null
  target_image_count: number
  status: 'draft' | 'processing' | 'completed' | 'cancelled'
  created_at: string
  completed_at?: string | null
  jobs: Job[]
  summary: {
    total: number
    completed: number
    failed: number
    processing: number
    pendingReview: number
    reviewed: number
    detections: number
    emptyFrames: number
    unidentifiable: number
    estimatedCostUsd: number
    averageLatencyMs: number | null
    species: Array<{ name: string; count: number }>
  }
}
type CorrectionDraft = { commonName: string; scientificName: string; notes: string }

const reviewLabels: Record<ReviewStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  corrected: 'Corregido',
  rejected: 'Rechazado',
  unidentifiable: 'No identificable',
}

function csvCell(value: unknown) { return `"${String(value ?? '').replace(/"/g, '""')}"` }

export function PilotBatchReview({ batchId }: { batchId: string }) {
  const [batch, setBatch] = useState<Batch | null>(null)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CorrectionDraft>({ commonName: '', scientificName: '', notes: '' })
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/vision/batches?id=${batchId}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success || !payload.data?.[0]) throw new Error(payload.error || 'Lote no encontrado.')
      setBatch(payload.data[0])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar el lote.')
    } finally {
      setLoading(false)
    }
  }, [batchId])

  useEffect(() => { void load() }, [load])

  const visibleJobs = useMemo(() => {
    if (!batch) return []
    return filter === 'pending'
      ? batch.jobs.filter((job) => job.status === 'completed' && job.review_status === 'pending')
      : batch.jobs
  }, [batch, filter])

  const criteria = batch ? {
    hasAnalyses: batch.summary.total > 0,
    noActiveProcessing: batch.summary.processing === 0,
    allCompletedReviewed: batch.summary.pendingReview === 0,
  } : null
  const canClose = Boolean(criteria?.hasAnalyses && criteria.noActiveProcessing && criteria.allCompletedReviewed && batch?.status !== 'completed')

  async function review(jobId: string, reviewStatus: Exclude<ReviewStatus, 'pending'>, correction?: CorrectionDraft) {
    setUpdating(jobId)
    setError(null)
    setMessage(null)
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
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible registrar la revision.')
      setEditingId(null)
      setMessage('Revision guardada.')
      await load()
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'No fue posible registrar la revision.')
    } finally {
      setUpdating(null)
    }
  }

  async function completeBatch() {
    setClosing(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/vision/batches/${batchId}/complete`, { method: 'POST' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cerrar el lote.')
      setMessage('Lote terminado. El informe queda disponible para exportacion.')
      await load()
    } catch (closeError) {
      setError(closeError instanceof Error ? closeError.message : 'No fue posible cerrar el lote.')
    } finally {
      setClosing(false)
    }
  }

  function exportCsv() {
    if (!batch) return
    const header = ['lote','archivo','estado','revision','especies','confianzas','error','latencia_ms','costo_estimado_usd','fecha_proceso']
    const rows = batch.jobs.map((job) => {
      const detections = job.result_json?.detections || []
      return [
        batch.name,
        job.original_filename,
        job.status,
        reviewLabels[job.review_status],
        detections.map((item) => getSpeciesLocalization(item.species).label).join(' | '),
        detections.map((item) => `${Math.round(item.confidence * 100)}%`).join(' | '),
        job.error_message || job.error_code || '',
        job.latency_ms || '',
        job.estimated_cost_usd || '',
        job.created_at,
      ].map(csvCell).join(',')
    })
    const blob = new Blob([[header.map(csvCell).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `seguria-lote-${batch.id}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="flex min-h-60 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#8fc8ea]" /></div>
  if (!batch) return <div className="rounded-xl border border-red-300/20 bg-red-300/[0.05] p-5 text-red-100">{error || 'Lote no encontrado.'}</div>

  return <div className="space-y-6">
    <section className="rounded-2xl border border-white/10 bg-[#0b1d2c] p-5 shadow-xl shadow-black/15 sm:p-6 print:border-black print:bg-white print:text-black">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-white/55 print:border-black print:text-black">{batch.status}</span>
            {batch.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-emerald-300" />}
          </div>
          <h2 className="mt-3 text-2xl font-medium text-white print:text-black">{batch.name}</h2>
          {batch.description && <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50 print:text-black">{batch.description}</p>}
          <p className="mt-2 text-xs text-white/35 print:text-black">{batch.zone_label || 'Zona no indicada'} · creado {new Date(batch.created_at).toLocaleString('es-CL')}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70"><RefreshCw className="h-3.5 w-3.5" />Actualizar</button>
          <button type="button" onClick={exportCsv} disabled={!batch.jobs.length} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 disabled:opacity-40"><Download className="h-3.5 w-3.5" />CSV</button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70"><FileText className="h-3.5 w-3.5" />Informe</button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Metric label="Analisis" value={`${batch.summary.total}/${batch.target_image_count}`} />
        <Metric label="Completados" value={String(batch.summary.completed)} />
        <Metric label="Revisados" value={String(batch.summary.reviewed)} />
        <Metric label="Pendientes" value={String(batch.summary.pendingReview)} />
        <Metric label="Fallidos" value={String(batch.summary.failed)} />
        <Metric label="Detecciones" value={String(batch.summary.detections)} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-xl bg-black/20 p-4 print:bg-white print:ring-1 print:ring-black/20">
          <h3 className="text-sm font-medium text-white print:text-black">Especies detectadas</h3>
          {!batch.summary.species.length ? <p className="mt-3 text-sm text-white/40 print:text-black">Sin detecciones.</p> : <div className="mt-3 grid gap-2 sm:grid-cols-2">{batch.summary.species.map((item) => <div key={item.name} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-sm print:bg-white"><span className="text-white/70 print:text-black">{getSpeciesLocalization(item.name).label}</span><span className="text-white print:text-black">{item.count}</span></div>)}</div>}
        </div>
        <div className="rounded-xl bg-black/20 p-4 print:bg-white print:ring-1 print:ring-black/20">
          <h3 className="text-sm font-medium text-white print:text-black">Criterios de cierre</h3>
          <div className="mt-3 space-y-2">
            <Criterion ok={Boolean(criteria?.hasAnalyses)} label="Existe al menos un analisis" />
            <Criterion ok={Boolean(criteria?.noActiveProcessing)} label="No hay procesamiento activo" />
            <Criterion ok={Boolean(criteria?.allCompletedReviewed)} label="Todos los completados fueron revisados" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/45 print:text-black"><span>Vacias: {batch.summary.emptyFrames}</span><span>No identificables: {batch.summary.unidentifiable}</span><span>Costo: USD {batch.summary.estimatedCostUsd.toFixed(3)}</span><span>Latencia: {batch.summary.averageLatencyMs === null ? '—' : `${batch.summary.averageLatencyMs} ms`}</span></div>
          {batch.status !== 'completed' && <button type="button" onClick={() => void completeBatch()} disabled={!canClose || closing} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 text-sm font-semibold text-emerald-950 disabled:cursor-not-allowed disabled:opacity-35 print:hidden">{closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Terminar lote</button>}
        </div>
      </div>
    </section>

    {error && <p className="rounded-xl border border-red-300/20 bg-red-300/[0.05] p-3 text-sm text-red-100 print:hidden">{error}</p>}
    {message && <p className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] p-3 text-sm text-emerald-100 print:hidden">{message}</p>}

    <section className="print:hidden">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-xl font-medium text-white">Revision de evidencia</h2><p className="mt-1 text-sm text-white/50">Confirma, corrige o descarta cada resultado.</p></div>
        <div className="flex rounded-lg border border-white/10 p-1 text-xs"><button type="button" onClick={() => setFilter('pending')} className={`rounded-md px-3 py-2 ${filter === 'pending' ? 'bg-[#58a9db] text-[#06131d]' : 'text-white/60'}`}>Pendientes ({batch.summary.pendingReview})</button><button type="button" onClick={() => setFilter('all')} className={`rounded-md px-3 py-2 ${filter === 'all' ? 'bg-[#58a9db] text-[#06131d]' : 'text-white/60'}`}>Todo ({batch.summary.total})</button></div>
      </div>

      {!visibleJobs.length && <div className="mt-4 rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">No hay elementos para este filtro.</div>}
      <div className="mt-4 space-y-4">
        {visibleJobs.map((job) => {
          const detections = job.result_json?.detections || []
          return <article key={job.id} className="rounded-2xl border border-white/10 bg-[#0b1d2c] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-medium text-white">{job.original_filename}</h3><p className="mt-1 text-xs text-white/35">{new Date(job.created_at).toLocaleString('es-CL')} · {job.status}</p></div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{reviewLabels[job.review_status]}</span>
            </div>

            {job.status === 'failed' ? <p className="mt-4 rounded-lg border border-red-300/15 bg-red-300/[0.04] p-3 text-sm text-red-100/75">{job.error_message || job.error_code || 'El analisis fallo.'}</p> : <>
              {job.result_json?.scene_summary && <p className="mt-4 text-sm leading-6 text-white/55">{job.result_json.scene_summary}</p>}
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{detections.map((detection, index) => { const species = getSpeciesLocalization(detection.species); return <div key={`${detection.species}-${index}`} className="rounded-lg bg-white/[0.04] p-3"><div className="flex justify-between gap-3"><div><p className="text-sm text-white">{species.label}</p>{species.scientificName && <p className="mt-0.5 text-xs italic text-white/35">{species.scientificName}</p>}</div><span className="text-sm text-[#9DD2F2]">{Math.round(detection.confidence * 100)}%<span className="block text-[10px] text-white/35">{getConfidenceLevel(detection.confidence)}</span></span></div>{detection.description && <p className="mt-2 text-xs leading-5 text-white/40">{detection.description}</p>}</div> })}</div>
            </>}

            {editingId === job.id ? <div className="mt-4 grid gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4 md:grid-cols-2"><input value={draft.commonName} onChange={(event) => setDraft((current) => ({ ...current, commonName: event.target.value }))} placeholder="Nombre comun corregido" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white" /><input value={draft.scientificName} onChange={(event) => setDraft((current) => ({ ...current, scientificName: event.target.value }))} placeholder="Nombre cientifico" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white" /><textarea value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Notas" className="min-h-20 rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white md:col-span-2" /><div className="flex gap-2 md:col-span-2"><button type="button" onClick={() => void review(job.id, 'corrected', draft)} disabled={updating === job.id || (!draft.commonName.trim() && !draft.scientificName.trim())} className="rounded-lg bg-amber-300/15 px-3 py-2 text-xs text-amber-100 disabled:opacity-40">Guardar correccion</button><button type="button" onClick={() => setEditingId(null)} className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70">Cancelar</button></div></div> : job.status === 'completed' && <div className="mt-4 flex flex-wrap gap-2"><VisionEvidenceViewer jobId={job.id} detections={detections} /><button type="button" onClick={() => void review(job.id, 'confirmed')} disabled={updating === job.id} className="inline-flex items-center gap-2 rounded-lg bg-emerald-300/15 px-3 py-2 text-xs text-emerald-100"><Check className="h-3.5 w-3.5" />Confirmar</button><button type="button" onClick={() => { setEditingId(job.id); setDraft({ commonName: '', scientificName: '', notes: '' }) }} className="rounded-lg bg-amber-300/15 px-3 py-2 text-xs text-amber-100">Corregir</button><button type="button" onClick={() => void review(job.id, 'unidentifiable')} disabled={updating === job.id} className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70">No identificable</button><button type="button" onClick={() => void review(job.id, 'rejected')} disabled={updating === job.id} className="inline-flex items-center gap-2 rounded-lg bg-red-300/10 px-3 py-2 text-xs text-red-100"><X className="h-3.5 w-3.5" />Rechazar</button></div>}
          </article>
        })}
      </div>
    </section>

    <div className="print:hidden"><Link href="/wildlife/vision/batches" className="text-sm text-[#9DD2F2] hover:text-white">Volver a todos los lotes</Link></div>
  </div>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-black/20 p-3 print:bg-white print:ring-1 print:ring-black/20"><p className="text-[11px] uppercase tracking-[0.1em] text-white/35 print:text-black">{label}</p><p className="mt-1 text-xl font-medium text-white print:text-black">{value}</p></div>
}

function Criterion({ ok, label }: { ok: boolean; label: string }) {
  return <div className="flex items-center gap-2 text-sm"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${ok ? 'bg-emerald-300/15 text-emerald-200' : 'bg-white/10 text-white/35'}`}>{ok ? <Check className="h-3.5 w-3.5" /> : '·'}</span><span className={ok ? 'text-white/75 print:text-black' : 'text-white/40 print:text-black'}>{label}</span></div>
}

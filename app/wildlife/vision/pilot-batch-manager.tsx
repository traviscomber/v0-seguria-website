'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, Download, Loader2, Plus, RefreshCw, RotateCcw, Upload } from 'lucide-react'

import { getSpeciesLocalization } from '@/lib/wildlife/species-localization'

type CameraRow = { id: string; code: string; name: string; zone_label: string | null; active: boolean }
type Detection = { species?: string; confidence?: number }
type Job = {
  id: string
  original_filename: string
  status: string
  review_status: string
  result_json?: { detections?: Detection[] } | null
  error_code?: string | null
  error_message?: string | null
  estimated_cost_usd?: number | string | null
  latency_ms?: number | null
  created_at: string
}
type Summary = {
  total: number; completed: number; failed: number; processing: number; pendingReview: number
  detections: number; emptyFrames: number; unidentifiable: number; estimatedCostUsd: number
  averageLatencyMs: number | null; species: Array<{ name: string; count: number }>
}
type Batch = {
  id: string; name: string; description?: string | null; zone_label?: string | null
  target_image_count: number; status: 'draft' | 'processing' | 'completed' | 'cancelled'
  camera_id?: string | null; created_at: string; jobs: Job[]; summary: Summary
  wildlife_cameras?: { code?: string | null; name?: string | null; zone_label?: string | null } | Array<{ code?: string | null; name?: string | null; zone_label?: string | null }> | null
}
type LogRow = { filename: string; state: 'processing' | 'completed' | 'failed'; message: string }

const MAX_GROUP = 20

function batchCamera(batch: Batch | null) {
  if (!batch?.wildlife_cameras) return null
  return Array.isArray(batch.wildlife_cameras) ? batch.wildlife_cameras[0] || null : batch.wildlife_cameras
}

function csvCell(value: unknown) { return `"${String(value ?? '').replace(/"/g, '""')}"` }
function statusLabel(status: Batch['status']) {
  return status === 'draft' ? 'Borrador' : status === 'processing' ? 'En proceso' : status === 'completed' ? 'Terminado' : 'Cancelado'
}

export function PilotBatchManager() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [cameras, setCameras] = useState<CameraRow[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [busy, setBusy] = useState(false)
  const [retrying, setRetrying] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [log, setLog] = useState<LogRow[]>([])

  const load = useCallback(async (preferredId?: string) => {
    setError(null)
    try {
      const [batchResponse, cameraResponse] = await Promise.all([
        fetch('/api/vision/batches', { cache: 'no-store' }),
        fetch('/api/vision/cameras', { cache: 'no-store' }),
      ])
      const batchPayload = await batchResponse.json()
      const cameraPayload = await cameraResponse.json()
      if (!batchResponse.ok || !batchPayload.success) throw new Error(batchPayload.error || 'No fue posible cargar los lotes.')
      if (!cameraResponse.ok || !cameraPayload.success) throw new Error(cameraPayload.error || 'No fue posible cargar las cámaras.')
      const nextBatches = (batchPayload.data || []) as Batch[]
      setBatches(nextBatches)
      setCameras(((cameraPayload.data || []) as CameraRow[]).filter((camera) => camera.active))
      const nextId = preferredId || (nextBatches.some((batch) => batch.id === selectedId) ? selectedId : nextBatches[0]?.id || '')
      setSelectedId(nextId)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar los lotes.')
    }
  }, [selectedId])

  useEffect(() => { void load() }, [])

  const selected = useMemo(() => batches.find((batch) => batch.id === selectedId) || null, [batches, selectedId])
  const camera = batchCamera(selected)
  const remaining = selected ? Math.max(0, selected.target_image_count - selected.summary.total) : 0
  const failedJobs = selected?.jobs.filter((job) => job.status === 'failed') || []

  async function createBatch(formData: FormData) {
    setBusy(true); setError(null); setMessage(null)
    try {
      const cameraId = String(formData.get('cameraId') || '').trim()
      const response = await fetch('/api/vision/batches', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(formData.get('name') || '').trim(),
          description: String(formData.get('description') || '').trim() || null,
          zoneLabel: String(formData.get('zoneLabel') || '').trim() || null,
          targetImageCount: Number(formData.get('targetImageCount')) || 100,
          cameraId: cameraId || null,
        }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible crear el lote.')
      setMessage('Lote creado. Ya puedes procesar el primer grupo.')
      await load(payload.data.id)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'No fue posible crear el lote.')
    } finally { setBusy(false) }
  }

  async function attach(batchId: string, jobId: string) {
    const response = await fetch('/api/vision/batches', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'attach_job', batchId, jobId }),
    })
    const payload = await response.json()
    if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible guardar el análisis en el lote.')
  }

  async function processGroup(formData: FormData) {
    if (!selected) return
    const files = formData.getAll('images').filter((item): item is File => item instanceof File && item.size > 0)
    const selectedFiles = files.slice(0, Math.min(MAX_GROUP, remaining))
    if (!selectedFiles.length) return

    setBusy(true); setError(null); setMessage(null)
    setLog(selectedFiles.map((file) => ({ filename: file.name, state: 'processing', message: 'En cola' })))
    const capturedAt = String(formData.get('capturedAt') || '').trim()

    for (const file of selectedFiles) {
      setLog((current) => current.map((row) => row.filename === file.name ? { ...row, message: 'Analizando' } : row))
      try {
        const headers: Record<string, string> = {
          'X-Image-Content-Type': file.type,
          'X-Image-Filename': encodeURIComponent(file.name),
        }
        if (camera?.code) headers['X-Camera-Code'] = encodeURIComponent(camera.code)
        if (camera?.name) headers['X-Camera-Name'] = encodeURIComponent(camera.name)
        if (selected.zone_label || camera?.zone_label) headers['X-Zone-Label'] = encodeURIComponent(selected.zone_label || camera?.zone_label || '')
        if (capturedAt) headers['X-Captured-At'] = new Date(capturedAt).toISOString()

        const response = await fetch('/api/vision/openai/infer-with-metadata', { method: 'POST', headers, body: await file.arrayBuffer() })
        const payload = await response.json() as { job_id?: string | null; error?: string; message?: string }
        if (payload.job_id) await attach(selected.id, payload.job_id)
        if (!response.ok || !payload.job_id) throw new Error(payload.message || payload.error || 'El análisis falló.')
        setLog((current) => current.map((row) => row.filename === file.name ? { ...row, state: 'completed', message: 'Guardada' } : row))
      } catch (processError) {
        setLog((current) => current.map((row) => row.filename === file.name ? { ...row, state: 'failed', message: processError instanceof Error ? processError.message : 'Error' } : row))
      }
    }

    setMessage('Grupo procesado. El progreso quedó guardado.')
    await load(selected.id)
    window.dispatchEvent(new Event('wildlife-job-created'))
    setBusy(false)
  }

  async function retry(job: Job) {
    if (!selected) return
    setRetrying(job.id); setError(null); setMessage(null)
    try {
      const response = await fetch(`/api/vision/batches/${selected.id}/retry`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId: job.id }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible reintentar.')
      setMessage(`Reintento completado: ${job.original_filename}`)
      await load(selected.id)
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : 'No fue posible reintentar.')
    } finally { setRetrying(null) }
  }

  async function closeBatch() {
    if (!selected) return
    setBusy(true); setError(null); setMessage(null)
    try {
      const response = await fetch('/api/vision/batches', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_status', batchId: selected.id, status: 'completed' }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible terminar el lote.')
      setMessage('Lote terminado y disponible para revisión y exportación.')
      await load(selected.id)
    } catch (closeError) {
      setError(closeError instanceof Error ? closeError.message : 'No fue posible terminar el lote.')
    } finally { setBusy(false) }
  }

  function exportCsv() {
    if (!selected) return
    const header = ['lote','archivo','estado','revision','especies','confianzas','error','latencia_ms','costo_estimado_usd','fecha']
    const rows = selected.jobs.map((job) => {
      const detections = job.result_json?.detections || []
      return [selected.name, job.original_filename, job.status, job.review_status,
        detections.map((detection) => detection.species || '').filter(Boolean).join(' | '),
        detections.map((detection) => typeof detection.confidence === 'number' ? `${Math.round(detection.confidence * 100)}%` : '').filter(Boolean).join(' | '),
        job.error_message || job.error_code || '', job.latency_ms || '', job.estimated_cost_usd || '', job.created_at,
      ].map(csvCell).join(',')
    })
    const blob = new Blob([[header.map(csvCell).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `seguria-lote-${selected.id}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return <section className="rounded-2xl border border-white/10 bg-[#0b1d2c] p-5 shadow-2xl shadow-black/15 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">Lotes piloto v1</p><h2 className="mt-2 text-2xl font-medium text-white">Procesamiento organizado y reanudable</h2><p className="mt-1 text-sm text-white/50">Hasta 100 imágenes por lote, en grupos de 20.</p></div>
      <button type="button" onClick={() => void load(selectedId)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70"><RefreshCw className="h-4 w-4" />Actualizar</button>
    </div>

    {error && <p className="mt-4 rounded-xl border border-red-300/20 bg-red-300/[0.05] p-3 text-sm text-red-100">{error}</p>}
    {message && <p className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] p-3 text-sm text-emerald-100">{message}</p>}

    <div className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <form action={(formData) => void createBatch(formData)} className="grid gap-3 rounded-xl bg-black/20 p-4">
          <h3 className="text-sm font-medium text-white">Crear lote</h3>
          <input name="name" required maxLength={160} placeholder="Piloto Huilo Huilo — lote 1" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white" />
          <textarea name="description" maxLength={1000} placeholder="Objetivo del lote" className="min-h-16 rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white" />
          <select name="cameraId" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white"><option value="">Sin cámara fija</option>{cameras.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select>
          <input name="zoneLabel" maxLength={160} placeholder="Zona" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white" />
          <input name="targetImageCount" type="number" min={1} max={100} defaultValue={100} className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white" />
          <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#58a9db] px-4 py-2.5 text-sm font-semibold text-[#06131d] disabled:opacity-40"><Plus className="h-4 w-4" />Crear</button>
        </form>
        <div className="rounded-xl bg-black/20 p-4"><label className="text-sm text-white/55">Lote activo</label><select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white"><option value="">Seleccionar</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name} · {statusLabel(batch.status)}</option>)}</select></div>
      </div>

      {!selected ? <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">Crea o selecciona un lote.</div> : <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-medium text-white">{selected.name}</h3><p className="mt-1 text-xs text-white/40">{statusLabel(selected.status)} · {selected.summary.total}/{selected.target_image_count} imágenes · {remaining} disponibles</p></div><div className="flex gap-2"><button type="button" onClick={exportCsv} disabled={!selected.summary.total} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 disabled:opacity-40"><Download className="h-3.5 w-3.5" />CSV</button>{!['completed','cancelled'].includes(selected.status) && <button type="button" onClick={() => void closeBatch()} disabled={busy || selected.summary.processing > 0} className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/20 px-3 py-2 text-xs text-emerald-100 disabled:opacity-40"><Archive className="h-3.5 w-3.5" />Terminar</button>}</div></div>

        <div className="grid gap-3 sm:grid-cols-4"><Metric label="Completadas" value={selected.summary.completed} /><Metric label="Fallidas" value={selected.summary.failed} /><Metric label="Por revisar" value={selected.summary.pendingReview} /><Metric label="Detecciones" value={selected.summary.detections} /></div>

        {!['completed','cancelled'].includes(selected.status) && remaining > 0 && <form action={(formData) => void processGroup(formData)} className="grid gap-3 rounded-xl bg-black/20 p-4 md:grid-cols-[1fr_220px_auto]"><label className="flex min-h-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/15 text-center text-sm text-white/60"><input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required disabled={busy} className="sr-only" />Seleccionar hasta {Math.min(MAX_GROUP, remaining)} imágenes</label><input name="capturedAt" type="datetime-local" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white" /><button disabled={busy} className="inline-flex min-h-20 items-center justify-center gap-2 rounded-lg bg-[#58a9db] px-5 text-sm font-semibold text-[#06131d] disabled:opacity-40">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Procesar</button></form>}

        {log.length > 0 && <div className="space-y-2 rounded-xl bg-black/20 p-4">{log.map((row) => <div key={row.filename} className="flex justify-between gap-3 text-xs"><span className="truncate text-white/60">{row.filename}</span><span className={row.state === 'completed' ? 'text-emerald-200' : row.state === 'failed' ? 'text-red-200' : 'text-[#9bd3f3]'}>{row.message}</span></div>)}</div>}

        <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl bg-black/20 p-4"><h4 className="text-sm font-medium text-white">Especies</h4><div className="mt-3 space-y-2">{selected.summary.species.length === 0 ? <p className="text-xs text-white/40">Sin detecciones todavía.</p> : selected.summary.species.slice(0,8).map((item) => <div key={item.name} className="flex justify-between text-xs"><span className="text-white/55">{getSpeciesLocalization(item.name).label}</span><span className="text-white">{item.count}</span></div>)}</div><p className="mt-4 text-xs text-white/35">Vacías: {selected.summary.emptyFrames} · No identificables: {selected.summary.unidentifiable} · Costo estimado: USD {selected.summary.estimatedCostUsd.toFixed(2)}</p></div><div className="rounded-xl bg-black/20 p-4"><h4 className="text-sm font-medium text-white">Reintentos</h4>{failedJobs.length === 0 ? <p className="mt-3 text-xs text-emerald-100/65">No hay fallos recuperables.</p> : <div className="mt-3 space-y-2">{failedJobs.map((job) => <div key={job.id} className="rounded-lg bg-white/[0.03] p-3"><p className="truncate text-xs text-white/60">{job.original_filename}</p><button type="button" onClick={() => void retry(job)} disabled={retrying === job.id || selected.status === 'completed'} className="mt-2 inline-flex items-center gap-2 rounded-lg border border-amber-300/20 px-3 py-2 text-xs text-amber-100 disabled:opacity-40">{retrying === job.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}Reintentar</button></div>)}</div>}</div></div>
      </div>}
    </div>
  </section>
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl bg-black/20 p-4"><p className="text-xs text-white/40">{label}</p><p className="mt-2 text-xl text-white">{value}</p></div>
}

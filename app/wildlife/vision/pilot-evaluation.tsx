'use client'

import { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, Download, Loader2, Plus, RefreshCw } from 'lucide-react'

type EvaluationItem = {
  id: string
  job_id: string
  observed_outcome?: string | null
  image_quality?: string | null
  expected_common_name?: string | null
  expected_scientific_name?: string | null
  reviewer_notes?: string | null
  reviewed_at?: string | null
}

type EvaluationSet = {
  id: string
  name: string
  description?: string | null
  status: string
  target_image_count?: number | null
  wildlife_evaluation_items?: EvaluationItem[] | null
}

type Job = {
  id: string
  original_filename: string
  review_status: string
  corrected_common_name?: string | null
  corrected_scientific_name?: string | null
  result_json?: { detections?: Array<{ species: string; confidence: number }> } | null
  zone_label?: string | null
  captured_at?: string | null
  created_at?: string | null
  wildlife_cameras?: { code?: string | null; name?: string | null } | Array<{ code?: string | null; name?: string | null }> | null
}

const outcomes = [
  ['true_positive', 'Verdadero positivo'],
  ['false_positive', 'Falso positivo'],
  ['false_negative', 'Falso negativo'],
  ['true_negative', 'Verdadero negativo'],
  ['unidentifiable', 'No identificable'],
] as const

const qualities = [
  ['good', 'Buena'], ['blurred', 'Borrosa'], ['dark', 'Oscura'], ['infrared', 'Infrarroja'],
  ['rain', 'Lluvia'], ['snow', 'Nieve'], ['occluded', 'Ocluida'], ['empty', 'Vacía'], ['other', 'Otra'],
] as const

const outcomeLabels = Object.fromEntries(outcomes) as Record<string, string>
const qualityLabels = Object.fromEntries(qualities) as Record<string, string>

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function cameraFor(job?: Job | null) {
  if (!job?.wildlife_cameras) return null
  return Array.isArray(job.wildlife_cameras) ? job.wildlife_cameras[0] || null : job.wildlife_cameras
}

export function PilotEvaluation() {
  const [sets, setSets] = useState<EvaluationSet[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedSetId, setSelectedSetId] = useState('')
  const [selectedJobId, setSelectedJobId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/vision/evaluations', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar el piloto.')
      setSets(payload.data.sets)
      setJobs(payload.data.jobs)
      if (!selectedSetId && payload.data.sets[0]) setSelectedSetId(payload.data.sets[0].id)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar el piloto.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadData() }, [])

  const selectedSet = sets.find((item) => item.id === selectedSetId) || null
  const items = selectedSet?.wildlife_evaluation_items || []
  const jobsById = useMemo(() => new Map(jobs.map((job) => [job.id, job])), [jobs])
  const evaluatedIds = useMemo(() => new Set(items.map((item) => item.job_id)), [items])
  const pendingJobs = jobs.filter((job) => !evaluatedIds.has(job.id))
  const selectedJob = jobs.find((job) => job.id === selectedJobId) || null
  const evaluatedCount = items.length
  const target = selectedSet?.target_image_count || 0
  const progress = target ? Math.min(100, Math.round((evaluatedCount / target) * 100)) : 0

  const metrics = useMemo(() => {
    const count = (key: string) => items.filter((item) => item.observed_outcome === key).length
    const truePositive = count('true_positive')
    const falsePositive = count('false_positive')
    const falseNegative = count('false_negative')
    const trueNegative = count('true_negative')
    const unidentifiable = count('unidentifiable')
    const precisionDenominator = truePositive + falsePositive
    const recallDenominator = truePositive + falseNegative
    const accuracyDenominator = truePositive + trueNegative + falsePositive + falseNegative
    const qualityProblems = items.filter((item) => item.image_quality && item.image_quality !== 'good').length
    return {
      truePositive, falsePositive, falseNegative, trueNegative, unidentifiable, qualityProblems,
      precision: precisionDenominator ? truePositive / precisionDenominator : null,
      recall: recallDenominator ? truePositive / recallDenominator : null,
      accuracy: accuracyDenominator ? (truePositive + trueNegative) / accuracyDenominator : null,
    }
  }, [items])

  async function createSet(formData: FormData) {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/vision/evaluations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(formData.get('name') || '').trim(),
          description: String(formData.get('description') || '').trim() || null,
          targetImageCount: Number(formData.get('targetImageCount')) || null,
        }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible crear el conjunto.')
      setSelectedSetId(payload.data.id)
      setMessage('Conjunto de evaluación creado.')
      await loadData()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No fue posible crear el conjunto.')
    } finally { setSaving(false) }
  }

  async function saveEvaluation(formData: FormData) {
    if (!selectedSetId || !selectedJobId) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/vision/evaluations', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationSetId: selectedSetId,
          jobId: selectedJobId,
          expectedCommonName: String(formData.get('expectedCommonName') || '').trim() || null,
          expectedScientificName: String(formData.get('expectedScientificName') || '').trim() || null,
          observedOutcome: formData.get('observedOutcome'),
          imageQuality: formData.get('imageQuality'),
          reviewerNotes: String(formData.get('reviewerNotes') || '').trim() || null,
        }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible guardar la evaluación.')
      setSelectedJobId('')
      setMessage('Resultado incorporado al conjunto de evaluación.')
      await loadData()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No fue posible guardar la evaluación.')
    } finally { setSaving(false) }
  }

  function exportCsv() {
    if (!selectedSet || !items.length) return
    const header = ['conjunto','job_id','archivo','camara_codigo','camara_nombre','zona','fecha_captura','predicciones','resultado_observado','calidad_imagen','especie_esperada','nombre_cientifico_esperado','notas','fecha_revision']
    const rows = items.map((item) => {
      const job = jobsById.get(item.job_id)
      const camera = cameraFor(job)
      const predictions = (job?.result_json?.detections || []).map((detection) => `${detection.species}:${Math.round(detection.confidence * 100)}%`).join(' | ')
      return [selectedSet.name, item.job_id, job?.original_filename || '', camera?.code || '', camera?.name || '', job?.zone_label || '', job?.captured_at || '', predictions, outcomeLabels[item.observed_outcome || ''] || '', qualityLabels[item.image_quality || ''] || '', item.expected_common_name || '', item.expected_scientific_name || '', item.reviewer_notes || '', item.reviewed_at || ''].map(csvCell).join(',')
    })
    const blob = new Blob([[header.map(csvCell).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `seguria-piloto-${selectedSet.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'evaluacion'}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const percent = (value: number | null) => value === null ? '—' : `${Math.round(value * 100)}%`

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-5 w-5 text-[#9DD2F2]" />
          <div><h2 className="text-xl font-light text-white">Piloto y evaluación local</h2><p className="text-sm text-white/50">Construye el dataset validado y mide errores observados.</p></div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportCsv} disabled={!items.length} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 disabled:opacity-40"><Download className="h-4 w-4" /> Exportar informe</button>
          <button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 disabled:opacity-40"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar</button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-300/20 bg-red-300/[0.05] p-3 text-sm text-red-100">{error}</p>}
      {message && <p className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.05] p-3 text-sm text-emerald-100">{message}</p>}

      {selectedSet && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Metric label="Evaluadas" value={String(evaluatedCount)} />
          <Metric label="Precisión observada" value={percent(metrics.precision)} />
          <Metric label="Recall observado" value={percent(metrics.recall)} />
          <Metric label="Exactitud observada" value={percent(metrics.accuracy)} />
          <Metric label="No identificables" value={String(metrics.unidentifiable)} />
          <Metric label="Problemas de calidad" value={String(metrics.qualityProblems)} />
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <form action={(formData) => void createSet(formData)} className="rounded-xl bg-black/20 p-4">
            <h3 className="text-sm font-medium text-white">Nuevo conjunto</h3>
            <div className="mt-3 grid gap-3">
              <input name="name" required maxLength={160} placeholder="Piloto Huilo Huilo — lote 1" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white" />
              <textarea name="description" maxLength={1000} placeholder="Objetivo, zona agregada y criterios" className="min-h-20 rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white" />
              <input name="targetImageCount" type="number" min={1} max={100000} placeholder="Meta de imágenes" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white" />
              <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4DA3D9] px-4 py-2.5 text-sm font-medium text-[#07131f] disabled:opacity-40"><Plus className="h-4 w-4" /> Crear conjunto</button>
            </div>
          </form>

          <div className="rounded-xl bg-black/20 p-4">
            <label className="text-sm text-white/60">Conjunto activo</label>
            <select value={selectedSetId} onChange={(event) => setSelectedSetId(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white"><option value="">Seleccionar</option>{sets.map((set) => <option key={set.id} value={set.id}>{set.name}</option>)}</select>
            {selectedSet && <div className="mt-4"><div className="flex justify-between text-xs text-white/50"><span>{evaluatedCount} evaluadas</span><span>{target ? `${target} objetivo` : 'Sin meta'}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#4DA3D9]" style={{ width: `${target ? progress : evaluatedCount ? 100 : 0}%` }} /></div></div>}
          </div>
        </div>

        <form action={(formData) => void saveEvaluation(formData)} className="rounded-xl bg-black/20 p-4">
          <h3 className="text-sm font-medium text-white">Clasificar trabajo</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-white/60 md:col-span-2"><span>Trabajo pendiente</span><select value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)} required className="w-full rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-white"><option value="">Seleccionar imagen</option>{pendingJobs.map((job) => <option key={job.id} value={job.id}>{job.original_filename}</option>)}</select></label>
            <label className="space-y-1 text-sm text-white/60"><span>Resultado observado</span><select name="observedOutcome" required className="w-full rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-white">{outcomes.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="space-y-1 text-sm text-white/60"><span>Calidad de imagen</span><select name="imageQuality" required className="w-full rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-white">{qualities.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <input name="expectedCommonName" placeholder="Especie esperada — nombre común" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white" />
            <input name="expectedScientificName" placeholder="Nombre científico" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white" />
            <textarea name="reviewerNotes" placeholder="Confusión observada, condición ambiental o comentario" className="min-h-24 rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white md:col-span-2" />
          </div>
          {selectedJob && <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/55"><p>{selectedJob.original_filename}</p><p className="mt-1">Predicción: {(selectedJob.result_json?.detections || []).map((item) => `${item.species} ${Math.round(item.confidence * 100)}%`).join(', ') || 'Sin detecciones'}</p><p className="mt-1">Revisión: {selectedJob.review_status}{selectedJob.corrected_common_name ? ` · ${selectedJob.corrected_common_name}` : ''}</p></div>}
          <button disabled={saving || !selectedSetId || !selectedJobId} className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#4DA3D9] px-5 py-2.5 text-sm font-medium text-[#07131f] disabled:opacity-40">{saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar evaluación</button>
        </form>
      </div>

      {items.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-white/50"><tr><th className="px-3 py-3 font-normal">Archivo</th><th className="px-3 py-3 font-normal">Resultado</th><th className="px-3 py-3 font-normal">Calidad</th><th className="px-3 py-3 font-normal">Especie esperada</th></tr></thead>
            <tbody>{items.map((item) => { const job = jobsById.get(item.job_id); return <tr key={item.id} className="border-t border-white/8"><td className="px-3 py-3 text-white/75">{job?.original_filename || item.job_id}</td><td className="px-3 py-3 text-white/60">{outcomeLabels[item.observed_outcome || ''] || '—'}</td><td className="px-3 py-3 text-white/60">{qualityLabels[item.image_quality || ''] || '—'}</td><td className="px-3 py-3 text-white/60">{item.expected_common_name || item.expected_scientific_name || '—'}</td></tr> })}</tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs text-white/45">{label}</p><p className="mt-1 text-xl font-light text-white">{value}</p></div>
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, Loader2, Plus, RefreshCw } from 'lucide-react'

type EvaluationItem = {
  id: string
  job_id: string
  observed_outcome?: string | null
  image_quality?: string | null
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
  const evaluatedIds = useMemo(() => new Set((selectedSet?.wildlife_evaluation_items || []).map((item) => item.job_id)), [selectedSet])
  const pendingJobs = jobs.filter((job) => !evaluatedIds.has(job.id))
  const selectedJob = jobs.find((job) => job.id === selectedJobId) || null
  const evaluatedCount = selectedSet?.wildlife_evaluation_items?.length || 0
  const target = selectedSet?.target_image_count || 0
  const progress = target ? Math.min(100, Math.round((evaluatedCount / target) * 100)) : 0

  async function createSet(formData: FormData) {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/vision/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    } finally {
      setSaving(false)
    }
  }

  async function saveEvaluation(formData: FormData) {
    if (!selectedSetId || !selectedJobId) return
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/vision/evaluations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-5 w-5 text-[#9DD2F2]" />
          <div>
            <h2 className="text-xl font-light text-white">Piloto y evaluación local</h2>
            <p className="text-sm text-white/50">Construye el dataset validado y mide errores observados.</p>
          </div>
        </div>
        <button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-300/20 bg-red-300/[0.05] p-3 text-sm text-red-100">{error}</p>}
      {message && <p className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.05] p-3 text-sm text-emerald-100">{message}</p>}

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
            <select value={selectedSetId} onChange={(event) => setSelectedSetId(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#081827] px-3 py-2.5 text-sm text-white">
              <option value="">Seleccionar</option>
              {sets.map((set) => <option key={set.id} value={set.id}>{set.name}</option>)}
            </select>
            {selectedSet && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-white/50"><span>{evaluatedCount} evaluadas</span><span>{target ? `${target} objetivo` : 'Sin meta'}</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#4DA3D9]" style={{ width: `${target ? progress : evaluatedCount ? 100 : 0}%` }} /></div>
              </div>
            )}
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

          {selectedJob && (
            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/55">
              <p>{selectedJob.original_filename}</p>
              <p className="mt-1">Predicción: {(selectedJob.result_json?.detections || []).map((item) => `${item.species} ${Math.round(item.confidence * 100)}%`).join(', ') || 'Sin detecciones'}</p>
              <p className="mt-1">Revisión: {selectedJob.review_status}{selectedJob.corrected_common_name ? ` · ${selectedJob.corrected_common_name}` : ''}</p>
            </div>
          )}

          <button disabled={saving || !selectedSetId || !selectedJobId} className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#4DA3D9] px-5 py-2.5 text-sm font-medium text-[#07131f] disabled:opacity-40">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar evaluación
          </button>
        </form>
      </div>
    </section>
  )
}

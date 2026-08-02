'use client'

import { useEffect, useState } from 'react'
import { Database, Eye, EyeOff, Loader2, RefreshCw, ShieldCheck } from 'lucide-react'

type DemoState = {
  available: boolean
  enabled: boolean
  canManage: boolean
  operationName?: string | null
  version?: string
  counts?: {
    cameras: number
    jobs: number
    batches: number
    alerts: number
    evaluationSets: number
  }
}

export function DemoDataControl() {
  const [state, setState] = useState<DemoState | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/vision/demo', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar el modo demo.')
      setState(payload.data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar el modo demo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function toggle() {
    if (!state?.canManage) return
    setUpdating(true)
    setError(null)
    try {
      const response = await fetch('/api/vision/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !state.enabled }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible actualizar el modo demo.')
      setState(payload.data)
      window.location.reload()
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'No fue posible actualizar el modo demo.')
      setUpdating(false)
    }
  }

  if (loading) {
    return <section className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1d2c] px-5 py-4 text-sm text-white/55"><Loader2 className="h-4 w-4 animate-spin text-[#8fc8ea]" /> Verificando datos demostrativos...</section>
  }

  if (!state?.available) return null

  const counts = state.counts || { cameras: 0, jobs: 0, batches: 0, alerts: 0, evaluationSets: 0 }

  return (
    <section className={`rounded-2xl border p-5 shadow-xl shadow-black/10 sm:p-6 ${state.enabled ? 'border-amber-300/25 bg-amber-300/[0.055]' : 'border-white/10 bg-[#0b1d2c]'}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${state.enabled ? 'border-amber-200/25 bg-amber-200/10 text-amber-100' : 'border-white/10 bg-white/[0.04] text-white/55'}`}>
              <Database className="h-3.5 w-3.5" />
              Modo demo {state.enabled ? 'visible' : 'oculto'}
            </span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/30">{state.operationName || 'Huilo Huilo'}</span>
          </div>
          <h2 className="mt-3 text-xl font-medium text-white">Datos demostrativos reversibles</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
            {state.enabled
              ? 'Las secciones muestran una muestra simulada de camaras, detecciones, lotes, alertas y evaluacion. Ningun registro corresponde a evidencia real.'
              : 'Los datos simulados estan ocultos. Las secciones muestran exclusivamente informacion real de la operacion.'}
          </p>
          {state.enabled && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/55">
              <Count label="Camaras" value={counts.cameras} />
              <Count label="Analisis" value={counts.jobs} />
              <Count label="Lotes" value={counts.batches} />
              <Count label="Alertas" value={counts.alerts} />
              <Count label="Evaluaciones" value={counts.evaluationSets} />
            </div>
          )}
        </div>

        <div className="shrink-0">
          {state.canManage ? (
            <button
              type="button"
              onClick={() => void toggle()}
              disabled={updating}
              className={`inline-flex min-w-48 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${state.enabled ? 'border border-amber-200/25 bg-amber-200/10 text-amber-50 hover:bg-amber-200/15' : 'bg-[#68b4e3] text-[#06131d] hover:bg-[#80c4eb]'}`}
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : state.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {state.enabled ? 'Ocultar datos demo' : 'Mostrar datos demo'}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/45"><ShieldCheck className="h-4 w-4" /> Solo lectura</div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-300/20 bg-red-300/[0.05] px-4 py-3 text-sm text-red-100/85">
          <span>{error}</span>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 text-xs text-red-50"><RefreshCw className="h-3.5 w-3.5" /> Reintentar</button>
        </div>
      )}
    </section>
  )
}

function Count({ label, value }: { label: string; value: number }) {
  return <span className="rounded-lg border border-white/10 bg-black/15 px-3 py-2"><strong className="font-medium text-white">{value}</strong> {label}</span>
}

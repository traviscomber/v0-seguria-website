'use client'

import { useCallback, useEffect, useState } from 'react'
import { Activity, AlertTriangle, BarChart3, DollarSign, RefreshCw } from 'lucide-react'

type Metrics = {
  period_days: number
  totals: {
    analyses: number
    completed: number
    failed: number
    detections: number
    reviewed: number
    pending_review: number
  }
  rates: {
    completion: number
    failure: number
    review: number
  }
  species: Array<{
    name: string
    detections: number
    average_confidence: number | null
  }>
  cost: {
    configured: boolean
    estimated_cost_per_analysis_usd: number | null
    estimated_total_usd: number | null
  }
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`
}

export function VisionMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/vision/metrics?days=${days}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar las métricas.')
      setMetrics(payload.data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar las métricas.')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    void loadMetrics()
  }, [loadMetrics])

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-light text-white">Métricas operativas</h2>
          <p className="mt-1 text-sm text-white/50">Volumen, revisión, especies detectadas y estimación de costo.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-lg border border-white/10 bg-[#081827] px-3 py-2 text-sm text-white">
            <option value={7}>7 días</option>
            <option value={30}>30 días</option>
            <option value={90}>90 días</option>
            <option value={365}>365 días</option>
          </select>
          <button type="button" onClick={() => void loadMetrics()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/[0.05] disabled:opacity-40">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-300/20 bg-red-300/[0.05] p-3 text-sm text-red-100">{error}</p>}

      {metrics && (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={<Activity className="h-5 w-5 text-[#9DD2F2]" />} label="Análisis" value={metrics.totals.analyses.toLocaleString('es-CL')} detail={`${metrics.totals.completed} completados`} />
            <MetricCard icon={<BarChart3 className="h-5 w-5 text-emerald-300" />} label="Detecciones" value={metrics.totals.detections.toLocaleString('es-CL')} detail={`${percent(metrics.rates.review)} revisado`} />
            <MetricCard icon={<AlertTriangle className="h-5 w-5 text-amber-300" />} label="Pendientes" value={metrics.totals.pending_review.toLocaleString('es-CL')} detail={`${percent(metrics.rates.failure)} fallos`} />
            <MetricCard icon={<DollarSign className="h-5 w-5 text-white/70" />} label="Costo estimado" value={metrics.cost.estimated_total_usd === null ? 'No configurado' : `USD ${metrics.cost.estimated_total_usd.toFixed(2)}`} detail={metrics.cost.estimated_cost_per_analysis_usd === null ? 'Definir OPENAI_VISION_ESTIMATED_COST_USD' : `USD ${metrics.cost.estimated_cost_per_analysis_usd.toFixed(4)} por análisis`} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded-xl border border-white/8 bg-black/20 p-4">
              <h3 className="text-sm font-medium text-white">Especies detectadas</h3>
              {metrics.species.length === 0 ? (
                <p className="mt-3 text-sm text-white/45">Todavía no existen detecciones para este período.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {metrics.species.slice(0, 12).map((item) => {
                    const maximum = metrics.species[0]?.detections || 1
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-white/75">{item.name}</span>
                          <span className="text-white/45">{item.detections} · {item.average_confidence === null ? 'sin confianza' : percent(item.average_confidence)}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-[#4DA3D9]" style={{ width: `${Math.max(3, (item.detections / maximum) * 100)}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/8 bg-black/20 p-4">
              <h3 className="text-sm font-medium text-white">Estado del flujo</h3>
              <div className="mt-4 space-y-3 text-sm">
                <FlowRow label="Completados" value={metrics.totals.completed} total={metrics.totals.analyses} />
                <FlowRow label="Revisados" value={metrics.totals.reviewed} total={metrics.totals.completed} />
                <FlowRow label="Pendientes" value={metrics.totals.pending_review} total={metrics.totals.completed} />
                <FlowRow label="Fallidos" value={metrics.totals.failed} total={metrics.totals.analyses} />
              </div>
              <p className="mt-5 text-xs leading-5 text-white/35">El costo es una estimación administrativa. Debe configurarse con el costo efectivo observado por análisis.</p>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

function MetricCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/20 p-4">
      <div className="flex items-center gap-3">{icon}<span className="text-sm text-white/45">{label}</span></div>
      <p className="mt-4 text-2xl font-light text-white">{value}</p>
      <p className="mt-1 text-xs text-white/35">{detail}</p>
    </div>
  )
}

function FlowRow({ label, value, total }: { label: string; value: number; total: number }) {
  const ratio = total > 0 ? value / total : 0
  return (
    <div>
      <div className="flex justify-between gap-3"><span className="text-white/60">{label}</span><span className="text-white">{value} · {percent(ratio)}</span></div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-white/30" style={{ width: `${Math.min(100, ratio * 100)}%` }} /></div>
    </div>
  )
}

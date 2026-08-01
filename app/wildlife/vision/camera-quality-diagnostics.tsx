'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  CircleDot,
  Clock3,
  ImageOff,
  RefreshCw,
  Settings2,
  Wrench,
} from 'lucide-react'

type HealthStatus = 'healthy' | 'watch' | 'maintenance' | 'critical' | 'inactive' | 'no_data'
type QualityFlag =
  | 'empty_frame'
  | 'low_visibility'
  | 'blurred'
  | 'occluded'
  | 'weather'
  | 'infrared'
  | 'uncertain_subject'
  | 'metadata_missing'

type CameraDiagnostic = {
  cameraId: string
  code: string
  name: string
  zoneLabel: string | null
  active: boolean
  status: HealthStatus
  analyses: number
  completed: number
  failed: number
  poorQuality: number
  qualityIssues: number
  emptyFrames: number
  uncertainSubjects: number
  missingMetadata: number
  failureRate: number
  poorQualityRate: number
  qualityIssueRate: number
  emptyFrameRate: number
  averageQualityScore: number | null
  lastActivityAt: string | null
  daysSinceActivity: number | null
  dominantFlags: Array<{ flag: QualityFlag; count: number }>
  recommendations: string[]
}

type QualityReport = {
  periodDays: number
  generatedAt: string
  unassignedAnalyses: number
  totals: {
    cameras: number
    healthy: number
    watch: number
    maintenance: number
    critical: number
    noData: number
    analyses: number
    completed: number
    failed: number
    poorQuality: number
    qualityIssues: number
    emptyFrames: number
  }
  diagnostics: CameraDiagnostic[]
  methodology: {
    source: string
    hardwareTelemetry: boolean
    flagLabels: Record<QualityFlag, string>
  }
}

const statusLabels: Record<HealthStatus, string> = {
  healthy: 'Estable',
  watch: 'Observar',
  maintenance: 'Mantencion',
  critical: 'Critica',
  inactive: 'Inactiva',
  no_data: 'Sin evidencia',
}

const statusClasses: Record<HealthStatus, string> = {
  healthy: 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100',
  watch: 'border-sky-300/20 bg-sky-300/[0.08] text-sky-100',
  maintenance: 'border-amber-300/20 bg-amber-300/[0.08] text-amber-100',
  critical: 'border-red-300/20 bg-red-300/[0.08] text-red-100',
  inactive: 'border-white/10 bg-white/[0.04] text-white/45',
  no_data: 'border-white/10 bg-white/[0.04] text-white/55',
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`
}

function activityLabel(item: CameraDiagnostic) {
  if (!item.lastActivityAt) return 'Sin actividad registrada'
  if (item.daysSinceActivity === 0) return 'Actividad hoy'
  if (item.daysSinceActivity === 1) return 'Actividad hace 1 dia'
  return `Actividad hace ${item.daysSinceActivity} dias`
}

export function CameraQualityDiagnostics() {
  const [report, setReport] = useState<QualityReport | null>(null)
  const [days, setDays] = useState(30)
  const [view, setView] = useState<'all' | 'attention'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/vision/quality?days=${days}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar el diagnostico.')
      setReport(payload.data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar el diagnostico.')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => { void load() }, [load])

  const visible = useMemo(() => {
    if (!report) return []
    if (view === 'all') return report.diagnostics
    return report.diagnostics.filter((item) => ['watch', 'maintenance', 'critical'].includes(item.status))
  }, [report, view])

  const attention = report
    ? report.totals.watch + report.totals.maintenance + report.totals.critical
    : 0

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b1d2c] p-5 shadow-2xl shadow-black/15 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">
            <Settings2 className="h-4 w-4" /> Calidad y mantenimiento
          </div>
          <h2 className="mt-2 text-2xl font-medium text-white">Diagnostico de la red de camaras</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-white/50">
            Señales derivadas de la evidencia procesada y de la actividad registrada. No representan bateria, señal ni almacenamiento en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="rounded-lg border border-white/10 bg-[#071622] px-3 py-2 text-sm text-white"
            aria-label="Periodo del diagnostico"
          >
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
            <option value={365}>365 dias</option>
          </select>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl border border-red-300/20 bg-red-300/[0.05] p-3 text-sm text-red-100">{error}</p>}

      {report && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard icon={<Camera className="h-5 w-5 text-[#9DD2F2]" />} label="Camaras" value={report.totals.cameras} detail={`${report.totals.noData} sin evidencia`} />
            <SummaryCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-300" />} label="Estables" value={report.totals.healthy} detail={`${report.totals.analyses} analisis`} />
            <SummaryCard icon={<Wrench className="h-5 w-5 text-amber-300" />} label="Requieren atencion" value={attention} detail={`${report.totals.critical} criticas`} />
            <SummaryCard icon={<ImageOff className="h-5 w-5 text-white/65" />} label="Calidad observada" value={report.totals.qualityIssues} detail={`${report.totals.poorQuality} imagenes deficientes`} />
          </div>

          {report.unassignedAnalyses > 0 && (
            <p className="mt-4 rounded-xl border border-sky-300/15 bg-sky-300/[0.04] p-3 text-sm text-sky-100/75">
              {report.unassignedAnalyses} analisis no estan asociados a una camara y no forman parte del diagnostico individual.
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-lg border border-white/10 p-1 text-xs">
              <button type="button" onClick={() => setView('all')} className={`rounded-md px-3 py-2 ${view === 'all' ? 'bg-[#58a9db] text-[#06131d]' : 'text-white/60'}`}>Todas ({report.totals.cameras})</button>
              <button type="button" onClick={() => setView('attention')} className={`rounded-md px-3 py-2 ${view === 'attention' ? 'bg-[#58a9db] text-[#06131d]' : 'text-white/60'}`}>Atencion ({attention})</button>
            </div>
            <p className="text-xs text-white/30">Actualizado {new Date(report.generatedAt).toLocaleString('es-CL')}</p>
          </div>

          {!visible.length && (
            <div className="mt-4 rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">
              {report.totals.cameras === 0 ? 'Registra una camara para iniciar el diagnostico.' : 'No existen camaras que requieran atencion para este periodo.'}
            </div>
          )}

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {visible.map((item) => (
              <article key={item.cameraId} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#9DD2F2]">{item.code}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] ${statusClasses[item.status]}`}>{statusLabels[item.status]}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-white">{item.name}</h3>
                    <p className="mt-1 text-xs text-white/40">{item.zoneLabel || 'Zona no indicada'} · {activityLabel(item)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-white/35">Calidad media</p>
                    <p className="mt-1 text-2xl font-light text-white">{item.averageQualityScore === null ? '—' : `${item.averageQualityScore}/100`}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <MiniMetric label="Analisis" value={item.analyses} />
                  <MiniMetric label="Fallos" value={`${item.failed} · ${percent(item.failureRate)}`} />
                  <MiniMetric label="Con problemas" value={`${item.qualityIssues} · ${percent(item.qualityIssueRate)}`} />
                  <MiniMetric label="Vacias" value={`${item.emptyFrames} · ${percent(item.emptyFrameRate)}`} />
                </div>

                {item.dominantFlags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.dominantFlags.map((flag) => (
                      <span key={flag.flag} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-white/55">
                        <CircleDot className="h-3 w-3" /> {report.methodology.flagLabels[flag.flag]} · {flag.count}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-white/45">
                    {item.status === 'critical' ? <AlertTriangle className="h-4 w-4 text-red-300" /> : <Clock3 className="h-4 w-4 text-[#8fc8ea]" />}
                    Acciones sugeridas
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-5 text-white/62">
                    {item.recommendations.map((recommendation) => <li key={recommendation}>— {recommendation}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function SummaryCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: number; detail: string }) {
  return <div className="rounded-xl border border-white/8 bg-black/20 p-4"><div className="flex items-center gap-3">{icon}<span className="text-sm text-white/45">{label}</span></div><p className="mt-4 text-2xl font-light text-white">{value}</p><p className="mt-1 text-xs text-white/35">{detail}</p></div>
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-white/[0.04] p-3"><p className="text-[10px] uppercase tracking-[0.1em] text-white/30">{label}</p><p className="mt-1 text-sm font-medium text-white/80">{value}</p></div>
}

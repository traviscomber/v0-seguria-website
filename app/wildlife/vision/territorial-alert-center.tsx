'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  CircleCheckBig,
  Clock3,
  LocateFixed,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Siren,
} from 'lucide-react'

type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'
type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed'
type AlertAction = 'acknowledge' | 'resolve' | 'dismiss' | 'reopen'

type AlertRecord = {
  id: string
  module: string
  alert_type: string
  severity: AlertSeverity
  status: AlertStatus
  source_type: string
  source_id?: string | null
  camera_id?: string | null
  title: string
  summary: string
  zone_label?: string | null
  detected_at: string
  payload?: {
    species?: string | null
    confidence?: number | null
    reviewStatus?: string | null
    locationStatus?: string | null
    cameraCode?: string | null
    cameraName?: string | null
    sensitiveZone?: boolean
    requiresHumanReview?: boolean
    inactiveHours?: number
  } | null
  acknowledged_at?: string | null
  resolved_at?: string | null
  created_at: string
  updated_at: string
  wildlife_cameras?: {
    code?: string | null
    name?: string | null
    zone_label?: string | null
  } | null
}

type StatusFilter = 'active' | 'all' | AlertStatus
type SeverityFilter = 'all' | AlertSeverity

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
}

function severityLabel(value: AlertSeverity) {
  if (value === 'critical') return 'Critica'
  if (value === 'high') return 'Alta'
  if (value === 'medium') return 'Media'
  if (value === 'low') return 'Baja'
  return 'Informativa'
}

function severityClasses(value: AlertSeverity) {
  if (value === 'critical') return 'border-red-300/25 bg-red-300/[0.08] text-red-100'
  if (value === 'high') return 'border-orange-300/25 bg-orange-300/[0.08] text-orange-100'
  if (value === 'medium') return 'border-amber-300/25 bg-amber-300/[0.07] text-amber-100'
  if (value === 'low') return 'border-sky-300/20 bg-sky-300/[0.06] text-sky-100'
  return 'border-white/12 bg-white/[0.04] text-white/70'
}

function statusLabel(value: AlertStatus) {
  if (value === 'open') return 'Abierta'
  if (value === 'acknowledged') return 'Reconocida'
  if (value === 'resolved') return 'Resuelta'
  return 'Descartada'
}

function statusClasses(value: AlertStatus) {
  if (value === 'open') return 'bg-red-300/10 text-red-100'
  if (value === 'acknowledged') return 'bg-amber-300/10 text-amber-100'
  if (value === 'resolved') return 'bg-emerald-300/10 text-emerald-100'
  return 'bg-white/[0.05] text-white/55'
}

function formatDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 'Fecha no disponible' : parsed.toLocaleString('es-CL')
}

function alertTypeLabel(value: string) {
  const labels: Record<string, string> = {
    priority_species: 'Especie prioritaria',
    human_intrusion: 'Presencia humana',
    vehicle_intrusion: 'Vehiculo en zona sensible',
    domestic_animal: 'Animal domestico',
    inference_failure: 'Fallo de analisis',
    low_confidence: 'Identificacion incierta',
    metadata_gap: 'Metadata incompleta',
    camera_inactive: 'Camara sin actividad',
  }
  return labels[value] || value.replace(/_/g, ' ')
}

export function TerritorialAlertCenter() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<string | null>(null)

  async function loadAlerts(sync = false) {
    setLoading(true)
    setError(null)
    try {
      if (sync) {
        const syncResponse = await fetch('/api/alerts/vision/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        const syncPayload = await syncResponse.json()
        if (!syncResponse.ok || !syncPayload.success) {
          throw new Error(syncPayload.error || 'No fue posible sincronizar las alertas.')
        }
        setLastSync(new Date().toISOString())
      }

      const response = await fetch('/api/alerts?module=vision&limit=100', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar las alertas.')
      setAlerts(payload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar el centro de alertas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAlerts(true)
    const handler = () => void loadAlerts(true)
    window.addEventListener('wildlife-job-created', handler)
    return () => window.removeEventListener('wildlife-job-created', handler)
  }, [])

  const filteredAlerts = useMemo(() => alerts
    .filter((alert) => {
      const statusMatch = statusFilter === 'all'
        || (statusFilter === 'active' && ['open', 'acknowledged'].includes(alert.status))
        || alert.status === statusFilter
      const severityMatch = severityFilter === 'all' || alert.severity === severityFilter
      return statusMatch && severityMatch
    })
    .sort((left, right) => {
      const severityDifference = SEVERITY_ORDER[right.severity] - SEVERITY_ORDER[left.severity]
      if (severityDifference !== 0) return severityDifference
      return new Date(right.detected_at).getTime() - new Date(left.detected_at).getTime()
    }), [alerts, severityFilter, statusFilter])

  const metrics = useMemo(() => ({
    active: alerts.filter((alert) => ['open', 'acknowledged'].includes(alert.status)).length,
    highPriority: alerts.filter((alert) => ['open', 'acknowledged'].includes(alert.status) && ['critical', 'high'].includes(alert.severity)).length,
    reviewPending: alerts.filter((alert) => ['open', 'acknowledged'].includes(alert.status) && alert.payload?.requiresHumanReview).length,
    locationPending: alerts.filter((alert) => ['open', 'acknowledged'].includes(alert.status) && alert.payload?.locationStatus === 'not_validated').length,
  }), [alerts])

  async function transition(alert: AlertRecord, action: AlertAction) {
    setWorkingId(alert.id)
    setError(null)
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId: alert.id, action }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible actualizar la alerta.')
      setAlerts((current) => current.map((item) => item.id === alert.id ? payload.data : item))
    } catch (transitionError) {
      setError(transitionError instanceof Error ? transitionError.message : 'No fue posible actualizar la alerta.')
    } finally {
      setWorkingId(null)
    }
  }

  function focusOnMap(alert: AlertRecord) {
    if (!alert.camera_id) return
    window.dispatchEvent(new CustomEvent('seguria-map-focus', { detail: { cameraId: alert.camera_id } }))
    document.getElementById('territorial-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1d2c] shadow-2xl shadow-black/15">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">Centro de alertas territoriales</p>
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/45">SegurIA Vision</span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/30">Powered by N3uralia</span>
          </div>
          <h2 className="mt-2 text-2xl font-medium text-white">Eventos que requieren decision operativa</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-white/55">Reglas deterministicas convierten detecciones, fallos y salud de camaras en alertas trazables. Ninguna alerta cientifica se valida sin revision humana.</p>
        </div>
        <button type="button" onClick={() => void loadAlerts(true)} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68b4e3]/60 disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      <div className="grid gap-px bg-white/8 sm:grid-cols-2 xl:grid-cols-4">
        <AlertMetric icon={<Siren className="h-4 w-4" />} label="Activas" value={metrics.active} detail="Abiertas o reconocidas" tone="neutral" />
        <AlertMetric icon={<ShieldAlert className="h-4 w-4" />} label="Alta prioridad" value={metrics.highPriority} detail="Criticas y altas" tone="danger" />
        <AlertMetric icon={<Clock3 className="h-4 w-4" />} label="Revision humana" value={metrics.reviewPending} detail="Pendientes de validar" tone="warning" />
        <AlertMetric icon={<MapPin className="h-4 w-4" />} label="Ubicacion pendiente" value={metrics.locationPending} detail="Sin coordenadas validadas" tone="info" />
      </div>

      <div className="grid gap-3 border-b border-white/10 p-5 sm:grid-cols-2 sm:p-6">
        <label className="text-sm text-white/60">
          <span className="mb-2 block">Estado</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="w-full rounded-xl border border-white/12 bg-[#071622] px-4 py-3 text-white outline-none transition focus:border-[#68b4e3]/60 focus:ring-2 focus:ring-[#68b4e3]/10">
            <option value="active">Activas</option>
            <option value="all">Todas</option>
            <option value="open">Abiertas</option>
            <option value="acknowledged">Reconocidas</option>
            <option value="resolved">Resueltas</option>
            <option value="dismissed">Descartadas</option>
          </select>
        </label>
        <label className="text-sm text-white/60">
          <span className="mb-2 block">Prioridad</span>
          <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as SeverityFilter)} className="w-full rounded-xl border border-white/12 bg-[#071622] px-4 py-3 text-white outline-none transition focus:border-[#68b4e3]/60 focus:ring-2 focus:ring-[#68b4e3]/10">
            <option value="all">Todas</option>
            <option value="critical">Critica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
            <option value="info">Informativa</option>
          </select>
        </label>
      </div>

      {error && <p className="m-5 rounded-xl border border-red-300/20 bg-red-300/[0.05] p-4 text-sm text-red-100/85 sm:m-6">{error}</p>}

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-medium text-white">Bandeja operacional</h3>
            <p className="mt-1 text-xs text-white/40">{filteredAlerts.length} alertas visibles{lastSync ? ` · sincronizado ${formatDate(lastSync)}` : ''}</p>
          </div>
        </div>

        {!loading && filteredAlerts.length === 0 && (
          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] p-7 text-center">
            <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-200/70" />
            <p className="mt-3 text-sm font-medium text-white">Sin alertas para estos filtros</p>
            <p className="mt-1 text-xs text-white/45">El sistema seguira evaluando nuevas evidencias y actividad de camaras.</p>
          </div>
        )}

        <div className="grid gap-3 xl:grid-cols-2">
          {filteredAlerts.map((alert) => {
            const busy = workingId === alert.id
            const cameraCode = alert.wildlife_cameras?.code || alert.payload?.cameraCode
            const confidence = typeof alert.payload?.confidence === 'number'
              ? `${Math.round(alert.payload.confidence * 100)}%`
              : null

            return (
              <article key={alert.id} className={`rounded-2xl border p-4 sm:p-5 ${alert.status === 'resolved' || alert.status === 'dismissed' ? 'border-white/8 bg-[#071622]/65' : 'border-white/10 bg-[#071622]'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${severityClasses(alert.severity)}`}>{severityLabel(alert.severity)}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] ${statusClasses(alert.status)}`}>{statusLabel(alert.status)}</span>
                      <span className="text-[10px] uppercase tracking-[0.12em] text-white/35">{alertTypeLabel(alert.alert_type)}</span>
                    </div>
                    <h4 className="mt-3 text-base font-medium text-white">{alert.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-white/58">{alert.summary}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-white/35">{formatDate(alert.detected_at)}</span>
                </div>

                <div className="mt-4 grid gap-2 text-xs text-white/55 sm:grid-cols-2">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-white/35" />{alert.zone_label || alert.wildlife_cameras?.zone_label || 'Sin sector'}</span>
                  <span className="inline-flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-white/35" />{cameraCode || 'Sin camara asociada'}</span>
                  {alert.payload?.species && <span>Clase: {alert.payload.species}</span>}
                  {confidence && <span>Confianza: {confidence}</span>}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-4">
                  {alert.camera_id && (
                    <button type="button" onClick={() => focusOnMap(alert)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#68b4e3]/20 bg-[#68b4e3]/[0.05] px-3 py-2 text-xs text-[#9bd3f3] transition hover:bg-[#68b4e3]/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68b4e3]/50">
                      <LocateFixed className="h-3.5 w-3.5" />Ver en mapa
                    </button>
                  )}
                  {alert.status === 'open' && (
                    <button type="button" disabled={busy} onClick={() => void transition(alert, 'acknowledge')} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/20 px-3 py-2 text-xs text-amber-100 transition hover:bg-amber-300/[0.06] disabled:opacity-40">
                      <CircleCheckBig className="h-3.5 w-3.5" />Reconocer
                    </button>
                  )}
                  {['open', 'acknowledged'].includes(alert.status) && (
                    <button type="button" disabled={busy} onClick={() => void transition(alert, 'resolve')} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/20 px-3 py-2 text-xs text-emerald-100 transition hover:bg-emerald-300/[0.06] disabled:opacity-40">
                      <CheckCircle2 className="h-3.5 w-3.5" />Resolver
                    </button>
                  )}
                  {['open', 'acknowledged'].includes(alert.status) && (
                    <button type="button" disabled={busy} onClick={() => void transition(alert, 'dismiss')} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/55 transition hover:bg-white/[0.05] disabled:opacity-40">
                      <Archive className="h-3.5 w-3.5" />Descartar
                    </button>
                  )}
                  {['resolved', 'dismissed'].includes(alert.status) && (
                    <button type="button" disabled={busy} onClick={() => void transition(alert, 'reopen')} className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-2 text-xs text-white/70 transition hover:bg-white/[0.05] disabled:opacity-40">
                      Reabrir
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function AlertMetric({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: number
  detail: string
  tone: 'neutral' | 'danger' | 'warning' | 'info'
}) {
  const valueClass = tone === 'danger'
    ? 'text-red-100'
    : tone === 'warning'
      ? 'text-amber-100'
      : tone === 'info'
        ? 'text-[#9bd3f3]'
        : 'text-white'

  return (
    <div className="bg-[#0b1d2c] p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.13em] text-white/40">{icon}{label}</div>
      <p className={`mt-2 text-3xl font-normal ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-white/35">{detail}</p>
    </div>
  )
}

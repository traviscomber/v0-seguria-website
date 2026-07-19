'use client'

import { startTransition, useEffect, useState } from 'react'
import { BellRing, CheckCircle2, Clock3, RefreshCw, ShieldAlert } from 'lucide-react'

type Notification = {
  id: string
  severity: 'warning' | 'critical'
  title: string
  body: string
  status: 'unread' | 'read' | 'acknowledged' | 'escalated'
  due_at: string
  created_at: string
  properties: { name: string; address: string | null } | null
  incidents: { status: string } | null
}

type Preference = {
  channel: 'email' | 'sms' | 'push' | 'webhook'
  enabled: boolean
  target: string
  minSeverity: 'warning' | 'critical'
}

const channelLabels: Record<Preference['channel'], string> = {
  email: 'Correo',
  sms: 'SMS',
  push: 'Push',
  webhook: 'Webhook',
}

const defaultPreferences: Preference[] = [
  { channel: 'email', enabled: false, target: '', minSeverity: 'warning' },
  { channel: 'sms', enabled: false, target: '', minSeverity: 'critical' },
  { channel: 'push', enabled: false, target: '', minSeverity: 'critical' },
  { channel: 'webhook', enabled: false, target: '', minSeverity: 'critical' },
]

function formatTime(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function isClosedIncident(status: string | undefined) {
  return ['resolved', 'false_alarm'].includes(status || '')
}

export function ClientNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [organizationId, setOrganizationId] = useState('')
  const [preferences, setPreferences] = useState<Preference[]>(defaultPreferences)
  const [savingPreferences, setSavingPreferences] = useState(false)

  async function load() {
    const response = await fetch('/api/notifications', { cache: 'no-store' })
    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible cargar los avisos.')
    startTransition(() => setNotifications(result.data || []))
  }

  async function loadPreferences() {
    const response = await fetch('/api/notifications/preferences', { cache: 'no-store' })
    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.success) return

    const orgId = result.data?.organizations?.[0] || ''
    const rows = result.data?.preferences || []
    setOrganizationId(orgId)
    setPreferences(defaultPreferences.map((preference) => {
      const saved = rows.find((row: { organization_id: string; channel: string }) =>
        row.organization_id === orgId && row.channel === preference.channel
      )
      return saved
        ? {
            channel: preference.channel,
            enabled: Boolean(saved.enabled),
            target: saved.target || '',
            minSeverity: saved.min_severity === 'critical' ? 'critical' : 'warning',
          }
        : preference
    }))
  }

  useEffect(() => {
    let active = true
    load()
      .catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setLoading(false))
    loadPreferences().catch(() => undefined)

    const interval = window.setInterval(() => load().catch(() => undefined), 30_000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  async function acknowledgeNotification(id: string) {
    setBusyId(id)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible confirmar el aviso.')

      setMessage(result.message || 'Aviso confirmado.')
      await load()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible confirmar el aviso.')
    } finally {
      setBusyId(null)
    }
  }

  async function savePreferences() {
    if (!organizationId) return
    setSavingPreferences(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          preferences: preferences.map((preference) => ({
            channel: preference.channel,
            enabled: preference.enabled,
            target: preference.target,
            minSeverity: preference.minSeverity,
          })),
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible guardar preferencias.')
      setMessage(result.message || 'Preferencias actualizadas.')
      await loadPreferences()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible guardar preferencias.')
    } finally {
      setSavingPreferences(false)
    }
  }

  function updatePreference(channel: Preference['channel'], patch: Partial<Preference>) {
    setPreferences((current) => current.map((preference) =>
      preference.channel === channel ? { ...preference, ...patch } : preference
    ))
  }

  const pending = notifications.filter((item) => item.status !== 'acknowledged' && !isClosedIncident(item.incidents?.status))
  const overdueCount = pending.filter((item) => item.status === 'escalated' || new Date(item.due_at).getTime() <= Date.now()).length

  return (
    <section id="avisos" className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.12),transparent_30%),rgba(255,255,255,0.04)] p-6 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[#9DD2F2]">
            <BellRing className="h-5 w-5" strokeWidth={1.6} />
            <p className="text-sm uppercase tracking-[0.18em]">Avisos importantes</p>
          </div>
          <h2 className="mt-3 text-2xl font-light text-white">Lo que necesita tu confirmacion</h2>
          <p className="mt-2 text-sm text-white/55">
            Revisa el contexto y confirma recepcion. Cada confirmacion queda registrada para soporte y auditoria.
          </p>
        </div>
        <button
          onClick={() => load().catch((loadError) => setError(loadError.message))}
          className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.6} />
          Actualizar
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryPill label="Pendientes" value={pending.length.toString()} />
        <SummaryPill label="Vencidos" value={overdueCount.toString()} tone={overdueCount > 0 ? 'text-red-100' : 'text-white'} />
        <SummaryPill label="Actualizacion" value="30s" />
      </div>

      {error && <p className="mt-4 rounded-xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
      {message && <p className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">{message}</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {loading ? (
          <Empty text="Cargando avisos..." />
        ) : pending.length === 0 ? (
          <Empty text="No tienes avisos pendientes. Todo esta al dia." />
        ) : (
          pending.slice(0, 8).map((item) => {
            const overdue = item.status === 'escalated' || new Date(item.due_at).getTime() <= Date.now()
            return (
              <article key={item.id} className={`rounded-2xl border p-5 ${item.severity === 'critical' ? 'border-red-400/25 bg-red-500/8' : 'border-amber-400/20 bg-amber-500/8'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/40">{item.properties?.name || 'Sitio protegido'}</p>
                    <h3 className="mt-2 text-lg font-light text-white">{item.title}</h3>
                  </div>
                  <ShieldAlert className={`h-5 w-5 ${item.severity === 'critical' ? 'text-red-200' : 'text-amber-200'}`} strokeWidth={1.6} />
                </div>

                <p className="mt-3 text-sm leading-6 text-white/60">{item.body}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${overdue ? 'bg-red-500/15 text-red-100' : 'bg-white/8 text-white/55'}`}>
                    <Clock3 className="h-3.5 w-3.5" strokeWidth={1.6} />
                    {overdue ? 'Confirmacion vencida' : `Confirmar antes de ${formatTime(item.due_at)}`}
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-white/45">
                    {item.severity === 'critical' ? 'Critico' : 'Atencion'}
                  </span>
                </div>

                <button
                  disabled={busyId === item.id}
                  onClick={() => acknowledgeNotification(item.id)}
                  className="btn-primary mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.6} />
                  {busyId === item.id ? 'Confirmando...' : 'Confirmar recepcion'}
                </button>
              </article>
            )
          })
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#0B1D30] p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-light text-white">Canales de aviso</p>
            <p className="mt-1 text-sm leading-6 text-white/55">
              Activa canales adicionales para avisos importantes. La entrega queda registrada con reintentos y auditoria.
            </p>
          </div>
          <button
            disabled={savingPreferences || !organizationId}
            onClick={savePreferences}
            className="btn-secondary inline-flex items-center justify-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
          >
            {savingPreferences ? 'Guardando...' : 'Guardar canales'}
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {preferences.map((preference) => (
            <div key={preference.channel} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white">{channelLabels[preference.channel]}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {preference.minSeverity === 'critical' ? 'Solo criticos' : 'Atencion y criticos'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updatePreference(preference.channel, { enabled: !preference.enabled })}
                  className={`rounded-full px-3 py-1 text-xs ${preference.enabled ? 'bg-[#4DA3D9] text-white' : 'bg-white/8 text-white/55'}`}
                >
                  {preference.enabled ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  value={preference.target}
                  onChange={(event) => updatePreference(preference.channel, { target: event.target.value })}
                  placeholder={preference.channel === 'sms' ? '+56 9...' : preference.channel === 'webhook' ? 'https://...' : 'Destino opcional'}
                  className="rounded-xl border border-white/10 bg-[#071524] px-3 py-2 text-sm text-white placeholder:text-white/30"
                />
                <select
                  value={preference.minSeverity}
                  onChange={(event) => updatePreference(preference.channel, { minSeverity: event.target.value === 'critical' ? 'critical' : 'warning' })}
                  className="rounded-xl border border-white/10 bg-[#071524] px-3 py-2 text-sm text-white"
                >
                  <option value="warning">Atencion+</option>
                  <option value="critical">Criticos</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SummaryPill({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-white/35">{label}</p>
      <p className={`mt-2 text-2xl font-light ${tone}`}>{value}</p>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="lg:col-span-2 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">{text}</div>
}

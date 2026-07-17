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

export function ClientNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const response = await fetch('/api/notifications', { cache: 'no-store' })
    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible cargar los avisos.')
    startTransition(() => setNotifications(result.data || []))
  }

  useEffect(() => {
    let active = true
    load().catch((loadError) => active && setError(loadError.message)).finally(() => active && setLoading(false))
    const interval = window.setInterval(() => load().catch(() => undefined), 30_000)
    return () => { active = false; window.clearInterval(interval) }
  }, [])

  async function acknowledge(id: string) {
    setBusyId(id); setError(null)
    try {
      const response = await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notificationId: id }) })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible confirmar el aviso.')
      await load()
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'No fue posible confirmar el aviso.') } finally { setBusyId(null) }
  }

  const pending = notifications.filter((item) => item.status !== 'acknowledged' && !['resolved', 'false_alarm'].includes(item.incidents?.status || ''))
  return (
    <section id="avisos" className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.12),transparent_30%),rgba(255,255,255,0.04)] p-6 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><div className="flex items-center gap-2 text-[#9DD2F2]"><BellRing className="h-5 w-5" /><p className="text-sm uppercase tracking-[0.18em]">Avisos importantes</p></div><h2 className="mt-3 text-2xl font-light text-white">Lo que necesita tu confirmación</h2><p className="mt-2 text-sm text-white/55">Revisa el contexto y confirma que recibiste el aviso.</p></div>
        <button onClick={() => load().catch((loadError) => setError(loadError.message))} className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"><RefreshCw className="h-4 w-4" /> Actualizar</button>
      </div>
      {error && <p className="mt-4 rounded-xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {loading ? <Empty text="Cargando avisos..." /> : pending.length === 0 ? <Empty text="No tienes avisos pendientes. Todo está al día." /> : pending.slice(0, 8).map((item) => {
          const overdue = item.status === 'escalated' || new Date(item.due_at).getTime() <= Date.now()
          return <article key={item.id} className={`rounded-2xl border p-5 ${item.severity === 'critical' ? 'border-red-400/25 bg-red-500/8' : 'border-amber-400/20 bg-amber-500/8'}`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.16em] text-white/40">{item.properties?.name || 'Sitio protegido'}</p><h3 className="mt-2 text-lg font-light text-white">{item.title}</h3></div><ShieldAlert className={`h-5 w-5 ${item.severity === 'critical' ? 'text-red-200' : 'text-amber-200'}`} /></div><p className="mt-3 text-sm leading-6 text-white/60">{item.body}</p><div className="mt-4 flex flex-wrap items-center gap-2 text-xs"><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${overdue ? 'bg-red-500/15 text-red-100' : 'bg-white/8 text-white/55'}`}><Clock3 className="h-3.5 w-3.5" /> {overdue ? 'Confirmación vencida' : `Confirmar antes de ${new Intl.DateTimeFormat('es-CL',{hour:'2-digit',minute:'2-digit'}).format(new Date(item.due_at))}`}</span><span className="rounded-full bg-white/5 px-3 py-1 text-white/45">{item.severity === 'critical' ? 'Crítico' : 'Atención'}</span></div><button disabled={busyId === item.id} onClick={() => acknowledge(item.id)} className="btn-primary mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-50"><CheckCircle2 className="h-4 w-4" /> {busyId === item.id ? 'Confirmando...' : 'Confirmar recepción'}</button></article>
        })}
      </div>
    </section>
  )
}

function Empty({ text }: { text: string }) { return <div className="lg:col-span-2 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">{text}</div> }

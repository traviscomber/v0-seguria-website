'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, ShieldAlert, UserRound } from 'lucide-react'

type IncidentAction = { id: string; actor_label: string | null; action_type: string; from_status: string | null; to_status: string | null; comment: string | null; created_at: string }
type IncidentNotification = { id: string; status: string; due_at: string; acknowledged_at: string | null; escalated_at: string | null; recipient_user_id: string }
type Incident = { id: string; assigned_to: string | null; title: string; description: string | null; severity: 'warning' | 'critical'; status: string; created_at: string; updated_at: string; properties: { name: string; address: string | null } | null; incident_actions: IncidentAction[]; notifications: IncidentNotification[] }
type Operator = { id: string; name: string; email?: string }

const statusLabel: Record<string, string> = { new: 'Nuevo', validating: 'Validando', confirmed: 'Confirmado', responding: 'En respuesta', resolved: 'Resuelto', false_alarm: 'Falsa alarma' }

export function IncidentCenter() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  const [selected, setSelected] = useState<Incident | null>(null)
  const [filter, setFilter] = useState('open')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    const response = await fetch('/api/admin/incidents', { cache: 'no-store' })
    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible cargar los incidentes.')
    setIncidents(result.data.incidents || [])
    setOperators(result.data.operators || [])
    if (selected) setSelected((result.data.incidents || []).find((item: Incident) => item.id === selected.id) || null)
  }

  useEffect(() => { load().catch((error) => setMessage(error.message)) }, [])

  async function update(payload: { status?: string; assignedTo?: string }) {
    if (!selected) return
    setBusy(true); setMessage(null)
    try {
      const response = await fetch('/api/admin/incidents', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ incidentId: selected.id, note: note || undefined, ...payload }) })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible actualizar el incidente.')
      setNote(''); setMessage(result.message); await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No fue posible actualizar.') } finally { setBusy(false) }
  }

  const visible = incidents.filter((incident) => filter === 'all' || (filter === 'open' ? !['resolved', 'false_alarm'].includes(incident.status) : incident.status === filter))
  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Centro de respuesta</p><h1 className="mt-2 text-3xl font-light text-white">Incidentes</h1><p className="mt-2 text-sm text-white/55">Confirma, asigna y documenta cada situación hasta su cierre.</p></div><button onClick={() => load()} className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"><RefreshCw className="h-4 w-4" /> Actualizar</button></header>
      {message && <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">{message}</p>}
      <div className="flex flex-wrap gap-2">{['open','new','validating','confirmed','responding','resolved','false_alarm','all'].map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-xs ${filter === value ? 'bg-[#4DA3D9] text-white' : 'bg-white/5 text-white/55'}`}>{value === 'open' ? 'Abiertos' : value === 'all' ? 'Todos' : statusLabel[value]}</button>)}</div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-3">{visible.length === 0 ? <Empty text="No hay incidentes en esta vista." /> : visible.map((incident) => { const escalated = incident.notifications?.some((item) => item.status === 'escalated'); return <button key={incident.id} onClick={() => setSelected(incident)} className={`w-full rounded-2xl border p-5 text-left transition ${selected?.id === incident.id ? 'border-[#4DA3D9]/60 bg-[#4DA3D9]/10' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-white">{incident.title}</p><p className="mt-1 text-xs text-white/45">{incident.properties?.name || 'Sitio'} · {new Intl.DateTimeFormat('es-CL',{dateStyle:'short',timeStyle:'short'}).format(new Date(incident.created_at))}</p></div><span className={`rounded-full px-3 py-1 text-xs ${incident.severity === 'critical' ? 'bg-red-500/15 text-red-200' : 'bg-amber-500/15 text-amber-200'}`}>{incident.severity === 'critical' ? 'Crítico' : 'Atención'}</span></div><div className="mt-4 flex items-center justify-between gap-3 text-xs"><span className="text-[#9DD2F2]">{statusLabel[incident.status]}</span>{escalated && <span className="rounded-full bg-red-500/15 px-3 py-1 text-red-100">SLA vencido</span>}</div></button> })}</section>
        <section className="glass-card min-h-[420px] p-6">{!selected ? <Empty text="Selecciona un incidente para gestionarlo." /> : <div className="space-y-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-white/40">{selected.properties?.name}</p><h2 className="mt-2 text-2xl font-light text-white">{selected.title}</h2><p className="mt-2 text-sm leading-6 text-white/55">{selected.description || 'Sin descripción adicional.'}</p></div><ShieldAlert className="h-7 w-7 text-[#9DD2F2]" /></div>
          <div className="grid gap-3 sm:grid-cols-4"><Info icon={Clock3} label="Estado" value={statusLabel[selected.status]} /><Info icon={UserRound} label="Responsable" value={operators.find((item) => item.id === selected.assigned_to)?.name || 'Sin asignar'} /><Info icon={AlertTriangle} label="Prioridad" value={selected.severity === 'critical' ? 'Crítica' : 'Atención'} /><Info icon={CheckCircle2} label="Confirmaciones" value={`${selected.notifications?.filter((item) => item.status === 'acknowledged').length || 0} de ${selected.notifications?.length || 0}`} /></div>
          <NotificationSla notifications={selected.notifications || []} />
          <div className="grid gap-3 sm:grid-cols-2"><select aria-label="Asignar responsable" disabled={busy} value={selected.assigned_to || ''} onChange={(event) => event.target.value && update({ assignedTo: event.target.value })} className="rounded-xl border border-white/10 bg-[#123A5A] px-4 py-3 text-sm text-white"><option value="">Asignar responsable...</option>{operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.name}</option>)}</select><select aria-label="Cambiar estado del incidente" disabled={busy} value="" onChange={(event) => event.target.value && update({ status: event.target.value })} className="rounded-xl border border-white/10 bg-[#123A5A] px-4 py-3 text-sm text-white"><option value="">Cambiar estado...</option>{Object.entries(statusLabel).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <div><textarea aria-label="Comentario para la bitácora" value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Agrega contexto para la bitácora..." className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-white/35" /><button disabled={busy || !note.trim()} onClick={() => update({})} className="btn-primary mt-3 px-5 py-2.5 text-sm disabled:opacity-50">Registrar comentario</button></div>
          <div><h3 className="text-sm text-white">Bitácora</h3><div className="mt-3 space-y-3">{selected.incident_actions?.length ? [...selected.incident_actions].sort((a,b) => b.created_at.localeCompare(a.created_at)).map((action) => <div key={action.id} className="rounded-xl border border-white/8 bg-white/4 p-4"><div className="flex items-center gap-2 text-xs text-[#9DD2F2]"><CheckCircle2 className="h-3.5 w-3.5" /> {action.action_type.replace('_',' ')} · {action.actor_label || 'Operador'}</div>{action.comment && <p className="mt-2 text-sm text-white/65">{action.comment}</p>}<p className="mt-2 text-xs text-white/35">{new Intl.DateTimeFormat('es-CL',{dateStyle:'medium',timeStyle:'short'}).format(new Date(action.created_at))}</p></div>) : <p className="text-sm text-white/40">Sin acciones registradas.</p>}</div></div>
        </div>}</section>
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) { return <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">{text}</div> }
function Info({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-white/5 p-4"><Icon className="h-4 w-4 text-[#9DD2F2]" /><p className="mt-3 text-xs text-white/40">{label}</p><p className="mt-1 text-sm text-white">{value}</p></div> }
function NotificationSla({ notifications }: { notifications: IncidentNotification[] }) {
  if (notifications.length === 0) return <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/40">Este incidente no tiene destinatarios configurados.</p>
  const acknowledged = notifications.filter((item) => item.status === 'acknowledged').length
  const escalated = notifications.filter((item) => item.status === 'escalated').length
  const nextDue = notifications.filter((item) => !['acknowledged', 'escalated'].includes(item.status)).sort((a, b) => a.due_at.localeCompare(b.due_at))[0]?.due_at
  return <div className={`rounded-xl border p-4 ${escalated ? 'border-red-400/25 bg-red-500/8' : 'border-white/10 bg-white/5'}`}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.16em] text-white/40">SLA de confirmación</p><p className="mt-2 text-sm text-white">{acknowledged} confirmados · {notifications.length - acknowledged - escalated} pendientes · {escalated} vencidos</p></div>{nextDue && <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">Próximo vencimiento {new Intl.DateTimeFormat('es-CL',{dateStyle:'short',timeStyle:'short'}).format(new Date(nextDue))}</span>}</div></div>
}

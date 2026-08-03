'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, Loader2, Search, UserCheck, UserRound } from 'lucide-react'

type StoredLead = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  source: string | null
  status: string | null
  created_at: string
  updated_at: string
}

type QueueItem = {
  id: string
  name: string
  email: string
  phone: string
  status: string
  createdAt: string
  updatedAt: string
  subject: string
  location: string
  urgency: string
  owner: string
  firstResponseAt: string
  itemLabel: string
}

type SlaState = 'overdue' | 'warning' | 'ontime' | 'handled'
type SlaFilter = 'all' | SlaState

type AuthUser = { email?: string; id?: string }

function parseDetails(message: string | null): Record<string, unknown> {
  try { return message ? JSON.parse(message) as Record<string, unknown> : {} }
  catch { return {} }
}

function stringValue(value: unknown) { return typeof value === 'string' ? value : '' }

function mapLead(row: StoredLead): QueueItem {
  const details = parseDetails(row.message)
  const context = details.supportContext && typeof details.supportContext === 'object'
    ? details.supportContext as Record<string, unknown>
    : {}
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    status: row.status || 'new',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    subject: stringValue(details.necesidadPrincipal) || 'Soporte operativo',
    location: stringValue(details.ubicacion) || 'Huilo Huilo',
    urgency: stringValue(details.urgencia),
    owner: stringValue(details.crmOwner),
    firstResponseAt: stringValue(details.crmFirstResponseAt),
    itemLabel: stringValue(context.itemLabel),
  }
}

function hoursSince(value: string) {
  return Math.max(0, (Date.now() - new Date(value).getTime()) / 3_600_000)
}

function slaState(item: QueueItem): SlaState {
  if (item.firstResponseAt || item.status !== 'new') return 'handled'
  const hours = hoursSince(item.createdAt)
  if (hours >= 4) return 'overdue'
  if (hours >= 2) return 'warning'
  return 'ontime'
}

function formatAge(item: QueueItem) {
  if (item.firstResponseAt) {
    const minutes = Math.max(1, Math.round((new Date(item.firstResponseAt).getTime() - new Date(item.createdAt).getTime()) / 60_000))
    if (minutes < 60) return `Atendido en ${minutes} min`
    return `Atendido en ${(minutes / 60).toFixed(1)} h`
  }
  const hours = hoursSince(item.createdAt)
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min esperando`
  return `${hours.toFixed(1)} h esperando`
}

const slaStyles: Record<SlaState, string> = {
  overdue: 'border-red-300/30 bg-red-500/10 text-red-100',
  warning: 'border-amber-300/30 bg-amber-500/10 text-amber-100',
  ontime: 'border-cyan-300/25 bg-cyan-500/10 text-cyan-100',
  handled: 'border-emerald-300/25 bg-emerald-500/10 text-emerald-100',
}

const slaLabels: Record<SlaState, string> = {
  overdue: 'SLA vencido', warning: 'Por vencer', ontime: 'En plazo', handled: 'Atendido',
}

export default function SupportQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [currentUser, setCurrentUser] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [slaFilter, setSlaFilter] = useState<SlaFilter>('all')
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine' | 'unassigned'>('all')
  const [savingId, setSavingId] = useState('')
  const [ownerDrafts, setOwnerDrafts] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [leadsResponse, authResponse] = await Promise.all([
        fetch('/api/leads', { cache: 'no-store' }),
        fetch('/api/auth/me', { cache: 'no-store' }),
      ])
      const leadsResult = await leadsResponse.json().catch(() => null)
      const authResult = await authResponse.json().catch(() => null)
      if (!leadsResponse.ok || !leadsResult?.success) throw new Error(leadsResult?.error || 'No fue posible cargar la cola.')
      const user = authResult?.data?.user as AuthUser | undefined
      setCurrentUser(user?.email || user?.id || '')
      const mapped = (leadsResult.data as StoredLead[]).filter((lead) => lead.source === 'support_huilo_huilo').map(mapLead)
      setItems(mapped)
      setOwnerDrafts(Object.fromEntries(mapped.map((item) => [item.id, item.owner])))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible cargar la cola.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const priority: Record<SlaState, number> = { overdue: 0, warning: 1, ontime: 2, handled: 3 }
    return items
      .filter((item) => {
        const state = slaState(item)
        const searchMatch = !normalized || [item.name, item.email, item.subject, item.location, item.itemLabel, item.owner].some((value) => value.toLowerCase().includes(normalized))
        const slaMatch = slaFilter === 'all' || state === slaFilter
        const ownerMatch = ownerFilter === 'all' || (ownerFilter === 'mine' ? item.owner === currentUser : !item.owner)
        return searchMatch && slaMatch && ownerMatch
      })
      .sort((a, b) => {
        const stateDifference = priority[slaState(a)] - priority[slaState(b)]
        if (stateDifference !== 0) return stateDifference
        if (a.urgency === 'critica' && b.urgency !== 'critica') return -1
        if (b.urgency === 'critica' && a.urgency !== 'critica') return 1
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
  }, [items, query, slaFilter, ownerFilter, currentUser])

  const assign = async (item: QueueItem, assignToMe = false) => {
    setSavingId(item.id)
    setError('')
    try {
      const response = await fetch('/api/leads/assignment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: item.id, owner: ownerDrafts[item.id] || null, assignToMe }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible asignar la solicitud.')
      const owner = String(result.owner || '')
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, owner, updatedAt: new Date().toISOString() } : entry))
      setOwnerDrafts((current) => ({ ...current, [item.id]: owner }))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible asignar la solicitud.')
    } finally {
      setSavingId('')
    }
  }

  const overdue = items.filter((item) => slaState(item) === 'overdue').length
  const warning = items.filter((item) => slaState(item) === 'warning').length
  const unassigned = items.filter((item) => !item.owner && slaState(item) !== 'handled').length
  const mine = items.filter((item) => item.owner === currentUser && slaState(item) !== 'handled').length

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Operación de soporte</p><h1 className="mt-2 text-3xl font-light text-white">Cola de atención</h1><p className="mt-2 max-w-3xl text-white/55">Solicitudes ordenadas por vencimiento de SLA, urgencia y antigüedad.</p></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="SLA vencido" value={String(overdue)} critical={overdue > 0} /><Metric label="Por vencer" value={String(warning)} /><Metric label="Sin asignar" value={String(unassigned)} /><Metric label="Mis casos" value={String(mine)} /></div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por persona, ubicación, cámara, alerta o responsable..." className="w-full rounded-[5px] bg-white/10 py-3 pl-11 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]" /></div>
        <select value={slaFilter} onChange={(event) => setSlaFilter(event.target.value as SlaFilter)} className="rounded-[5px] bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"><option value="all" className="bg-[#123A5A]">Todos los SLA</option><option value="overdue" className="bg-[#123A5A]">SLA vencido</option><option value="warning" className="bg-[#123A5A]">Por vencer</option><option value="ontime" className="bg-[#123A5A]">En plazo</option><option value="handled" className="bg-[#123A5A]">Atendidos</option></select>
        <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value as 'all' | 'mine' | 'unassigned')} className="rounded-[5px] bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"><option value="all" className="bg-[#123A5A]">Todos los responsables</option><option value="mine" className="bg-[#123A5A]">Mis casos</option><option value="unassigned" className="bg-[#123A5A]">Sin asignar</option></select>
      </div>

      {error && <p className="rounded-[5px] border border-red-300/25 bg-red-500/10 p-4 text-sm text-red-100">{error}</p>}

      {loading ? <div className="flex min-h-64 items-center justify-center text-white/55"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Cargando cola...</div> : visible.length === 0 ? <div className="glass-card p-10 text-center text-white/50">No hay solicitudes para este filtro.</div> : <div className="space-y-3">{visible.map((item) => {
        const state = slaState(item)
        const StateIcon = state === 'overdue' || state === 'warning' ? AlertTriangle : state === 'handled' ? CheckCircle2 : Clock3
        return <article key={item.id} className="glass-card p-5"><div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr_0.9fr] xl:items-center">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-[5px] border px-2.5 py-1 text-xs ${slaStyles[state]}`}><StateIcon className="h-3.5 w-3.5" />{slaLabels[state]}</span>{item.urgency === 'critica' && <span className="rounded-[5px] border border-red-300/25 bg-red-500/10 px-2.5 py-1 text-xs text-red-100">Problema activo</span>}</div><h2 className="mt-3 truncate text-lg text-white">{item.name}</h2><p className="mt-1 text-sm text-white/60">{item.subject} · {item.location}</p>{item.itemLabel && <p className="mt-1 truncate text-xs text-[#9DD2F2]">{item.itemLabel}</p>}<p className="mt-2 text-xs text-white/40">{item.email}{item.phone ? ` · ${item.phone}` : ''}</p></div>
          <div><p className="text-xs uppercase tracking-[0.14em] text-white/40">Tiempo</p><p className="mt-2 text-sm text-white/80">{formatAge(item)}</p><p className="mt-1 text-xs text-white/35">Creado {new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.createdAt))}</p></div>
          <div><p className="mb-2 text-xs uppercase tracking-[0.14em] text-white/40">Responsable</p><div className="flex gap-2"><input value={ownerDrafts[item.id] || ''} onChange={(event) => setOwnerDrafts((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="email o nombre" className="min-w-0 flex-1 rounded-[5px] border border-white/10 bg-[#0B1D30] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]" /><button type="button" onClick={() => void assign(item)} disabled={savingId === item.id} className="rounded-[5px] border border-white/10 bg-white/5 px-3 text-white/65 hover:bg-white/10 hover:text-white disabled:opacity-50" aria-label="Guardar responsable">{savingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}</button></div><button type="button" onClick={() => void assign(item, true)} disabled={savingId === item.id || !currentUser} className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#9DD2F2] hover:text-white disabled:opacity-40"><UserRound className="h-3.5 w-3.5" />Asignarme</button></div>
        </div></article>
      })}</div>}
    </div>
  )
}

function Metric({ label, value, critical = false }: { label: string; value: string; critical?: boolean }) {
  return <div className={`rounded-[5px] border px-4 py-3 ${critical ? 'border-red-300/25 bg-red-500/10' : 'border-white/10 bg-white/5'}`}><p className="text-xs uppercase tracking-[0.14em] text-white/45">{label}</p><p className="mt-1 text-2xl font-light text-white">{value}</p></div>
}

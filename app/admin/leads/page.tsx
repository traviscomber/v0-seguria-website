'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, Eye, FileText, History, Loader2, Mail, MapPin, Paperclip, Phone, Search, UserRound, X } from 'lucide-react'
import type { Lead, LeadStatus } from '@/lib/types'

type ApiLeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost'
type SupportContext = { origin?: string; section?: string; kind?: string; propertyId?: string; itemId?: string; itemLabel?: string; returnPath?: string }
type CrmActivity = { type?: 'created' | 'status_changed' | 'notes_updated'; at?: string; by?: string; fromStatus?: string; toStatus?: string }
type AdminLead = Lead & {
  evidenceCount: number
  source: string
  supportContext?: SupportContext
  crmActivityLog: CrmActivity[]
  crmFirstResponseAt?: string
  crmOwner?: string
}

type StoredLead = {
  id: string
  name: string
  email: string
  phone: string | null
  property_type: string | null
  message: string | null
  source: string | null
  status: string | null
  created_at: string
  updated_at: string
}

type LeadEvidence = {
  name?: string
  type?: string
  size?: number
  path?: string
  signedUrl?: string | null
  retentionUntil?: string
}

type EvidenceAccess = { fileName?: string; path?: string; openedAt?: string; openedBy?: string }

type LeadEvidenceResponse = {
  id: string
  retentionDays?: number
  retentionProcessedAt?: string | null
  supportContext?: SupportContext
  evidenceAccessLog?: EvidenceAccess[]
  evidence: LeadEvidence[]
}

type SlaState = { level: 'ok' | 'warning' | 'overdue' | 'responded'; label: string; detail: string }

const apiToUiStatus: Record<ApiLeadStatus, LeadStatus> = {
  new: 'nuevo', contacted: 'contactado', qualified: 'diagnostico', proposal_sent: 'propuesta', won: 'ganado', lost: 'perdido',
}
const uiToApiStatus: Record<LeadStatus, ApiLeadStatus> = {
  nuevo: 'new', contactado: 'contacted', diagnostico: 'qualified', propuesta: 'proposal_sent', ganado: 'won', perdido: 'lost',
}
const statusLabels: Record<LeadStatus, string> = {
  nuevo: 'Nuevo', contactado: 'Contactado', diagnostico: 'Diagnostico', propuesta: 'Propuesta', ganado: 'Ganado', perdido: 'Perdido',
}
const apiStatusLabels: Record<string, string> = {
  new: 'Nuevo', contacted: 'Contactado', qualified: 'Diagnóstico', proposal_sent: 'Propuesta', won: 'Ganado', lost: 'Perdido',
}
const statusStyles: Record<LeadStatus, string> = {
  nuevo: 'bg-[#4DA3D9]/18 text-[#9DD2F2] border-[#4DA3D9]/25',
  contactado: 'bg-amber-500/15 text-amber-200 border-amber-400/25',
  diagnostico: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/25',
  propuesta: 'bg-blue-500/15 text-blue-200 border-blue-400/25',
  ganado: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/25',
  perdido: 'bg-red-500/15 text-red-200 border-red-400/25',
}
const orderedStatuses: LeadStatus[] = ['nuevo', 'contactado', 'diagnostico', 'propuesta', 'ganado', 'perdido']
const urgencyLabels: Record<string, string> = { normal: 'Evaluacion', pronto: 'Avanzar pronto', critica: 'Problema activo' }

function parseDetails(message: string | null): Record<string, unknown> {
  try { return message ? JSON.parse(message) as Record<string, unknown> : {} }
  catch { return { mensaje: message || '' } }
}
function stringValue(value: unknown) { return typeof value === 'string' ? value : '' }
function contextKindLabel(context?: SupportContext) {
  if (context?.kind === 'camera') return 'Cámara'
  if (context?.kind === 'incident') return 'Incidente'
  if (context?.kind === 'alert') return 'Alerta'
  return context?.section || context?.origin || 'Portal'
}
function formatDuration(milliseconds: number) {
  const minutes = Math.max(0, Math.floor(milliseconds / 60000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (hours < 24) return remaining ? `${hours} h ${remaining} min` : `${hours} h`
  const days = Math.floor(hours / 24)
  return `${days} d ${hours % 24} h`
}
function getSlaState(lead: AdminLead): SlaState {
  if (lead.source !== 'support_huilo_huilo') return { level: 'responded', label: 'Comercial', detail: 'Sin SLA operativo' }
  if (lead.crmFirstResponseAt || lead.estado !== 'nuevo') {
    const responseAt = lead.crmFirstResponseAt ? new Date(lead.crmFirstResponseAt).getTime() : lead.fechaActualizacion.getTime()
    return { level: 'responded', label: 'Atendido', detail: `Primera respuesta en ${formatDuration(responseAt - lead.fechaCreacion.getTime())}` }
  }
  const age = Date.now() - lead.fechaCreacion.getTime()
  if (age > 4 * 60 * 60 * 1000) return { level: 'overdue', label: 'SLA vencido', detail: `${formatDuration(age)} sin respuesta` }
  if (age > 2 * 60 * 60 * 1000) return { level: 'warning', label: 'Por vencer', detail: `${formatDuration(age)} sin respuesta` }
  return { level: 'ok', label: 'En plazo', detail: `${formatDuration(age)} desde ingreso` }
}

function mapStoredLead(row: StoredLead): AdminLead {
  const details = parseDetails(row.message)
  const apiStatus = (row.status || 'new') as ApiLeadStatus
  const evidenceCount = Array.isArray(details.evidence) ? details.evidence.length : 0
  const supportContext = details.supportContext && typeof details.supportContext === 'object' ? details.supportContext as SupportContext : undefined
  const crmActivityLog = Array.isArray(details.crmActivityLog) ? details.crmActivityLog as CrmActivity[] : []
  return {
    id: row.id,
    nombre: row.name,
    email: row.email,
    telefono: row.phone || '',
    tipoProyecto: row.property_type === 'campo' ? 'campo' : 'propiedad',
    ubicacion: stringValue(details.ubicacion),
    tamanoAproximado: stringValue(details.tamanoAproximado),
    necesidadPrincipal: stringValue(details.necesidadPrincipal),
    tieneCamaras: stringValue(details.tieneCamaras),
    tieneInternet: stringValue(details.tieneInternet),
    cantidadSitios: stringValue(details.cantidadSitios),
    urgencia: stringValue(details.urgencia),
    tipoServicio: stringValue(details.tipoServicio),
    mensaje: stringValue(details.mensaje),
    notas: stringValue(details.crmNotes),
    estado: apiToUiStatus[apiStatus] || 'nuevo',
    origen: row.source === 'contact_page' ? 'web' : 'otro',
    fechaCreacion: new Date(row.created_at),
    fechaActualizacion: new Date(row.updated_at),
    evidenceCount,
    source: row.source || '',
    supportContext,
    crmActivityLog,
    crmFirstResponseAt: stringValue(details.crmFirstResponseAt),
    crmOwner: stringValue(details.crmOwner || details.crmUpdatedBy),
  }
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(value)
}
function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
function formatBytes(bytes = 0) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<AdminLead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'todos'>('todos')
  const [selectedLead, setSelectedLead] = useState<AdminLead | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>('nuevo')
  const [crmNotes, setCrmNotes] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [evidenceState, setEvidenceState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [leadEvidence, setLeadEvidence] = useState<LeadEvidenceResponse | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/leads', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json().catch(() => null)
        if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible cargar los contactos.')
        if (active) setLeads((result.data as StoredLead[]).map(mapStoredLead))
      })
      .catch((error) => active && setLoadError(error instanceof Error ? error.message : 'No fue posible cargar los contactos.'))
      .finally(() => active && setIsLoading(false))
    return () => { active = false }
  }, [])

  const filteredLeads = leads.filter((lead) => {
    const query = searchTerm.toLowerCase().trim()
    const context = lead.supportContext
    const values = [lead.nombre, lead.email, lead.telefono, lead.ubicacion, context?.itemLabel || '', context?.propertyId || '', context?.itemId || '', context?.section || '', lead.crmOwner || '']
    const matchesSearch = !query || values.some((value) => value.toLowerCase().includes(query))
    return matchesSearch && (statusFilter === 'todos' || lead.estado === statusFilter)
  })

  const openLead = async (lead: AdminLead) => {
    setSelectedLead(lead)
    setSelectedStatus(lead.estado)
    setCrmNotes(lead.notas || '')
    setSaveState('idle')
    setSaveError(null)
    setLeadEvidence(null)
    setEvidenceState(lead.evidenceCount > 0 ? 'loading' : 'ready')
    if (lead.evidenceCount === 0) return
    try {
      const response = await fetch(`/api/leads/evidence?leadId=${encodeURIComponent(lead.id)}`, { cache: 'no-store' })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible cargar la evidencia.')
      setLeadEvidence(result.data as LeadEvidenceResponse)
      setEvidenceState('ready')
    } catch {
      setEvidenceState('error')
    }
  }

  const updateSelectedLead = async () => {
    if (!selectedLead) return
    setSaveState('saving')
    setSaveError(null)
    try {
      const response = await fetch('/api/leads', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedLead.id, status: uiToApiStatus[selectedStatus], crmNotes }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible actualizar el lead.')
      const updated = mapStoredLead(result.data as StoredLead)
      setLeads((current) => current.map((lead) => lead.id === updated.id ? updated : lead))
      setSelectedLead(updated)
      setSelectedStatus(updated.estado)
      setCrmNotes(updated.notas || '')
      setSaveState('saved')
      window.setTimeout(() => setSaveState('idle'), 1800)
    } catch (error) {
      setSaveState('idle')
      setSaveError(error instanceof Error ? error.message : 'No fue posible actualizar el lead.')
    }
  }

  const pipelineStats = orderedStatuses.map((status) => ({ status, label: statusLabels[status], count: leads.filter((lead) => lead.estado === status).length }))
  const urgentLeads = leads.filter((lead) => lead.urgencia === 'critica').length
  const evidenceLeads = leads.filter((lead) => lead.evidenceCount > 0).length
  const overdueLeads = leads.filter((lead) => getSlaState(lead).level === 'overdue').length

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div><p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">CRM interno</p><h1 className="mt-2 text-3xl font-light text-white">Leads y soporte</h1><p className="mt-2 max-w-3xl text-white/55">Contactos comerciales y solicitudes operativas, con contexto, seguimiento, SLA y evidencia privada.</p></div>
        <div className="grid gap-3 sm:grid-cols-4"><SummaryPill label="Cartera" value={String(leads.length)} /><SummaryPill label="Problema activo" value={String(urgentLeads)} tone={urgentLeads > 0 ? 'critical' : 'normal'} /><SummaryPill label="SLA vencido" value={String(overdueLeads)} tone={overdueLeads > 0 ? 'critical' : 'normal'} /><SummaryPill label="Con evidencia" value={String(evidenceLeads)} /></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{pipelineStats.map(({ status, label, count }) => <button key={status} onClick={() => setStatusFilter(statusFilter === status ? 'todos' : status)} className={`rounded-[5px] border p-4 text-left transition-colors ${statusFilter === status ? statusStyles[status] : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/8'}`}><p className="text-2xl font-light">{count}</p><p className="mt-1 text-xs uppercase tracking-[0.16em] opacity-75">{label}</p></button>)}</div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" strokeWidth={1.5} /><input type="text" placeholder="Buscar por contacto, cámara, alerta, propiedad, responsable o identificador..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full rounded-[5px] bg-white/10 py-3 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]" /></div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as LeadStatus | 'todos')} className="rounded-[5px] bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"><option value="todos" className="bg-[#123A5A]">Todos los estados</option>{orderedStatuses.map((status) => <option key={status} value={status} className="bg-[#123A5A]">{statusLabels[status]}</option>)}</select>
      </div>

      <div className="glass-card overflow-hidden">
        {loadError && <p className="border-b border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">{loadError}</p>}
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-white/10 text-left text-sm text-white/50"><th className="p-4 font-normal">Contacto</th><th className="p-4 font-normal">Proyecto</th><th className="p-4 font-normal">Prioridad</th><th className="p-4 font-normal">Necesidad</th><th className="p-4 font-normal">Estado</th><th className="p-4 font-normal">Actualizado</th><th className="p-4 text-right font-normal">Accion</th></tr></thead>
          <tbody>{isLoading ? <tr><td colSpan={7} className="p-10 text-center text-white/50">Cargando contactos...</td></tr> : filteredLeads.length === 0 ? <tr><td colSpan={7} className="p-10 text-center text-white/50">No hay leads para este filtro.</td></tr> : filteredLeads.map((lead) => {
            const sla = getSlaState(lead)
            return <tr key={lead.id} className="border-b border-white/5 transition-colors hover:bg-white/5">
              <td className="p-4"><p className="text-[15px] text-white">{lead.nombre}</p><div className="mt-2 flex flex-wrap gap-3 text-xs text-white/45"><a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 hover:text-[#9DD2F2]"><Mail className="h-3.5 w-3.5" />{lead.email}</a><a href={`tel:${lead.telefono}`} className="inline-flex items-center gap-1 hover:text-[#9DD2F2]"><Phone className="h-3.5 w-3.5" />{lead.telefono || 'Sin telefono'}</a></div></td>
              <td className="p-4 text-sm text-white/70"><p>{lead.tipoProyecto === 'campo' ? 'Campo inteligente' : 'Propiedad inteligente'}</p><p className="mt-1 text-xs text-white/40">{lead.ubicacion || 'Ubicacion pendiente'}</p>{lead.supportContext?.itemLabel && <p className="mt-1 line-clamp-1 text-xs text-[#9DD2F2]">{contextKindLabel(lead.supportContext)} · {lead.supportContext.itemLabel}</p>}</td>
              <td className="p-4 text-sm text-white/65"><p className={lead.urgencia === 'critica' ? 'text-red-200' : 'text-white/75'}>{urgencyLabels[lead.urgencia || ''] || 'Por ordenar'}</p><SlaBadge state={sla} />{lead.evidenceCount > 0 && <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-200"><Paperclip className="h-3 w-3" />{lead.evidenceCount} adjunto{lead.evidenceCount === 1 ? '' : 's'}</p>}</td>
              <td className="p-4 text-sm text-white/65"><p>{lead.necesidadPrincipal || lead.tipoServicio || 'Por definir'}</p><p className="mt-1 line-clamp-1 text-xs text-white/35">{lead.mensaje || 'Sin mensaje adicional'}</p></td>
              <td className="p-4"><span className={`inline-flex rounded-[5px] border px-2.5 py-1 text-xs ${statusStyles[lead.estado]}`}>{statusLabels[lead.estado]}</span></td>
              <td className="p-4 text-sm text-white/45">{formatDate(lead.fechaActualizacion)}</td>
              <td className="p-4"><div className="flex justify-end"><button onClick={() => openLead(lead)} className="inline-flex items-center gap-2 rounded-[5px] bg-white/8 px-3 py-2 text-sm text-white/65 transition-colors hover:bg-white/12 hover:text-white"><Eye className="h-4 w-4" />Gestionar</button></div></td>
            </tr>})}</tbody></table></div>
      </div>

      {selectedLead && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedLead(null)}>
        <div className="glass-card max-h-[92vh] w-full max-w-5xl overflow-y-auto" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6"><div><p className="text-sm uppercase tracking-[0.18em] text-[#9DD2F2]">Seguimiento</p><h2 className="mt-2 text-2xl font-light text-white">{selectedLead.nombre}</h2><p className="mt-1 text-sm text-white/45">Ingresó {formatDateTime(selectedLead.fechaCreacion)} · actualizado {formatDateTime(selectedLead.fechaActualizacion)}</p></div><button onClick={() => setSelectedLead(null)} className="rounded-[5px] p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Cerrar"><X className="h-5 w-5" /></button></div>
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.88fr]">
            <div className="space-y-5">
              <ContextPanel context={leadEvidence?.supportContext || selectedLead.supportContext} />
              <InfoBlock label="Email" value={selectedLead.email} /><InfoBlock label="Telefono" value={selectedLead.telefono || 'Sin telefono'} /><InfoBlock label="Tipo de proyecto" value={selectedLead.tipoProyecto === 'campo' ? 'Campo inteligente' : 'Propiedad inteligente'} /><InfoBlock label="Ubicacion" value={selectedLead.ubicacion || 'Pendiente'} /><InfoBlock label="Urgencia" value={urgencyLabels[selectedLead.urgencia || ''] || 'Pendiente'} /><InfoBlock label="Necesidad" value={selectedLead.necesidadPrincipal || selectedLead.tipoServicio || 'Por definir'} />
              <div><p className="text-sm text-white/45">Mensaje</p><p className="mt-2 rounded-[5px] bg-white/5 p-4 text-sm leading-7 text-white/70">{selectedLead.mensaje || 'Sin mensaje adicional.'}</p></div>
              <EvidencePanel leadId={selectedLead.id} state={evidenceState} data={leadEvidence} count={selectedLead.evidenceCount} />
            </div>
            <div className="space-y-5">
              <section className="rounded-[5px] border border-white/10 bg-white/5 p-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><OperationalMetric icon={Clock3} label="Atención" value={getSlaState(selectedLead).label} detail={getSlaState(selectedLead).detail} critical={getSlaState(selectedLead).level === 'overdue'} /><OperationalMetric icon={UserRound} label="Responsable" value={selectedLead.crmOwner || 'Sin asignar'} detail={selectedLead.crmFirstResponseAt ? `Respondió ${formatDateTime(selectedLead.crmFirstResponseAt)}` : 'Aún sin primera respuesta'} /></div>
                <label className="mt-5 block space-y-2"><span className="block text-sm text-white/55">Estado</span><select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as LeadStatus)} className="w-full rounded-[5px] border border-white/10 bg-[#0B1D30] px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]">{orderedStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
                <label className="mt-5 block space-y-2"><span className="block text-sm text-white/55">Nota interna</span><textarea value={crmNotes} onChange={(event) => setCrmNotes(event.target.value)} rows={7} placeholder="Proximo paso, contexto del cliente o acuerdo..." className="w-full resize-none rounded-[5px] border border-white/10 bg-[#0B1D30] px-4 py-3 text-sm leading-7 text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]" /></label>
                {saveError && <p className="mt-4 rounded-[5px] border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100">{saveError}</p>}
                <button onClick={updateSelectedLead} disabled={saveState === 'saving'} className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-[15px] disabled:opacity-60">{saveState === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{saveState === 'saved' ? 'Guardado' : saveState === 'saving' ? 'Guardando...' : 'Guardar seguimiento'}</button>
              </section>
              <ActivityTimeline activities={selectedLead.crmActivityLog} />
            </div>
          </div>
        </div>
      </div>}
    </div>
  )
}

function SlaBadge({ state }: { state: SlaState }) {
  const classes = state.level === 'overdue' ? 'text-red-200' : state.level === 'warning' ? 'text-amber-200' : state.level === 'ok' ? 'text-emerald-200' : 'text-white/45'
  return <p className={`mt-1 inline-flex items-center gap-1 text-xs ${classes}`}>{state.level === 'overdue' ? <AlertTriangle className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}{state.label}</p>
}

function ContextPanel({ context }: { context?: SupportContext }) {
  if (!context || !(context.itemLabel || context.section || context.propertyId)) return null
  return <section className="rounded-[5px] border border-[#4DA3D9]/25 bg-[#4DA3D9]/8 p-4"><div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" /><div className="min-w-0"><p className="text-xs uppercase tracking-[0.14em] text-[#9DD2F2]">Origen contextual · {contextKindLabel(context)}</p><p className="mt-2 text-sm font-medium text-white/90">{context.itemLabel || context.section || 'Portal Huilo Huilo'}</p><p className="mt-1 break-all text-xs leading-5 text-white/50">{context.propertyId ? `Propiedad: ${context.propertyId}` : ''}{context.itemId ? `${context.propertyId ? ' · ' : ''}Elemento: ${context.itemId}` : ''}</p>{context.returnPath?.startsWith('/app') && <a href={context.returnPath} className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#9DD2F2] hover:text-white">Abrir origen en el portal<ExternalLink className="h-3.5 w-3.5" /></a>}</div></div></section>
}

function EvidencePanel({ leadId, state, data, count }: { leadId: string; state: 'idle' | 'loading' | 'ready' | 'error'; data: LeadEvidenceResponse | null; count: number }) {
  const [openingPath, setOpeningPath] = useState('')
  const [accessLog, setAccessLog] = useState<EvidenceAccess[]>([])
  const [accessError, setAccessError] = useState('')

  useEffect(() => { setAccessLog(data?.evidenceAccessLog || []) }, [data?.evidenceAccessLog])
  if (count === 0) return null

  const openEvidence = async (item: LeadEvidence) => {
    if (!item.signedUrl || !item.path || openingPath) return
    const popup = window.open('', '_blank', 'noopener,noreferrer')
    setOpeningPath(item.path)
    setAccessError('')
    try {
      const response = await fetch('/api/leads/evidence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId, fileName: item.name || 'Archivo', path: item.path }) })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible registrar el acceso.')
      setAccessLog((current) => [result.event as EvidenceAccess, ...current].slice(0, 50))
      if (popup) popup.location.href = item.signedUrl
      else window.location.href = item.signedUrl
    } catch (error) {
      popup?.close()
      setAccessError(error instanceof Error ? error.message : 'No fue posible abrir la evidencia.')
    } finally { setOpeningPath('') }
  }

  return <section><div className="flex items-center justify-between"><p className="text-sm text-white/45">Evidencia privada</p><span className="text-xs text-white/35">URL válida 15 min</span></div>
    {state === 'loading' && <div className="mt-2 flex items-center gap-2 rounded-[5px] bg-white/5 p-4 text-sm text-white/55"><Loader2 className="h-4 w-4 animate-spin" />Generando acceso seguro...</div>}
    {state === 'error' && <p className="mt-2 rounded-[5px] bg-red-500/10 p-4 text-sm text-red-100">No fue posible generar el acceso temporal.</p>}
    {accessError && <p className="mt-2 rounded-[5px] bg-red-500/10 p-3 text-sm text-red-100">{accessError}</p>}
    {state === 'ready' && <div className="mt-2 grid gap-3 sm:grid-cols-2">{(data?.evidence || []).map((item, index) => <button type="button" key={`${item.path || item.name}-${index}`} onClick={() => void openEvidence(item)} disabled={!item.signedUrl || !item.path || Boolean(openingPath)} className={`overflow-hidden rounded-[5px] border border-white/10 bg-white/5 text-left transition ${item.signedUrl ? 'hover:border-[#4DA3D9]/50 hover:bg-white/8' : 'opacity-45'} disabled:cursor-wait`}>
      <div className="flex h-28 items-center justify-center bg-black/20">{item.type?.startsWith('image/') && item.signedUrl ? <img src={item.signedUrl} alt={`Evidencia ${item.name || index + 1}`} className="h-full w-full object-cover" /> : <FileText className="h-7 w-7 text-[#9DD2F2]" />}</div>
      <div className="flex items-center gap-3 p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm text-white/85">{item.name || 'Archivo'}</p><p className="mt-1 text-xs text-white/40">{formatBytes(item.size)}</p></div>{openingPath === item.path ? <Loader2 className="h-4 w-4 animate-spin text-[#9DD2F2]" /> : <ExternalLink className="h-4 w-4 text-white/40" />}</div>
    </button>)}</div>}
    {accessLog.length > 0 && <div className="mt-4 rounded-[5px] border border-white/10 bg-black/10 p-4"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/45"><History className="h-3.5 w-3.5" />Historial de acceso · {accessLog.length}</div><ul className="mt-3 space-y-2">{accessLog.slice(0, 5).map((entry, index) => <li key={`${entry.openedAt}-${index}`} className="flex flex-col gap-1 border-t border-white/5 pt-2 first:border-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between"><span className="truncate text-xs text-white/65">{entry.fileName || 'Archivo'} · {entry.openedBy || 'Administrador'}</span><span className="shrink-0 text-[11px] text-white/35">{entry.openedAt ? formatDateTime(entry.openedAt) : ''}</span></li>)}</ul></div>}
  </section>
}

function ActivityTimeline({ activities }: { activities: CrmActivity[] }) {
  const ordered = [...activities].reverse().slice(0, 12)
  return <section className="rounded-[5px] border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/45"><History className="h-3.5 w-3.5" />Actividad CRM · {activities.length}</div>{ordered.length === 0 ? <p className="mt-4 text-sm text-white/40">La bitácora comenzará con el próximo cambio.</p> : <ol className="mt-4 space-y-4">{ordered.map((activity, index) => <li key={`${activity.at}-${index}`} className="relative border-l border-white/10 pl-4"><span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-[#9DD2F2]" /><p className="text-sm text-white/75">{activity.type === 'created' ? 'Solicitud creada' : activity.type === 'status_changed' ? `Estado: ${apiStatusLabels[activity.fromStatus || ''] || activity.fromStatus || '—'} → ${apiStatusLabels[activity.toStatus || ''] || activity.toStatus || '—'}` : 'Nota interna actualizada'}</p><p className="mt-1 text-xs text-white/35">{activity.by || 'Sistema'}{activity.at ? ` · ${formatDateTime(activity.at)}` : ''}</p></li>)}</ol>}</section>
}

function OperationalMetric({ icon: Icon, label, value, detail, critical = false }: { icon: typeof Clock3; label: string; value: string; detail: string; critical?: boolean }) {
  return <div className={`rounded-[5px] border p-3 ${critical ? 'border-red-300/25 bg-red-500/10' : 'border-white/10 bg-black/10'}`}><div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-white/40"><Icon className={`h-3.5 w-3.5 ${critical ? 'text-red-200' : 'text-[#9DD2F2]'}`} />{label}</div><p className={`mt-2 truncate text-sm ${critical ? 'text-red-100' : 'text-white/85'}`}>{value}</p><p className="mt-1 text-xs text-white/40">{detail}</p></div>
}

function InfoBlock({ label, value }: { label: string; value: string }) { return <div><p className="text-sm text-white/45">{label}</p><p className="mt-1 text-white">{value}</p></div> }
function SummaryPill({ label, value, tone = 'normal' }: { label: string; value: string; tone?: 'normal' | 'critical' }) { return <div className={`rounded-[5px] border px-4 py-3 text-sm ${tone === 'critical' ? 'border-red-300/25 bg-red-500/10 text-red-100' : 'border-white/10 bg-white/5 text-white/55'}`}><p className="text-xs uppercase tracking-[0.16em] opacity-70">{label}</p><p className="mt-1 text-2xl font-light text-white">{value}</p></div> }

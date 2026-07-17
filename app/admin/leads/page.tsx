'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Eye, Loader2, Mail, Phone, Search, X } from 'lucide-react'
import type { Lead, LeadStatus } from '@/lib/types'

type ApiLeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost'

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

const apiToUiStatus: Record<ApiLeadStatus, LeadStatus> = {
  new: 'nuevo',
  contacted: 'contactado',
  qualified: 'diagnostico',
  proposal_sent: 'propuesta',
  won: 'ganado',
  lost: 'perdido',
}

const uiToApiStatus: Record<LeadStatus, ApiLeadStatus> = {
  nuevo: 'new',
  contactado: 'contacted',
  diagnostico: 'qualified',
  propuesta: 'proposal_sent',
  ganado: 'won',
  perdido: 'lost',
}

const statusLabels: Record<LeadStatus, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  diagnostico: 'Diagnostico',
  propuesta: 'Propuesta',
  ganado: 'Ganado',
  perdido: 'Perdido',
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

const urgencyLabels: Record<string, string> = {
  normal: 'Evaluacion',
  pronto: 'Avanzar pronto',
  critica: 'Problema activo',
}

const siteCountLabels: Record<string, string> = {
  uno: '1 sitio',
  dos_a_cinco: '2 a 5 sitios',
  mas_de_cinco: 'Mas de 5 sitios',
}

function parseDetails(message: string | null) {
  try {
    return message ? JSON.parse(message) as Record<string, string> : {}
  } catch {
    return { mensaje: message || '' }
  }
}

function mapStoredLead(row: StoredLead): Lead {
  const details = parseDetails(row.message)
  const apiStatus = (row.status || 'new') as ApiLeadStatus

  return {
    id: row.id,
    nombre: row.name,
    email: row.email,
    telefono: row.phone || '',
    tipoProyecto: row.property_type === 'campo' ? 'campo' : 'propiedad',
    ubicacion: details.ubicacion || '',
    tamanoAproximado: details.tamanoAproximado,
    necesidadPrincipal: details.necesidadPrincipal,
    tieneCamaras: details.tieneCamaras,
    tieneInternet: details.tieneInternet,
    cantidadSitios: details.cantidadSitios,
    urgencia: details.urgencia,
    tipoServicio: details.tipoServicio,
    mensaje: details.mensaje,
    notas: details.crmNotes || '',
    estado: apiToUiStatus[apiStatus] || 'nuevo',
    origen: row.source === 'contact_page' ? 'web' : 'otro',
    fechaCreacion: new Date(row.created_at),
    fechaActualizacion: new Date(row.updated_at),
  }
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value)
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'todos'>('todos')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>('nuevo')
  const [crmNotes, setCrmNotes] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

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

    return () => {
      active = false
    }
  }, [])

  const filteredLeads = leads.filter((lead) => {
    const query = searchTerm.toLowerCase().trim()
    const matchesSearch = !query ||
      lead.nombre.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.telefono.toLowerCase().includes(query) ||
      lead.ubicacion.toLowerCase().includes(query)
    const matchesStatus = statusFilter === 'todos' || lead.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const openLead = (lead: Lead) => {
    setSelectedLead(lead)
    setSelectedStatus(lead.estado)
    setCrmNotes(lead.notas || '')
    setSaveState('idle')
    setSaveError(null)
  }

  const updateSelectedLead = async () => {
    if (!selectedLead) return

    setSaveState('saving')
    setSaveError(null)

    try {
      const response = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLead.id,
          status: uiToApiStatus[selectedStatus],
          crmNotes,
        }),
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

  const pipelineStats = orderedStatuses.map((status) => ({
    status,
    label: statusLabels[status],
    count: leads.filter((lead) => lead.estado === status).length,
  }))

  const urgentLeads = leads.filter((lead) => lead.urgencia === 'critica').length
  const multiSiteLeads = leads.filter((lead) => lead.cantidadSitios === 'dos_a_cinco' || lead.cantidadSitios === 'mas_de_cinco').length

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">CRM interno</p>
          <h1 className="mt-2 text-3xl font-light text-white">Leads comerciales</h1>
          <p className="mt-2 max-w-3xl text-white/55">
            Contactos capturados desde el sitio, con seguimiento real en base de datos y estados para convertirlos en proyecto.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryPill label="Cartera" value={String(leads.length)} />
          <SummaryPill label="Problema activo" value={String(urgentLeads)} tone={urgentLeads > 0 ? 'critical' : 'normal'} />
          <SummaryPill label="Multi sitio" value={String(multiSiteLeads)} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {pipelineStats.map(({ status, label, count }) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? 'todos' : status)}
            className={`rounded-[5px] border p-4 text-left transition-colors ${
              statusFilter === status ? statusStyles[status] : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/8'
            }`}
          >
            <p className="text-2xl font-light">{count}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] opacity-75">{label}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar por nombre, email, telefono o ubicacion..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-[5px] bg-white/10 py-3 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as LeadStatus | 'todos')}
          className="rounded-[5px] bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
        >
          <option value="todos" className="bg-[#123A5A]">Todos los estados</option>
          {orderedStatuses.map((status) => (
            <option key={status} value={status} className="bg-[#123A5A]">{statusLabels[status]}</option>
          ))}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        {loadError && <p className="border-b border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">{loadError}</p>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-sm text-white/50">
                <th className="p-4 font-normal">Contacto</th>
                <th className="p-4 font-normal">Proyecto</th>
                <th className="p-4 font-normal">Prioridad</th>
                <th className="p-4 font-normal">Necesidad</th>
                <th className="p-4 font-normal">Estado</th>
                <th className="p-4 font-normal">Actualizado</th>
                <th className="p-4 text-right font-normal">Accion</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-10 text-center text-white/50">Cargando contactos...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={7} className="p-10 text-center text-white/50">No hay leads para este filtro.</td></tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 transition-colors hover:bg-white/5">
                    <td className="p-4">
                      <p className="text-[15px] text-white">{lead.nombre}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/45">
                        <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 hover:text-[#9DD2F2]">
                          <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {lead.email}
                        </a>
                        <a href={`tel:${lead.telefono}`} className="inline-flex items-center gap-1 hover:text-[#9DD2F2]">
                          <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {lead.telefono || 'Sin telefono'}
                        </a>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white/70">
                      <p>{lead.tipoProyecto === 'campo' ? 'Campo inteligente' : 'Propiedad inteligente'}</p>
                      <p className="mt-1 text-xs text-white/40">{lead.ubicacion || 'Ubicacion pendiente'}</p>
                    </td>
                    <td className="p-4 text-sm text-white/65">
                      <p className={lead.urgencia === 'critica' ? 'text-red-200' : 'text-white/75'}>
                        {urgencyLabels[lead.urgencia || ''] || 'Por ordenar'}
                      </p>
                      <p className="mt-1 text-xs text-white/35">{siteCountLabels[lead.cantidadSitios || ''] || 'Sitios por definir'}</p>
                    </td>
                    <td className="p-4 text-sm text-white/65">
                      <p>{lead.necesidadPrincipal || lead.tipoServicio || 'Por definir'}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-white/35">{lead.mensaje || 'Sin mensaje adicional'}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-[5px] border px-2.5 py-1 text-xs ${statusStyles[lead.estado]}`}>
                        {statusLabels[lead.estado]}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-white/45">{formatDate(lead.fechaActualizacion)}</td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => openLead(lead)}
                          className="inline-flex items-center gap-2 rounded-[5px] bg-white/8 px-3 py-2 text-sm text-white/65 transition-colors hover:bg-white/12 hover:text-white"
                        >
                          <Eye className="h-4 w-4" strokeWidth={1.5} />
                          Gestionar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedLead(null)}>
          <div className="glass-card max-h-[92vh] w-full max-w-3xl overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#9DD2F2]">Seguimiento comercial</p>
                <h2 className="mt-2 text-2xl font-light text-white">{selectedLead.nombre}</h2>
                <p className="mt-1 text-sm text-white/45">Actualizado {formatDateTime(selectedLead.fechaActualizacion)}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="rounded-[5px] p-2 text-white/50 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-5">
                <InfoBlock label="Email" value={selectedLead.email} />
                <InfoBlock label="Telefono" value={selectedLead.telefono || 'Sin telefono'} />
                <InfoBlock label="Tipo de proyecto" value={selectedLead.tipoProyecto === 'campo' ? 'Campo inteligente' : 'Propiedad inteligente'} />
                <InfoBlock label="Ubicacion" value={selectedLead.ubicacion || 'Pendiente'} />
                <InfoBlock label="Tamano aproximado" value={selectedLead.tamanoAproximado || 'Pendiente'} />
                <InfoBlock label="Cantidad de sitios" value={siteCountLabels[selectedLead.cantidadSitios || ''] || 'Pendiente'} />
                <InfoBlock label="Urgencia" value={urgencyLabels[selectedLead.urgencia || ''] || 'Pendiente'} />
                <InfoBlock label="Necesidad" value={selectedLead.necesidadPrincipal || selectedLead.tipoServicio || 'Por definir'} />
                <div>
                  <p className="text-sm text-white/45">Mensaje</p>
                  <p className="mt-2 rounded-[5px] bg-white/5 p-4 text-sm leading-7 text-white/70">
                    {selectedLead.mensaje || 'Sin mensaje adicional.'}
                  </p>
                </div>
              </div>

              <div className="rounded-[5px] border border-white/10 bg-white/5 p-5">
                <label className="space-y-2">
                  <span className="block text-sm text-white/55">Estado</span>
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value as LeadStatus)}
                    className="w-full rounded-[5px] border border-white/10 bg-[#0B1D30] px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
                  >
                    {orderedStatuses.map((status) => (
                      <option key={status} value={status}>{statusLabels[status]}</option>
                    ))}
                  </select>
                </label>

                <label className="mt-5 block space-y-2">
                  <span className="block text-sm text-white/55">Nota interna</span>
                  <textarea
                    value={crmNotes}
                    onChange={(event) => setCrmNotes(event.target.value)}
                    rows={7}
                    placeholder="Proximo paso, contexto del cliente o acuerdo comercial..."
                    className="w-full resize-none rounded-[5px] border border-white/10 bg-[#0B1D30] px-4 py-3 text-sm leading-7 text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
                  />
                </label>

                {saveError && <p className="mt-4 rounded-[5px] border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100">{saveError}</p>}

                <button
                  onClick={updateSelectedLead}
                  disabled={saveState === 'saving'}
                  className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-[15px] disabled:opacity-60"
                >
                  {saveState === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />}
                  {saveState === 'saved' ? 'Guardado' : saveState === 'saving' ? 'Guardando...' : 'Guardar seguimiento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-white/45">{label}</p>
      <p className="mt-1 text-white">{value}</p>
    </div>
  )
}

function SummaryPill({
  label,
  value,
  tone = 'normal',
}: {
  label: string
  value: string
  tone?: 'normal' | 'critical'
}) {
  return (
    <div className={`rounded-[5px] border px-4 py-3 text-sm ${
      tone === 'critical'
        ? 'border-red-300/25 bg-red-500/10 text-red-100'
        : 'border-white/10 bg-white/5 text-white/55'
    }`}>
      <p className="text-xs uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-light text-white">{value}</p>
    </div>
  )
}

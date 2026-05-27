'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Phone, Mail } from 'lucide-react'
import { getLeads } from '@/lib/store'
import type { Lead, LeadStatus } from '@/lib/types'

const statusColors: Record<LeadStatus, { bg: string; text: string }> = {
  nuevo: { bg: 'bg-[#4DA3D9]/20', text: 'text-[#4DA3D9]' },
  contactado: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  diagnostico: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  propuesta: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  ganado: { bg: 'bg-green-500/20', text: 'text-green-400' },
  perdido: { bg: 'bg-red-500/20', text: 'text-red-400' },
}

const statusLabels: Record<LeadStatus, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  diagnostico: 'Diagnóstico',
  propuesta: 'Propuesta',
  ganado: 'Ganado',
  perdido: 'Perdido',
}

export default function LeadsPage() {
  const leads = getLeads()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'todos'>('todos')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || lead.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CL', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white">Leads</h1>
          <p className="text-white/60 mt-1">Gestiona tus contactos y oportunidades</p>
        </div>
        <button className="btn-primary px-4 py-2.5 text-[15px] inline-flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Nuevo Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'todos')}
          className="px-4 py-2.5 rounded-[5px] bg-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9] appearance-none min-w-[150px]"
        >
          <option value="todos" className="bg-[#123A5A]">Todos los estados</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value} className="bg-[#123A5A]">{label}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(statusLabels).map(([status, label]) => {
          const count = leads.filter(l => l.estado === status).length
          const colors = statusColors[status as LeadStatus]
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status as LeadStatus)}
              className={`p-3 rounded-[5px] text-center transition-all ${
                statusFilter === status ? colors.bg : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <p className={`text-xl font-light ${statusFilter === status ? colors.text : 'text-white'}`}>
                {count}
              </p>
              <p className={`text-[12px] ${statusFilter === status ? colors.text : 'text-white/50'}`}>
                {label}
              </p>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-white/50 text-sm border-b border-white/10">
                <th className="p-4 font-normal">Nombre</th>
                <th className="p-4 font-normal">Contacto</th>
                <th className="p-4 font-normal">Tipo</th>
                <th className="p-4 font-normal">Ubicación</th>
                <th className="p-4 font-normal">Estado</th>
                <th className="p-4 font-normal">Fecha</th>
                <th className="p-4 font-normal text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/50">
                    No se encontraron leads
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="text-white text-[15px]">{lead.nombre}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <a 
                          href={`mailto:${lead.email}`} 
                          className="text-white/50 hover:text-[#4DA3D9] transition-colors"
                          title={lead.email}
                        >
                          <Mail className="w-4 h-4" strokeWidth={1.5} />
                        </a>
                        <a 
                          href={`tel:${lead.telefono}`} 
                          className="text-white/50 hover:text-[#4DA3D9] transition-colors"
                          title={lead.telefono}
                        >
                          <Phone className="w-4 h-4" strokeWidth={1.5} />
                        </a>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white/70 text-[15px]">
                        {lead.tipoProyecto === 'campo' ? 'Campo' : 'Propiedad'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white/70 text-[15px]">{lead.ubicacion}</span>
                    </td>
                    <td className="p-4">
                      <span className={`
                        inline-block px-2 py-1 rounded-[5px] text-[12px]
                        ${statusColors[lead.estado].bg} ${statusColors[lead.estado].text}
                      `}>
                        {statusLabels[lead.estado]}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white/50 text-[14px]">{formatDate(lead.fechaCreacion)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 rounded-[5px] text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button 
                          className="p-2 rounded-[5px] text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" strokeWidth={1.5} />
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

      {/* Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-light text-white">Detalle del Lead</h2>
              <button 
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-[5px] text-white/50 hover:text-white hover:bg-white/10"
              >
                <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-white/50 text-sm mb-1">Nombre</p>
                  <p className="text-white">{selectedLead.nombre}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Estado</p>
                  <span className={`
                    inline-block px-2 py-1 rounded-[5px] text-[12px]
                    ${statusColors[selectedLead.estado].bg} ${statusColors[selectedLead.estado].text}
                  `}>
                    {statusLabels[selectedLead.estado]}
                  </span>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Email</p>
                  <p className="text-white">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Teléfono</p>
                  <p className="text-white">{selectedLead.telefono}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Tipo de Proyecto</p>
                  <p className="text-white">{selectedLead.tipoProyecto === 'campo' ? 'Campo Inteligente' : 'Propiedad Inteligente'}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Ubicación</p>
                  <p className="text-white">{selectedLead.ubicacion}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Tamaño Aproximado</p>
                  <p className="text-white">{selectedLead.tamanoAproximado || '-'}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Necesidad Principal</p>
                  <p className="text-white">{selectedLead.necesidadPrincipal || '-'}</p>
                </div>
              </div>
              {selectedLead.mensaje && (
                <div>
                  <p className="text-white/50 text-sm mb-1">Mensaje</p>
                  <p className="text-white/80 bg-white/5 p-4 rounded-[5px]">{selectedLead.mensaje}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button className="btn-primary px-4 py-2.5 text-[15px] flex-1">
                  Convertir a Proyecto
                </button>
                <button className="btn-secondary px-4 py-2.5 text-[15px] flex-1">
                  Editar Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

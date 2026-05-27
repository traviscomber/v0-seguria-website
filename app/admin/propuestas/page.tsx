'use client'

import { useState } from 'react'
import { Plus, Search, FileCheck, Eye, Download, Send } from 'lucide-react'
import { getProposals, getProjects } from '@/lib/store'
import type { Proposal, ProposalStatus } from '@/lib/types'

const statusColors: Record<ProposalStatus, { bg: string; text: string }> = {
  borrador: { bg: 'bg-white/10', text: 'text-white/50' },
  enviada: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  aceptada: { bg: 'bg-green-500/20', text: 'text-green-400' },
  rechazada: { bg: 'bg-red-500/20', text: 'text-red-400' },
  vencida: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
}

const statusLabels: Record<ProposalStatus, string> = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  vencida: 'Vencida',
}

export default function ProposalsPage() {
  const proposals = getProposals()
  const projects = getProjects()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'todos'>('todos')
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.numero.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || proposal.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CL', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    }).format(new Date(date))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value)
  }

  // Stats
  const stats = {
    total: proposals.length,
    pendientes: proposals.filter(p => p.estado === 'enviada').length,
    aceptadas: proposals.filter(p => p.estado === 'aceptada').length,
    valorTotal: proposals.reduce((sum, p) => sum + p.total, 0),
    valorAceptado: proposals.filter(p => p.estado === 'aceptada').reduce((sum, p) => sum + p.total, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white">Propuestas</h1>
          <p className="text-white/60 mt-1">Gestiona tus propuestas comerciales</p>
        </div>
        <button className="btn-primary px-4 py-2.5 text-[15px] inline-flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Nueva Propuesta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-white/50 text-sm">Total Propuestas</p>
          <p className="text-2xl font-light text-white mt-1">{stats.total}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-white/50 text-sm">Pendientes</p>
          <p className="text-2xl font-light text-amber-400 mt-1">{stats.pendientes}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-white/50 text-sm">Valor Total</p>
          <p className="text-2xl font-light text-white mt-1">{formatCurrency(stats.valorTotal)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-white/50 text-sm">Valor Aceptado</p>
          <p className="text-2xl font-light text-green-400 mt-1">{formatCurrency(stats.valorAceptado)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar por número, título o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'todos')}
          className="px-4 py-2.5 rounded-[5px] bg-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9] appearance-none min-w-[150px]"
        >
          <option value="todos" className="bg-[#123A5A]">Todos los estados</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value} className="bg-[#123A5A]">{label}</option>
          ))}
        </select>
      </div>

      {/* Proposals Table */}
      <div className="glass-card overflow-hidden">
        {filteredProposals.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck className="w-12 h-12 text-white/30 mx-auto mb-4" strokeWidth={1} />
            <p className="text-white/50">No se encontraron propuestas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-white/50 text-sm border-b border-white/10">
                  <th className="p-4 font-normal">Número</th>
                  <th className="p-4 font-normal">Cliente</th>
                  <th className="p-4 font-normal">Título</th>
                  <th className="p-4 font-normal text-right">Total</th>
                  <th className="p-4 font-normal">Estado</th>
                  <th className="p-4 font-normal">Fecha</th>
                  <th className="p-4 font-normal text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="text-[#4DA3D9] font-mono text-[14px]">{proposal.numero}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-white text-[15px]">{proposal.cliente.nombre}</p>
                      <p className="text-white/40 text-[13px]">{proposal.cliente.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-white/70 text-[15px]">{proposal.titulo.slice(0, 40)}...</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-white text-[15px] font-mono">{formatCurrency(proposal.total)}</span>
                    </td>
                    <td className="p-4">
                      <span className={`
                        inline-block px-2 py-1 rounded-[5px] text-[12px]
                        ${statusColors[proposal.estado].bg} ${statusColors[proposal.estado].text}
                      `}>
                        {statusLabels[proposal.estado]}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white/50 text-[14px]">{formatDate(proposal.fechaCreacion)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedProposal(proposal)}
                          className="p-2 rounded-[5px] text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button 
                          className="p-2 rounded-[5px] text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        {proposal.estado === 'borrador' && (
                          <button 
                            className="p-2 rounded-[5px] text-white/50 hover:text-[#4DA3D9] hover:bg-[#4DA3D9]/10 transition-colors"
                            title="Enviar"
                          >
                            <Send className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProposal(null)}>
          <div className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[#4DA3D9] font-mono text-sm">{selectedProposal.numero}</p>
                <h2 className="text-xl font-light text-white">{selectedProposal.titulo}</h2>
              </div>
              <button 
                onClick={() => setSelectedProposal(null)}
                className="p-2 rounded-[5px] text-white/50 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-white/50 text-sm mb-1">Cliente</p>
                  <p className="text-white">{selectedProposal.cliente.nombre}</p>
                  <p className="text-white/50 text-sm">{selectedProposal.cliente.email}</p>
                  <p className="text-white/50 text-sm">{selectedProposal.cliente.telefono}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Estado</p>
                  <span className={`
                    inline-block px-2 py-1 rounded-[5px] text-[12px]
                    ${statusColors[selectedProposal.estado].bg} ${statusColors[selectedProposal.estado].text}
                  `}>
                    {statusLabels[selectedProposal.estado]}
                  </span>
                  <p className="text-white/40 text-sm mt-2">Válida por {selectedProposal.validezDias} días</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-white/50 text-sm mb-3">Detalle</p>
                <div className="bg-white/5 rounded-[5px] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-white/40 text-[13px] border-b border-white/10">
                        <th className="p-3 font-normal">Descripción</th>
                        <th className="p-3 font-normal text-center">Cant.</th>
                        <th className="p-3 font-normal text-right">Precio Unit.</th>
                        <th className="p-3 font-normal text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProposal.items.map((item) => (
                        <tr key={item.id} className="border-b border-white/5">
                          <td className="p-3 text-white text-[14px]">{item.descripcion}</td>
                          <td className="p-3 text-white/70 text-[14px] text-center">{item.cantidad}</td>
                          <td className="p-3 text-white/70 text-[14px] text-right font-mono">{formatCurrency(item.precioUnitario)}</td>
                          <td className="p-3 text-white text-[14px] text-right font-mono">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-white/10">
                      <tr>
                        <td colSpan={3} className="p-3 text-right text-white/50 text-[14px]">Subtotal</td>
                        <td className="p-3 text-right text-white font-mono text-[14px]">{formatCurrency(selectedProposal.subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-3 text-right text-white/50 text-[14px]">IVA (19%)</td>
                        <td className="p-3 text-right text-white font-mono text-[14px]">{formatCurrency(selectedProposal.iva)}</td>
                      </tr>
                      <tr className="bg-white/5">
                        <td colSpan={3} className="p-3 text-right text-white text-[15px] font-light">Total</td>
                        <td className="p-3 text-right text-white font-mono text-lg">{formatCurrency(selectedProposal.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedProposal.condiciones && (
                <div>
                  <p className="text-white/50 text-sm mb-1">Condiciones</p>
                  <p className="text-white/80 bg-white/5 p-4 rounded-[5px] text-[14px]">{selectedProposal.condiciones}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button className="btn-primary px-4 py-2.5 text-[15px] flex-1 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  Descargar PDF
                </button>
                {selectedProposal.estado === 'borrador' && (
                  <button className="btn-secondary px-4 py-2.5 text-[15px] flex-1 flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                    Enviar al Cliente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

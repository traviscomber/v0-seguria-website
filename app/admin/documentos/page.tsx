'use client'

import { useState } from 'react'
import { Plus, Search, FileText, Eye, Download, Upload } from 'lucide-react'
import { getDocuments, getProjects } from '@/lib/store'
import type { Document, DocumentType, DocumentStatus } from '@/lib/types'

const typeLabels: Record<DocumentType, string> = {
  diagnostico_inicial: 'Diagnóstico Inicial',
  requerimientos: 'Requerimientos',
  propuesta_comercial: 'Propuesta Comercial',
  propuesta_tecnica: 'Propuesta Técnica',
  plano_esquema: 'Plano / Esquema',
  cotizacion: 'Cotización',
  informe_instalacion: 'Informe de Instalación',
  informe_mantencion: 'Informe de Mantención',
  manual: 'Manual',
  fotografia_evidencia: 'Fotografía / Evidencia',
}

const statusColors: Record<DocumentStatus, { bg: string; text: string }> = {
  borrador: { bg: 'bg-white/10', text: 'text-white/50' },
  revision: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  aprobado: { bg: 'bg-green-500/20', text: 'text-green-400' },
  archivado: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
}

const statusLabels: Record<DocumentStatus, string> = {
  borrador: 'Borrador',
  revision: 'En Revisión',
  aprobado: 'Aprobado',
  archivado: 'Archivado',
}

export default function DocumentsPage() {
  const documents = getDocuments()
  const projects = getProjects()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'todos'>('todos')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'todos' || doc.tipo === typeFilter
    return matchesSearch && matchesType
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CL', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    }).format(new Date(date))
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.clienteNombre || 'Sin proyecto'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white">Documentos</h1>
          <p className="text-white/60 mt-1">Gestiona la documentación técnica</p>
        </div>
        <button className="btn-primary px-4 py-2.5 text-[15px] inline-flex items-center gap-2 w-fit">
          <Upload className="w-4 h-4" strokeWidth={1.5} />
          Subir Documento
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as DocumentType | 'todos')}
          className="px-4 py-2.5 rounded-[5px] bg-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9] appearance-none min-w-[180px]"
        >
          <option value="todos" className="bg-[#123A5A]">Todos los tipos</option>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value} className="bg-[#123A5A]">{label}</option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <div className="glass-card overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" strokeWidth={1} />
            <p className="text-white/50">No se encontraron documentos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-white/50 text-sm border-b border-white/10">
                  <th className="p-4 font-normal">Título</th>
                  <th className="p-4 font-normal">Tipo</th>
                  <th className="p-4 font-normal">Proyecto</th>
                  <th className="p-4 font-normal">Versión</th>
                  <th className="p-4 font-normal">Estado</th>
                  <th className="p-4 font-normal">Fecha</th>
                  <th className="p-4 font-normal text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#4DA3D9]" strokeWidth={1.5} />
                        </div>
                        <p className="text-white text-[15px]">{doc.titulo}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white/70 text-[14px]">{typeLabels[doc.tipo]}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white/70 text-[14px]">{getProjectName(doc.proyectoId)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white/50 text-[14px]">v{doc.version}</span>
                    </td>
                    <td className="p-4">
                      <span className={`
                        inline-block px-2 py-1 rounded-[5px] text-[12px]
                        ${statusColors[doc.estado].bg} ${statusColors[doc.estado].text}
                      `}>
                        {statusLabels[doc.estado]}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white/50 text-[14px]">{formatDate(doc.fechaCreacion)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedDoc(doc)}
                          className="p-2 rounded-[5px] text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button 
                          className="p-2 rounded-[5px] text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" strokeWidth={1.5} />
                        </button>
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
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDoc(null)}>
          <div className="glass-card max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-light text-white">Detalle del Documento</h2>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-[5px] text-white/50 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-white/50 text-sm mb-1">Título</p>
                <p className="text-white">{selectedDoc.titulo}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/50 text-sm mb-1">Tipo</p>
                  <p className="text-white">{typeLabels[selectedDoc.tipo]}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Versión</p>
                  <p className="text-white">v{selectedDoc.version}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Estado</p>
                  <span className={`
                    inline-block px-2 py-1 rounded-[5px] text-[12px]
                    ${statusColors[selectedDoc.estado].bg} ${statusColors[selectedDoc.estado].text}
                  `}>
                    {statusLabels[selectedDoc.estado]}
                  </span>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Autor</p>
                  <p className="text-white">{selectedDoc.autor}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="btn-primary px-4 py-2.5 text-[15px] flex-1 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  Descargar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

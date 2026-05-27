'use client'

import { useState } from 'react'
import { Plus, Search, Eye, Edit, FolderKanban } from 'lucide-react'
import { getProjects } from '@/lib/store'
import type { Project, ProjectStatus, ProjectPriority } from '@/lib/types'

const statusColors: Record<ProjectStatus, { bg: string; text: string }> = {
  diagnostico: { bg: 'bg-[#4DA3D9]/20', text: 'text-[#4DA3D9]' },
  diseno: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  propuesta: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  aprobado: { bg: 'bg-green-500/20', text: 'text-green-400' },
  instalacion: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  monitoreo: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  cerrado: { bg: 'bg-white/10', text: 'text-white/50' },
}

const statusLabels: Record<ProjectStatus, string> = {
  diagnostico: 'Diagnóstico',
  diseno: 'Diseño',
  propuesta: 'Propuesta',
  aprobado: 'Aprobado',
  instalacion: 'Instalación',
  monitoreo: 'Monitoreo',
  cerrado: 'Cerrado',
}

const priorityColors: Record<ProjectPriority, { bg: string; text: string }> = {
  baja: { bg: 'bg-white/10', text: 'text-white/50' },
  media: { bg: 'bg-[#4DA3D9]/20', text: 'text-[#4DA3D9]' },
  alta: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  urgente: { bg: 'bg-red-500/20', text: 'text-red-400' },
}

export default function ProjectsPage() {
  const projects = getProjects()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'todos'>('todos')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || project.estado === statusFilter
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white">Proyectos</h1>
          <p className="text-white/60 mt-1">Gestiona tus proyectos activos</p>
        </div>
        <button className="btn-primary px-4 py-2.5 text-[15px] inline-flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Nuevo Proyecto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar por cliente o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'todos')}
          className="px-4 py-2.5 rounded-[5px] bg-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9] appearance-none min-w-[150px]"
        >
          <option value="todos" className="bg-[#123A5A]">Todos los estados</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value} className="bg-[#123A5A]">{label}</option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FolderKanban className="w-12 h-12 text-white/30 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/50">No se encontraron proyectos</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="glass-card p-6 hover:bg-[rgba(18,58,90,0.6)] transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white text-lg font-light">{project.clienteNombre}</p>
                  <p className="text-white/50 text-sm">{project.ubicacion}</p>
                </div>
                <span className={`
                  inline-block px-2 py-1 rounded-[5px] text-[12px]
                  ${priorityColors[project.prioridad].bg} ${priorityColors[project.prioridad].text}
                `}>
                  {project.prioridad.charAt(0).toUpperCase() + project.prioridad.slice(1)}
                </span>
              </div>
              
              <p className="text-white/60 text-[14px] leading-relaxed mb-4 line-clamp-2">
                {project.descripcion}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className={`
                  inline-block px-2 py-1 rounded-[5px] text-[12px]
                  ${statusColors[project.estado].bg} ${statusColors[project.estado].text}
                `}>
                  {statusLabels[project.estado]}
                </span>
                {project.presupuestoEstimado && (
                  <span className="text-white/50 text-[14px]">
                    {formatCurrency(project.presupuestoEstimado)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <button 
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 py-2 rounded-[5px] bg-white/5 hover:bg-white/10 text-white/70 text-[14px] transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                  Ver
                </button>
                <button className="flex-1 py-2 rounded-[5px] bg-white/5 hover:bg-white/10 text-white/70 text-[14px] transition-colors flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" strokeWidth={1.5} />
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-light text-white">Detalle del Proyecto</h2>
              <button 
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-[5px] text-white/50 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-white/50 text-sm mb-1">Cliente</p>
                  <p className="text-white">{selectedProject.clienteNombre}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Estado</p>
                  <span className={`
                    inline-block px-2 py-1 rounded-[5px] text-[12px]
                    ${statusColors[selectedProject.estado].bg} ${statusColors[selectedProject.estado].text}
                  `}>
                    {statusLabels[selectedProject.estado]}
                  </span>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Tipo</p>
                  <p className="text-white">{selectedProject.tipo === 'campo' ? 'Campo Inteligente' : 'Propiedad Inteligente'}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Prioridad</p>
                  <span className={`
                    inline-block px-2 py-1 rounded-[5px] text-[12px]
                    ${priorityColors[selectedProject.prioridad].bg} ${priorityColors[selectedProject.prioridad].text}
                  `}>
                    {selectedProject.prioridad.charAt(0).toUpperCase() + selectedProject.prioridad.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Ubicación</p>
                  <p className="text-white">{selectedProject.ubicacion}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Presupuesto Estimado</p>
                  <p className="text-white">{selectedProject.presupuestoEstimado ? formatCurrency(selectedProject.presupuestoEstimado) : '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Descripción</p>
                <p className="text-white/80 bg-white/5 p-4 rounded-[5px]">{selectedProject.descripcion}</p>
              </div>
              {selectedProject.notasTecnicas && (
                <div>
                  <p className="text-white/50 text-sm mb-1">Notas Técnicas</p>
                  <p className="text-white/80 bg-white/5 p-4 rounded-[5px]">{selectedProject.notasTecnicas}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button className="btn-primary px-4 py-2.5 text-[15px] flex-1">
                  Ver Documentos
                </button>
                <button className="btn-secondary px-4 py-2.5 text-[15px] flex-1">
                  Crear Propuesta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

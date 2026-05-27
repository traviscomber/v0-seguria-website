import Link from 'next/link'
import { 
  Users, 
  FolderKanban, 
  FileText, 
  Cpu, 
  FileCheck,
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { getDashboardStats, getLeads, getProjects, getProposals } from '@/lib/store'

export default function AdminDashboard() {
  const stats = getDashboardStats()
  const recentLeads = getLeads().slice(0, 5)
  const activeProjects = getProjects().filter(p => p.estado !== 'cerrado').slice(0, 3)
  const pendingProposals = getProposals().filter(p => p.estado === 'enviada').slice(0, 3)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short' }).format(new Date(date))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-white">Dashboard</h1>
        <p className="text-white/60 mt-1">Resumen de tu operación</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Leads',
            value: stats.leads.total,
            subtext: `${stats.leads.nuevos} nuevos`,
            icon: Users,
            color: '#4DA3D9',
            href: '/admin/leads'
          },
          {
            label: 'Proyectos',
            value: stats.proyectos.total,
            subtext: `${stats.proyectos.activos} activos`,
            icon: FolderKanban,
            color: '#4DA3D9',
            href: '/admin/proyectos'
          },
          {
            label: 'Dispositivos',
            value: stats.dispositivos.total,
            subtext: stats.dispositivos.enFalla > 0 
              ? `${stats.dispositivos.enFalla} en falla` 
              : 'Todo operativo',
            icon: Cpu,
            color: stats.dispositivos.enFalla > 0 ? '#EF4444' : '#4DA3D9',
            href: '/admin/dispositivos'
          },
          {
            label: 'Propuestas',
            value: formatCurrency(stats.propuestas.valorTotal),
            subtext: `${stats.propuestas.pendientes} pendientes`,
            icon: FileCheck,
            color: '#4DA3D9',
            href: '/admin/propuestas'
          }
        ].map((stat, index) => (
          <Link 
            key={index} 
            href={stat.href}
            className="glass-card p-6 hover:bg-[rgba(18,58,90,0.6)] transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm">{stat.label}</p>
                <p className="text-2xl font-light text-white mt-1">{stat.value}</p>
                <p className="text-[13px] mt-2" style={{ color: stat.color }}>{stat.subtext}</p>
              </div>
              <div 
                className="w-10 h-10 rounded-[5px] flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} strokeWidth={1.5} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-light text-white">Leads recientes</h2>
            <Link href="/admin/leads" className="text-[#4DA3D9] text-sm flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentLeads.length === 0 ? (
              <p className="text-white/50 text-sm text-center py-8">No hay leads registrados</p>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <div>
                    <p className="text-white text-[15px]">{lead.nombre}</p>
                    <p className="text-white/50 text-sm">{lead.tipoProyecto === 'campo' ? 'Campo' : 'Propiedad'} • {lead.ubicacion}</p>
                  </div>
                  <div className="text-right">
                    <span className={`
                      inline-block px-2 py-1 rounded-[5px] text-[12px]
                      ${lead.estado === 'nuevo' ? 'bg-[#4DA3D9]/20 text-[#4DA3D9]' : ''}
                      ${lead.estado === 'contactado' ? 'bg-amber-500/20 text-amber-400' : ''}
                      ${lead.estado === 'propuesta' ? 'bg-purple-500/20 text-purple-400' : ''}
                      ${lead.estado === 'ganado' ? 'bg-green-500/20 text-green-400' : ''}
                    `}>
                      {lead.estado.charAt(0).toUpperCase() + lead.estado.slice(1)}
                    </span>
                    <p className="text-white/40 text-[12px] mt-1">{formatDate(lead.fechaCreacion)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-light text-white">Proyectos activos</h2>
            <Link href="/admin/proyectos" className="text-[#4DA3D9] text-sm flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {activeProjects.length === 0 ? (
              <p className="text-white/50 text-sm text-center py-8">No hay proyectos activos</p>
            ) : (
              activeProjects.map((project) => (
                <div key={project.id} className="p-4 rounded-[5px] bg-white/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white text-[15px]">{project.clienteNombre}</p>
                      <p className="text-white/50 text-sm mt-1">{project.descripcion.slice(0, 60)}...</p>
                    </div>
                    <span className={`
                      inline-block px-2 py-1 rounded-[5px] text-[12px] shrink-0
                      ${project.prioridad === 'alta' ? 'bg-amber-500/20 text-amber-400' : ''}
                      ${project.prioridad === 'urgente' ? 'bg-red-500/20 text-red-400' : ''}
                      ${project.prioridad === 'media' ? 'bg-[#4DA3D9]/20 text-[#4DA3D9]' : ''}
                      ${project.prioridad === 'baja' ? 'bg-white/10 text-white/50' : ''}
                    `}>
                      {project.prioridad.charAt(0).toUpperCase() + project.prioridad.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[13px] text-white/40">
                    <span>{project.estado.charAt(0).toUpperCase() + project.estado.slice(1)}</span>
                    <span>{project.presupuestoEstimado ? formatCurrency(project.presupuestoEstimado) : 'Sin presupuesto'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Proposals */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-light text-white">Propuestas pendientes</h2>
            <Link href="/admin/propuestas" className="text-[#4DA3D9] text-sm flex items-center gap-1 hover:underline">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {pendingProposals.length === 0 ? (
            <p className="text-white/50 text-sm text-center py-8">No hay propuestas pendientes</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-white/50 text-sm border-b border-white/10">
                    <th className="pb-3 font-normal">Número</th>
                    <th className="pb-3 font-normal">Cliente</th>
                    <th className="pb-3 font-normal">Título</th>
                    <th className="pb-3 font-normal text-right">Total</th>
                    <th className="pb-3 font-normal text-right">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProposals.map((proposal) => (
                    <tr key={proposal.id} className="border-b border-white/5 last:border-0">
                      <td className="py-4 text-white text-[15px]">{proposal.numero}</td>
                      <td className="py-4 text-white/70 text-[15px]">{proposal.cliente.nombre}</td>
                      <td className="py-4 text-white/70 text-[15px]">{proposal.titulo.slice(0, 40)}...</td>
                      <td className="py-4 text-white text-[15px] text-right">{formatCurrency(proposal.total)}</td>
                      <td className="py-4 text-right">
                        <span className="inline-block px-2 py-1 rounded-[5px] text-[12px] bg-amber-500/20 text-amber-400">
                          Enviada
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

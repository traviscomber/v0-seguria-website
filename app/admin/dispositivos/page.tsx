'use client'

import { useState } from 'react'
import { Plus, Search, Cpu, Wifi, WifiOff, AlertTriangle, Settings } from 'lucide-react'
import { getDevices, getProjects } from '@/lib/store'
import type { Device, DeviceStatus, DeviceType } from '@/lib/types'

const typeLabels: Record<DeviceType, string> = {
  camara_ip: 'Cámara IP',
  camara_analogica: 'Cámara Analógica',
  nvr_dvr: 'NVR / DVR',
  sensor_movimiento: 'Sensor de Movimiento',
  sensor_temperatura: 'Sensor de Temperatura',
  sensor_humedad: 'Sensor de Humedad',
  sensor_puerta: 'Sensor de Puerta',
  control_acceso: 'Control de Acceso',
  router: 'Router',
  access_point: 'Access Point',
  panel_solar: 'Panel Solar',
  bateria: 'Batería',
  gateway_iot: 'Gateway IoT',
  otro: 'Otro',
}

const statusColors: Record<DeviceStatus, { bg: string; text: string; icon: typeof Wifi }> = {
  activo: { bg: 'bg-green-500/20', text: 'text-green-400', icon: Wifi },
  inactivo: { bg: 'bg-white/10', text: 'text-white/50', icon: WifiOff },
  mantencion: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Settings },
  falla: { bg: 'bg-red-500/20', text: 'text-red-400', icon: AlertTriangle },
}

const statusLabels: Record<DeviceStatus, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  mantencion: 'En Mantención',
  falla: 'En Falla',
}

export default function DevicesPage() {
  const devices = getDevices()
  const projects = getProjects()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'todos'>('todos')

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         typeLabels[device.tipo].toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || device.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.clienteNombre || 'Sin proyecto'
  }

  // Stats
  const stats = {
    total: devices.length,
    activos: devices.filter(d => d.estado === 'activo').length,
    inactivos: devices.filter(d => d.estado === 'inactivo').length,
    enFalla: devices.filter(d => d.estado === 'falla').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white">Dispositivos</h1>
          <p className="text-white/60 mt-1">Gestiona los dispositivos instalados</p>
        </div>
        <button className="btn-primary px-4 py-2.5 text-[15px] inline-flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Registrar Dispositivo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: '#4DA3D9' },
          { label: 'Activos', value: stats.activos, color: '#22C55E' },
          { label: 'Inactivos', value: stats.inactivos, color: '#6B7280' },
          { label: 'En Falla', value: stats.enFalla, color: '#EF4444' },
        ].map((stat, index) => (
          <div key={index} className="glass-card p-4 text-center">
            <p className="text-2xl font-light text-white">{stat.value}</p>
            <p className="text-[13px]" style={{ color: stat.color }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar por tipo, marca o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DeviceStatus | 'todos')}
          className="px-4 py-2.5 rounded-[5px] bg-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9] appearance-none min-w-[150px]"
        >
          <option value="todos" className="bg-[#123A5A]">Todos los estados</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value} className="bg-[#123A5A]">{label}</option>
          ))}
        </select>
      </div>

      {/* Empty State or Devices Grid */}
      {devices.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Cpu className="w-16 h-16 text-white/20 mx-auto mb-6" strokeWidth={1} />
          <h3 className="text-xl font-light text-white mb-2">Sin dispositivos registrados</h3>
          <p className="text-white/50 mb-6 max-w-md mx-auto">
            Aún no hay dispositivos registrados en el sistema. Los dispositivos se pueden agregar cuando se complete una instalación.
          </p>
          <button className="btn-primary px-6 py-3 text-[15px] inline-flex items-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Registrar primer dispositivo
          </button>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Cpu className="w-12 h-12 text-white/30 mx-auto mb-4" strokeWidth={1} />
          <p className="text-white/50">No se encontraron dispositivos con los filtros aplicados</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => {
            const StatusIcon = statusColors[device.estado].icon
            return (
              <div key={device.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-[#4DA3D9]" strokeWidth={1.5} />
                  </div>
                  <div className={`
                    flex items-center gap-1.5 px-2 py-1 rounded-[5px]
                    ${statusColors[device.estado].bg}
                  `}>
                    <StatusIcon className={`w-3 h-3 ${statusColors[device.estado].text}`} strokeWidth={1.5} />
                    <span className={`text-[12px] ${statusColors[device.estado].text}`}>
                      {statusLabels[device.estado]}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-white font-light text-lg mb-1">{typeLabels[device.tipo]}</h3>
                <p className="text-white/50 text-sm mb-4">
                  {device.marca} {device.modelo}
                </p>

                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-white/40">Proyecto</span>
                    <span className="text-white/70">{getProjectName(device.proyectoId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Ubicación</span>
                    <span className="text-white/70">{device.ubicacionDescripcion || '-'}</span>
                  </div>
                  {device.ipUrl && (
                    <div className="flex justify-between">
                      <span className="text-white/40">IP/URL</span>
                      <span className="text-white/70 font-mono text-[12px]">{device.ipUrl}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

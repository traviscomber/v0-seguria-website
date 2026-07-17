'use client'

import { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  Settings,
  Activity,
  Camera,
  Gauge,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Device, DeviceStatus, DeviceType } from '@/lib/types'

type InventoryProperty = {
  id: string
  name: string
}

type InventoryResponse = {
  devices: Device[]
  properties: InventoryProperty[]
  spaces: InventorySpace[]
}

type InventorySpace = {
  id: string
  name: string
  propertyId: string
}

const typeLabels: Record<DeviceType, string> = {
  camara_ip: 'Camara IP',
  camara_analogica: 'Camara Analogica',
  nvr_dvr: 'NVR / DVR',
  sensor_movimiento: 'Sensor de Movimiento',
  sensor_temperatura: 'Sensor de Temperatura',
  sensor_humedad: 'Sensor de Humedad',
  sensor_puerta: 'Sensor de Puerta',
  sensor_humo: 'Sensor de Humo',
  sensor_gas: 'Sensor de Gas',
  sensor_agua: 'Sensor de Agua',
  sensor_vibracion: 'Sensor de Vibracion',
  sensor_sabotaje: 'Sensor de Sabotaje',
  control_acceso: 'Control de Acceso',
  router: 'Router',
  access_point: 'Access Point',
  panel_solar: 'Panel Solar',
  bateria: 'Bateria',
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
  mantencion: 'En mantencion',
  falla: 'En falla',
}

const chartColors = ['#22C55E', '#F59E0B', '#6B7280', '#EF4444']

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [properties, setProperties] = useState<InventoryProperty[]>([])
  const [spaces, setSpaces] = useState<InventorySpace[]>([])
  const [assigningDeviceId, setAssigningDeviceId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'todos'>('todos')

  useEffect(() => {
    let isActive = true

    async function loadInventory() {
      try {
        const response = await fetch('/api/admin/security-inventory', { cache: 'no-store' })
        const payload = (await response.json()) as InventoryResponse & { error?: string }
        if (!response.ok) throw new Error(payload.error || 'No fue posible cargar el inventario.')
        if (!isActive) return

        setDevices(
          payload.devices.map((device) => ({
            ...device,
            lastSeenAt: device.lastSeenAt ? new Date(device.lastSeenAt) : undefined,
            fechaCreacion: new Date(device.fechaCreacion),
            fechaActualizacion: new Date(device.fechaActualizacion),
          }))
        )
        setProperties(payload.properties)
        setSpaces(payload.spaces)
      } catch (error) {
        if (isActive) setLoadError(error instanceof Error ? error.message : 'No fue posible cargar el inventario.')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadInventory()
    return () => {
      isActive = false
    }
  }, [])

  async function assignSpace(deviceId: string, spaceId: string) {
    setAssigningDeviceId(deviceId)
    setLoadError('')
    try {
      const response = await fetch('/api/admin/security-inventory', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ deviceId, spaceId: spaceId || null }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'No fue posible asignar el espacio.')

      const selectedSpace = spaces.find((space) => space.id === spaceId)
      setDevices((current) => current.map((device) =>
        device.id === deviceId
          ? {
              ...device,
              ubicacionDescripcion: selectedSpace?.name || 'Espacio por asignar',
              metadata: { ...device.metadata, spaceId: spaceId || undefined },
            }
          : device
      ))
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No fue posible asignar el espacio.')
    } finally {
      setAssigningDeviceId('')
    }
  }

  const connectedDevices = devices.filter((device) => device.integrationSource !== 'manual')
  const cameraDevices = devices.filter((device) => device.tipo === 'camara_ip' || device.tipo === 'camara_analogica')
  const sensorDevices = devices.filter((device) =>
    [
      'sensor_movimiento',
      'sensor_temperatura',
      'sensor_humedad',
      'sensor_puerta',
      'sensor_humo',
      'sensor_gas',
      'sensor_agua',
      'sensor_vibracion',
      'sensor_sabotaje',
    ].includes(device.tipo)
  )
  const alertDevices = devices.filter((device) => device.estado === 'falla' || device.estado === 'mantencion')

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typeLabels[device.tipo].toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || device.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const getProjectName = (projectId: string) => {
    const property = properties.find((entry) => entry.id === projectId)
    return property?.name || 'Sin propiedad'
  }

  const stats = {
    total: devices.length,
    activos: devices.filter((d) => d.estado === 'activo').length,
    inactivos: devices.filter((d) => d.estado === 'inactivo').length,
    enFalla: devices.filter((d) => d.estado === 'falla').length,
  }

  const statusChartData = [
    { name: 'Activo', value: stats.activos },
    { name: 'Mantencion', value: devices.filter((d) => d.estado === 'mantencion').length },
    { name: 'Inactivo', value: stats.inactivos },
    { name: 'Falla', value: stats.enFalla },
  ]

  const deviceTypeChartData = [
    { name: 'Camaras', value: cameraDevices.length },
    { name: 'Sensores', value: sensorDevices.length },
    { name: 'Conectados', value: connectedDevices.length },
    { name: 'Otros', value: Math.max(devices.length - connectedDevices.length, 0) },
  ]

  const recentDevices = [...devices]
    .sort((a, b) => {
      const aTime = new Date(a.lastSeenAt || a.fechaActualizacion || a.fechaInstalacion || 0).getTime()
      const bTime = new Date(b.lastSeenAt || b.fechaActualizacion || b.fechaInstalacion || 0).getTime()
      return bTime - aTime
    })
    .slice(0, 5)

  const focusCards = [
    {
      title: 'Total',
      value: stats.total,
      label: 'Dispositivos',
      icon: Gauge,
      color: '#4DA3D9',
    },
    {
      title: 'Camaras',
      value: cameraDevices.length,
      label: 'Visibles',
      icon: Camera,
      color: '#22C55E',
    },
    {
      title: 'Alertas',
      value: alertDevices.length,
      label: 'Requieren revision',
      icon: Activity,
      color: '#F59E0B',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-white">Centro de dispositivos</h1>
          <p className="text-white/60 mt-1">Cuenta del cliente primero, con camaras, sensores y alertas bien ordenados.</p>
        </div>
        <button className="btn-primary px-4 py-2.5 text-[15px] inline-flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Registrar dispositivo
        </button>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[#4DA3D9] text-sm mb-2">Resumen operativo</p>
              <h2 className="text-2xl font-light text-white">Estado del parque de equipos</h2>
            </div>
            <span className="text-[12px] px-2 py-1 rounded-[5px] bg-white/10 text-white/60">Vista interna</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {focusCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="rounded-[5px] bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-white/55 text-sm">{card.title}</p>
                    <Icon className="w-4 h-4" style={{ color: card.color }} strokeWidth={1.5} />
                  </div>
                  <p className="text-white text-3xl font-light mt-3">{card.value}</p>
                  <p className="text-[13px] mt-2" style={{ color: card.color }}>
                    {card.label}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-[5px] bg-white/5 p-4">
              <p className="text-white/55 text-sm mb-4">Estado</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0A1B2E',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[5px] bg-white/5 p-4">
              <p className="text-white/55 text-sm mb-4">Tipos</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviceTypeChartData} layout="vertical" margin={{ top: 5, right: 12, left: 12, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#D1D5DB', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: '#0A1B2E',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#4DA3D9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[#4DA3D9] text-sm mb-2">Lectura rapida</p>
              <h2 className="text-2xl font-light text-white">Lo importante de un vistazo</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total', value: stats.total, color: '#4DA3D9' },
              { label: 'Activos', value: stats.activos, color: '#22C55E' },
              { label: 'Inactivos', value: stats.inactivos, color: '#6B7280' },
              { label: 'En falla', value: stats.enFalla, color: '#EF4444' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[5px] bg-white/5 p-4 text-center">
                <p className="text-2xl font-light text-white">{stat.value}</p>
                <p className="text-[13px]" style={{ color: stat.color }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[5px] bg-white/5 p-4">
            <p className="text-white/55 text-sm mb-3">Lectura operativa</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/45">Camaras visibles</span>
                <span className="text-white/80">{cameraDevices.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/45">Sensores visibles</span>
                <span className="text-white/80">{sensorDevices.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/45">Alertas abiertas</span>
                <span className="text-white/80">{alertDevices.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/45">Equipos conectados</span>
                <span className="text-white/80">{connectedDevices.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between gap-4 flex-col sm:flex-row mb-6">
          <div>
            <p className="text-[#4DA3D9] text-sm mb-2">Actividad reciente</p>
            <h2 className="text-2xl font-light text-white">Ultimos equipos vistos por el sistema</h2>
          </div>
          <span className="text-[12px] px-2 py-1 rounded-[5px] bg-white/10 text-white/60">
            {alertDevices.length} con alerta o mantencion
          </span>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
          {recentDevices.map((device) => {
            const StatusIcon = statusColors[device.estado].icon
            return (
              <div key={device.id} className="rounded-[5px] bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-white/55 text-sm">{typeLabels[device.tipo]}</p>
                  <StatusIcon className={`w-4 h-4 ${statusColors[device.estado].text}`} strokeWidth={1.5} />
                </div>
                <p className="text-white font-light mt-2">{device.displayName || device.marca || 'Equipo'}</p>
                <p className="text-white/45 text-sm mt-1">{device.estado}</p>
                <p className="text-white/35 text-[12px] mt-3">
                  {new Intl.DateTimeFormat('es-CL', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(device.lastSeenAt || device.fechaActualizacion || device.fechaInstalacion || new Date()))}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass-card p-6 border border-[#4DA3D9]/30">
          <p className="text-[#4DA3D9] text-sm mb-2">1. Estado general</p>
          <h2 className="text-2xl font-light text-white text-balance">Saber si todo esta bien</h2>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="rounded-[5px] bg-white/5 p-4">
              <p className="text-white/45 text-sm">Activos</p>
              <p className="text-white text-2xl font-light mt-1">{stats.activos}</p>
            </div>
            <div className="rounded-[5px] bg-white/5 p-4">
              <p className="text-white/45 text-sm">En falla</p>
              <p className="text-white text-2xl font-light mt-1">{stats.enFalla}</p>
            </div>
            <div className="rounded-[5px] bg-white/5 p-4">
              <p className="text-white/45 text-sm">Inactivos</p>
              <p className="text-white text-2xl font-light mt-1">{stats.inactivos}</p>
            </div>
            <div className="rounded-[5px] bg-white/5 p-4">
              <p className="text-white/45 text-sm">Total</p>
              <p className="text-white text-2xl font-light mt-1">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-[#4DA3D9]/30">
          <p className="text-[#4DA3D9] text-sm mb-2">2. Cuenta del cliente</p>
          <h2 className="text-2xl font-light text-white text-balance">Lo principal del producto</h2>
          <p className="text-white/55 mt-3">Mostrar equipos del cliente, su estado y que necesita revision.</p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="rounded-[5px] bg-white/5 p-4">
              <p className="text-white/45 text-sm">Equipos</p>
              <p className="text-white text-2xl font-light mt-1">{connectedDevices.length}</p>
            </div>
            <div className="rounded-[5px] bg-white/5 p-4">
              <p className="text-white/45 text-sm">Foco Pro</p>
              <p className="text-white text-lg font-light mt-2">Prioridad 1</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-[#4DA3D9]/30">
          <p className="text-[#4DA3D9] text-sm mb-2">3. Camaras y sensores</p>
          <h2 className="text-2xl font-light text-white text-balance">Ver vigilancia y ambiente</h2>
          <p className="text-white/55 mt-3">Camaras, movimiento, puertas y alertas para reaccionar rapido.</p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="rounded-[5px] bg-white/5 p-4">
              <p className="text-white/45 text-sm">Camaras</p>
              <p className="text-white text-2xl font-light mt-1">{cameraDevices.length}</p>
            </div>
            <div className="rounded-[5px] bg-white/5 p-4">
              <p className="text-white/45 text-sm">Sensores</p>
              <p className="text-white text-2xl font-light mt-1">{sensorDevices.length}</p>
            </div>
            <div className="rounded-[5px] bg-white/5 p-4 col-span-2">
              <p className="text-white/45 text-sm">Alertas abiertas</p>
              <p className="text-white text-2xl font-light mt-1">{alertDevices.length}</p>
            </div>
          </div>
        </div>
      </div>

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
          <option value="todos" className="bg-[#123A5A]">
            Todos los estados
          </option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value} className="bg-[#123A5A]">
              {label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="glass-card p-12 text-center">
          <Activity className="w-12 h-12 text-[#4DA3D9] mx-auto mb-4 animate-pulse" strokeWidth={1} />
          <p className="text-white/60">Cargando inventario seguro...</p>
        </div>
      ) : loadError ? (
        <div className="glass-card p-12 text-center border border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" strokeWidth={1} />
          <h3 className="text-xl font-light text-white mb-2">Inventario no disponible</h3>
          <p className="text-white/50">{loadError}</p>
        </div>
      ) : devices.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Cpu className="w-16 h-16 text-white/20 mx-auto mb-6" strokeWidth={1} />
          <h3 className="text-xl font-light text-white mb-2">Sin dispositivos registrados</h3>
          <p className="text-white/50 mb-6 max-w-md mx-auto">
            Aun no hay dispositivos registrados en el sistema. Los dispositivos se pueden agregar cuando se complete
            una instalacion.
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
                  <div
                    className={`
                    flex items-center gap-1.5 px-2 py-1 rounded-[5px]
                    ${statusColors[device.estado].bg}
                  `}
                  >
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
                    <span className="text-white/40">Ubicacion</span>
                    <span className="text-white/70">{device.ubicacionDescripcion || '-'}</span>
                  </div>
                  <label className="grid gap-1 pt-2 text-white/40">
                    Espacio asignado
                    <select
                      value={String(device.metadata?.spaceId || '')}
                      disabled={assigningDeviceId === device.id}
                      onChange={(event) => assignSpace(device.id, event.target.value)}
                      className="rounded-[5px] bg-white/10 px-3 py-2 text-white outline-none ring-[#4DA3D9] focus:ring-1 disabled:opacity-50"
                    >
                      <option value="" className="bg-[#123A5A]">Por asignar</option>
                      {spaces
                        .filter((space) => space.propertyId === device.proyectoId)
                        .map((space) => (
                          <option key={space.id} value={space.id} className="bg-[#123A5A]">{space.name}</option>
                        ))}
                    </select>
                  </label>
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

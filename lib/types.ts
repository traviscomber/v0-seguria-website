// Type definitions for SegurIA internal modules

// ==================== LEADS ====================
export type LeadStatus = 'nuevo' | 'contactado' | 'diagnostico' | 'propuesta' | 'ganado' | 'perdido'
export type LeadSource = 'web' | 'whatsapp' | 'referido' | 'llamada' | 'otro'
export type ProjectType = 'campo' | 'propiedad'

export interface Lead {
  id: string
  nombre: string
  email: string
  telefono: string
  tipoProyecto: ProjectType
  ubicacion: string
  tamanoAproximado?: string
  necesidadPrincipal?: string
  tieneCamaras?: string
  tieneInternet?: string
  tipoServicio?: string
  mensaje?: string
  estado: LeadStatus
  origen: LeadSource
  fechaCreacion: Date
  fechaActualizacion: Date
  notas?: string
}

// ==================== PROJECTS ====================
export type ProjectStatus = 'diagnostico' | 'diseno' | 'propuesta' | 'aprobado' | 'instalacion' | 'monitoreo' | 'cerrado'
export type ProjectPriority = 'baja' | 'media' | 'alta' | 'urgente'

export interface Project {
  id: string
  leadId: string
  clienteNombre: string
  clienteEmail: string
  clienteTelefono: string
  tipo: ProjectType
  ubicacion: string
  descripcion: string
  estado: ProjectStatus
  prioridad: ProjectPriority
  presupuestoEstimado?: number
  fechaInicio?: Date
  fechaCierre?: Date
  responsable?: string
  notasTecnicas?: string
  fechaCreacion: Date
  fechaActualizacion: Date
}

// ==================== DOCUMENTS ====================
export type DocumentType = 
  | 'diagnostico_inicial'
  | 'requerimientos'
  | 'propuesta_comercial'
  | 'propuesta_tecnica'
  | 'plano_esquema'
  | 'cotizacion'
  | 'informe_instalacion'
  | 'informe_mantencion'
  | 'manual'
  | 'fotografia_evidencia'

export type DocumentStatus = 'borrador' | 'revision' | 'aprobado' | 'archivado'

export interface Document {
  id: string
  proyectoId: string
  tipo: DocumentType
  titulo: string
  version: string
  estado: DocumentStatus
  archivoUrl?: string
  archivoNombre?: string
  resumenIA?: string
  autor: string
  fechaCreacion: Date
  fechaActualizacion: Date
}

// ==================== DEVICES ====================
export type DeviceType = 
  | 'camara_ip'
  | 'camara_analogica'
  | 'nvr_dvr'
  | 'sensor_movimiento'
  | 'sensor_temperatura'
  | 'sensor_humedad'
  | 'sensor_puerta'
  | 'control_acceso'
  | 'router'
  | 'access_point'
  | 'panel_solar'
  | 'bateria'
  | 'gateway_iot'
  | 'otro'

export type DeviceProtocol = 'onvif' | 'rtsp' | 'http' | 'mqtt' | 'zigbee' | 'wifi' | 'ethernet' | 'otro'
export type DeviceStatus = 'activo' | 'inactivo' | 'mantencion' | 'falla'
export type PowerSource = 'red_electrica' | 'solar' | 'bateria' | 'poe' | 'mixto'

export interface Device {
  id: string
  proyectoId: string
  tipo: DeviceType
  marca?: string
  modelo?: string
  protocolo?: DeviceProtocol
  ubicacionDescripcion?: string
  ubicacionCoordenadas?: { lat: number; lng: number }
  estado: DeviceStatus
  ipUrl?: string
  fuenteEnergia?: PowerSource
  notas?: string
  metadata?: Record<string, unknown>
  fechaInstalacion?: Date
  fechaCreacion: Date
  fechaActualizacion: Date
}

// ==================== PROPOSALS ====================
export type ProposalStatus = 'borrador' | 'enviada' | 'aceptada' | 'rechazada' | 'vencida'

export interface ProposalItem {
  id: string
  descripcion: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Proposal {
  id: string
  proyectoId: string
  numero: string // PRO-2024-001
  titulo: string
  cliente: {
    nombre: string
    email: string
    telefono: string
    direccion?: string
  }
  items: ProposalItem[]
  subtotal: number
  iva: number
  total: number
  validezDias: number
  condiciones?: string
  notasInternas?: string
  estado: ProposalStatus
  fechaEnvio?: Date
  fechaRespuesta?: Date
  fechaCreacion: Date
  fechaActualizacion: Date
}

// ==================== API RESPONSES ====================
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ==================== DASHBOARD STATS ====================
export interface DashboardStats {
  leads: {
    total: number
    nuevos: number
    enProceso: number
    ganados: number
  }
  proyectos: {
    total: number
    activos: number
    completados: number
  }
  dispositivos: {
    total: number
    activos: number
    enFalla: number
  }
  propuestas: {
    total: number
    pendientes: number
    aceptadas: number
    valorTotal: number
  }
}

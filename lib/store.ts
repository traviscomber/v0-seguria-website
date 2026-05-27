import { 
  Lead, 
  Project, 
  Document, 
  Device, 
  Proposal,
  DashboardStats 
} from './types'

// In-memory store for demo purposes
// In production, this would be replaced with a database

let leads: Lead[] = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    email: 'juan@ejemplo.cl',
    telefono: '+56 9 1234 5678',
    tipoProyecto: 'campo',
    ubicacion: 'Región de O\'Higgins',
    tamanoAproximado: '500 hectáreas',
    necesidadPrincipal: 'seguridad',
    tieneCamaras: 'no',
    tieneInternet: 'inestable',
    tipoServicio: 'diagnostico',
    mensaje: 'Necesito monitorear ganado en zona remota',
    estado: 'nuevo',
    origen: 'web',
    fechaCreacion: new Date('2024-01-15'),
    fechaActualizacion: new Date('2024-01-15'),
  },
  {
    id: '2',
    nombre: 'María González',
    email: 'maria@ejemplo.cl',
    telefono: '+56 9 8765 4321',
    tipoProyecto: 'propiedad',
    ubicacion: 'Santiago, Las Condes',
    tamanoAproximado: '800 m2',
    necesidadPrincipal: 'acceso',
    tieneCamaras: 'si',
    tieneInternet: 'si',
    tipoServicio: 'instalacion',
    mensaje: 'Quiero mejorar el sistema de acceso de mi condominio',
    estado: 'contactado',
    origen: 'whatsapp',
    fechaCreacion: new Date('2024-01-14'),
    fechaActualizacion: new Date('2024-01-16'),
  },
  {
    id: '3',
    nombre: 'Carlos Rodríguez',
    email: 'carlos@ejemplo.cl',
    telefono: '+56 9 5555 1234',
    tipoProyecto: 'campo',
    ubicacion: 'Región del Maule',
    tamanoAproximado: '1200 hectáreas',
    necesidadPrincipal: 'integral',
    tieneCamaras: 'parcial',
    tieneInternet: 'no',
    tipoServicio: 'propuesta',
    estado: 'propuesta',
    origen: 'referido',
    fechaCreacion: new Date('2024-01-10'),
    fechaActualizacion: new Date('2024-01-18'),
  }
]

let projects: Project[] = [
  {
    id: '1',
    leadId: '3',
    clienteNombre: 'Carlos Rodríguez',
    clienteEmail: 'carlos@ejemplo.cl',
    clienteTelefono: '+56 9 5555 1234',
    tipo: 'campo',
    ubicacion: 'Región del Maule',
    descripcion: 'Proyecto integral de monitoreo para viñedo con 1200 hectáreas',
    estado: 'propuesta',
    prioridad: 'alta',
    presupuestoEstimado: 15000000,
    responsable: 'Equipo SegurIA',
    notasTecnicas: 'Requiere solución de conectividad rural + cámaras solares',
    fechaCreacion: new Date('2024-01-12'),
    fechaActualizacion: new Date('2024-01-18'),
  }
]

let documents: Document[] = [
  {
    id: '1',
    proyectoId: '1',
    tipo: 'diagnostico_inicial',
    titulo: 'Diagnóstico Campo Rodríguez',
    version: '1.0',
    estado: 'aprobado',
    autor: 'Equipo Técnico',
    fechaCreacion: new Date('2024-01-13'),
    fechaActualizacion: new Date('2024-01-14'),
  },
  {
    id: '2',
    proyectoId: '1',
    tipo: 'propuesta_comercial',
    titulo: 'Propuesta Comercial - Campo Rodríguez',
    version: '1.0',
    estado: 'revision',
    autor: 'Equipo Comercial',
    fechaCreacion: new Date('2024-01-16'),
    fechaActualizacion: new Date('2024-01-17'),
  }
]

let devices: Device[] = []

let proposals: Proposal[] = [
  {
    id: '1',
    proyectoId: '1',
    numero: 'PRO-2024-001',
    titulo: 'Propuesta Monitoreo Integral - Viñedo Rodríguez',
    cliente: {
      nombre: 'Carlos Rodríguez',
      email: 'carlos@ejemplo.cl',
      telefono: '+56 9 5555 1234',
      direccion: 'Región del Maule'
    },
    items: [
      { id: '1', descripcion: 'Cámara solar 4K con visión nocturna', cantidad: 8, precioUnitario: 450000, subtotal: 3600000 },
      { id: '2', descripcion: 'Gateway IoT rural', cantidad: 2, precioUnitario: 800000, subtotal: 1600000 },
      { id: '3', descripcion: 'Antena de enlace punto a punto', cantidad: 4, precioUnitario: 350000, subtotal: 1400000 },
      { id: '4', descripcion: 'Instalación y configuración', cantidad: 1, precioUnitario: 2500000, subtotal: 2500000 },
    ],
    subtotal: 9100000,
    iva: 1729000,
    total: 10829000,
    validezDias: 30,
    condiciones: 'Garantía de 2 años en equipos. Soporte técnico incluido por 12 meses.',
    estado: 'enviada',
    fechaEnvio: new Date('2024-01-18'),
    fechaCreacion: new Date('2024-01-17'),
    fechaActualizacion: new Date('2024-01-18'),
  }
]

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15)

// ==================== LEADS ====================
export const getLeads = (): Lead[] => leads
export const getLeadById = (id: string): Lead | undefined => leads.find(l => l.id === id)
export const createLead = (data: Omit<Lead, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Lead => {
  const lead: Lead = {
    ...data,
    id: generateId(),
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
  }
  leads = [lead, ...leads]
  return lead
}
export const updateLead = (id: string, data: Partial<Lead>): Lead | undefined => {
  const index = leads.findIndex(l => l.id === id)
  if (index === -1) return undefined
  leads[index] = { ...leads[index], ...data, fechaActualizacion: new Date() }
  return leads[index]
}
export const deleteLead = (id: string): boolean => {
  const index = leads.findIndex(l => l.id === id)
  if (index === -1) return false
  leads = leads.filter(l => l.id !== id)
  return true
}

// ==================== PROJECTS ====================
export const getProjects = (): Project[] => projects
export const getProjectById = (id: string): Project | undefined => projects.find(p => p.id === id)
export const createProject = (data: Omit<Project, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Project => {
  const project: Project = {
    ...data,
    id: generateId(),
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
  }
  projects = [project, ...projects]
  return project
}
export const updateProject = (id: string, data: Partial<Project>): Project | undefined => {
  const index = projects.findIndex(p => p.id === id)
  if (index === -1) return undefined
  projects[index] = { ...projects[index], ...data, fechaActualizacion: new Date() }
  return projects[index]
}

// ==================== DOCUMENTS ====================
export const getDocuments = (proyectoId?: string): Document[] => 
  proyectoId ? documents.filter(d => d.proyectoId === proyectoId) : documents
export const getDocumentById = (id: string): Document | undefined => documents.find(d => d.id === id)
export const createDocument = (data: Omit<Document, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Document => {
  const document: Document = {
    ...data,
    id: generateId(),
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
  }
  documents = [document, ...documents]
  return document
}

// ==================== DEVICES ====================
export const getDevices = (proyectoId?: string): Device[] => 
  proyectoId ? devices.filter(d => d.proyectoId === proyectoId) : devices
export const getDeviceById = (id: string): Device | undefined => devices.find(d => d.id === id)
export const createDevice = (data: Omit<Device, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Device => {
  const device: Device = {
    ...data,
    id: generateId(),
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
  }
  devices = [device, ...devices]
  return device
}

// ==================== PROPOSALS ====================
export const getProposals = (): Proposal[] => proposals
export const getProposalById = (id: string): Proposal | undefined => proposals.find(p => p.id === id)
export const createProposal = (data: Omit<Proposal, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Proposal => {
  const proposal: Proposal = {
    ...data,
    id: generateId(),
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
  }
  proposals = [proposal, ...proposals]
  return proposal
}

// ==================== DASHBOARD STATS ====================
export const getDashboardStats = (): DashboardStats => {
  return {
    leads: {
      total: leads.length,
      nuevos: leads.filter(l => l.estado === 'nuevo').length,
      enProceso: leads.filter(l => ['contactado', 'diagnostico', 'propuesta'].includes(l.estado)).length,
      ganados: leads.filter(l => l.estado === 'ganado').length,
    },
    proyectos: {
      total: projects.length,
      activos: projects.filter(p => !['cerrado'].includes(p.estado)).length,
      completados: projects.filter(p => p.estado === 'cerrado').length,
    },
    dispositivos: {
      total: devices.length,
      activos: devices.filter(d => d.estado === 'activo').length,
      enFalla: devices.filter(d => d.estado === 'falla').length,
    },
    propuestas: {
      total: proposals.length,
      pendientes: proposals.filter(p => p.estado === 'enviada').length,
      aceptadas: proposals.filter(p => p.estado === 'aceptada').length,
      valorTotal: proposals.reduce((sum, p) => sum + p.total, 0),
    },
  }
}

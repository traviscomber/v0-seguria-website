import { 
  Lead, 
  Project, 
  Document, 
  Device, 
  Proposal,
  DashboardStats,
  IntegrationConnection,
  IntegrationEvent,
  IntegrationProvider,
  IntegrationStatus
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

let devices: Device[] = [
  {
    id: 'device-1',
    proyectoId: '1',
    tipo: 'camara_ip',
    integrationSource: 'tuya',
    externalId: 'tuya.camara.frente',
    displayName: 'Camara frontal',
    marca: 'Tuya',
    modelo: 'Outdoor Cam',
    protocolo: 'wifi',
    ubicacionDescripcion: 'Entrada principal',
    estado: 'activo',
    ipUrl: '192.168.1.45',
    fuenteEnergia: 'poe',
    notas: 'Vista de acceso y porton',
    metadata: { area: 'frente' },
    fechaInstalacion: new Date('2024-01-10'),
    fechaCreacion: new Date('2024-01-10'),
    fechaActualizacion: new Date('2024-01-10'),
  },
  {
    id: 'device-2',
    proyectoId: '1',
    tipo: 'sensor_movimiento',
    integrationSource: 'tuya',
    externalId: 'tuya.sensor.patio',
    displayName: 'Sensor de patio',
    marca: 'Tuya',
    modelo: 'PIR Motion',
    protocolo: 'wifi',
    ubicacionDescripcion: 'Patio lateral',
    estado: 'activo',
    notas: 'Detecta movimiento fuera de horario',
    metadata: { area: 'patio' },
    fechaInstalacion: new Date('2024-01-11'),
    fechaCreacion: new Date('2024-01-11'),
    fechaActualizacion: new Date('2024-01-11'),
  },
  {
    id: 'device-3',
    proyectoId: '1',
    tipo: 'sensor_puerta',
    integrationSource: 'home_assistant',
    externalId: 'binary_sensor.porton',
    displayName: 'Sensor de portón',
    marca: 'Control local',
    modelo: 'Door Contact',
    protocolo: 'mqtt',
    ubicacionDescripcion: 'Portón de acceso',
    estado: 'falla',
    notas: 'Se reportó pérdida de señal',
    metadata: { area: 'acceso' },
    fechaInstalacion: new Date('2024-01-09'),
    fechaCreacion: new Date('2024-01-09'),
    fechaActualizacion: new Date('2024-01-12'),
  },
  {
    id: 'device-4',
    proyectoId: '1',
    tipo: 'gateway_iot',
    integrationSource: 'home_assistant',
    externalId: 'gateway.site.01',
    displayName: 'Gateway principal',
    marca: 'SegurIA',
    modelo: 'Edge Hub',
    protocolo: 'ethernet',
    ubicacionDescripcion: 'Sala técnica',
    estado: 'activo',
    notas: 'Sincroniza estado local y eventos',
    metadata: { role: 'gateway' },
    fechaInstalacion: new Date('2024-01-08'),
    fechaCreacion: new Date('2024-01-08'),
    fechaActualizacion: new Date('2024-01-12'),
  },
  {
    id: 'device-5',
    proyectoId: '1',
    tipo: 'control_acceso',
    integrationSource: 'tuya',
    externalId: 'tuya.lock.puerta',
    displayName: 'Cerradura principal',
    marca: 'Tuya',
    modelo: 'Smart Lock',
    protocolo: 'wifi',
    ubicacionDescripcion: 'Acceso peatonal',
    estado: 'mantencion',
    notas: 'Revisar batería y respuesta de apertura',
    metadata: { area: 'acceso' },
    fechaInstalacion: new Date('2024-01-07'),
    fechaCreacion: new Date('2024-01-07'),
    fechaActualizacion: new Date('2024-01-12'),
  },
]

let integrationConnections: IntegrationConnection[] = [
  {
    provider: 'tuya',
    name: 'Conectores de dispositivos',
    description: 'Sincronizacion de dispositivos via capa operativa o API dedicada.',
    status: 'pending',
    endpoint: '/api/integrations/tuya',
    accountName: undefined,
    accountScope: undefined,
    secretName: 'TUYA_SYNC_SECRET',
    lastSyncAt: undefined,
    totalEvents: 0,
    totalDevices: 0,
    notes: [
      'Registro de dispositivos, estado y telemetria',
      'Compatibilidad para switches, sensores y acceso',
    ],
  },
  {
    provider: 'home_assistant',
    name: 'Capa operativa local',
    description: 'Control plane para automatizaciones, escenas y telemetria local.',
    status: 'pending',
    endpoint: '/api/integrations/home-assistant',
    accountName: undefined,
    accountScope: undefined,
    secretName: 'HOME_ASSISTANT_WEBHOOK_SECRET',
    lastSyncAt: undefined,
    totalEvents: 0,
    totalDevices: 0,
    notes: [
      'Webhook de eventos para entidades y alertas',
      'Sincronizacion de estado con dispositivos del sitio',
    ],
  },
  {
    provider: 'github',
    name: 'GitHub',
    description: 'Versionado de configuraciones, reglas y automatizaciones del proyecto.',
    status: 'connected',
    endpoint: 'https://github.com/traviscomber/v0-seguria-website',
    accountName: 'traviscomber/v0-seguria-website',
    accountScope: 'internal',
    secretName: 'GITHUB_TOKEN',
    lastSyncAt: new Date(),
    totalEvents: 0,
    totalDevices: 0,
    notes: [
      'Fuente de verdad para cambios de configuracion',
      'Tracking de versiones para automatizaciones',
    ],
  },
]

let integrationEvents: IntegrationEvent[] = [
  {
    id: 'integration-seed-0',
    provider: 'tuya',
    eventType: 'sync',
    title: 'Tuya conectado y listo para mostrar estado',
    status: 'success',
    payload: {
      source: 'tuya',
      scope: 'devices',
    },
    receivedAt: new Date(),
  },
  {
    id: 'integration-seed-1',
    provider: 'home_assistant',
    eventType: 'bootstrap',
    title: 'Capa operativa lista para recibir eventos',
    status: 'info',
    payload: {
      mode: 'webhook',
      scope: 'security-suite',
    },
    receivedAt: new Date(),
  },
]

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

const getIntegrationIndex = (provider: IntegrationProvider) =>
  integrationConnections.findIndex((connection) => connection.provider === provider)

const getDeviceStatusFromText = (value?: string): Device['estado'] => {
  const normalized = value?.toLowerCase().trim()
  if (!normalized) return 'mantencion'
  if (['on', 'online', 'active', 'activo', 'open', 'triggered', 'armed'].includes(normalized)) return 'activo'
  if (['off', 'offline', 'unavailable', 'inactive', 'inactivo', 'closed'].includes(normalized)) return 'inactivo'
  if (['fault', 'error', 'falla', 'alert', 'alarm'].includes(normalized)) return 'falla'
  return 'mantencion'
}

const inferDeviceTypeFromEntityId = (entityId?: string, fallback: Device['tipo'] = 'otro'): Device['tipo'] => {
  if (!entityId) return fallback
  if (entityId.startsWith('camera.')) return 'camara_ip'
  if (entityId.startsWith('lock.') || entityId.startsWith('cover.')) return 'control_acceso'
  if (entityId.startsWith('binary_sensor.')) {
    if (entityId.includes('door') || entityId.includes('gate') || entityId.includes('window')) {
      return 'sensor_puerta'
    }
    return 'sensor_movimiento'
  }
  if (entityId.startsWith('sensor.')) {
    if (entityId.includes('temperature')) return 'sensor_temperatura'
    if (entityId.includes('humidity')) return 'sensor_humedad'
    if (entityId.includes('motion')) return 'sensor_movimiento'
  }
  if (entityId.startsWith('switch.') || entityId.startsWith('light.')) return 'otro'
  return fallback
}

const inferDeviceTypeFromCategory = (category?: string, fallback: Device['tipo'] = 'otro'): Device['tipo'] => {
  const normalized = category?.toLowerCase().trim()
  if (!normalized) return fallback
  if (normalized.includes('camera')) return 'camara_ip'
  if (normalized.includes('door') || normalized.includes('lock') || normalized.includes('access')) return 'control_acceso'
  if (normalized.includes('motion') || normalized.includes('pir')) return 'sensor_movimiento'
  if (normalized.includes('temperature')) return 'sensor_temperatura'
  if (normalized.includes('humidity')) return 'sensor_humedad'
  return fallback
}

function syncIntegrationConnection(provider: IntegrationProvider, updater: (current: IntegrationConnection) => IntegrationConnection) {
  const index = getIntegrationIndex(provider)
  if (index === -1) return
  integrationConnections[index] = updater(integrationConnections[index])
}

function connectTuyaAccount(input: { accountName: string; accountScope?: string; siteName?: string }) {
  const receivedAt = new Date()
  syncIntegrationConnection('tuya', (current) => ({
    ...current,
    status: 'connected',
    accountName: input.accountName,
    accountScope: input.accountScope || input.siteName || 'Sitio principal',
    lastSyncAt: receivedAt,
    notes: [
      `Cuenta: ${input.accountName}`,
      input.siteName ? `Sitio: ${input.siteName}` : 'Cuenta lista para importar equipos',
    ],
  }))

  const event = recordIntegrationEvent({
    provider: 'tuya',
    eventType: 'account.connected',
    title: `Cuenta Tuya conectada: ${input.accountName}`,
    status: 'success',
    payload: {
      accountName: input.accountName,
      accountScope: input.accountScope || input.siteName || 'Sitio principal',
    },
  })

  return event
}

function recordIntegrationEvent(event: Omit<IntegrationEvent, 'id' | 'receivedAt'>) {
  const entry: IntegrationEvent = {
    ...event,
    id: generateId(),
    receivedAt: new Date(),
  }

  integrationEvents = [entry, ...integrationEvents].slice(0, 100)

  syncIntegrationConnection(event.provider, (current) => ({
    ...current,
    status: event.status === 'error' ? 'degraded' : 'connected',
    lastSyncAt: entry.receivedAt,
    totalEvents: current.totalEvents + 1,
  }))

  return entry
}

function upsertIntegrationDevice(input: {
  provider: 'home_assistant' | 'tuya'
  externalId: string
  deviceName?: string
  displayName?: string
  projectId?: string
  entityId?: string
  category?: string
  state?: string
  notes?: string
  metadata?: Record<string, unknown>
  ipUrl?: string
  protocolo?: Device['protocolo']
  fuenteEnergia?: Device['fuenteEnergia']
}) {
  const deviceStatus = getDeviceStatusFromText(input.state)
  const inferredType = input.provider === 'tuya'
    ? inferDeviceTypeFromCategory(input.category, inferDeviceTypeFromEntityId(input.entityId))
    : inferDeviceTypeFromEntityId(input.entityId)

  const index = devices.findIndex(
    (device) => device.integrationSource === input.provider && device.externalId === input.externalId
  )

  const nextDevice: Device = {
    id: index >= 0 ? devices[index].id : generateId(),
    proyectoId: input.projectId || 'integration',
    tipo: inferredType,
    integrationSource: input.provider,
    externalId: input.externalId,
    displayName: input.displayName || input.deviceName,
    marca: input.provider === 'tuya' ? 'Dispositivo conectado' : 'Control local',
    modelo: input.category || input.entityId || input.deviceName,
    protocolo: input.protocolo || (input.provider === 'home_assistant' ? 'http' : 'wifi'),
    ubicacionDescripcion: input.notes,
    estado: deviceStatus,
    ipUrl: input.ipUrl,
    fuenteEnergia: input.fuenteEnergia,
    notas: input.notes,
    metadata: input.metadata,
    lastSeenAt: new Date(),
    fechaInstalacion: index >= 0 ? devices[index].fechaInstalacion : new Date(),
    fechaCreacion: index >= 0 ? devices[index].fechaCreacion : new Date(),
    fechaActualizacion: new Date(),
  }

  if (index >= 0) {
    devices[index] = {
      ...devices[index],
      ...nextDevice,
      fechaCreacion: devices[index].fechaCreacion,
      fechaInstalacion: devices[index].fechaInstalacion ?? nextDevice.fechaInstalacion,
    }
    return devices[index]
  }

  devices = [nextDevice, ...devices]
  syncIntegrationConnection(input.provider, (current) => ({
    ...current,
    totalDevices: current.totalDevices + 1,
  }))
  return nextDevice
}

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
export const updateDevice = (id: string, data: Partial<Device>): Device | undefined => {
  const index = devices.findIndex((device) => device.id === id)
  if (index === -1) return undefined
  devices[index] = {
    ...devices[index],
    ...data,
    fechaActualizacion: new Date(),
  }
  return devices[index]
}

export const getIntegrationConnections = (): IntegrationConnection[] => integrationConnections
export const getIntegrationConnectionByProvider = (provider: IntegrationProvider): IntegrationConnection | undefined =>
  integrationConnections.find((connection) => connection.provider === provider)
export const getIntegrationEvents = (limit = 25): IntegrationEvent[] => integrationEvents.slice(0, limit)
export const getIntegrationSummary = () => {
  const recentEvents = getIntegrationEvents(10)
  return {
    totalConnections: integrationConnections.length,
    connectedConnections: integrationConnections.filter((connection) => connection.status === 'connected').length,
    pendingConnections: integrationConnections.filter((connection) => connection.status === 'pending').length,
    recentEvents,
  }
}
export const recordIntegrationConnectionEvent = recordIntegrationEvent
export const upsertDeviceFromIntegration = upsertIntegrationDevice
export const connectTuyaIntegrationAccount = connectTuyaAccount

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

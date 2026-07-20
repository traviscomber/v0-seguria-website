import type { AuthUser } from '@/lib/auth-store'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Device, Document } from '@/lib/types'

type PortalSiteStatus = 'operativo' | 'atencion' | 'revision'
type PortalIncidentStatus = 'new' | 'validating' | 'confirmed' | 'responding' | 'resolved' | 'false_alarm'

export interface PortalSiteSummary {
  organizationId: string
  organizationName: string
  propertyId: string
  projectId: string
  label: string
  location: string
  imageUrl: string
  imageAlt: string
  imageCredit: string
  imageCreditUrl: string
  imageIsRepresentative: boolean
  status: PortalSiteStatus
  statusLabel: string
  deviceCount: number
  cameraCount: number
  sensorCount: number
  accessCount: number
  documentCount: number
  alertCount: number
  lastUpdatedAt?: Date
  devices: Device[]
  documents: Document[]
  events: PortalEvent[]
  spaces: PortalSpace[]
  incidents: PortalIncident[]
  gatewayHealth: PortalGatewayHealth
  report: PortalOperationalReport
  profile: PortalSiteProfile
}

export interface PortalSiteProfile {
  key: 'dairy_field' | 'hotel' | 'general'
  eyebrow: string
  headline: string
  summary: string
  operatingPromise: string
  integrationPromise: string
  focusAreas: string[]
  commandCenter: {
    label: string
    value: string
    detail: string
  }[]
  assurance: {
    label: string
    value: string
    detail: string
  }[]
  shiftFlow: {
    label: string
    moment: string
    detail: string
  }[]
  escalationMatrix: {
    label: string
    trigger: string
    owner: string
    response: string
  }[]
  evidencePackage: {
    label: string
    detail: string
  }[]
  responsePlan: string[]
  metricLabels: {
    camera: string
    sensor: string
    alert: string
    access: string
  }
  recommendedStableAction: string
  recommendedAttentionAction: string
}

export interface PortalSpace {
  id: string
  name: string
  cameraCount: number
  sensorCount: number
  alertCount: number
  lastUpdatedAt?: Date
}

export interface PortalEvent {
  id: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  state?: string
  title: string
  occurredAt: Date
}

export interface PortalIncidentEvidence {
  id: string
  title: string
  capturedAt: Date
  deviceId?: string
  fileName: string
  association: 'primary' | 'correlated' | 'operator_pinned' | 'time_window'
  note?: string
  pinned: boolean
}

export interface PortalDeviceBucket {
  key: 'camera' | 'sensor' | 'alert' | 'access' | 'other'
  label: string
  count: number
  devices: Device[]
}

export interface PortalIncident {
  id: string
  propertyId: string
  title: string
  description?: string
  severity: 'warning' | 'critical'
  status: PortalIncidentStatus
  statusLabel: string
  acknowledgedAt?: Date
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
  relatedEvents: PortalEvent[]
  evidence: PortalIncidentEvidence[]
}

export interface PortalGatewayHealth {
  total: number
  online: number
  degraded: number
  offline: number
  lastSeenAt?: Date
}

export interface PortalSensorRisk {
  stable: number
  attention: number
  critical: number
}

export interface PortalOperationalReport {
  eventsToday: number
  criticalEventsToday: number
  incidentsThisMonth: number
  resolvedThisMonth: number
  overdueConfirmations: number
  averageConfirmationMinutes?: number
  averageResolutionHours?: number
}

export interface PortalOperationalScore {
  score: number
  label: string
  tone: 'ok' | 'warning' | 'critical'
  summary: string
  drivers: string[]
}

export interface PortalDailyPriority {
  id: string
  siteLabel: string
  title: string
  detail: string
  action: string
  tone: 'ok' | 'warning' | 'critical'
  rank: number
}

export interface PortalCoverageZone {
  id: string
  siteLabel: string
  name: string
  cameraCount: number
  sensorCount: number
  alertCount: number
  score: number
  statusLabel: string
  summary: string
  action: string
  tone: 'ok' | 'warning' | 'critical'
  updatedAt?: Date
}

export interface PortalServiceCommitment {
  id: string
  siteLabel: string
  label: string
  target: string
  current: string
  summary: string
  action: string
  tone: 'ok' | 'warning' | 'critical'
  rank: number
}

export interface PortalExecutiveBrief {
  title: string
  periodLabel: string
  verdict: string
  narrative: string
  highlights: string[]
  focus: string[]
  tone: 'ok' | 'warning' | 'critical'
}

export interface PortalSensitiveWindow {
  id: string
  siteLabel: string
  label: string
  range: string
  eventCount: number
  incidentCount: number
  criticalCount: number
  summary: string
  action: string
  tone: 'ok' | 'warning' | 'critical'
  rank: number
}

export interface PortalImprovementAction {
  id: string
  siteLabel: string
  title: string
  why: string
  nextStep: string
  expectedImpact: string
  tone: 'ok' | 'warning' | 'critical'
  rank: number
}

export interface PortalDecisionPacket {
  id: string
  siteLabel: string
  decision: string
  owner: string
  evidence: string
  timing: string
  outcome: string
  tone: 'ok' | 'warning' | 'critical'
  rank: number
}

export interface PortalOperationalFlowStep {
  id: string
  siteLabel: string
  stage: string
  title: string
  metric: string
  reading: string
  action: string
  proof: string
  tone: 'ok' | 'warning' | 'critical'
  rank: number
}

export interface PortalBoardReport {
  title: string
  periodLabel: string
  verdict: string
  outcome: string
  risk: string
  decision: string
  proofPoints: string[]
  metrics: {
    label: string
    value: string
    detail: string
    tone: 'ok' | 'warning' | 'critical'
  }[]
  tone: 'ok' | 'warning' | 'critical'
}

export interface PortalGovernanceRitual {
  id: string
  siteLabel: string
  cadence: string
  title: string
  owner: string
  question: string
  input: string
  output: string
  tone: 'ok' | 'warning' | 'critical'
  rank: number
}

export interface PortalActionRegisterItem {
  id: string
  siteLabel: string
  title: string
  owner: string
  due: string
  status: string
  why: string
  nextStep: string
  successCriteria: string
  tone: 'ok' | 'warning' | 'critical'
  rank: number
}

export interface PortalTraceabilityItem {
  id: string
  siteLabel: string
  title: string
  source: string
  evidence: string
  decisionLink: string
  status: string
  occurredAt: Date
  tone: 'ok' | 'warning' | 'critical'
  rank: number
}

export interface PortalRiskMapItem {
  id: string
  siteLabel: string
  zone: string
  window: string
  exposure: string
  protection: string
  action: string
  owner: string
  tone: 'ok' | 'warning' | 'critical'
  rank: number
}

export interface PortalMaturityScorecardItem {
  id: string
  label: string
  score: number
  level: string
  reading: string
  nextStep: string
  tone: 'ok' | 'warning' | 'critical'
  rank: number
}

export interface PortalWeeklyDecisionAgendaItem {
  id: string
  siteLabel: string
  decision: string
  priorityLabel: string
  evidence: string
  owner: string
  deadline: string
  expectedOutcome: string
  customerValue: string
  tone: 'ok' | 'warning' | 'critical'
  rank: number
}

type PortalNotificationMetric = {
  propertyId: string
  severity: 'warning' | 'critical'
  status: string
  dueAt: Date
  createdAt: Date
  acknowledgedAt?: Date
  escalatedAt?: Date
}

type PortalSnapshot = {
  id: string
  propertyId: string
  deviceId?: string
  objectPath: string
  mimeType: string
  capturedAt: Date
  createdAt: Date
}

const openIncidentStatuses: PortalIncidentStatus[] = ['new', 'validating', 'confirmed', 'responding']

const incidentStatusLabels: Record<PortalIncidentStatus, string> = {
  new: 'Nuevo',
  validating: 'Validando',
  confirmed: 'Confirmado',
  responding: 'En respuesta',
  resolved: 'Resuelto',
  false_alarm: 'Falsa alarma',
}

function getPortalSiteVisual(organizationName: string, propertyName: string) {
  const key = `${organizationName} ${propertyName}`.toLowerCase()

  if (key.includes('huilo')) {
    return {
      imageUrl: '/portal/huilo-huilo.jpg',
      imageAlt: 'Hotel en la Reserva Huilo Huilo rodeado de bosque nativo',
      imageCredit: 'Roberto Araya Barckhahn / CC BY-SA 3.0',
      imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Hotel_Baobab,_Huilo-Huilo.JPG',
      imageIsRepresentative: false,
    }
  }

  if (key.includes('santa elena')) {
    return {
      imageUrl: '/portal/santa-elena.jpg',
      imageAlt: 'Ganado lechero alimentandose en una pradera',
      imageCredit: 'Foto referencial: Gonzalo De La Rosa / CC BY-SA 4.0',
      imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Campo_de_vacas_alimentandose.JPG',
      imageIsRepresentative: true,
    }
  }

  return {
    imageUrl: '/portal/santa-elena.jpg',
    imageAlt: 'Operacion protegida por SegurIA',
    imageCredit: 'Foto referencial / Creative Commons',
    imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Campo_de_vacas_alimentandose.JPG',
    imageIsRepresentative: true,
  }
}

function getPortalSiteProfile(organizationName: string, propertyName: string): PortalSiteProfile {
  const key = `${organizationName} ${propertyName}`.toLowerCase()

  if (key.includes('huilo')) {
    return {
      key: 'hotel',
      eyebrow: 'Reserva y hoteleria protegida',
      headline: 'Entre bosque, lodges y senderos, la operacion se cuida sin perder calma.',
      summary: 'SegurIA acompana una operacion extendida en la selva valdiviana: hoteles, accesos, excursiones, termas, estacionamientos y zonas comunes con una lectura simple para el equipo.',
      operatingPromise: 'La seguridad se vuelve parte de la hospitalidad: discreta para el huesped, clara para recepcion, util para mantencion y precisa cuando algo cambia.',
      integrationPromise: 'Conectamos camaras, accesos, sensores y registros que el hotel ya usa para ordenar la operacion sin obligar a partir desde cero.',
      focusAreas: ['Llegadas y recepcion', 'Lodges y areas comunes', 'Senderos, excursiones y termas', 'Perimetro bosque-estacionamientos'],
      commandCenter: [
        { label: 'Recepcion', value: 'llegadas claras', detail: 'Accesos, proveedores y horarios sensibles aparecen con contexto antes de convertirse en ruido.' },
        { label: 'Huesped', value: 'calma visible', detail: 'La vigilancia acompana sin invadir: zonas comunes, senderos y termas se leen con criterio operativo.' },
        { label: 'Equipo', value: 'turnos atentos', detail: 'Cada aviso indica donde mirar, que cambio y quien debe actuar primero.' },
        { label: 'Evidencia', value: 'sin busqueda larga', detail: 'Eventos, capturas y documentos quedan unidos para revisar rapidamente lo que importa.' },
      ],
      assurance: [
        { label: 'Privacidad', value: 'operacion discreta', detail: 'El portal muestra contexto de seguridad sin exponer informacion innecesaria del huesped.' },
        { label: 'Roles', value: 'cada turno sabe', detail: 'Recepcion, mantencion y administracion reciben una lectura orientada a su responsabilidad.' },
        { label: 'SLA', value: 'respuesta medible', detail: 'Los tiempos de confirmacion y resolucion quedan visibles para mejorar cada guardia.' },
        { label: 'Auditoria', value: 'historial ordenado', detail: 'Incidentes, evidencia y cierres quedan trazables para revisar despues sin reconstruir la historia.' },
      ],
      shiftFlow: [
        { label: 'Abrir turno', moment: 'inicio', detail: 'Revisar llegadas, accesos activos, zonas comunes y avisos pendientes antes de recibir flujo de huespedes.' },
        { label: 'Observar cambios', moment: 'durante', detail: 'Separar actividad normal de huespedes y proveedores de movimientos fuera de rutina.' },
        { label: 'Escalar con criterio', moment: 'alerta', detail: 'Cruzar evento, evidencia y ubicacion antes de activar mantencion, recepcion o seguridad.' },
        { label: 'Cerrar con historia', moment: 'cierre', detail: 'Dejar incidente, evidencia y aprendizaje listos para el siguiente turno.' },
      ],
      escalationMatrix: [
        { label: 'Movimiento fuera de rutina', trigger: 'Zona comun, sendero o estacionamiento cambia fuera de horario.', owner: 'Recepcion / seguridad', response: 'Validar evidencia y registrar si corresponde seguimiento.' },
        { label: 'Acceso sensible', trigger: 'Proveedor, porton o puerta queda fuera del flujo esperado.', owner: 'Recepcion / administracion', response: 'Confirmar autorizacion y dejar evento respaldado.' },
        { label: 'Continuidad del servicio', trigger: 'Equipo clave o vista critica queda con revision.', owner: 'Mantencion', response: 'Priorizar restitucion antes del siguiente bloque de ocupacion.' },
      ],
      evidencePackage: [
        { label: 'Evento', detail: 'Hora, lugar y tipo de senal que origino la revision.' },
        { label: 'Captura', detail: 'Imagen o evidencia visual vinculada al momento relevante.' },
        { label: 'Decision', detail: 'Responsable, accion tomada y motivo de cierre.' },
      ],
      responsePlan: [
        'Priorizar recepcion, accesos y estacionamientos durante cambios de turno.',
        'Cruzar eventos con evidencia visual antes de escalar una alerta.',
        'Separar actividad normal del huesped de movimientos fuera de horario.',
        'Cerrar cada incidente con responsable, evidencia y aprendizaje para el siguiente turno.',
      ],
      metricLabels: {
        camera: 'Vistas clave',
        sensor: 'Sensores',
        alert: 'Avisos',
        access: 'Puntos de acceso',
      },
      recommendedStableAction: 'Mantener supervision de recepcion, lodges, senderos activos y zonas de descanso durante la jornada.',
      recommendedAttentionAction: 'Priorizar llegadas, zonas comunes, rutas outdoor y estacionamientos antes de cerrar el turno.',
    }
  }

  if (key.includes('santa elena')) {
    return {
      key: 'dairy_field',
      eyebrow: 'Campo lechero protegido',
      headline: 'Santa Elena cuida leche, praderas y faena: cada senal debe llegar antes del problema.',
      summary: 'SegurIA acompana una operacion lechera del eje Reumen-Futrono, con foco en accesos, riego, alfalfa, praderas, sala de frio, bodegas y continuidad de la entrega.',
      operatingPromise: 'La seguridad deja de mirar solo portones: acompana la continuidad del campo, protege puntos criticos y ayuda a decidir antes de que una falla cueste produccion.',
      integrationPromise: 'Aprovechamos camaras, sensores, controles y redes existentes para darles una capa de inteligencia operativa, alertas utiles y evidencia ordenada.',
      focusAreas: ['Accesos y portones', 'Riego, alfalfa y praderas', 'Sala de frio y leche', 'Bodegas, insumos y movimiento nocturno'],
      commandCenter: [
        { label: 'Campo', value: 'faena visible', detail: 'Praderas, riego, bodegas y accesos se leen como una sola operacion, no como equipos aislados.' },
        { label: 'Frio', value: 'continuidad cuidada', detail: 'Los puntos sensibles tienen prioridad para reducir sorpresas en sala de frio y entrega.' },
        { label: 'Noche', value: 'movimiento claro', detail: 'Avisos fuera de horario separan rutina, animales, visitas y excepciones que requieren revision.' },
        { label: 'Evidencia', value: 'decisiones simples', detail: 'Cada alerta queda asociada a lugar, hora, equipo y material de respaldo.' },
      ],
      assurance: [
        { label: 'Continuidad', value: 'faena protegida', detail: 'La lectura prioriza puntos que pueden afectar frio, riego, bodegas y movimiento diario.' },
        { label: 'Roles', value: 'accion por equipo', detail: 'Administrador, encargado y operador ven que revisar primero sin mezclar responsabilidades.' },
        { label: 'SLA', value: 'avisos medibles', detail: 'Confirmaciones, demoras y cierres permiten controlar respuesta sin depender de memoria.' },
        { label: 'Auditoria', value: 'evidencia rural', detail: 'Cada excepcion queda unida a horario, ubicacion y respaldo visual para cerrar con criterio.' },
      ],
      shiftFlow: [
        { label: 'Abrir jornada', moment: 'inicio', detail: 'Revisar portones, sala de frio, riego, bodegas y ultimos movimientos nocturnos.' },
        { label: 'Cuidar continuidad', moment: 'durante', detail: 'Mirar primero los puntos que pueden detener faena o afectar leche, praderas e insumos.' },
        { label: 'Responder sin correr', moment: 'alerta', detail: 'Validar senal con camara, ubicacion y horario antes de movilizar al equipo.' },
        { label: 'Cerrar con causa', moment: 'cierre', detail: 'Registrar evidencia, causa probable y accion preventiva para la siguiente jornada.' },
      ],
      escalationMatrix: [
        { label: 'Acceso fuera de horario', trigger: 'Porton, bodega o zona de insumos registra movimiento no esperado.', owner: 'Encargado de campo', response: 'Validar con camara y decidir visita, llamado o registro simple.' },
        { label: 'Riesgo de continuidad', trigger: 'Sala de frio, riego o punto critico muestra falla o silencio.', owner: 'Administrador / operador', response: 'Confirmar estado y priorizar accion antes de afectar faena.' },
        { label: 'Movimiento nocturno', trigger: 'Actividad en praderas, bodegas o perimetro durante ventana sensible.', owner: 'Equipo de turno', response: 'Cruzar ubicacion, hora y evidencia antes de movilizar recursos.' },
      ],
      evidencePackage: [
        { label: 'Lugar', detail: 'Sector exacto del campo, porton, sala, bodega o pradera involucrada.' },
        { label: 'Respaldo', detail: 'Captura, evento y horario unidos para evitar interpretaciones incompletas.' },
        { label: 'Cierre', detail: 'Causa probable, responsable y accion preventiva para la siguiente jornada.' },
      ],
      responsePlan: [
        'Revisar primero accesos, portones y movimiento nocturno.',
        'Confirmar continuidad de sala de frio, riego y bodegas sensibles.',
        'Cruzar senales con camaras antes de movilizar al equipo.',
        'Cerrar incidentes con causa probable, evidencia y accion preventiva.',
      ],
      metricLabels: {
        camera: 'Puntos de vista',
        sensor: 'Sensores de campo',
        alert: 'Avisos',
        access: 'Portones',
      },
      recommendedStableAction: 'Mantener supervision de portones, sala de frio, riego y movimiento nocturno antes de cada jornada.',
      recommendedAttentionAction: 'Revisar primero accesos, cadena de frio, riego, bodegas y senales fuera de horario.',
    }
  }

  return {
    key: 'general',
    eyebrow: 'Operacion protegida',
    headline: 'Tu seguridad, clara y lista para decidir.',
    summary: 'SegurIA reune camaras, sensores, accesos y eventos importantes para responder con contexto.',
    operatingPromise: 'Una operacion segura no depende de mirar pantallas todo el dia: depende de entender que cambio, donde paso y que hacer despues.',
    integrationPromise: 'Conectamos los sistemas existentes y los ordenamos en una experiencia unica para mejorar respuesta, evidencia y continuidad.',
    focusAreas: ['Perimetro', 'Accesos', 'Espacios sensibles', 'Continuidad operativa'],
    commandCenter: [
      { label: 'Visibilidad', value: 'todo en contexto', detail: 'Sitios, equipos, eventos e incidentes aparecen en una misma lectura.' },
      { label: 'Prioridad', value: 'menos ruido', detail: 'Las alertas se agrupan por impacto para evitar decisiones a ciegas.' },
      { label: 'Respuesta', value: 'accion clara', detail: 'Cada senal viene con siguiente paso y evidencia disponible.' },
      { label: 'Continuidad', value: 'operacion estable', detail: 'La plataforma ayuda a detectar cortes, fallas y excepciones antes de que escalen.' },
    ],
    assurance: [
      { label: 'Privacidad', value: 'solo lo necesario', detail: 'La vista cliente evita ruido tecnico y expone informacion util para operar.' },
      { label: 'Roles', value: 'responsables claros', detail: 'Cada accion se puede leer por equipo, sitio y prioridad.' },
      { label: 'SLA', value: 'tiempos visibles', detail: 'Confirmacion, resolucion y alertas pendientes quedan medibles.' },
      { label: 'Auditoria', value: 'historia completa', detail: 'Eventos, evidencia e incidentes quedan ordenados para revisar y mejorar.' },
    ],
    shiftFlow: [
      { label: 'Abrir operacion', moment: 'inicio', detail: 'Revisar estado, alertas y conexiones antes de iniciar la jornada.' },
      { label: 'Monitorear cambios', moment: 'durante', detail: 'Distinguir rutina, excepcion y riesgo con contexto de sitio.' },
      { label: 'Escalar alerta', moment: 'alerta', detail: 'Usar evidencia y responsable antes de convertir un aviso en incidente.' },
      { label: 'Cerrar aprendizaje', moment: 'cierre', detail: 'Registrar resultado para mejorar reglas, tiempos y respuesta.' },
    ],
    escalationMatrix: [
      { label: 'Alerta critica', trigger: 'Evento de prioridad alta o incidente abierto.', owner: 'Responsable del sitio', response: 'Confirmar evidencia, asignar accion y registrar seguimiento.' },
      { label: 'Conexion con revision', trigger: 'Equipo o enlace relevante deja de reportar.', owner: 'Operacion', response: 'Revisar continuidad y restaurar visibilidad.' },
      { label: 'Actividad sensible', trigger: 'Movimiento fuera de horario o zona restringida.', owner: 'Equipo de turno', response: 'Validar contexto antes de escalar.' },
    ],
    evidencePackage: [
      { label: 'Senal', detail: 'Evento, sensor o aviso que inicio la revision.' },
      { label: 'Contexto', detail: 'Lugar, hora, equipo y evidencia asociada.' },
      { label: 'Cierre', detail: 'Decision, responsable y aprendizaje operativo.' },
    ],
    responsePlan: [
      'Revisar primero alertas criticas y conexiones con atencion.',
      'Confirmar evidencia antes de escalar una excepcion.',
      'Asignar responsable y registrar cierre del incidente.',
      'Usar el historial para ajustar reglas y reducir ruido operativo.',
    ],
    metricLabels: {
      camera: 'Camaras',
      sensor: 'Sensores',
      alert: 'Alertas',
      access: 'Accesos',
    },
    recommendedStableAction: 'Mantener supervision normal.',
    recommendedAttentionAction: 'Revisar los avisos activos y confirmar recepcion si corresponde.',
  }
}

function determineStatus(devices: Device[]): { status: PortalSiteStatus; label: string } {
  if (devices.some((device) => device.estado === 'falla')) {
    return { status: 'atencion', label: 'Requiere atencion' }
  }
  if (devices.some((device) => device.estado === 'mantencion' || device.estado === 'inactivo')) {
    return { status: 'revision', label: 'En revision' }
  }
  return { status: 'operativo', label: 'Operativo' }
}

function isCamera(device: Device) {
  return device.tipo === 'camara_ip' || device.tipo === 'camara_analogica'
}

function isSensor(device: Device) {
  return [
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
}

function getPortalGroup(device: Device): PortalDeviceBucket['key'] {
  const explicitGroup = device.metadata?.portalGroup
  if (['camera', 'sensor', 'alert', 'access', 'other'].includes(String(explicitGroup))) {
    return explicitGroup as PortalDeviceBucket['key']
  }
  if (isCamera(device)) return 'camera'
  if (isSensor(device)) return 'sensor'
  if (device.tipo === 'control_acceso') return 'access'
  if (device.estado === 'falla' || device.estado === 'mantencion') return 'alert'
  return 'other'
}

export function isOpenPortalIncident(incident: PortalIncident) {
  return openIncidentStatuses.includes(incident.status)
}

export function getPortalDeviceBuckets(devices: Device[]): PortalDeviceBucket[] {
  const buckets: PortalDeviceBucket[] = [
    { key: 'camera', label: 'Camaras', count: 0, devices: [] },
    { key: 'sensor', label: 'Sensores', count: 0, devices: [] },
    { key: 'alert', label: 'Alertas', count: 0, devices: [] },
    { key: 'access', label: 'Accesos', count: 0, devices: [] },
    { key: 'other', label: 'Otros', count: 0, devices: [] },
  ]

  for (const device of devices) {
    buckets.find((entry) => entry.key === getPortalGroup(device))?.devices.push(device)
  }

  return buckets.map((bucket) => ({
    ...bucket,
    count: bucket.devices.length,
    devices: bucket.devices.sort((left, right) => {
      const leftAt = left.lastSeenAt || left.fechaActualizacion
      const rightAt = right.lastSeenAt || right.fechaActualizacion
      return rightAt.getTime() - leftAt.getTime()
    }),
  }))
}

export function getPortalSensorRisk(devices: Device[]): PortalSensorRisk {
  return devices.filter(isSensor).reduce<PortalSensorRisk>(
    (risk, device) => {
      if (device.estado === 'falla') risk.critical += 1
      else if (device.estado === 'mantencion' || device.estado === 'inactivo') risk.attention += 1
      else risk.stable += 1
      return risk
    },
    { stable: 0, attention: 0, critical: 0 }
  )
}

function mapDeviceKind(kind: string, metadata: Record<string, unknown>): Device['tipo'] {
  if (kind === 'camera') return 'camara_ip'
  if (kind === 'entry') return 'sensor_puerta'
  if (kind === 'motion') return 'sensor_movimiento'
  if (kind === 'smoke') return 'sensor_humo'
  if (kind === 'gas') return 'sensor_gas'
  if (kind === 'water') return 'sensor_agua'
  if (kind === 'access') return 'control_acceso'
  if (kind === 'gateway') return 'gateway_iot'
  if (kind === 'environment' && metadata.deviceClass === 'temperature') return 'sensor_temperatura'
  if (kind === 'environment' && metadata.deviceClass === 'humidity') return 'sensor_humedad'
  return 'otro'
}

function mapDeviceStatus(status: string): Device['estado'] {
  if (status === 'online') return 'activo'
  if (status === 'offline') return 'inactivo'
  if (status === 'alert') return 'falla'
  return 'mantencion'
}

function getSafeEvidenceName(objectPath: string) {
  return objectPath.split('/').filter(Boolean).at(-1) || 'evidencia-capturada'
}

function getIncidentEvidence(incident: Omit<PortalIncident, 'relatedEvents' | 'evidence'>, snapshots: PortalSnapshot[]): PortalIncidentEvidence[] {
  const incidentStartedAt = incident.createdAt.getTime()
  const windowStart = incidentStartedAt - 30 * 60 * 1000
  const windowEnd = incidentStartedAt + 2 * 60 * 60 * 1000

  return snapshots
    .filter((snapshot) => {
      const capturedAt = snapshot.capturedAt.getTime()
      return capturedAt >= windowStart && capturedAt <= windowEnd
    })
    .sort((left, right) => right.capturedAt.getTime() - left.capturedAt.getTime())
    .slice(0, 3)
    .map((snapshot) => {
      const fileName = getSafeEvidenceName(snapshot.objectPath)
      return {
        id: snapshot.id,
        title: `Captura cercana - ${fileName}`,
        capturedAt: snapshot.capturedAt,
        deviceId: snapshot.deviceId,
        fileName,
        association: 'time_window',
        pinned: false,
      }
    })
}

function getAverage(values: number[]) {
  if (values.length === 0) return undefined
  return values.reduce((total, value) => total + value, 0) / values.length
}

function formatCommitmentDuration(value: number | undefined, unit: 'min' | 'h') {
  if (typeof value !== 'number') return 'Sin historial'
  return `${Math.round(value)} ${unit}`
}

function buildOperationalReport({
  events,
  incidents,
  notifications,
}: {
  events: PortalEvent[]
  incidents: PortalIncident[]
  notifications: PortalNotificationMetric[]
}): PortalOperationalReport {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const eventsToday = events.filter((event) => event.occurredAt >= todayStart)
  const monthIncidents = incidents.filter((incident) => incident.createdAt >= monthStart)
  const resolvedThisMonth = incidents.filter((incident) => incident.resolvedAt && incident.resolvedAt >= monthStart)
  const confirmationMinutes = notifications
    .filter((notification) => notification.acknowledgedAt)
    .map((notification) => (notification.acknowledgedAt!.getTime() - notification.createdAt.getTime()) / 60_000)
    .filter((value) => value >= 0)
  const resolutionHours = incidents
    .filter((incident) => incident.resolvedAt)
    .map((incident) => (incident.resolvedAt!.getTime() - incident.createdAt.getTime()) / 3_600_000)
    .filter((value) => value >= 0)

  return {
    eventsToday: eventsToday.length,
    criticalEventsToday: eventsToday.filter((event) => event.severity === 'critical').length,
    incidentsThisMonth: monthIncidents.length,
    resolvedThisMonth: resolvedThisMonth.length,
    overdueConfirmations: notifications.filter((notification) =>
      notification.status === 'escalated' ||
      Boolean(!notification.acknowledgedAt && notification.dueAt.getTime() <= now.getTime())
    ).length,
    averageConfirmationMinutes: getAverage(confirmationMinutes),
    averageResolutionHours: getAverage(resolutionHours),
  }
}

export async function getAccessiblePortalSites(user: AuthUser): Promise<PortalSiteSummary[]> {
  if (user.propertyIds.length === 0) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) throw new Error('Portal data service is not configured.')

  const [
    propertiesResult,
    organizationsResult,
    spacesResult,
    devicesResult,
    eventsResult,
    snapshotsResult,
    gatewaysResult,
    incidentsResult,
    incidentEventsResult,
    incidentEvidenceResult,
    notificationsResult,
  ] = await Promise.all([
    supabase.from('properties').select('id, organization_id, name, address, updated_at').in('id', user.propertyIds),
    supabase.from('organizations').select('id, name').in('id', user.clientIds),
    supabase.from('spaces').select('id, property_id, name').in('property_id', user.propertyIds),
    supabase
      .from('devices')
      .select('id, property_id, space_id, external_id, name, kind, status, last_seen_at, metadata, created_at, updated_at')
      .in('property_id', user.propertyIds),
    supabase
      .from('events')
      .select('id, property_id, event_type, severity, state, occurred_at, payload')
      .in('property_id', user.propertyIds)
      .order('occurred_at', { ascending: false })
      .limit(100),
    supabase
      .from('camera_snapshots')
      .select('id, property_id, device_id, object_path, mime_type, size_bytes, captured_at, created_at')
      .in('property_id', user.propertyIds)
      .order('captured_at', { ascending: false })
      .limit(100),
    supabase
      .from('gateways')
      .select('id, property_id, status, last_seen_at, updated_at')
      .in('property_id', user.propertyIds),
    supabase
      .from('incidents')
      .select('id, property_id, title, description, severity, status, acknowledged_at, resolved_at, created_at, updated_at')
      .in('property_id', user.propertyIds)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('incident_events')
      .select('incident_id, property_id, created_at, events(id, property_id, event_type, severity, state, occurred_at, payload)')
      .in('property_id', user.propertyIds),
    supabase
      .from('incident_evidence')
      .select('incident_id, association, note, camera_snapshots(id, property_id, device_id, object_path, mime_type, captured_at, created_at)')
      .in('property_id', user.propertyIds),
    supabase
      .from('notifications')
      .select('id, property_id, severity, status, due_at, acknowledged_at, escalated_at, created_at')
      .in('property_id', user.propertyIds)
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  const queryError =
    propertiesResult.error ||
    organizationsResult.error ||
    spacesResult.error ||
    devicesResult.error ||
    eventsResult.error ||
    snapshotsResult.error ||
    gatewaysResult.error ||
    incidentsResult.error ||
    incidentEventsResult.error ||
    notificationsResult.error
  if (queryError) throw new Error(`Portal data query failed: ${queryError.message}`)
  const incidentEvidenceUnavailable = Boolean(incidentEvidenceResult.error)

  const organizationNames = new Map((organizationsResult.data || []).map((organization) => [
    organization.id,
    organization.name,
  ]))
  const spaces = new Map((spacesResult.data || []).map((space) => [space.id, space.name]))
  const spacesByProperty = new Map<string, PortalSpace[]>()
  const devicesByProperty = new Map<string, Device[]>()
  const eventsByProperty = new Map<string, PortalEvent[]>()
  const documentsByProperty = new Map<string, Document[]>()
  const snapshotsByProperty = new Map<string, PortalSnapshot[]>()
  const gatewayHealthByProperty = new Map<string, PortalGatewayHealth>()
  const incidentsByProperty = new Map<string, PortalIncident[]>()
  const incidentEventsByIncident = new Map<string, PortalEvent[]>()
  const incidentEvidenceByIncident = new Map<string, PortalIncidentEvidence[]>()
  const notificationsByProperty = new Map<string, PortalNotificationMetric[]>()

  for (const row of spacesResult.data || []) {
    spacesByProperty.set(row.property_id, [
      ...(spacesByProperty.get(row.property_id) || []),
      { id: row.id, name: row.name, cameraCount: 0, sensorCount: 0, alertCount: 0 },
    ])
  }

  for (const row of devicesResult.data || []) {
    const metadata = (row.metadata || {}) as Record<string, unknown>
    const device: Device = {
      id: row.id,
      proyectoId: row.property_id,
      tipo: mapDeviceKind(row.kind, metadata),
      externalId: row.external_id,
      displayName: row.name,
      marca: 'Equipo conectado',
      protocolo: 'http',
      ubicacionDescripcion: row.space_id ? spaces.get(row.space_id) || 'Espacio vigilado' : 'Espacio por asignar',
      estado: mapDeviceStatus(row.status),
      lastSeenAt: row.last_seen_at ? new Date(row.last_seen_at) : undefined,
      metadata: {
        ...metadata,
        spaceId: row.space_id || undefined,
        portalGroup: row.kind === 'camera' ? 'camera' : undefined,
      },
      fechaCreacion: new Date(row.created_at),
      fechaActualizacion: new Date(row.updated_at),
    }
    devicesByProperty.set(row.property_id, [...(devicesByProperty.get(row.property_id) || []), device])
  }

  for (const row of eventsResult.data || []) {
    const payload = (row.payload || {}) as Record<string, unknown>
    const event: PortalEvent = {
      id: row.id,
      type: row.event_type,
      severity: row.severity as PortalEvent['severity'],
      state: row.state || undefined,
      title: typeof payload.title === 'string'
        ? payload.title
        : typeof payload.description === 'string'
          ? payload.description
          : row.event_type.replace(/[._]/g, ' '),
      occurredAt: new Date(row.occurred_at),
    }
    eventsByProperty.set(row.property_id, [...(eventsByProperty.get(row.property_id) || []), event])
  }

  for (const row of snapshotsResult.data || []) {
    const snapshot: PortalSnapshot = {
      id: row.id,
      propertyId: row.property_id,
      deviceId: row.device_id || undefined,
      objectPath: row.object_path,
      mimeType: row.mime_type,
      capturedAt: new Date(row.captured_at),
      createdAt: new Date(row.created_at),
    }
    snapshotsByProperty.set(row.property_id, [...(snapshotsByProperty.get(row.property_id) || []), snapshot])

    const evidenceName = getSafeEvidenceName(row.object_path)
    const document: Document = {
      id: row.id,
      proyectoId: row.property_id,
      tipo: 'fotografia_evidencia',
      titulo: `Evidencia capturada - ${evidenceName}`,
      version: '1',
      estado: 'aprobado',
      archivoNombre: evidenceName,
      resumenIA: row.mime_type || 'Evidencia operativa',
      autor: 'SegurIA',
      fechaCreacion: new Date(row.created_at),
      fechaActualizacion: new Date(row.captured_at),
    }
    documentsByProperty.set(row.property_id, [
      ...(documentsByProperty.get(row.property_id) || []),
      document,
    ])
  }

  if (!incidentEvidenceUnavailable) {
    for (const row of incidentEvidenceResult.data || []) {
      const snapshotRow = Array.isArray(row.camera_snapshots) ? row.camera_snapshots[0] : row.camera_snapshots
      if (!snapshotRow) continue

      const fileName = getSafeEvidenceName(snapshotRow.object_path)
      const evidence: PortalIncidentEvidence = {
        id: snapshotRow.id,
        title: `Evidencia fijada - ${fileName}`,
        capturedAt: new Date(snapshotRow.captured_at),
        deviceId: snapshotRow.device_id || undefined,
        fileName,
        association: ['primary', 'correlated', 'operator_pinned', 'time_window'].includes(String(row.association))
          ? row.association as PortalIncidentEvidence['association']
          : 'operator_pinned',
        note: row.note || undefined,
        pinned: true,
      }
      incidentEvidenceByIncident.set(row.incident_id, [
        ...(incidentEvidenceByIncident.get(row.incident_id) || []),
        evidence,
      ])
    }
  }

  for (const row of gatewaysResult.data || []) {
    const current = gatewayHealthByProperty.get(row.property_id) || {
      total: 0,
      online: 0,
      degraded: 0,
      offline: 0,
      lastSeenAt: undefined,
    }
    const lastSeenAt = row.last_seen_at ? new Date(row.last_seen_at) : row.updated_at ? new Date(row.updated_at) : undefined
    current.total += 1
    if (row.status === 'online') current.online += 1
    else if (row.status === 'degraded') current.degraded += 1
    else current.offline += 1
    if (lastSeenAt && (!current.lastSeenAt || lastSeenAt.getTime() > current.lastSeenAt.getTime())) {
      current.lastSeenAt = lastSeenAt
    }
    gatewayHealthByProperty.set(row.property_id, current)
  }

  for (const row of incidentsResult.data || []) {
    const status = row.status as PortalIncidentStatus
    const incidentBase = {
      id: row.id,
      propertyId: row.property_id,
      title: row.title,
      description: row.description || undefined,
      severity: row.severity as PortalIncident['severity'],
      status,
      statusLabel: incidentStatusLabels[status] || status,
      acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at) : undefined,
      resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
    const incident: PortalIncident = {
      ...incidentBase,
      relatedEvents: [],
      evidence: (incidentEvidenceByIncident.get(row.id) || [])
        .sort((left, right) => right.capturedAt.getTime() - left.capturedAt.getTime()),
    }
    if (incident.evidence.length === 0) {
      incident.evidence = getIncidentEvidence(incidentBase, snapshotsByProperty.get(row.property_id) || [])
    }
    incidentsByProperty.set(row.property_id, [...(incidentsByProperty.get(row.property_id) || []), incident])
  }

  for (const row of incidentEventsResult.data || []) {
    const eventRow = Array.isArray(row.events) ? row.events[0] : row.events
    if (!eventRow) continue

    const payload = (eventRow.payload || {}) as Record<string, unknown>
    const event: PortalEvent = {
      id: eventRow.id,
      type: eventRow.event_type,
      severity: eventRow.severity as PortalEvent['severity'],
      state: eventRow.state || undefined,
      title: typeof payload.title === 'string'
        ? payload.title
        : typeof payload.description === 'string'
          ? payload.description
          : eventRow.event_type.replace(/[._]/g, ' '),
      occurredAt: new Date(eventRow.occurred_at),
    }
    incidentEventsByIncident.set(row.incident_id, [
      ...(incidentEventsByIncident.get(row.incident_id) || []),
      event,
    ])
  }

  for (const [propertyId, incidents] of incidentsByProperty.entries()) {
    incidentsByProperty.set(propertyId, incidents.map((incident) => ({
      ...incident,
      relatedEvents: (incidentEventsByIncident.get(incident.id) || [])
        .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime())
        .slice(0, 5),
    })))
  }

  for (const row of notificationsResult.data || []) {
    const notification: PortalNotificationMetric = {
      propertyId: row.property_id,
      severity: row.severity as PortalNotificationMetric['severity'],
      status: row.status,
      dueAt: new Date(row.due_at),
      createdAt: new Date(row.created_at),
      acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at) : undefined,
      escalatedAt: row.escalated_at ? new Date(row.escalated_at) : undefined,
    }
    notificationsByProperty.set(row.property_id, [...(notificationsByProperty.get(row.property_id) || []), notification])
  }

  return (propertiesResult.data || []).map((property) => {
    const organizationName = organizationNames.get(property.organization_id) || property.name
    const visual = getPortalSiteVisual(organizationName, property.name)
    const profile = getPortalSiteProfile(organizationName, property.name)
    const devices = devicesByProperty.get(property.id) || []
    const events = eventsByProperty.get(property.id) || []
    const documents = documentsByProperty.get(property.id) || []
    const incidents = incidentsByProperty.get(property.id) || []
    const notifications = notificationsByProperty.get(property.id) || []
    const buckets = getPortalDeviceBuckets(devices)
    const siteSpaces = (spacesByProperty.get(property.id) || []).map((space) => {
      const spaceDevices = devices.filter((device) => device.metadata?.spaceId === space.id)
      const lastUpdatedAt = spaceDevices
        .map((device) => device.lastSeenAt || device.fechaActualizacion)
        .sort((left, right) => right.getTime() - left.getTime())[0]

      return {
        ...space,
        cameraCount: spaceDevices.filter(isCamera).length,
        sensorCount: spaceDevices.filter(isSensor).length,
        alertCount: spaceDevices.filter((device) => device.estado === 'falla' || device.estado === 'mantencion').length,
        lastUpdatedAt,
      }
    })
    const { status, label } = determineStatus(devices)
    const lastDeviceUpdate = devices
      .map((device) => device.lastSeenAt || device.fechaActualizacion)
      .sort((left, right) => right.getTime() - left.getTime())[0]

    return {
      organizationId: property.organization_id,
      organizationName,
      propertyId: property.id,
      projectId: property.id,
      label: property.name,
      location: property.address || 'Ubicacion por definir',
      ...visual,
      status,
      statusLabel: label,
      deviceCount: devices.length,
      cameraCount: buckets.find((bucket) => bucket.key === 'camera')?.count || 0,
      sensorCount: buckets.find((bucket) => bucket.key === 'sensor')?.count || 0,
      accessCount: buckets.find((bucket) => bucket.key === 'access')?.count || 0,
      documentCount: documents.length,
      alertCount: devices.filter((device) => device.estado === 'falla').length + incidents.filter(isOpenPortalIncident).length,
      lastUpdatedAt: lastDeviceUpdate || new Date(property.updated_at),
      devices,
      documents,
      events,
      incidents,
      gatewayHealth: gatewayHealthByProperty.get(property.id) || { total: 0, online: 0, degraded: 0, offline: 0 },
      report: buildOperationalReport({ events, incidents, notifications }),
      profile,
      spaces: siteSpaces,
    }
  })
}

export async function getPortalSiteForUser(user: AuthUser, propertyId: string) {
  const sites = await getAccessiblePortalSites(user)
  return sites.find((site) => site.propertyId === propertyId)
}

export function getPortalDashboardTotals(sites: PortalSiteSummary[]) {
  const buckets = sites.flatMap((site) => getPortalDeviceBuckets(site.devices))
  return {
    organizations: new Set(sites.map((site) => site.organizationId)).size,
    sites: sites.length,
    devices: sites.reduce((total, site) => total + site.deviceCount, 0),
    cameras: buckets.filter((bucket) => bucket.key === 'camera').reduce((total, bucket) => total + bucket.count, 0),
    sensors: buckets.filter((bucket) => bucket.key === 'sensor').reduce((total, bucket) => total + bucket.count, 0),
    alerts: sites.reduce((total, site) => total + site.alertCount, 0),
    documents: sites.reduce((total, site) => total + site.documentCount, 0),
    openIncidents: sites.reduce((total, site) => total + site.incidents.filter(isOpenPortalIncident).length, 0),
    onlineGateways: sites.reduce((total, site) => total + site.gatewayHealth.online, 0),
    offlineGateways: sites.reduce((total, site) => total + site.gatewayHealth.offline + site.gatewayHealth.degraded, 0),
    eventsToday: sites.reduce((total, site) => total + site.report.eventsToday, 0),
    criticalEventsToday: sites.reduce((total, site) => total + site.report.criticalEventsToday, 0),
    incidentsThisMonth: sites.reduce((total, site) => total + site.report.incidentsThisMonth, 0),
    resolvedThisMonth: sites.reduce((total, site) => total + site.report.resolvedThisMonth, 0),
    overdueConfirmations: sites.reduce((total, site) => total + site.report.overdueConfirmations, 0),
  }
}

export function getPortalPortfolioReport(sites: PortalSiteSummary[]): PortalOperationalReport {
  const confirmationValues = sites
    .map((site) => site.report.averageConfirmationMinutes)
    .filter((value): value is number => typeof value === 'number')
  const resolutionValues = sites
    .map((site) => site.report.averageResolutionHours)
    .filter((value): value is number => typeof value === 'number')

  return {
    eventsToday: sites.reduce((total, site) => total + site.report.eventsToday, 0),
    criticalEventsToday: sites.reduce((total, site) => total + site.report.criticalEventsToday, 0),
    incidentsThisMonth: sites.reduce((total, site) => total + site.report.incidentsThisMonth, 0),
    resolvedThisMonth: sites.reduce((total, site) => total + site.report.resolvedThisMonth, 0),
    overdueConfirmations: sites.reduce((total, site) => total + site.report.overdueConfirmations, 0),
    averageConfirmationMinutes: getAverage(confirmationValues),
    averageResolutionHours: getAverage(resolutionValues),
  }
}

export function getPortalOperationalScore(sites: PortalSiteSummary[]): PortalOperationalScore {
  if (sites.length === 0) {
    return {
      score: 0,
      label: 'Sin datos',
      tone: 'warning',
      summary: 'Aun no hay sitios conectados para calcular salud operativa.',
      drivers: ['Agregar el primer sitio protegido', 'Cargar inventario y eventos iniciales'],
    }
  }

  const totals = getPortalDashboardTotals(sites)
  const sensorRisk = sites.reduce(
    (current, site) => {
      const next = getPortalSensorRisk(site.devices)
      current.stable += next.stable
      current.attention += next.attention
      current.critical += next.critical
      return current
    },
    { stable: 0, attention: 0, critical: 0 }
  )
  const penalties = [
    totals.criticalEventsToday * 10,
    totals.openIncidents * 8,
    totals.offlineGateways * 6,
    sensorRisk.critical * 6,
    sensorRisk.attention * 3,
    totals.overdueConfirmations * 8,
  ]
  const score = Math.max(0, Math.min(100, 100 - penalties.reduce((total, value) => total + value, 0)))
  const drivers = [
    totals.openIncidents > 0 ? `${totals.openIncidents} incidente${totals.openIncidents === 1 ? '' : 's'} abierto${totals.openIncidents === 1 ? '' : 's'}` : 'Sin incidentes abiertos',
    totals.offlineGateways > 0 ? `${totals.offlineGateways} conexion${totals.offlineGateways === 1 ? '' : 'es'} con revision` : 'Conexiones estables',
    sensorRisk.critical > 0 ? `${sensorRisk.critical} sensor${sensorRisk.critical === 1 ? '' : 'es'} critico${sensorRisk.critical === 1 ? '' : 's'}` : 'Sensores sin criticidad',
    totals.overdueConfirmations > 0 ? `${totals.overdueConfirmations} confirmacion${totals.overdueConfirmations === 1 ? '' : 'es'} vencida${totals.overdueConfirmations === 1 ? '' : 's'}` : 'Confirmaciones al dia',
  ]

  if (score >= 86) {
    return {
      score,
      label: 'Operacion sana',
      tone: 'ok',
      summary: 'La operacion esta visible, trazable y sin senales criticas abiertas.',
      drivers,
    }
  }

  if (score >= 68) {
    return {
      score,
      label: 'Operacion con atencion',
      tone: 'warning',
      summary: 'Hay puntos puntuales que conviene revisar antes del cierre operativo.',
      drivers,
    }
  }

  return {
    score,
    label: 'Operacion exigida',
    tone: 'critical',
    summary: 'La prioridad es estabilizar eventos, conexiones o confirmaciones pendientes.',
    drivers,
  }
}

export function getPortalDailyPriorities(sites: PortalSiteSummary[]): PortalDailyPriority[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-portal',
      siteLabel: 'Sin sitio',
      title: 'Completar primera operacion',
      detail: 'Aun no hay sitios visibles para construir una lectura diaria.',
      action: 'Crear o asignar el primer sitio protegido.',
      tone: 'warning',
      rank: 90,
    }]
  }

  const priorities = sites.flatMap((site) => {
    const sensorRisk = getPortalSensorRisk(site.devices)
    const openIncidents = site.incidents.filter(isOpenPortalIncident)
    const evidenceMissing = openIncidents.filter((incident) => incident.evidence.length === 0).length
    const gatewayRisk = site.gatewayHealth.offline + site.gatewayHealth.degraded
    const criticalEvents = site.events.filter((event) => event.severity === 'critical')
    const items: PortalDailyPriority[] = []

    if (openIncidents.length > 0) {
      const criticalIncidents = openIncidents.filter((incident) => incident.severity === 'critical').length
      items.push({
        id: `${site.propertyId}-open-incidents`,
        siteLabel: site.label,
        title: criticalIncidents > 0 ? 'Incidente critico abierto' : 'Incidente en seguimiento',
        detail: `${openIncidents.length} incidente${openIncidents.length === 1 ? '' : 's'} requiere${openIncidents.length === 1 ? '' : 'n'} cierre operativo.`,
        action: 'Revisar responsable, evidencia y siguiente accion antes del cierre del turno.',
        tone: criticalIncidents > 0 ? 'critical' : 'warning',
        rank: criticalIncidents > 0 ? 100 : 82,
      })
    }

    if (site.report.overdueConfirmations > 0) {
      items.push({
        id: `${site.propertyId}-overdue-confirmations`,
        siteLabel: site.label,
        title: 'Confirmacion vencida',
        detail: `${site.report.overdueConfirmations} aviso${site.report.overdueConfirmations === 1 ? '' : 's'} paso${site.report.overdueConfirmations === 1 ? '' : 'n'} el tiempo esperado de respuesta.`,
        action: 'Confirmar recepcion y registrar si corresponde escalamiento o cierre.',
        tone: 'critical',
        rank: 96,
      })
    }

    if (criticalEvents.length > 0) {
      items.push({
        id: `${site.propertyId}-critical-events`,
        siteLabel: site.label,
        title: 'Senales criticas recientes',
        detail: `${criticalEvents.length} evento${criticalEvents.length === 1 ? '' : 's'} critico${criticalEvents.length === 1 ? '' : 's'} aparece${criticalEvents.length === 1 ? '' : 'n'} en la lectura reciente.`,
        action: 'Cruzar lugar, hora y evidencia antes de decidir si se mantiene seguimiento.',
        tone: 'critical',
        rank: 94,
      })
    }

    if (gatewayRisk > 0) {
      items.push({
        id: `${site.propertyId}-continuity-risk`,
        siteLabel: site.label,
        title: 'Continuidad con revision',
        detail: `${gatewayRisk} conexion${gatewayRisk === 1 ? '' : 'es'} necesita${gatewayRisk === 1 ? '' : 'n'} atencion para sostener visibilidad.`,
        action: 'Priorizar restitucion de la lectura antes de depender solo de rondas manuales.',
        tone: 'warning',
        rank: 78,
      })
    }

    if (sensorRisk.critical > 0 || sensorRisk.attention > 0) {
      const sensorCount = sensorRisk.critical + sensorRisk.attention
      items.push({
        id: `${site.propertyId}-sensor-risk`,
        siteLabel: site.label,
        title: sensorRisk.critical > 0 ? 'Sensores criticos' : 'Sensores para revisar',
        detail: `${sensorCount} sensor${sensorCount === 1 ? '' : 'es'} no esta${sensorCount === 1 ? '' : 'n'} en lectura normal.`,
        action: site.profile.recommendedAttentionAction,
        tone: sensorRisk.critical > 0 ? 'critical' : 'warning',
        rank: sensorRisk.critical > 0 ? 88 : 70,
      })
    }

    if (evidenceMissing > 0) {
      items.push({
        id: `${site.propertyId}-evidence-gap`,
        siteLabel: site.label,
        title: 'Evidencia incompleta',
        detail: `${evidenceMissing} incidente${evidenceMissing === 1 ? '' : 's'} abierto${evidenceMissing === 1 ? '' : 's'} no muestra${evidenceMissing === 1 ? '' : 'n'} captura asociada.`,
        action: 'Abrir el incidente y confirmar si requiere respaldo visual o cierre documentado.',
        tone: 'warning',
        rank: 74,
      })
    }

    if (items.length === 0) {
      items.push({
        id: `${site.propertyId}-stable-routine`,
        siteLabel: site.label,
        title: 'Rutina estable',
        detail: 'No hay incidentes abiertos ni senales criticas visibles para este sitio.',
        action: site.profile.recommendedStableAction,
        tone: 'ok',
        rank: 20,
      })
    }

    return items
  })

  return priorities
    .sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel))
    .slice(0, 6)
}

export function getPortalCoverageZones(site: PortalSiteSummary): PortalCoverageZone[] {
  const zones = site.spaces.length > 0
    ? site.spaces
    : site.profile.focusAreas.map((area, index) => ({
        id: `${site.propertyId}-focus-${index}`,
        name: area,
        cameraCount: index === 0 ? site.cameraCount : 0,
        sensorCount: index === 0 ? site.sensorCount : 0,
        alertCount: index === 0 ? site.alertCount : 0,
        lastUpdatedAt: site.lastUpdatedAt,
      }))

  return zones.map((zone) => {
    const hasCamera = zone.cameraCount > 0
    const hasSensor = zone.sensorCount > 0
    const hasAlert = zone.alertCount > 0
    const updatedAt = zone.lastUpdatedAt
    const isFresh = updatedAt ? Date.now() - updatedAt.getTime() <= 24 * 60 * 60 * 1000 : false
    const score = Math.max(0, Math.min(100,
      (hasCamera ? 38 : 0) +
      (hasSensor ? 34 : 0) +
      (isFresh ? 18 : 0) +
      (!hasAlert ? 10 : -18)
    ))

    if (!hasCamera && !hasSensor) {
      return {
        id: `${site.propertyId}-${zone.id}`,
        siteLabel: site.label,
        name: zone.name,
        cameraCount: zone.cameraCount,
        sensorCount: zone.sensorCount,
        alertCount: zone.alertCount,
        score,
        statusLabel: 'Punto ciego',
        summary: 'No hay lectura visible asociada a esta zona.',
        action: 'Asignar una vista, sensor o revision operativa para cubrir este punto.',
        tone: 'critical' as const,
        updatedAt,
      }
    }

    if (hasAlert || score < 70) {
      return {
        id: `${site.propertyId}-${zone.id}`,
        siteLabel: site.label,
        name: zone.name,
        cameraCount: zone.cameraCount,
        sensorCount: zone.sensorCount,
        alertCount: zone.alertCount,
        score,
        statusLabel: hasAlert ? 'Con atencion' : 'Cobertura parcial',
        summary: hasAlert
          ? 'La zona tiene cobertura, pero aparece con avisos que conviene revisar.'
          : 'La zona esta visible, aunque falta reforzar lectura o recencia.',
        action: hasAlert ? site.profile.recommendedAttentionAction : 'Revisar si falta una senal complementaria o una actualizacion reciente.',
        tone: 'warning' as const,
        updatedAt,
      }
    }

    return {
      id: `${site.propertyId}-${zone.id}`,
      siteLabel: site.label,
      name: zone.name,
      cameraCount: zone.cameraCount,
      sensorCount: zone.sensorCount,
      alertCount: zone.alertCount,
      score,
      statusLabel: 'Cubierta',
      summary: 'La zona cuenta con lectura visible y sin avisos abiertos.',
      action: site.profile.recommendedStableAction,
      tone: 'ok' as const,
      updatedAt,
    }
  }).sort((left, right) => {
    const toneRank = { critical: 3, warning: 2, ok: 1 }
    return toneRank[right.tone] - toneRank[left.tone] || left.score - right.score || left.name.localeCompare(right.name)
  })
}

export function getPortalServiceCommitments(sites: PortalSiteSummary[]): PortalServiceCommitment[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-service',
      siteLabel: 'Sin sitio',
      label: 'Activacion inicial',
      target: 'Sitio visible',
      current: 'Pendiente',
      summary: 'Aun no hay una operacion publicada para medir servicio.',
      action: 'Asignar sitio, inventario y responsables antes de medir compromisos.',
      tone: 'warning',
      rank: 90,
    }]
  }

  const commitments = sites.flatMap((site) => {
    const openIncidents = site.incidents.filter(isOpenPortalIncident)
    const evidenceMissing = openIncidents.filter((incident) => incident.evidence.length === 0).length
    const gatewayRisk = site.gatewayHealth.offline + site.gatewayHealth.degraded
    const confirmationTone = site.report.overdueConfirmations > 0
      ? 'critical'
      : typeof site.report.averageConfirmationMinutes === 'number' && site.report.averageConfirmationMinutes > 30
        ? 'warning'
        : 'ok'
    const resolutionTone = openIncidents.some((incident) => incident.severity === 'critical')
      ? 'critical'
      : openIncidents.length > 0
        ? 'warning'
        : 'ok'
    const evidenceTone = evidenceMissing > 0 ? 'warning' : 'ok'
    const continuityTone = gatewayRisk > 0 ? 'warning' : 'ok'

    return [
      {
        id: `${site.propertyId}-acknowledgement`,
        siteLabel: site.label,
        label: 'Confirmacion de avisos',
        target: 'Alta en 5 min / atencion en 30 min',
        current: site.report.overdueConfirmations > 0
          ? `${site.report.overdueConfirmations} vencida${site.report.overdueConfirmations === 1 ? '' : 's'}`
          : formatCommitmentDuration(site.report.averageConfirmationMinutes, 'min'),
        summary: site.report.overdueConfirmations > 0
          ? 'Hay avisos que pasaron el tiempo esperado de confirmacion.'
          : 'Los avisos quedan medidos para saber si el equipo responde a tiempo.',
        action: site.report.overdueConfirmations > 0
          ? 'Confirmar recepcion y documentar si corresponde escalamiento.'
          : 'Mantener confirmacion visible y revisar demoras al cierre del turno.',
        tone: confirmationTone,
        rank: confirmationTone === 'critical' ? 100 : confirmationTone === 'warning' ? 76 : 25,
      },
      {
        id: `${site.propertyId}-incident-closure`,
        siteLabel: site.label,
        label: 'Cierre de incidentes',
        target: 'Responsable, causa y cierre trazable',
        current: openIncidents.length > 0 ? `${openIncidents.length} abierto${openIncidents.length === 1 ? '' : 's'}` : formatCommitmentDuration(site.report.averageResolutionHours, 'h'),
        summary: openIncidents.length > 0
          ? 'Hay situaciones que todavia necesitan seguimiento operativo.'
          : 'Los cierres quedan medidos para mejorar respuesta y aprendizaje.',
        action: openIncidents.length > 0
          ? 'Asignar responsable, revisar evidencia y dejar siguiente accion clara.'
          : 'Revisar cierres mensuales y ajustar reglas si hubo ruido operativo.',
        tone: resolutionTone,
        rank: resolutionTone === 'critical' ? 96 : resolutionTone === 'warning' ? 80 : 22,
      },
      {
        id: `${site.propertyId}-evidence-quality`,
        siteLabel: site.label,
        label: 'Evidencia lista',
        target: 'Evento + contexto + respaldo',
        current: evidenceMissing > 0 ? `${evidenceMissing} incompleta${evidenceMissing === 1 ? '' : 's'}` : 'Disponible',
        summary: evidenceMissing > 0
          ? 'Algunos incidentes abiertos aun no muestran respaldo visual o documental.'
          : 'La informacion critica queda preparada para explicar decisiones.',
        action: evidenceMissing > 0
          ? 'Completar respaldo o cerrar con causa documentada.'
          : 'Mantener capturas y documentos asociados a cada situacion relevante.',
        tone: evidenceTone,
        rank: evidenceTone === 'warning' ? 72 : 18,
      },
      {
        id: `${site.propertyId}-continuity`,
        siteLabel: site.label,
        label: 'Continuidad visible',
        target: 'Lectura operativa sin puntos mudos',
        current: gatewayRisk > 0 ? `${gatewayRisk} con revision` : 'Conectada',
        summary: gatewayRisk > 0
          ? 'Hay conexiones que pueden reducir visibilidad del sitio.'
          : 'La operacion mantiene lectura disponible para el cliente.',
        action: gatewayRisk > 0
          ? 'Restituir lectura antes de depender de supervision manual.'
          : 'Mantener revision normal de zonas y avisos relevantes.',
        tone: continuityTone,
        rank: continuityTone === 'warning' ? 68 : 15,
      },
    ] satisfies PortalServiceCommitment[]
  })

  return commitments
    .sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel))
    .slice(0, 8)
}

export function getPortalExecutiveBrief(sites: PortalSiteSummary[]): PortalExecutiveBrief {
  const now = new Date()
  const periodLabel = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(now)

  if (sites.length === 0) {
    return {
      title: 'Informe ejecutivo',
      periodLabel,
      verdict: 'Operacion pendiente de activacion',
      narrative: 'Todavia no hay sitios publicados para entregar una lectura ejecutiva de seguridad.',
      highlights: ['Sin sitios visibles', 'Sin inventario publicado', 'Sin evidencia operacional'],
      focus: ['Completar activacion inicial', 'Asignar responsables', 'Publicar primera lectura de seguridad'],
      tone: 'warning',
    }
  }

  const totals = getPortalDashboardTotals(sites)
  const score = getPortalOperationalScore(sites)
  const criticalSites = sites.filter((site) =>
    site.report.criticalEventsToday > 0 ||
    site.report.overdueConfirmations > 0 ||
    site.incidents.some((incident) => isOpenPortalIncident(incident) && incident.severity === 'critical')
  )
  const attentionSites = sites.filter((site) =>
    site.alertCount > 0 ||
    site.gatewayHealth.offline + site.gatewayHealth.degraded > 0 ||
    getPortalSensorRisk(site.devices).attention + getPortalSensorRisk(site.devices).critical > 0
  )
  const evidenceReady = sites.reduce((total, site) =>
    total + site.incidents.filter((incident) => incident.evidence.length > 0 || incident.relatedEvents.length > 0).length,
    0
  )
  const tone: PortalExecutiveBrief['tone'] = criticalSites.length > 0 || totals.overdueConfirmations > 0
    ? 'critical'
    : attentionSites.length > 0 || score.tone === 'warning'
      ? 'warning'
      : 'ok'
  const verdict = tone === 'critical'
    ? 'Hay temas criticos que requieren cierre'
    : tone === 'warning'
      ? 'Operacion controlada con puntos de atencion'
      : 'Operacion sana y trazable'
  const primaryRisk = criticalSites[0] || attentionSites[0]

  return {
    title: 'Informe ejecutivo',
    periodLabel,
    verdict,
    narrative: primaryRisk
      ? `${primaryRisk.label} concentra la principal lectura de atencion. El portal mantiene visibilidad sobre ${totals.sites} sitio${totals.sites === 1 ? '' : 's'}, ${totals.devices} equipo${totals.devices === 1 ? '' : 's'} y ${totals.openIncidents} incidente${totals.openIncidents === 1 ? '' : 's'} abierto${totals.openIncidents === 1 ? '' : 's'}.`
      : `La operacion mantiene una lectura estable sobre ${totals.sites} sitio${totals.sites === 1 ? '' : 's'} y ${totals.devices} equipo${totals.devices === 1 ? '' : 's'}, con trazabilidad para eventos, evidencia y respuesta.`,
    highlights: [
      `${score.score}/100 de salud operativa`,
      `${totals.eventsToday} evento${totals.eventsToday === 1 ? '' : 's'} visible${totals.eventsToday === 1 ? '' : 's'} hoy`,
      `${totals.resolvedThisMonth} incidente${totals.resolvedThisMonth === 1 ? '' : 's'} resuelto${totals.resolvedThisMonth === 1 ? '' : 's'} este mes`,
      `${evidenceReady} caso${evidenceReady === 1 ? '' : 's'} con evidencia o senales asociadas`,
    ],
    focus: [
      totals.overdueConfirmations > 0 ? 'Cerrar confirmaciones vencidas antes del cambio de turno.' : 'Mantener confirmacion de avisos dentro del tiempo esperado.',
      totals.openIncidents > 0 ? 'Revisar responsable y proxima accion de incidentes abiertos.' : 'Mantener bitacora limpia sin incidentes abiertos.',
      totals.offlineGateways > 0 ? 'Restituir continuidad en conexiones con revision.' : 'Conservar lectura continua de zonas prioritarias.',
      evidenceReady < totals.incidentsThisMonth ? 'Completar evidencia de cierres mensuales.' : 'Usar evidencia disponible para aprendizaje operativo.',
    ],
    tone,
  }
}

function getWindowSlot(date: Date) {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 23) return 'evening'
  return 'night'
}

const sensitiveWindowLabels = {
  morning: { label: 'Apertura', range: '05:00 - 12:00' },
  afternoon: { label: 'Operacion diaria', range: '12:00 - 18:00' },
  evening: { label: 'Cierre y cambios', range: '18:00 - 23:00' },
  night: { label: 'Noche sensible', range: '23:00 - 05:00' },
} as const

export function getPortalSensitiveWindows(sites: PortalSiteSummary[]): PortalSensitiveWindow[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-window',
      siteLabel: 'Sin sitio',
      label: 'Sin lectura',
      range: 'Pendiente',
      eventCount: 0,
      incidentCount: 0,
      criticalCount: 0,
      summary: 'Aun no hay actividad suficiente para detectar horarios sensibles.',
      action: 'Publicar eventos e incidentes del primer sitio para construir la lectura.',
      tone: 'warning',
      rank: 80,
    }]
  }

  const windows = sites.flatMap((site) => {
    const groups = {
      morning: { events: 0, incidents: 0, critical: 0 },
      afternoon: { events: 0, incidents: 0, critical: 0 },
      evening: { events: 0, incidents: 0, critical: 0 },
      night: { events: 0, incidents: 0, critical: 0 },
    }

    for (const event of site.events) {
      const slot = getWindowSlot(event.occurredAt)
      groups[slot].events += 1
      if (event.severity === 'critical') groups[slot].critical += 1
    }

    for (const incident of site.incidents) {
      const slot = getWindowSlot(incident.createdAt)
      groups[slot].incidents += 1
      if (incident.severity === 'critical') groups[slot].critical += 1
    }

    return Object.entries(groups).map(([slot, metrics]) => {
      const meta = sensitiveWindowLabels[slot as keyof typeof sensitiveWindowLabels]
      const tone: PortalSensitiveWindow['tone'] = metrics.critical > 0
        ? 'critical'
        : metrics.incidents > 0 || metrics.events >= 3
          ? 'warning'
          : 'ok'
      const rank = metrics.critical * 25 + metrics.incidents * 12 + metrics.events * 3
      return {
        id: `${site.propertyId}-${slot}`,
        siteLabel: site.label,
        label: meta.label,
        range: meta.range,
        eventCount: metrics.events,
        incidentCount: metrics.incidents,
        criticalCount: metrics.critical,
        summary: metrics.events + metrics.incidents === 0
          ? 'Sin senales relevantes en esta franja.'
          : `${metrics.events} evento${metrics.events === 1 ? '' : 's'} y ${metrics.incidents} incidente${metrics.incidents === 1 ? '' : 's'} aparecen en esta franja.`,
        action: tone === 'critical'
          ? 'Reforzar revision, evidencia y responsable durante esta ventana.'
          : tone === 'warning'
            ? 'Dejar esta franja en seguimiento y revisar si hay patron repetido.'
            : 'Mantener rutina normal y conservar lectura disponible.',
        tone,
        rank,
      }
    })
  })

  return windows
    .sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel))
    .slice(0, 8)
}

export function getPortalImprovementActions(sites: PortalSiteSummary[]): PortalImprovementAction[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-improvement',
      siteLabel: 'Sin sitio',
      title: 'Completar base operativa',
      why: 'Sin sitios ni equipos publicados no es posible medir cobertura, respuesta o evidencia.',
      nextStep: 'Activar el primer sitio, cargar inventario y asignar responsables.',
      expectedImpact: 'Primer tablero ejecutivo util para el cliente.',
      tone: 'warning',
      rank: 90,
    }]
  }

  const actions = sites.flatMap((site) => {
    const score = getPortalOperationalScore([site])
    const coverage = getPortalCoverageZones(site)
    const commitments = getPortalServiceCommitments([site])
    const windows = getPortalSensitiveWindows([site])
    const openIncidents = site.incidents.filter(isOpenPortalIncident)
    const blindZones = coverage.filter((zone) => zone.tone === 'critical')
    const partialZones = coverage.filter((zone) => zone.tone === 'warning')
    const serviceRisks = commitments.filter((commitment) => commitment.tone !== 'ok')
    const sensitiveRisks = windows.filter((window) => window.tone !== 'ok')
    const evidenceGaps = openIncidents.filter((incident) => incident.evidence.length === 0)
    const items: PortalImprovementAction[] = []

    if (score.score < 86) {
      items.push({
        id: `${site.propertyId}-score`,
        siteLabel: site.label,
        title: 'Subir salud operativa',
        why: `El sitio marca ${score.score}/100 y muestra ${score.label.toLowerCase()}.`,
        nextStep: score.drivers.slice(0, 2).join(' y ') || site.profile.recommendedAttentionAction,
        expectedImpact: 'Mejor lectura ejecutiva y menos dudas al iniciar turno.',
        tone: score.tone === 'critical' ? 'critical' : 'warning',
        rank: score.tone === 'critical' ? 100 : 82,
      })
    }

    if (blindZones.length > 0) {
      items.push({
        id: `${site.propertyId}-blind-zones`,
        siteLabel: site.label,
        title: 'Cerrar puntos ciegos',
        why: `${blindZones.length} zona${blindZones.length === 1 ? '' : 's'} no tiene${blindZones.length === 1 ? '' : 'n'} lectura visible suficiente.`,
        nextStep: `Priorizar ${blindZones[0].name} y asignar vista, senal o revision operativa.`,
        expectedImpact: 'Menos areas sin contexto cuando ocurre una alerta.',
        tone: 'critical',
        rank: 96,
      })
    }

    if (partialZones.length > 0) {
      items.push({
        id: `${site.propertyId}-partial-zones`,
        siteLabel: site.label,
        title: 'Reforzar cobertura parcial',
        why: `${partialZones.length} zona${partialZones.length === 1 ? '' : 's'} aparece${partialZones.length === 1 ? '' : 'n'} con cobertura incompleta o avisos.`,
        nextStep: `Revisar ${partialZones[0].name} y completar senal complementaria o actualizacion reciente.`,
        expectedImpact: 'Mejor explicacion de eventos y menos revision manual.',
        tone: 'warning',
        rank: 76,
      })
    }

    if (serviceRisks.length > 0) {
      items.push({
        id: `${site.propertyId}-service-risk`,
        siteLabel: site.label,
        title: 'Mejorar cumplimiento operativo',
        why: `${serviceRisks[0].label} requiere atencion: ${serviceRisks[0].current}.`,
        nextStep: serviceRisks[0].action,
        expectedImpact: 'Respuesta mas medible y cierres con menos friccion.',
        tone: serviceRisks.some((item) => item.tone === 'critical') ? 'critical' : 'warning',
        rank: serviceRisks.some((item) => item.tone === 'critical') ? 92 : 74,
      })
    }

    if (sensitiveRisks.length > 0) {
      items.push({
        id: `${site.propertyId}-time-window`,
        siteLabel: site.label,
        title: 'Ajustar turnos sensibles',
        why: `${sensitiveRisks[0].label} concentra senales entre ${sensitiveRisks[0].range}.`,
        nextStep: sensitiveRisks[0].action,
        expectedImpact: 'Mas criterio en horarios con actividad y menos alarmas fuera de contexto.',
        tone: sensitiveRisks.some((item) => item.tone === 'critical') ? 'critical' : 'warning',
        rank: sensitiveRisks.some((item) => item.tone === 'critical') ? 88 : 68,
      })
    }

    if (evidenceGaps.length > 0) {
      items.push({
        id: `${site.propertyId}-evidence-gaps`,
        siteLabel: site.label,
        title: 'Completar evidencia pendiente',
        why: `${evidenceGaps.length} incidente${evidenceGaps.length === 1 ? '' : 's'} abierto${evidenceGaps.length === 1 ? '' : 's'} no muestra${evidenceGaps.length === 1 ? '' : 'n'} respaldo asociado.`,
        nextStep: 'Adjuntar captura, senal relacionada o causa documentada antes de cerrar.',
        expectedImpact: 'Decisiones mas faciles de auditar y explicar.',
        tone: 'warning',
        rank: 72,
      })
    }

    if (items.length === 0) {
      items.push({
        id: `${site.propertyId}-healthy-optimization`,
        siteLabel: site.label,
        title: 'Mantener mejora continua',
        why: 'La operacion no muestra brechas relevantes en la lectura actual.',
        nextStep: 'Revisar patrones del mes y ajustar reglas para reducir ruido operativo.',
        expectedImpact: 'Servicio consistente sin aumentar complejidad para el cliente.',
        tone: 'ok',
        rank: 20,
      })
    }

    return items
  })

  return actions
    .sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel))
    .slice(0, 8)
}

export function getPortalDecisionPackets(sites: PortalSiteSummary[]): PortalDecisionPacket[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-decision',
      siteLabel: 'Sin sitio',
      decision: 'Activar primera lectura cliente',
      owner: 'Equipo SegurIA',
      evidence: 'Sitio, inventario inicial y responsables asignados.',
      timing: 'Antes de la primera reunion operativa.',
      outcome: 'Portal util para decidir con datos reales.',
      tone: 'warning',
      rank: 90,
    }]
  }

  const packets = sites.flatMap((site) => {
    const openIncidents = site.incidents.filter(isOpenPortalIncident)
    const criticalIncident = openIncidents.find((incident) => incident.severity === 'critical')
    const improvement = getPortalImprovementActions([site])[0]
    const coverage = getPortalCoverageZones(site)
    const blindZone = coverage.find((zone) => zone.tone === 'critical')
    const overdue = site.report.overdueConfirmations
    const evidenceGap = openIncidents.find((incident) => incident.evidence.length === 0)
    const packetsForSite: PortalDecisionPacket[] = []

    if (criticalIncident) {
      packetsForSite.push({
        id: `${site.propertyId}-critical-incident-decision`,
        siteLabel: site.label,
        decision: 'Definir cierre o escalamiento del incidente critico',
        owner: site.profile.escalationMatrix[0]?.owner || 'Responsable del sitio',
        evidence: criticalIncident.evidence.length > 0 ? 'Captura, senales asociadas y bitacora del incidente.' : 'Senales asociadas, horario y causa documentada.',
        timing: 'Antes del cierre del turno actual.',
        outcome: 'Incidente con responsable, causa y proxima accion clara.',
        tone: 'critical',
        rank: 100,
      })
    }

    if (overdue > 0) {
      packetsForSite.push({
        id: `${site.propertyId}-sla-decision`,
        siteLabel: site.label,
        decision: 'Resolver confirmaciones vencidas',
        owner: 'Responsable de turno',
        evidence: `${overdue} aviso${overdue === 1 ? '' : 's'} fuera del tiempo esperado de respuesta.`,
        timing: 'Antes de transferir turno o cerrar jornada.',
        outcome: 'Avisos confirmados, escalados o cerrados con trazabilidad.',
        tone: 'critical',
        rank: 96,
      })
    }

    if (blindZone) {
      packetsForSite.push({
        id: `${site.propertyId}-blind-zone-decision`,
        siteLabel: site.label,
        decision: `Cubrir ${blindZone.name}`,
        owner: site.profile.escalationMatrix[1]?.owner || 'Operacion',
        evidence: 'Lectura de cobertura muestra zona sin vista o senal suficiente.',
        timing: 'Planificar en la proxima revision de sitio.',
        outcome: 'Menos puntos sin contexto y mejor respuesta ante alertas.',
        tone: 'critical',
        rank: 92,
      })
    }

    if (evidenceGap) {
      packetsForSite.push({
        id: `${site.propertyId}-evidence-decision`,
        siteLabel: site.label,
        decision: 'Completar respaldo del incidente abierto',
        owner: site.profile.escalationMatrix[2]?.owner || 'Equipo de turno',
        evidence: evidenceGap.relatedEvents.length > 0 ? 'Senales asociadas disponibles, falta respaldo visual o cierre documentado.' : 'Incidente abierto sin evidencia publicada.',
        timing: 'Antes de declarar el cierre operativo.',
        outcome: 'Decision auditable sin reconstruir la historia despues.',
        tone: 'warning',
        rank: 78,
      })
    }

    if (improvement) {
      packetsForSite.push({
        id: `${site.propertyId}-improvement-decision`,
        siteLabel: site.label,
        decision: improvement.title,
        owner: 'Administrador del cliente',
        evidence: improvement.why,
        timing: 'Revisar en la proxima reunion de operacion.',
        outcome: improvement.expectedImpact,
        tone: improvement.tone,
        rank: improvement.rank - 8,
      })
    }

    if (packetsForSite.length === 0) {
      packetsForSite.push({
        id: `${site.propertyId}-healthy-decision`,
        siteLabel: site.label,
        decision: 'Mantener rutina y revisar aprendizaje mensual',
        owner: 'Administrador del cliente',
        evidence: 'Sin incidentes abiertos, sin confirmaciones vencidas y sin brechas criticas visibles.',
        timing: 'En la revision mensual de seguridad.',
        outcome: 'Operar con consistencia y reducir ruido sin nuevas cargas.',
        tone: 'ok',
        rank: 20,
      })
    }

    return packetsForSite
  })

  return packets
    .sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel))
    .slice(0, 8)
}

export function getPortalOperationalFlow(sites: PortalSiteSummary[]): PortalOperationalFlowStep[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-operational-flow',
      siteLabel: 'Sin sitio',
      stage: 'Preparar',
      title: 'Activar primera operacion',
      metric: '0 sitios',
      reading: 'Todavia no hay senales para construir una rutina cliente.',
      action: 'Crear sitio, publicar inventario y asignar responsables antes de operar.',
      proof: 'Sitio, zonas, equipos y responsables visibles.',
      tone: 'warning',
      rank: 90,
    }]
  }

  const steps = sites.flatMap((site) => {
    const openIncidents = site.incidents.filter(isOpenPortalIncident)
    const criticalIncidents = openIncidents.filter((incident) => incident.severity === 'critical')
    const evidenceCount = openIncidents.reduce((total, incident) => total + incident.evidence.length, 0)
    const unresolvedEvidence = openIncidents.filter((incident) => incident.evidence.length === 0)
    const recentSignals = site.events.filter((event) => event.severity !== 'info').length
    const connectionRisk = site.gatewayHealth.offline + site.gatewayHealth.degraded
    const score = getPortalOperationalScore([site])
    const coverage = getPortalCoverageZones(site)
    const weakZones = coverage.filter((zone) => zone.tone !== 'ok')
    const stepsForSite: PortalOperationalFlowStep[] = [
      {
        id: `${site.propertyId}-flow-detect`,
        siteLabel: site.label,
        stage: 'Detectar',
        title: 'Senales que importan',
        metric: `${recentSignals} senal${recentSignals === 1 ? '' : 'es'}`,
        reading: recentSignals > 0
          ? 'La operacion distingue avisos relevantes de actividad normal para evitar ruido.'
          : 'No hay senales relevantes abiertas en la lectura actual.',
        action: recentSignals > 0 ? 'Revisar primero las senales con severidad y zona definida.' : 'Mantener rutina y conservar la lectura disponible.',
        proof: 'Evento, zona, horario y severidad en una misma lectura.',
        tone: criticalIncidents.length > 0 ? 'critical' : recentSignals > 0 ? 'warning' : 'ok',
        rank: criticalIncidents.length > 0 ? 100 : recentSignals > 0 ? 74 : 20,
      },
      {
        id: `${site.propertyId}-flow-verify`,
        siteLabel: site.label,
        stage: 'Verificar',
        title: 'Contexto antes de escalar',
        metric: `${evidenceCount} respaldo${evidenceCount === 1 ? '' : 's'}`,
        reading: unresolvedEvidence.length > 0
          ? `${unresolvedEvidence.length} incidente${unresolvedEvidence.length === 1 ? '' : 's'} necesita${unresolvedEvidence.length === 1 ? '' : 'n'} respaldo antes de cierre.`
          : 'Los incidentes abiertos tienen contexto suficiente o no hay incidentes pendientes.',
        action: unresolvedEvidence.length > 0 ? 'Completar captura, senal relacionada o causa documentada.' : 'Usar evidencia disponible para decidir sin reconstruir la historia.',
        proof: 'Captura, senal asociada, responsable y nota de cierre.',
        tone: unresolvedEvidence.length > 0 ? 'warning' : 'ok',
        rank: unresolvedEvidence.length > 0 ? 82 : 18,
      },
      {
        id: `${site.propertyId}-flow-respond`,
        siteLabel: site.label,
        stage: 'Responder',
        title: 'Accion con responsable',
        metric: `${openIncidents.length} abierto${openIncidents.length === 1 ? '' : 's'}`,
        reading: openIncidents.length > 0
          ? 'Hay situaciones en seguimiento que requieren responsable y proximo paso.'
          : 'No hay incidentes abiertos que obliguen a escalar.',
        action: openIncidents.length > 0 ? site.profile.escalationMatrix[0]?.response || site.profile.recommendedAttentionAction : site.profile.recommendedStableAction,
        proof: 'Responsable, estado, confirmacion y siguiente accion registrada.',
        tone: criticalIncidents.length > 0 ? 'critical' : openIncidents.length > 0 ? 'warning' : 'ok',
        rank: criticalIncidents.length > 0 ? 98 : openIncidents.length > 0 ? 78 : 16,
      },
      {
        id: `${site.propertyId}-flow-close`,
        siteLabel: site.label,
        stage: 'Cerrar',
        title: 'Aprendizaje de operacion',
        metric: `${site.report.resolvedThisMonth}/${site.report.incidentsThisMonth}`,
        reading: site.report.incidentsThisMonth > 0
          ? 'El cierre mensual muestra cuanto queda explicado y cuanto vuelve como patron.'
          : 'Aun no hay incidentes del mes para comparar cierres y aprendizaje.',
        action: weakZones.length > 0 ? `Revisar ${weakZones[0].name} antes de la proxima reunion.` : 'Mantener revision mensual de patrones, reglas y tiempos.',
        proof: 'Incidente cerrado, causa, evidencia y ajuste recomendado.',
        tone: score.tone,
        rank: score.tone === 'critical' ? 94 : score.tone === 'warning' ? 70 : 14,
      },
      {
        id: `${site.propertyId}-flow-continuity`,
        siteLabel: site.label,
        stage: 'Continuidad',
        title: 'Operacion siempre visible',
        metric: `${site.gatewayHealth.online}/${site.gatewayHealth.total || 0}`,
        reading: connectionRisk > 0
          ? `${connectionRisk} conexion${connectionRisk === 1 ? '' : 'es'} requiere${connectionRisk === 1 ? '' : 'n'} revision para no perder visibilidad.`
          : 'Las conexiones reportan sin brechas relevantes en la lectura actual.',
        action: connectionRisk > 0 ? 'Priorizar continuidad antes de sumar nuevas reglas o alertas.' : 'Mantener supervision y validar recencia en la rutina diaria.',
        proof: 'Ultima conexion, estado de sitio y equipos con lectura reciente.',
        tone: connectionRisk > 0 ? 'warning' : 'ok',
        rank: connectionRisk > 0 ? 84 : 12,
      },
    ]

    return stepsForSite
  })

  return steps
    .sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel))
    .slice(0, 10)
}

export function getPortalBoardReport(sites: PortalSiteSummary[]): PortalBoardReport {
  const report = getPortalPortfolioReport(sites)
  const score = getPortalOperationalScore(sites)
  const commitments = getPortalServiceCommitments(sites)
  const priorities = getPortalDailyPriorities(sites)
  const decisions = getPortalDecisionPackets(sites)
  const criticalCommitments = commitments.filter((commitment) => commitment.tone === 'critical')
  const warningCommitments = commitments.filter((commitment) => commitment.tone === 'warning')
  const openIncidents = sites.flatMap((site) => site.incidents.filter(isOpenPortalIncident))
  const criticalIncidents = openIncidents.filter((incident) => incident.severity === 'critical')
  const evidenceCount = openIncidents.reduce((total, incident) => total + incident.evidence.length, 0)
  const connectionRisk = sites.reduce((total, site) => total + site.gatewayHealth.offline + site.gatewayHealth.degraded, 0)
  const firstPriority = priorities[0]
  const firstDecision = decisions[0]
  const tone: PortalBoardReport['tone'] = criticalIncidents.length > 0 || criticalCommitments.length > 0
    ? 'critical'
    : score.tone === 'warning' || warningCommitments.length > 0 || connectionRisk > 0
      ? 'warning'
      : 'ok'

  if (sites.length === 0) {
    return {
      title: 'Reporte de direccion',
      periodLabel: 'Sin operacion publicada',
      verdict: 'Falta activar la primera lectura cliente.',
      outcome: 'El portal necesita sitio, inventario y responsables para entregar una lectura profesional.',
      risk: 'Sin datos operativos no hay evidencia suficiente para priorizar decisiones.',
      decision: 'Activar el primer sitio y publicar inventario base.',
      proofPoints: [
        'Sitio y empresa visibles para el cliente.',
        'Equipos agrupados por zona y responsabilidad.',
        'Primer flujo de decision operativo disponible.',
      ],
      metrics: [
        { label: 'Sitios', value: '0', detail: 'Sin sitios visibles.', tone: 'warning' },
        { label: 'Equipos', value: '0', detail: 'Inventario pendiente.', tone: 'warning' },
        { label: 'Evidencia', value: '0', detail: 'Sin respaldo publicado.', tone: 'warning' },
      ],
      tone: 'warning',
    }
  }

  return {
    title: 'Reporte de direccion',
    periodLabel: 'Lectura diaria y mensual',
    verdict: tone === 'critical'
      ? 'Hay decisiones que requieren cierre ejecutivo.'
      : tone === 'warning'
        ? 'La operacion esta visible, con puntos concretos para mejorar.'
        : 'La operacion esta ordenada y bajo control.',
    outcome: score.summary,
    risk: criticalIncidents.length > 0
      ? `${criticalIncidents.length} incidente${criticalIncidents.length === 1 ? '' : 's'} critico${criticalIncidents.length === 1 ? '' : 's'} requiere${criticalIncidents.length === 1 ? '' : 'n'} seguimiento.`
      : connectionRisk > 0
        ? `${connectionRisk} conexion${connectionRisk === 1 ? '' : 'es'} necesita${connectionRisk === 1 ? '' : 'n'} revision para sostener visibilidad.`
        : firstPriority?.detail || 'Sin riesgos criticos abiertos en la lectura actual.',
    decision: firstDecision?.decision || 'Mantener rutina y revisar aprendizaje mensual',
    proofPoints: [
      `${report.eventsToday} evento${report.eventsToday === 1 ? '' : 's'} revisado${report.eventsToday === 1 ? '' : 's'} hoy.`,
      `${openIncidents.length} incidente${openIncidents.length === 1 ? '' : 's'} abierto${openIncidents.length === 1 ? '' : 's'} y ${report.resolvedThisMonth} cierre${report.resolvedThisMonth === 1 ? '' : 's'} del mes.`,
      `${evidenceCount} respaldo${evidenceCount === 1 ? '' : 's'} asociado${evidenceCount === 1 ? '' : 's'} a incidentes abiertos.`,
      firstDecision?.outcome || 'Operacion consistente y decisiones explicables.',
    ],
    metrics: [
      {
        label: 'Salud',
        value: `${score.score}/100`,
        detail: score.label,
        tone: score.tone,
      },
      {
        label: 'Sitios',
        value: sites.length.toString(),
        detail: `${sites.reduce((total, site) => total + site.deviceCount, 0)} equipos visibles.`,
        tone: connectionRisk > 0 ? 'warning' : 'ok',
      },
      {
        label: 'SLA',
        value: report.overdueConfirmations.toString(),
        detail: report.overdueConfirmations > 0 ? 'Confirmaciones vencidas.' : 'Sin vencimientos pendientes.',
        tone: report.overdueConfirmations > 0 ? 'critical' : 'ok',
      },
      {
        label: 'Cierre',
        value: `${report.resolvedThisMonth}/${report.incidentsThisMonth}`,
        detail: report.incidentsThisMonth > 0 ? 'Incidentes resueltos este mes.' : 'Sin incidentes mensuales.',
        tone: report.incidentsThisMonth > report.resolvedThisMonth ? 'warning' : 'ok',
      },
    ],
    tone,
  }
}

export function getPortalGovernanceRituals(sites: PortalSiteSummary[]): PortalGovernanceRitual[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-governance',
      siteLabel: 'Sin sitio',
      cadence: 'Inicio',
      title: 'Preparar primera revision',
      owner: 'Equipo SegurIA',
      question: 'Que debe ver el cliente para confiar en la operacion?',
      input: 'Sitio, zonas, inventario y responsables iniciales.',
      output: 'Primera lectura ejecutiva lista para operar.',
      tone: 'warning',
      rank: 90,
    }]
  }

  const rituals = sites.flatMap((site) => {
    const score = getPortalOperationalScore([site])
    const decisions = getPortalDecisionPackets([site])
    const improvements = getPortalImprovementActions([site])
    const windows = getPortalSensitiveWindows([site])
    const commitments = getPortalServiceCommitments([site])
    const openIncidents = site.incidents.filter(isOpenPortalIncident)
    const criticalIncidents = openIncidents.filter((incident) => incident.severity === 'critical')
    const overdue = site.report.overdueConfirmations
    const weakCommitment = commitments.find((commitment) => commitment.tone !== 'ok')
    const sensitiveWindow = windows.find((window) => window.tone !== 'ok')
    const decision = decisions[0]
    const improvement = improvements[0]
    const operationsOwner = site.profile.escalationMatrix[0]?.owner || 'Responsable del sitio'
    const continuityOwner = site.profile.escalationMatrix[1]?.owner || 'Operacion'

    const siteRituals: PortalGovernanceRitual[] = [
      {
        id: `${site.propertyId}-daily-brief`,
        siteLabel: site.label,
        cadence: 'Diario',
        title: 'Apertura de operacion',
        owner: operationsOwner,
        question: 'Que cambio desde la ultima revision?',
        input: `${site.report.eventsToday} evento${site.report.eventsToday === 1 ? '' : 's'} hoy, ${openIncidents.length} incidente${openIncidents.length === 1 ? '' : 's'} abierto${openIncidents.length === 1 ? '' : 's'}.`,
        output: openIncidents.length > 0 ? 'Responsable y siguiente accion asignados.' : 'Rutina normal confirmada.',
        tone: criticalIncidents.length > 0 ? 'critical' : openIncidents.length > 0 ? 'warning' : 'ok',
        rank: criticalIncidents.length > 0 ? 100 : openIncidents.length > 0 ? 76 : 20,
      },
      {
        id: `${site.propertyId}-weekly-control`,
        siteLabel: site.label,
        cadence: 'Semanal',
        title: 'Control de servicio',
        owner: continuityOwner,
        question: 'Estamos respondiendo con evidencia y dentro del tiempo esperado?',
        input: weakCommitment ? `${weakCommitment.label}: ${weakCommitment.current}.` : 'Compromisos sin brechas visibles.',
        output: weakCommitment ? weakCommitment.action : 'Mantener compromisos y revisar excepciones puntuales.',
        tone: weakCommitment?.tone || 'ok',
        rank: weakCommitment?.tone === 'critical' ? 94 : weakCommitment?.tone === 'warning' ? 72 : 18,
      },
      {
        id: `${site.propertyId}-decision-review`,
        siteLabel: site.label,
        cadence: 'Reunion',
        title: 'Mesa de decision',
        owner: decision?.owner || 'Administrador del cliente',
        question: 'Que decision no debe quedar abierta?',
        input: decision?.evidence || 'Lectura de estado, cobertura y evidencia disponible.',
        output: decision?.outcome || 'Decision registrada con responsable y criterio.',
        tone: decision?.tone || score.tone,
        rank: decision?.rank || 50,
      },
      {
        id: `${site.propertyId}-monthly-learning`,
        siteLabel: site.label,
        cadence: 'Mensual',
        title: 'Aprendizaje y ajuste',
        owner: 'Administrador del cliente',
        question: 'Que patron se repite y que se puede simplificar?',
        input: improvement?.why || `Salud operativa ${score.score}/100.`,
        output: improvement?.expectedImpact || 'Reglas mas claras, menos ruido y mejor respuesta.',
        tone: improvement?.tone || score.tone,
        rank: improvement?.rank ? improvement.rank - 4 : 44,
      },
    ]

    if (overdue > 0 || sensitiveWindow) {
      siteRituals.push({
        id: `${site.propertyId}-exception-review`,
        siteLabel: site.label,
        cadence: 'Excepcion',
        title: overdue > 0 ? 'Cierre de confirmaciones vencidas' : 'Revision de horario sensible',
        owner: operationsOwner,
        question: overdue > 0 ? 'Que aviso sigue sin confirmacion?' : 'Que franja requiere mas criterio?',
        input: overdue > 0
          ? `${overdue} confirmacion${overdue === 1 ? '' : 'es'} vencida${overdue === 1 ? '' : 's'}.`
          : `${sensitiveWindow?.label || 'Horario sensible'} concentra senales operativas.`,
        output: overdue > 0
          ? 'Aviso cerrado, escalado o documentado antes del cambio de turno.'
          : sensitiveWindow?.action || 'Turno ajustado con evidencia y responsable.',
        tone: overdue > 0 ? 'critical' : sensitiveWindow?.tone || 'warning',
        rank: overdue > 0 ? 98 : 74,
      })
    }

    return siteRituals
  })

  return rituals
    .sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel))
    .slice(0, 10)
}

export function getPortalActionRegister(sites: PortalSiteSummary[]): PortalActionRegisterItem[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-action-register',
      siteLabel: 'Sin sitio',
      title: 'Activar primer plan de accion',
      owner: 'Equipo SegurIA',
      due: 'Antes del inicio operativo',
      status: 'Pendiente',
      why: 'Sin sitio publicado no hay acciones priorizadas para el cliente.',
      nextStep: 'Crear sitio, cargar inventario y asignar responsables.',
      successCriteria: 'Portal con acciones visibles, responsables y criterios de cierre.',
      tone: 'warning',
      rank: 90,
    }]
  }

  const actions = sites.flatMap((site) => {
    const openIncidents = site.incidents.filter(isOpenPortalIncident)
    const criticalIncident = openIncidents.find((incident) => incident.severity === 'critical')
    const decisions = getPortalDecisionPackets([site])
    const improvements = getPortalImprovementActions([site])
    const commitments = getPortalServiceCommitments([site])
    const windows = getPortalSensitiveWindows([site])
    const coverage = getPortalCoverageZones(site)
    const connectionRisk = site.gatewayHealth.offline + site.gatewayHealth.degraded
    const overdue = site.report.overdueConfirmations
    const evidenceGap = openIncidents.find((incident) => incident.evidence.length === 0)
    const blindZone = coverage.find((zone) => zone.tone === 'critical')
    const weakCommitment = commitments.find((commitment) => commitment.tone !== 'ok')
    const sensitiveWindow = windows.find((window) => window.tone !== 'ok')
    const decision = decisions[0]
    const improvement = improvements[0]
    const operationsOwner = site.profile.escalationMatrix[0]?.owner || 'Responsable del sitio'
    const continuityOwner = site.profile.escalationMatrix[1]?.owner || 'Operacion'
    const siteActions: PortalActionRegisterItem[] = []

    if (criticalIncident) {
      siteActions.push({
        id: `${site.propertyId}-critical-action`,
        siteLabel: site.label,
        title: criticalIncident.title,
        owner: operationsOwner,
        due: 'Hoy, antes del cierre de turno',
        status: criticalIncident.statusLabel,
        why: criticalIncident.description || 'Incidente critico abierto con impacto potencial en la operacion.',
        nextStep: criticalIncident.evidence.length > 0 ? 'Confirmar evidencia, asignar respuesta y registrar cierre.' : 'Completar evidencia antes de escalar o cerrar.',
        successCriteria: 'Incidente con causa, responsable, evidencia y estado actualizado.',
        tone: 'critical',
        rank: 100,
      })
    }

    if (overdue > 0) {
      siteActions.push({
        id: `${site.propertyId}-overdue-action`,
        siteLabel: site.label,
        title: 'Cerrar confirmaciones vencidas',
        owner: operationsOwner,
        due: 'Antes del cambio de turno',
        status: 'Vencido',
        why: `${overdue} aviso${overdue === 1 ? '' : 's'} esta${overdue === 1 ? '' : 'n'} fuera del tiempo esperado.`,
        nextStep: 'Confirmar recepcion, escalar o documentar motivo de excepcion.',
        successCriteria: 'Sin confirmaciones vencidas y con trazabilidad de respuesta.',
        tone: 'critical',
        rank: 96,
      })
    }

    if (connectionRisk > 0) {
      siteActions.push({
        id: `${site.propertyId}-continuity-action`,
        siteLabel: site.label,
        title: 'Restaurar continuidad visible',
        owner: continuityOwner,
        due: 'Proxima revision operativa',
        status: 'En revision',
        why: `${connectionRisk} conexion${connectionRisk === 1 ? '' : 'es'} requiere${connectionRisk === 1 ? '' : 'n'} atencion para sostener visibilidad.`,
        nextStep: 'Revisar recencia, enlace y equipos prioritarios antes de sumar nuevas reglas.',
        successCriteria: 'Conexiones activas y lectura reciente del sitio.',
        tone: 'warning',
        rank: 84,
      })
    }

    if (blindZone) {
      siteActions.push({
        id: `${site.propertyId}-coverage-action`,
        siteLabel: site.label,
        title: `Cubrir ${blindZone.name}`,
        owner: continuityOwner,
        due: 'Proxima visita o reunion de sitio',
        status: blindZone.statusLabel,
        why: blindZone.summary,
        nextStep: blindZone.action,
        successCriteria: 'Zona con vista, senal o criterio de revision suficiente.',
        tone: 'critical',
        rank: 88,
      })
    }

    if (evidenceGap) {
      siteActions.push({
        id: `${site.propertyId}-evidence-action`,
        siteLabel: site.label,
        title: 'Completar respaldo pendiente',
        owner: site.profile.escalationMatrix[2]?.owner || operationsOwner,
        due: 'Antes de cerrar incidente',
        status: evidenceGap.statusLabel,
        why: `${evidenceGap.title} sigue sin respaldo visual publicado.`,
        nextStep: 'Adjuntar captura, senal relacionada o causa documentada.',
        successCriteria: 'Decision explicable sin reconstruir la historia.',
        tone: 'warning',
        rank: 78,
      })
    }

    if (weakCommitment) {
      siteActions.push({
        id: `${site.propertyId}-commitment-action`,
        siteLabel: site.label,
        title: weakCommitment.label,
        owner: 'Administrador del cliente',
        due: 'Revision semanal',
        status: weakCommitment.current,
        why: weakCommitment.summary,
        nextStep: weakCommitment.action,
        successCriteria: weakCommitment.target,
        tone: weakCommitment.tone,
        rank: weakCommitment.rank - 2,
      })
    }

    if (sensitiveWindow) {
      siteActions.push({
        id: `${site.propertyId}-window-action`,
        siteLabel: site.label,
        title: `Ajustar ${sensitiveWindow.label}`,
        owner: operationsOwner,
        due: 'Antes de la siguiente ventana',
        status: sensitiveWindow.criticalCount > 0 ? 'Critica' : 'Atencion',
        why: sensitiveWindow.summary,
        nextStep: sensitiveWindow.action,
        successCriteria: 'Turno con criterio, responsable y evidencia esperada.',
        tone: sensitiveWindow.tone,
        rank: sensitiveWindow.rank + 40,
      })
    }

    if (decision) {
      siteActions.push({
        id: `${site.propertyId}-decision-action`,
        siteLabel: site.label,
        title: decision.decision,
        owner: decision.owner,
        due: decision.timing,
        status: 'Por decidir',
        why: decision.evidence,
        nextStep: decision.outcome,
        successCriteria: 'Decision registrada con responsable y evidencia minima.',
        tone: decision.tone,
        rank: decision.rank - 10,
      })
    }

    if (improvement) {
      siteActions.push({
        id: `${site.propertyId}-improvement-action`,
        siteLabel: site.label,
        title: improvement.title,
        owner: 'Administrador del cliente',
        due: 'Mejora mensual',
        status: 'Planificado',
        why: improvement.why,
        nextStep: improvement.nextStep,
        successCriteria: improvement.expectedImpact,
        tone: improvement.tone,
        rank: improvement.rank - 14,
      })
    }

    if (siteActions.length === 0) {
      siteActions.push({
        id: `${site.propertyId}-stable-action`,
        siteLabel: site.label,
        title: 'Mantener rutina de control',
        owner: 'Administrador del cliente',
        due: 'Revision mensual',
        status: 'Al dia',
        why: 'La lectura actual no muestra brechas criticas o advertencias abiertas.',
        nextStep: 'Revisar patrones, reglas y tiempos para seguir reduciendo ruido.',
        successCriteria: 'Operacion consistente, visible y facil de explicar.',
        tone: 'ok',
        rank: 18,
      })
    }

    return siteActions
  })

  return actions
    .sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel))
    .slice(0, 10)
}

export function getPortalTraceabilityLedger(sites: PortalSiteSummary[]): PortalTraceabilityItem[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-traceability',
      siteLabel: 'Sin sitio',
      title: 'Primera evidencia pendiente',
      source: 'Operacion inicial',
      evidence: 'Aun no hay eventos, documentos o incidentes publicados.',
      decisionLink: 'Activar sitio e inventario para iniciar trazabilidad.',
      status: 'Pendiente',
      occurredAt: new Date(),
      tone: 'warning',
      rank: 90,
    }]
  }

  const ledger = sites.flatMap((site) => {
    const actions = getPortalActionRegister([site])
    const primaryAction = actions[0]
    const openIncidents = site.incidents.filter(isOpenPortalIncident)
    const incidentItems: PortalTraceabilityItem[] = site.incidents.flatMap((incident) => {
      if (incident.evidence.length === 0) {
        return [{
          id: `${site.propertyId}-incident-${incident.id}-no-evidence`,
          siteLabel: site.label,
          title: incident.title,
          source: incident.relatedEvents[0]?.title || 'Incidente operativo',
          evidence: 'Sin respaldo visual publicado para el cliente.',
          decisionLink: primaryAction?.title || 'Completar evidencia antes del cierre.',
          status: incident.statusLabel,
          occurredAt: incident.updatedAt,
          tone: incident.severity === 'critical' ? 'critical' : 'warning',
          rank: incident.severity === 'critical' ? 98 : 78,
        }]
      }

      return incident.evidence.slice(0, 3).map((evidence) => ({
        id: `${site.propertyId}-evidence-${evidence.id}`,
        siteLabel: site.label,
        title: incident.title,
        source: incident.relatedEvents[0]?.title || 'Incidente operativo',
        evidence: evidence.title,
        decisionLink: evidence.pinned ? 'Evidencia fijada para explicar la decision.' : 'Evidencia asociada al contexto del incidente.',
        status: incident.statusLabel,
        occurredAt: evidence.capturedAt,
        tone: incident.severity === 'critical' ? 'critical' : 'warning',
        rank: evidence.pinned ? 88 : 72,
      }))
    })

    const eventItems: PortalTraceabilityItem[] = site.events
      .filter((event) => event.severity !== 'info')
      .slice(0, 4)
      .map((event) => ({
        id: `${site.propertyId}-event-${event.id}`,
        siteLabel: site.label,
        title: event.title,
        source: 'Senal relevante',
        evidence: event.state ? `Estado registrado: ${event.state}.` : 'Evento con severidad y horario publicado.',
        decisionLink: primaryAction?.nextStep || site.profile.recommendedAttentionAction,
        status: event.severity === 'critical' ? 'Critico' : 'Atencion',
        occurredAt: event.occurredAt,
        tone: event.severity === 'critical' ? 'critical' : 'warning',
        rank: event.severity === 'critical' ? 82 : 62,
      }))

    const documentItems: PortalTraceabilityItem[] = site.documents
      .slice(0, 3)
      .map((document) => ({
        id: `${site.propertyId}-document-${document.id}`,
        siteLabel: site.label,
        title: document.titulo,
        source: 'Documento operativo',
        evidence: document.archivoNombre || document.autor || 'Documento publicado para respaldo.',
        decisionLink: 'Disponible para revisar o explicar una decision.',
        status: document.estado,
        occurredAt: document.fechaActualizacion,
        tone: 'ok' as const,
        rank: openIncidents.length > 0 ? 48 : 22,
      }))

    if (incidentItems.length + eventItems.length + documentItems.length === 0) {
      return [{
        id: `${site.propertyId}-stable-traceability`,
        siteLabel: site.label,
        title: 'Operacion sin excepciones abiertas',
        source: 'Lectura actual',
        evidence: 'Sin eventos relevantes, incidentes o documentos nuevos en esta lectura.',
        decisionLink: 'Mantener rutina de control y conservar historial disponible.',
        status: 'Al dia',
        occurredAt: site.lastUpdatedAt || new Date(),
        tone: 'ok' as const,
        rank: 10,
      }]
    }

    return [...incidentItems, ...eventItems, ...documentItems]
  })

  return ledger
    .sort((left, right) => right.rank - left.rank || right.occurredAt.getTime() - left.occurredAt.getTime())
    .slice(0, 10)
}

export function getPortalRiskMap(sites: PortalSiteSummary[]): PortalRiskMapItem[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-risk-map',
      siteLabel: 'Sin sitio',
      zone: 'Sin zona',
      window: 'Pendiente',
      exposure: 'Sin lectura operacional disponible.',
      protection: 'Falta publicar sitio e inventario base.',
      action: 'Activar el primer sitio protegido.',
      owner: 'Equipo SegurIA',
      tone: 'warning',
      rank: 90,
    }]
  }

  const mapItems = sites.flatMap((site) => {
    const coverage = getPortalCoverageZones(site)
    const windows = getPortalSensitiveWindows([site])
    const actions = getPortalActionRegister([site])
    const openIncidents = site.incidents.filter(isOpenPortalIncident)
    const criticalOpen = openIncidents.some((incident) => incident.severity === 'critical')
    const primaryAction = actions[0]
    const strongestWindow = windows[0]
    const fallbackZone = coverage[0]
    const items = coverage.slice(0, 4).map((zone, index) => {
      const window = windows[index] || strongestWindow
      const action = actions[index] || primaryAction
      const rank =
        (zone.tone === 'critical' ? 60 : zone.tone === 'warning' ? 34 : 10) +
        (window?.tone === 'critical' ? 28 : window?.tone === 'warning' ? 14 : 0) +
        (action?.tone === 'critical' ? 22 : action?.tone === 'warning' ? 10 : 0)
      const tone: PortalRiskMapItem['tone'] = zone.tone === 'critical' || window?.tone === 'critical' || action?.tone === 'critical' || criticalOpen
        ? 'critical'
        : zone.tone === 'warning' || window?.tone === 'warning' || action?.tone === 'warning'
          ? 'warning'
          : 'ok'

      return {
        id: `${site.propertyId}-risk-map-${zone.id}`,
        siteLabel: site.label,
        zone: zone.name,
        window: window ? `${window.label} (${window.range})` : 'Sin franja sensible',
        exposure: zone.summary,
        protection: `${zone.cameraCount} vista${zone.cameraCount === 1 ? '' : 's'}, ${zone.sensorCount} senal${zone.sensorCount === 1 ? '' : 'es'}, score ${zone.score}/100.`,
        action: action?.nextStep || zone.action,
        owner: action?.owner || site.profile.escalationMatrix[0]?.owner || 'Responsable del sitio',
        tone,
        rank,
      }
    })

    if (items.length === 0 && fallbackZone) return []

    return items.length > 0
      ? items
      : [{
          id: `${site.propertyId}-risk-map-stable`,
          siteLabel: site.label,
          zone: site.profile.focusAreas[0] || site.label,
          window: strongestWindow ? `${strongestWindow.label} (${strongestWindow.range})` : 'Rutina normal',
          exposure: 'No hay zonas criticas visibles en esta lectura.',
          protection: `${site.cameraCount} vista${site.cameraCount === 1 ? '' : 's'} y ${site.sensorCount} senal${site.sensorCount === 1 ? '' : 'es'} publicadas.`,
          action: site.profile.recommendedStableAction,
          owner: 'Administrador del cliente',
          tone: 'ok' as const,
          rank: 10,
        }]
  })

  return mapItems
    .sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel))
    .slice(0, 8)
}

function getMaturityTone(score: number): PortalMaturityScorecardItem['tone'] {
  if (score >= 82) return 'ok'
  if (score >= 58) return 'warning'
  return 'critical'
}

function getMaturityLevel(score: number) {
  if (score >= 90) return 'Avanzado'
  if (score >= 76) return 'Profesional'
  if (score >= 58) return 'En mejora'
  return 'Exigido'
}

export function getPortalMaturityScorecard(sites: PortalSiteSummary[]): PortalMaturityScorecardItem[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-maturity',
      label: 'Base operativa',
      score: 0,
      level: 'Pendiente',
      reading: 'No hay sitios publicados para evaluar madurez.',
      nextStep: 'Activar sitio, inventario y responsables iniciales.',
      tone: 'warning',
      rank: 100,
    }]
  }

  const totals = getPortalDashboardTotals(sites)
  const report = getPortalPortfolioReport(sites)
  const operationalScore = getPortalOperationalScore(sites)
  const actions = getPortalActionRegister(sites)
  const decisions = getPortalDecisionPackets(sites)
  const traceability = getPortalTraceabilityLedger(sites)
  const governance = getPortalGovernanceRituals(sites)
  const coverage = sites.flatMap((site) => getPortalCoverageZones(site))
  const sensorRisk = sites.reduce(
    (current, site) => {
      const next = getPortalSensorRisk(site.devices)
      current.stable += next.stable
      current.attention += next.attention
      current.critical += next.critical
      return current
    },
    { stable: 0, attention: 0, critical: 0 }
  )
  const coveredZones = coverage.filter((zone) => zone.tone === 'ok').length
  const warningZones = coverage.filter((zone) => zone.tone === 'warning').length
  const criticalZones = coverage.filter((zone) => zone.tone === 'critical').length
  const openIncidents = totals.openIncidents
  const criticalActions = actions.filter((action) => action.tone === 'critical').length
  const evidenceItems = traceability.filter((item) => item.tone !== 'critical').length
  const governanceOk = governance.filter((item) => item.tone === 'ok').length

  const visibilityScore = Math.max(0, Math.min(100,
    35 +
    Math.min(25, totals.cameras * 4) +
    Math.min(20, totals.sensors * 3) +
    coveredZones * 6 -
    warningZones * 8 -
    criticalZones * 16
  ))
  const responseScore = Math.max(0, Math.min(100,
    100 -
    openIncidents * 12 -
    report.overdueConfirmations * 18 -
    criticalActions * 10
  ))
  const evidenceScore = Math.max(0, Math.min(100,
    45 +
    Math.min(30, totals.documents * 6) +
    Math.min(25, evidenceItems * 5) -
    decisions.filter((decision) => decision.tone === 'critical').length * 10
  ))
  const governanceScore = Math.max(0, Math.min(100,
    52 +
    governanceOk * 8 +
    Math.min(20, governance.length * 3) -
    actions.filter((action) => action.tone !== 'ok').length * 6
  ))
  const continuityScore = Math.max(0, Math.min(100,
    100 -
    totals.offlineGateways * 16 -
    sensorRisk.critical * 12 -
    sensorRisk.attention * 5
  ))

  const items = [
    {
      id: 'visibility',
      label: 'Visibilidad',
      score: visibilityScore,
      reading: `${coveredZones} zona${coveredZones === 1 ? '' : 's'} cubierta${coveredZones === 1 ? '' : 's'}, ${criticalZones} punto${criticalZones === 1 ? '' : 's'} ciego${criticalZones === 1 ? '' : 's'}.`,
      nextStep: criticalZones > 0 ? 'Cerrar puntos ciegos antes de sumar nuevas reglas.' : 'Mantener cobertura y revisar zonas parciales.',
    },
    {
      id: 'response',
      label: 'Respuesta',
      score: responseScore,
      reading: `${openIncidents} incidente${openIncidents === 1 ? '' : 's'} abierto${openIncidents === 1 ? '' : 's'} y ${report.overdueConfirmations} confirmacion${report.overdueConfirmations === 1 ? '' : 'es'} vencida${report.overdueConfirmations === 1 ? '' : 's'}.`,
      nextStep: report.overdueConfirmations > 0 ? 'Cerrar confirmaciones vencidas antes del cambio de turno.' : 'Mantener responsables y cierres visibles.',
    },
    {
      id: 'evidence',
      label: 'Evidencia',
      score: evidenceScore,
      reading: `${totals.documents} documento${totals.documents === 1 ? '' : 's'} y ${evidenceItems} respaldo${evidenceItems === 1 ? '' : 's'} util${evidenceItems === 1 ? '' : 'es'}.`,
      nextStep: evidenceScore < 76 ? 'Completar respaldo de incidentes y decisiones abiertas.' : 'Usar evidencia para aprendizaje operativo.',
    },
    {
      id: 'governance',
      label: 'Gobierno',
      score: governanceScore,
      reading: `${governance.length} ritual${governance.length === 1 ? '' : 'es'} y ${actions.length} accion${actions.length === 1 ? '' : 'es'} priorizada${actions.length === 1 ? '' : 's'}.`,
      nextStep: governanceScore < 76 ? 'Ordenar responsables, plazos y criterios de cierre.' : 'Mantener cadencia diaria, semanal y mensual.',
    },
    {
      id: 'continuity',
      label: 'Continuidad',
      score: continuityScore,
      reading: `${totals.onlineGateways} conexion${totals.onlineGateways === 1 ? '' : 'es'} activa${totals.onlineGateways === 1 ? '' : 's'}, ${totals.offlineGateways} con revision.`,
      nextStep: totals.offlineGateways > 0 ? 'Restituir lectura de sitio antes de depender de rondas manuales.' : 'Mantener recencia y estabilidad de equipos.',
    },
  ].map((item) => ({
    ...item,
    level: getMaturityLevel(item.score),
    tone: getMaturityTone(item.score),
    rank: 100 - item.score,
  }))

  return items.sort((left, right) => right.rank - left.rank || left.label.localeCompare(right.label))
}

export function getPortalWeeklyDecisionAgenda(sites: PortalSiteSummary[]): PortalWeeklyDecisionAgendaItem[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-weekly-agenda',
      siteLabel: 'Sin sitio',
      decision: 'Activar una primera agenda de seguridad',
      priorityLabel: 'Inicio',
      evidence: 'No hay sitios publicados para construir una agenda semanal.',
      owner: 'Equipo SegurIA',
      deadline: 'Antes del inicio operativo',
      expectedOutcome: 'Cliente con prioridades, responsables y primera rutina visible.',
      customerValue: 'La seguridad deja de depender de conversaciones sueltas y parte con un orden claro.',
      tone: 'warning',
      rank: 90,
    }]
  }

  const agenda = sites.flatMap((site) => {
    const actions = getPortalActionRegister([site])
    const riskMap = getPortalRiskMap([site])
    const maturity = getPortalMaturityScorecard([site])
    const board = getPortalBoardReport([site])
    const openIncidents = site.incidents.filter(isOpenPortalIncident)
    const primaryAction = actions[0]
    const primaryRisk = riskMap[0]
    const weakestPillar = maturity[0]
    const owner = primaryAction?.owner || site.profile.escalationMatrix[0]?.owner || 'Responsable del sitio'
    const decisionTone: PortalWeeklyDecisionAgendaItem['tone'] =
      primaryAction?.tone === 'critical' || board.tone === 'critical'
        ? 'critical'
        : primaryAction?.tone === 'warning' || board.tone === 'warning'
          ? 'warning'
          : 'ok'

    const items: PortalWeeklyDecisionAgendaItem[] = [{
      id: `${site.propertyId}-weekly-primary`,
      siteLabel: site.label,
      decision: primaryAction?.title || board.decision,
      priorityLabel: decisionTone === 'critical' ? 'Resolver hoy' : decisionTone === 'warning' ? 'Prioridad semanal' : 'Mantener',
      evidence: primaryAction?.why || board.risk,
      owner,
      deadline: primaryAction?.due || 'Revision semanal',
      expectedOutcome: primaryAction?.successCriteria || board.outcome,
      customerValue: openIncidents.length > 0
        ? 'Menos incertidumbre: cada incidente queda con respuesta, evidencia y cierre claro.'
        : 'Mas calma diaria: la operacion sabe que mirar primero y cuando escalar.',
      tone: decisionTone,
      rank: (primaryAction?.rank || 50) + (openIncidents.length > 0 ? 12 : 0),
    }]

    if (weakestPillar) {
      items.push({
        id: `${site.propertyId}-weekly-maturity-${weakestPillar.id}`,
        siteLabel: site.label,
        decision: `Subir madurez en ${weakestPillar.label.toLowerCase()}`,
        priorityLabel: weakestPillar.level,
        evidence: weakestPillar.reading,
        owner: 'Administrador del cliente',
        deadline: weakestPillar.tone === 'critical' ? 'Esta semana' : 'Proxima revision',
        expectedOutcome: weakestPillar.nextStep,
        customerValue: 'La seguridad se vuelve mas profesional sin pedirle al cliente perseguir datos ni pantallas.',
        tone: weakestPillar.tone,
        rank: weakestPillar.rank + 8,
      })
    }

    if (primaryRisk) {
      items.push({
        id: `${site.propertyId}-weekly-risk-${primaryRisk.id}`,
        siteLabel: site.label,
        decision: `Acordar criterio para ${primaryRisk.zone}`,
        priorityLabel: primaryRisk.window,
        evidence: primaryRisk.exposure,
        owner: primaryRisk.owner,
        deadline: primaryRisk.tone === 'critical' ? 'Antes del proximo turno sensible' : 'Mesa semanal',
        expectedOutcome: primaryRisk.action,
        customerValue: 'El equipo sabe cuando mirar, que validar y como responder antes de que el problema crezca.',
        tone: primaryRisk.tone,
        rank: primaryRisk.rank + 6,
      })
    }

    return items
  })

  return agenda
    .sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel))
    .slice(0, 8)
}

export function getPortalAlertDevices(sites: PortalSiteSummary[]) {
  return sites
    .flatMap((site) =>
      site.devices
        .filter((device) => device.estado === 'falla' || device.estado === 'mantencion')
        .map((device) => ({ site, device }))
    )
    .sort((left, right) => {
      const leftAt = left.device.lastSeenAt || left.device.fechaActualizacion
      const rightAt = right.device.lastSeenAt || right.device.fechaActualizacion
      return rightAt.getTime() - leftAt.getTime()
    })
}

export function getPortalActivityFeed(sites: PortalSiteSummary[]) {
  const eventActivity = sites.flatMap((site) =>
    site.events.map((event) => ({
      id: event.id,
      title: event.title,
      detail: site.label,
      kind: 'event' as const,
      status: event.severity,
      at: event.occurredAt,
    }))
  )

  const deviceActivity = sites.flatMap((site) =>
    site.devices.map((device) => ({
      id: `${site.propertyId}-device-${device.id}`,
      title: device.displayName || 'Dispositivo',
      detail: device.ubicacionDescripcion || 'Equipo del sitio',
      kind: 'device' as const,
      status: device.estado,
      at: device.lastSeenAt || device.fechaActualizacion,
    }))
  )

  const documentActivity = sites.flatMap((site) =>
    site.documents.map((document) => ({
      id: `${site.propertyId}-document-${document.id}`,
      title: document.titulo,
      detail: site.label,
      kind: 'document' as const,
      status: document.estado,
      at: document.fechaActualizacion,
    }))
  )

  return [...eventActivity, ...deviceActivity, ...documentActivity]
    .sort((left, right) => right.at.getTime() - left.at.getTime())
    .slice(0, 8)
}

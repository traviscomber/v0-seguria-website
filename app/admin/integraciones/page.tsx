import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Github,
  Home,
  Network,
  ShieldAlert,
  Workflow,
  Radar,
  RefreshCw,
  AlertTriangle,
  PlayCircle,
  ClipboardList,
  Shield,
  ChevronRight,
} from 'lucide-react'
import {
  getIntegrationConnections,
  getIntegrationEvents,
  getIntegrationSummary,
  getIntegrationActivitySummary,
} from '@/lib/integration-state'
import { cameraCatalog, cameraCommonCapabilities } from '@/lib/camera-catalog'
import { deviceCatalogGroups, deviceCatalogHighlights } from '@/lib/device-catalog'
import { TuyaConnectForm } from '@/components/tuya-connect-form'

export const dynamic = 'force-dynamic'

const statusStyles = {
  pending: 'bg-amber-500/20 text-amber-400',
  connected: 'bg-green-500/20 text-green-400',
  degraded: 'bg-orange-500/20 text-orange-300',
  offline: 'bg-red-500/20 text-red-400',
}

const providerLabels: Record<string, string> = {
  tuya: 'Puente operativo',
  home_assistant: 'Capa local',
  github: 'GitHub',
}

function scrubVisibleText(value: string) {
  return value.replace(/tuya/gi, 'cliente')
}

function scrubVisiblePayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(scrubVisiblePayload)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        key === 'source' && typeof entry === 'string' ? scrubVisibleText(entry) : scrubVisiblePayload(entry),
      ])
    )
  }
  return typeof value === 'string' ? scrubVisibleText(value) : value
}

const autonomyFunctions = [
  {
    icon: Radar,
    title: 'Descubrir equipos',
    description: 'Detectar camaras, sensores, luces y accesos de forma automatica.',
  },
  {
    icon: RefreshCw,
    title: 'Sincronizar estado',
    description: 'Traer el estado de cada equipo y mostrarlo en tiempo real.',
  },
  {
    icon: AlertTriangle,
    title: 'Recibir alertas',
    description: 'Guardar eventos de movimiento, apertura, falla o desconexion.',
  },
  {
    icon: PlayCircle,
    title: 'Ejecutar acciones',
    description: 'Encender, apagar, abrir o cerrar con un solo toque.',
  },
  {
    icon: Shield,
    title: 'Mantener autonomia',
    description: 'Seguir funcionando aunque la red falle o se corte por momentos.',
  },
  {
    icon: ClipboardList,
    title: 'Auditar cambios',
    description: 'Saber que se cambio, cuando paso y a que equipo afecto.',
  },
]

const feedFamilies = [
  {
    title: 'Camaras',
    description: 'Stream, snapshot, online/offline y movimiento.',
    details: 'La interfaz ya puede mostrar imagen, enlace o alerta.',
  },
  {
    title: 'Sensores',
    description: 'Puerta, presencia, temperatura, humedad y bateria.',
    details: 'Las lecturas entran a una sola linea de tiempo clara.',
  },
  {
    title: 'Alertas',
    description: 'Falla, perdida de señal, bateria baja y desconexion.',
    details: 'Cada evento queda visible para operacion y soporte.',
  },
]

const onboardingSteps = [
  {
    step: '01',
    title: 'Preparar puente',
    description: 'Configurar Home Assistant como capa operativa y validar que los equipos aparezcan.',
  },
  {
    step: '02',
    title: 'Vincular cliente',
    description: 'Cargar nombre, sitio y alcance del primer cliente real en el panel interno.',
  },
  {
    step: '03',
    title: 'Validar vista',
    description: 'Comprobar que el portal de cliente muestre camaras, alertas y espacios vigilados.',
  },
  {
    step: '04',
    title: 'Registrar excepciones',
    description: 'Dejar el acceso directo solo para casos especiales que no pasen por Home Assistant.',
  },
]

export default function IntegrationsAdminPage() {
  const summary = getIntegrationSummary()
  const activity = getIntegrationActivitySummary(12)
  const connections = getIntegrationConnections()
  const recentEvents = getIntegrationEvents(12)
  const tuyaConnection = connections.find((connection) => connection.provider === 'tuya')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light text-white">Integraciones</h1>
        <p className="mt-1 text-white/60">Operacion interna: Home Assistant debe ser el puente recomendado y SegurIA debe leer desde ahi.</p>
      </div>

      <div className="glass-card p-6">
        <p className="text-[#4DA3D9] text-sm mb-2">Objetivo</p>
        <h2 className="text-2xl md:text-3xl font-light text-white text-balance">
          Dejar lista la conexion real y mostrar sus datos.
        </h2>
        <p className="mt-3 max-w-2xl text-white/55">
          La meta ahora es simple: nuestro equipo prepara el puente, trae dispositivos y muestra su estado.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Vista cliente</p>
          <h3 className="mt-2 text-lg font-light text-white">Home Assistant primero</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">
            El portal debe leer desde la capa normalizada para dar una experiencia simple y confiable.
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Excepcion</p>
          <h3 className="mt-2 text-lg font-light text-white">Fallback directo</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Solo si Home Assistant no expone algo relevante, se revisa un camino alternativo.
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Primer cliente</p>
          <h3 className="mt-2 text-lg font-light text-white">Onboarding guiado</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Configuramos el puente, validamos la cuenta y dejamos la primera vista lista para operar.
          </p>
        </div>
      </div>

      <div className="glass-card border border-[#4DA3D9]/20 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[#4DA3D9] mb-2">Conexion activa</p>
            <h2 className="text-2xl font-light text-white">
              {tuyaConnection?.accountName || 'Aun no hay cuenta vinculada'}
            </h2>
            <p className="mt-2 text-sm text-white/55">
              {tuyaConnection?.accountEmail || 'Completa el formulario para guardar el correo y el alcance.'}
            </p>
          </div>
          <div className="grid gap-2 text-sm text-white/65 sm:text-right">
            <p>Alcance: {tuyaConnection?.accountScope || 'Sin definir'}</p>
            <p>Estado: {tuyaConnection?.status || 'pending'}</p>
            <p>Ultima sincronizacion: {tuyaConnection?.lastSyncAt ? tuyaConnection.lastSyncAt.toLocaleString('es-CL') : 'Sin datos'}</p>
          </div>
        </div>
      </div>

      <TuyaConnectForm />

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm">Conexiones</p>
          <p className="text-white text-3xl font-light mt-2">{summary.totalConnections}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm">Conectadas</p>
          <p className="text-white text-3xl font-light mt-2">{summary.connectedConnections}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-white/60 text-sm">Pendientes</p>
          <p className="text-white text-3xl font-light mt-2">{summary.pendingConnections}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-[5px] bg-white/5 p-4">
          <p className="text-white/50 text-sm">Cuentas listas</p>
          <p className="text-white text-2xl font-light mt-1">{activity.connectedEvents}</p>
        </div>
        <div className="rounded-[5px] bg-white/5 p-4">
          <p className="text-white/50 text-sm">Sincronizaciones</p>
          <p className="text-white text-2xl font-light mt-1">{activity.syncEvents}</p>
        </div>
        <div className="rounded-[5px] bg-white/5 p-4">
          <p className="text-white/50 text-sm">Alertas</p>
          <p className="text-white text-2xl font-light mt-1">{activity.alertEvents}</p>
        </div>
      </div>

      <div className="glass-card p-6 border border-[#4DA3D9]/20">
        <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
          <div>
            <p className="text-[#4DA3D9] text-sm mb-2">Feeds listos</p>
            <h2 className="text-2xl font-light text-white">La base ya recibe equipos y alertas del cliente.</h2>
          </div>
          <span className="text-[12px] px-2 py-1 rounded-[5px] bg-[#4DA3D9]/15 text-[#9DD2F2]">Listo para puente HA</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-5">
          {feedFamilies.map((family) => (
            <div key={family.title} className="rounded-[5px] bg-white/5 p-4">
              <h3 className="text-white font-light text-[16px]">{family.title}</h3>
              <p className="text-white/55 text-sm mt-2">{family.description}</p>
              <p className="text-white/40 text-sm mt-3">{family.details}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 border border-[#4DA3D9]/20">
        <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
          <div>
            <p className="text-[#4DA3D9] text-sm mb-2">Catálogo de cámaras</p>
            <h2 className="text-2xl font-light text-white">Tipos que ya conviene considerar en el portal.</h2>
            <p className="text-white/55 mt-3 max-w-2xl">
              No hay una base pública completa con todos los modelos, pero sí categorías y capacidades para dejar el portal listo.
            </p>
          </div>
          <span className="text-[12px] px-2 py-1 rounded-[5px] bg-[#4DA3D9]/15 text-[#9DD2F2]">
            Data base lista
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mt-5">
          {cameraCatalog.map((camera) => (
            <div key={camera.code} className="rounded-[5px] bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-light">{camera.label}</p>
                  <p className="text-white/50 text-sm mt-1">Categoría interna: {camera.code}</p>
                </div>
                <span className="text-[12px] px-2 py-1 rounded-[5px] bg-white/10 text-white/60">Compatible</span>
              </div>
              <p className="text-white/55 text-sm mt-3">{camera.summary}</p>

              <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
                <div>
                  <p className="text-white/40">Capacidades</p>
                  <ul className="mt-2 space-y-1 text-white/70">
                    {camera.features.map((feature) => (
                      <li key={feature}>• {feature}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-white/40">Emparejamiento</p>
                  <ul className="mt-2 space-y-1 text-white/70">
                    {camera.pairing.map((method) => (
                      <li key={method}>• {method}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {camera.notes.map((note) => (
                  <span key={note} className="text-[12px] px-2 py-1 rounded-[5px] bg-white/10 text-white/55">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[5px] bg-white/5 p-4">
          <p className="text-white/40 text-sm">Capacidades comunes que ya vale la pena modelar</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cameraCommonCapabilities.map((item) => (
              <span key={item} className="text-[12px] px-2 py-1 rounded-[5px] bg-[#4DA3D9]/15 text-[#9DD2F2]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border border-[#4DA3D9]/20">
        <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
          <div>
            <p className="text-[#4DA3D9] text-sm mb-2">Sensores y otros equipos</p>
            <h2 className="text-2xl font-light text-white">La data que conviene cargar para el portal del cliente.</h2>
            <p className="text-white/55 mt-3 max-w-2xl">
              Priorizamos los sensores que más importan para seguridad, control ambiental y automatización.
            </p>
          </div>
          <span className="text-[12px] px-2 py-1 rounded-[5px] bg-[#4DA3D9]/15 text-[#9DD2F2]">
            Cobertura amplia
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {deviceCatalogHighlights.map((item) => (
            <span key={item} className="text-[12px] px-2 py-1 rounded-[5px] bg-white/10 text-white/60">
              {item}
            </span>
          ))}
        </div>

        <div className="grid xl:grid-cols-2 gap-4 mt-5">
          {deviceCatalogGroups.map((group) => (
            <div key={group.title} className="rounded-[5px] bg-white/5 p-4">
              <h3 className="text-white font-light text-[16px]">{group.title}</h3>
              <p className="text-white/50 text-sm mt-1">{group.description}</p>
              <div className="space-y-4 mt-4">
                {group.items.slice(0, 6).map((item) => (
                  <div key={item.code} className="rounded-[5px] bg-[#0B1D30] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-white">{item.label}</p>
                        <p className="text-white/45 text-xs mt-1">Código interno: {item.code}</p>
                      </div>
                      <span className="text-[12px] px-2 py-1 rounded-[5px] bg-white/10 text-white/55">
                        {item.platforms[0]}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mt-2">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 border border-[#4DA3D9]/20">
        <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
          <div>
            <p className="text-[#4DA3D9] text-sm mb-2">Onboarding</p>
            <h2 className="text-2xl font-light text-white">Primer cliente real</h2>
            <p className="text-white/55 mt-3 max-w-2xl">
              Dejamos este flujo listo para usarlo como plantilla de activacion cuando llegue la primera cuenta real.
            </p>
          </div>
          <span className="text-[12px] px-2 py-1 rounded-[5px] bg-[#4DA3D9]/15 text-[#9DD2F2]">
            Guiado y repetible
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {onboardingSteps.map((step) => (
            <div key={step.step} className="rounded-[5px] bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-[#9DD2F2]">{step.step}</p>
                <ChevronRight className="h-4 w-4 text-white/35" />
              </div>
              <h3 className="mt-2 text-white font-light text-[16px]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {autonomyFunctions.map((item) => (
          <div key={item.title} className="glass-card p-5">
            <div className="w-11 h-11 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center mb-4">
              <item.icon className="w-5 h-5 text-[#4DA3D9]" strokeWidth={1.5} />
            </div>
            <h3 className="text-white font-light text-[16px] mb-1">{item.title}</h3>
            <p className="text-white/55 text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1fr_1.1fr] gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Workflow className="w-5 h-5 text-[#4DA3D9]" strokeWidth={1.5} />
              <h2 className="text-lg font-light text-white">Estado de conectores</h2>
            </div>
            <span className="text-[12px] px-2 py-1 rounded-[5px] bg-white/10 text-white/60">API listo</span>
          </div>

          <div className="space-y-4">
            {connections.map((connection) => {
              const Icon = connection.provider === 'github' ? Github : Home
              return (
                <div key={connection.provider} className="rounded-[5px] bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#4DA3D9]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-white font-light">{connection.name}</p>
                        <p className="text-white/50 text-sm mt-1">{connection.description}</p>
                        {connection.accountName && (
                          <p className="text-white/40 text-xs mt-1">
                            Cuenta: {connection.accountName}
                            {connection.accountScope ? ` | ${connection.accountScope}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-[5px] text-[12px] ${statusStyles[connection.status]}`}>
                      {connection.status}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-white/40">Endpoint</p>
                      <p className="text-white/70 mt-1 break-all">
                        {connection.provider === 'tuya' ? 'Endpoint interno' : connection.endpoint}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40">Secreto</p>
                      <p className="text-white/70 mt-1">{connection.secretName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Eventos</p>
                      <p className="text-white/70 mt-1">{connection.totalEvents}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Dispositivos</p>
                      <p className="text-white/70 mt-1">{connection.totalDevices}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {connection.notes.map((note) => (
                      <span key={note} className="text-[12px] px-2 py-1 rounded-[5px] bg-white/10 text-white/55">
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Network className="w-5 h-5 text-[#4DA3D9]" strokeWidth={1.5} />
              <h2 className="text-lg font-light text-white">Eventos recientes</h2>
            </div>
            <span className="text-[12px] px-2 py-1 rounded-[5px] bg-white/10 text-white/60">{recentEvents.length} items</span>
          </div>

          <div className="space-y-4">
            {recentEvents.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                <Clock3 className="w-12 h-12 mx-auto mb-4 text-white/20" strokeWidth={1.5} />
                Sin eventos registrados
              </div>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="rounded-[5px] bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 rounded-[5px] text-[12px] ${statusStyles.connected}`}>
                          {providerLabels[event.provider] || 'Integracion'}
                        </span>
                        <span className="text-white/35 text-[12px]">{event.eventType}</span>
                      </div>
                      <p className="text-white mt-3 font-light">{scrubVisibleText(event.title)}</p>
                      <div className="mt-2 text-white/50 text-sm space-y-1">
                        {event.deviceName && <p>Dispositivo: {event.deviceName}</p>}
                        {event.entityId && <p>Entidad: {event.entityId}</p>}
                        {event.externalId && <p>ID externo: {event.externalId}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-[12px]">
                        {new Intl.DateTimeFormat('es-CL', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date(event.receivedAt))}
                      </p>
                      {event.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto mt-2" strokeWidth={1.5} />
                      ) : event.status === 'warning' ? (
                        <ShieldAlert className="w-4 h-4 text-amber-400 ml-auto mt-2" strokeWidth={1.5} />
                      ) : null}
                    </div>
                  </div>

                  {event.payload && (
                    <pre className="mt-4 overflow-x-auto rounded-[5px] bg-[#0A1B2E] p-3 text-[12px] text-white/65">
                      {JSON.stringify(scrubVisiblePayload(event.payload), null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h2 className="text-lg font-light text-white">Siguiente paso</h2>
            <p className="text-white/55 text-sm mt-1">
              Setear la cuenta real del cliente y probar la primera vista de datos.
            </p>
          </div>
          <a href="/integraciones" className="btn-primary px-5 py-2.5 text-[15px] inline-flex items-center gap-2">
            Revisar experiencia
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

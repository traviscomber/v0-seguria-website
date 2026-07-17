import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Home,
  Network,
  RefreshCw,
  Shield,
  ShieldAlert,
  Workflow,
} from 'lucide-react'
import {
  getIntegrationActivitySummary,
  getIntegrationConnections,
  getIntegrationCredentialSummaries,
  getIntegrationEvents,
  getIntegrationPropertyOptions,
  getIntegrationSummary,
} from '@/lib/integration-state'
import { cameraCatalog, cameraCommonCapabilities } from '@/lib/camera-catalog'
import { deviceCatalogGroups, deviceCatalogHighlights } from '@/lib/device-catalog'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { GatewayProvisionForm } from '@/components/gateway-provision-form'
import { IntegrationCredentialForm } from '@/components/integration-credential-form'

export const dynamic = 'force-dynamic'

const statusStyles = {
  pending: 'bg-amber-500/20 text-amber-300',
  connected: 'bg-green-500/20 text-green-300',
  degraded: 'bg-orange-500/20 text-orange-300',
  offline: 'bg-red-500/20 text-red-300',
}

const providerLabels: Record<string, string> = {
  tuya: 'Cuenta operativa',
  home_assistant: 'Puente local',
  github: 'Repositorio tecnico',
}

function scrubVisibleText(value: string) {
  return value
    .replace(/tuya/gi, 'cuenta operativa')
    .replace(/home[_ -]?assistant/gi, 'puente local')
    .replace(/github/gi, 'repositorio tecnico')
}

function scrubVisiblePayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrubVisiblePayload)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        typeof entry === 'string' ? scrubVisibleText(entry) : scrubVisiblePayload(entry),
      ])
    )
  }
  return typeof value === 'string' ? scrubVisibleText(value) : value
}

const operatingSteps = [
  ['01', 'Crear cliente y sitio', 'Alta desde el panel interno, con usuario, propiedad y espacios base.'],
  ['02', 'Provisionar gateway', 'Generar el enlace seguro que permite recibir inventario, eventos y evidencia.'],
  ['03', 'Guardar acceso operativo', 'Registrar la cuenta o token por propiedad sin exponer secretos.'],
  ['04', 'Validar portal', 'Confirmar que camaras, sensores, alertas y bitacora aparezcan para el cliente.'],
]

const readinessCards = [
  ['Inventario', 'Equipos normalizados por propiedad, espacio, estado, bateria y ultima senal.'],
  ['Eventos', 'Movimiento, apertura, fallas, desconexion y telemetria en una linea de tiempo comun.'],
  ['Evidencia', 'Snapshots y sesiones de video protegidas por rutas autenticadas de SegurIA.'],
  ['Respuesta', 'Incidentes, responsables, confirmaciones, SLA, acciones y auditoria trazable.'],
]

export default async function IntegrationsAdminPage() {
  const auth = await getCurrentAuthSession()
  const user = auth?.user
  const [summary, activity, connections, recentEvents, properties, credentials] = await Promise.all([
    getIntegrationSummary(user),
    getIntegrationActivitySummary(12, user),
    getIntegrationConnections(user),
    getIntegrationEvents(12, user),
    user ? getIntegrationPropertyOptions(user) : Promise.resolve([]),
    user ? getIntegrationCredentialSummaries(user) : Promise.resolve([]),
  ])

  const totalDevices = connections.reduce((total, connection) => total + connection.totalDevices, 0)

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="glass-card p-7">
          <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Integraciones internas</p>
          <h1 className="mt-3 text-3xl font-light text-white md:text-4xl">Activar datos reales por cliente</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">
            SegurIA debe mostrar camaras, sensores, eventos y evidencia sin que el cliente tenga que entender la tecnologia
            que hay debajo. Esta vista es para preparar, validar y monitorear ese puente operativo.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <Metric label="Conexiones" value={summary.totalConnections.toString()} />
          <Metric label="Listas" value={summary.connectedConnections.toString()} />
          <Metric label="Equipos" value={totalDevices.toString()} />
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {readinessCards.map(([title, text]) => (
          <div key={title} className="glass-card p-5">
            <Shield className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.5} />
            <h2 className="mt-4 text-lg font-light text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/52">{text}</p>
          </div>
        ))}
      </div>

      <GatewayProvisionForm
        properties={properties.map((property) => ({ id: property.id, name: property.name, location: property.location }))}
      />

      <IntegrationCredentialForm properties={properties} initialCredentials={credentials} />

      <section className="glass-card border border-[#4DA3D9]/20 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-[#9DD2F2]">Flujo repetible</p>
            <h2 className="mt-2 text-2xl font-light text-white">Onboarding tecnico del cliente</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              El objetivo es que cualquier propiedad quede lista para recibir datos y operar desde el portal.
            </p>
          </div>
          <Link href="/admin/clientes" className="btn-secondary inline-flex w-fit items-center gap-2 px-4 py-2.5 text-sm">
            Ver clientes
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {operatingSteps.map(([step, title, text]) => (
            <div key={step} className="rounded-[5px] bg-white/5 p-4">
              <p className="text-sm text-[#9DD2F2]">{step}</p>
              <h3 className="mt-2 text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/50">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Workflow className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.5} />
              <h2 className="text-lg font-light text-white">Estado de conectores</h2>
            </div>
            <span className="rounded-[5px] bg-white/10 px-2 py-1 text-[12px] text-white/60">API lista</span>
          </div>

          <div className="space-y-4">
            {connections.length === 0 ? (
              <EmptyState text="Aun no hay conexiones reales. Crea un cliente y provisiona su gateway." />
            ) : (
              connections.map((connection) => (
                <div key={connection.provider} className="rounded-[5px] bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-[#4DA3D9]/20">
                        <Home className="h-5 w-5 text-[#4DA3D9]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-white">{scrubVisibleText(connection.name)}</p>
                        <p className="mt-1 text-sm text-white/50">{scrubVisibleText(connection.description)}</p>
                        {connection.accountName && <p className="mt-1 text-xs text-white/40">Cuenta: {connection.accountName}</p>}
                      </div>
                    </div>
                    <span className={`rounded-[5px] px-2 py-1 text-[12px] ${statusStyles[connection.status]}`}>
                      {connection.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <InlineStat label="Endpoint" value={connection.provider === 'tuya' ? 'Endpoint interno' : connection.endpoint || '-'} />
                    <InlineStat label="Eventos" value={connection.totalEvents.toString()} />
                    <InlineStat label="Dispositivos" value={connection.totalDevices.toString()} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Network className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.5} />
              <h2 className="text-lg font-light text-white">Eventos recientes</h2>
            </div>
            <span className="rounded-[5px] bg-white/10 px-2 py-1 text-[12px] text-white/60">{recentEvents.length} items</span>
          </div>

          <div className="space-y-4">
            {recentEvents.length === 0 ? (
              <EmptyState text="Sin eventos registrados todavia." />
            ) : (
              recentEvents.map((event) => (
                <article key={event.id} className="rounded-[5px] bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-[5px] bg-[#4DA3D9]/15 px-2 py-1 text-[12px] text-[#9DD2F2]">
                          {providerLabels[event.provider] || 'Integracion'}
                        </span>
                        <span className="text-[12px] text-white/35">{event.eventType}</span>
                      </div>
                      <p className="mt-3 font-light text-white">{scrubVisibleText(event.title)}</p>
                      <div className="mt-2 space-y-1 text-sm text-white/50">
                        {event.deviceName && <p>Dispositivo: {event.deviceName}</p>}
                        {event.entityId && <p>Entidad: {event.entityId}</p>}
                        {event.externalId && <p>ID externo: {event.externalId}</p>}
                      </div>
                    </div>
                    <EventIcon status={event.status} />
                  </div>
                  {event.payload && (
                    <pre className="mt-4 overflow-x-auto rounded-[5px] bg-[#0A1B2E] p-3 text-[12px] text-white/65">
                      {JSON.stringify(scrubVisiblePayload(event.payload), null, 2)}
                    </pre>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="glass-card border border-[#4DA3D9]/20 p-6">
        <p className="text-sm text-[#9DD2F2]">Catalogo operativo</p>
        <h2 className="mt-2 text-2xl font-light text-white">Camaras y sensores listos para dashboard</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
          Estas familias permiten preparar visualizaciones simples para el mercado local: espacios vigilados, alertas,
          telemetria y evidencia por propiedad.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {cameraCatalog.map((camera) => (
            <CatalogCard key={camera.code} title={camera.label} subtitle={`Categoria interna: ${camera.code}`} text={camera.summary} tags={[...camera.features, ...camera.pairing]} />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {cameraCommonCapabilities.map((item) => <Tag key={item}>{item}</Tag>)}
        </div>
      </section>

      <section className="glass-card border border-[#4DA3D9]/20 p-6">
        <p className="text-sm text-[#9DD2F2]">Sensores y equipos</p>
        <h2 className="mt-2 text-2xl font-light text-white">Data base para seguridad integral</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {deviceCatalogHighlights.map((item) => <Tag key={item}>{item}</Tag>)}
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {deviceCatalogGroups.map((group) => (
            <div key={group.title} className="rounded-[5px] bg-white/5 p-4">
              <h3 className="text-lg font-light text-white">{group.title}</h3>
              <p className="mt-1 text-sm text-white/50">{group.description}</p>
              <div className="mt-4 space-y-3">
                {group.items.slice(0, 6).map((item) => (
                  <CatalogCard key={item.code} title={item.label} subtitle={`Codigo interno: ${item.code}`} text={item.summary} tags={item.platforms} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric label="Cuentas listas" value={activity.connectedEvents.toString()} />
        <Metric label="Sincronizaciones" value={activity.syncEvents.toString()} />
        <Metric label="Alertas" value={activity.alertEvents.toString()} />
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm text-white/55">{label}</p>
      <p className="mt-2 text-3xl font-light text-white">{value}</p>
    </div>
  )
}

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/40">{label}</p>
      <p className="mt-1 break-all text-white/70">{value}</p>
    </div>
  )
}

function EventIcon({ status }: { status: string }) {
  if (status === 'success') return <CheckCircle2 className="h-4 w-4 text-green-400" strokeWidth={1.5} />
  if (status === 'warning') return <ShieldAlert className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
  return <Clock3 className="h-4 w-4 text-white/35" strokeWidth={1.5} />
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-[5px] border border-dashed border-white/10 p-8 text-center text-sm text-white/45">{text}</div>
}

function CatalogCard({ title, subtitle, text, tags }: { title: string; subtitle: string; text: string; tags: string[] }) {
  return (
    <div className="rounded-[5px] bg-[#0B1D30] p-4">
      <p className="text-white">{title}</p>
      <p className="mt-1 text-xs text-white/40">{subtitle}</p>
      <p className="mt-2 text-sm leading-6 text-white/58">{text}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.slice(0, 8).map((tag) => <Tag key={tag}>{tag}</Tag>)}
      </div>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-[5px] bg-white/10 px-2 py-1 text-[12px] text-white/58">{children}</span>
}

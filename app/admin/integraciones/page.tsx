import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Home,
  KeyRound,
  PlugZap,
  Radio,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import {
  getIntegrationConnections,
  getIntegrationCredentialSummaries,
  getIntegrationEvents,
  getIntegrationPropertyOptions,
  getIntegrationSummary,
} from '@/lib/integration-state'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { GatewayProvisionForm } from '@/components/gateway-provision-form'
import { IntegrationCredentialForm } from '@/components/integration-credential-form'
import type { IntegrationConnection, IntegrationEvent } from '@/lib/types'

export const dynamic = 'force-dynamic'

const statusStyles = {
  pending: 'bg-amber-500/18 text-amber-200 border-amber-300/20',
  connected: 'bg-green-500/18 text-green-200 border-green-300/20',
  degraded: 'bg-orange-500/18 text-orange-200 border-orange-300/20',
  offline: 'bg-red-500/18 text-red-200 border-red-300/20',
}

const statusLabels = {
  pending: 'Pendiente',
  connected: 'Conectado',
  degraded: 'Revisar',
  offline: 'Sin senal',
}

const providerLabels = {
  home_assistant: 'Puente local',
  tuya: 'Cuenta operativa',
}

function scrubVisibleText(value: string) {
  return value
    .replace(/home[_\s-]?assistant/gi, 'Puente local')
    .replace(/\bha\b/gi, 'puente local')
    .replace(/tuya/gi, 'Cuenta operativa')
}

function scrubVisiblePayload(value?: string | null) {
  return value ? scrubVisibleText(value) : ''
}

export default async function IntegrationsAdminPage() {
  const auth = await getCurrentAuthSession()
  if (!auth) redirect('/login?next=/admin/integraciones')
  if (auth.user.role === 'client') redirect('/app')

  const user = auth.user
  const [summary, connections, recentEvents, properties, credentials] = await Promise.all([
    getIntegrationSummary(user),
    getIntegrationConnections(user),
    getIntegrationEvents(12, user),
    getIntegrationPropertyOptions(user),
    user?.role === 'admin' ? getIntegrationCredentialSummaries(user) : Promise.resolve([]),
  ])

  const totalDevices = connections.reduce((total, connection) => total + connection.totalDevices, 0)
  const homeAssistantConnections = connections.filter((connection) => connection.provider === 'home_assistant')
  const propertyRows = properties.map((property) => {
    const propertyConnections = connections.filter((connection) => connection.propertyId === property.id)
    const propertyEvents = recentEvents.filter((event) => event.projectId === property.id)
    const homeAssistant = propertyConnections.find((connection) => connection.provider === 'home_assistant')
    const totalPropertyDevices = propertyConnections.reduce((total, connection) => total + connection.totalDevices, 0)

    return {
      ...property,
      connection: homeAssistant || propertyConnections[0],
      hasHomeAssistant: Boolean(homeAssistant),
      totalDevices: totalPropertyDevices,
      totalEvents: propertyEvents.length,
    }
  })

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden border border-[#4DA3D9]/20">
        <div className="grid gap-0 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="p-7 md:p-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#4DA3D9]/25 bg-[#4DA3D9]/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
              Consola interna
            </p>
            <h1 className="mt-5 max-w-2xl text-3xl font-light text-white md:text-4xl">
              Integraciones simples, estado claro.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">
              El puente local conecta camaras, sensores y alarmas por sitio. SegurIA ordena esa senal en inventario,
              eventos y evidencia. El cliente ve SegurIA; el equipo interno ve la operacion tecnica.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/admin/dispositivos" className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm">
                Ver inventario
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link href="/admin/incidentes" className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm">
                Ver incidentes
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-white/10 md:grid-cols-4 xl:grid-cols-2">
            <Metric label="Sitios" value={properties.length.toString()} icon={<Home className="h-5 w-5" strokeWidth={1.5} />} />
            <Metric label="Puente local" value={homeAssistantConnections.length.toString()} icon={<PlugZap className="h-5 w-5" strokeWidth={1.5} />} />
            <Metric label="Equipos" value={totalDevices.toString()} icon={<Radio className="h-5 w-5" strokeWidth={1.5} />} />
            <Metric label="Eventos" value={summary.recentEvents.length.toString()} icon={<Activity className="h-5 w-5" strokeWidth={1.5} />} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="glass-card p-6">
          <SectionHeader
            eyebrow="Operacion por cliente"
            title="Estado por sitio"
            action={
              <Link href="/admin/clientes" className="text-sm text-[#9DD2F2] hover:text-white">
                Gestionar clientes
              </Link>
            }
          />

          <div className="mt-5 space-y-3">
            {propertyRows.length === 0 ? (
              <EmptyState text="No hay propiedades asignadas para configurar." />
            ) : (
              propertyRows.map((property) => (
                <article key={property.id} className="rounded-[5px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-light text-white">{property.organizationName}</p>
                      <p className="mt-1 text-sm text-white/52">{property.name} / {property.location}</p>
                    </div>
                    <StatusBadge connection={property.connection} />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <StepCheck label="Gateway" active={Boolean(property.connection)} />
                    <StepCheck label="Puente local" active={property.hasHomeAssistant} />
                    <StepCheck label="Inventario" active={property.totalDevices > 0} />
                    <StepCheck label="Eventos" active={property.totalEvents > 0} />
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <InlineStat label="Equipos" value={property.totalDevices.toString()} />
                    <InlineStat label="Eventos recientes" value={property.totalEvents.toString()} />
                    <InlineStat label="Conexion" value={property.connection ? providerLabels[property.connection.provider] : 'Sin conectar'} />
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <SectionHeader eyebrow="Puente tecnico" title="Puente local" />
            <div className="mt-5 space-y-3">
              {homeAssistantConnections.length === 0 ? (
                <EmptyState text="Aun no hay puentes locales activos." />
              ) : (
                homeAssistantConnections.map((connection) => (
                  <ConnectionCard key={`${connection.propertyId || connection.name}-${connection.endpoint}`} connection={connection} />
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <SectionHeader eyebrow="Senal viva" title="Ultimos eventos" />
            <div className="mt-5 space-y-3">
              {recentEvents.length === 0 ? (
                <EmptyState text="Sin eventos recibidos todavia." />
              ) : (
                recentEvents.map((event) => <EventRow key={event.id} event={event} />)
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <GatewayProvisionForm
          properties={properties.map((property) => ({ id: property.id, name: property.name, location: property.location }))}
        />

        {user?.role === 'admin' ? (
          <IntegrationCredentialForm properties={properties} initialCredentials={credentials} />
        ) : (
          <section className="glass-card border border-white/10 p-6">
            <KeyRound className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.5} />
            <h2 className="mt-4 text-2xl font-light text-white">Credenciales reservadas para administradores</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Los tecnicos pueden validar estado e inventario. Las credenciales quedan reservadas para administradores.
            </p>
          </section>
        )}
      </section>
    </div>
  )
}

function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-[#9DD2F2]">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-light text-white">{title}</h2>
      </div>
      {action}
    </div>
  )
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#0A1B2E]/70 p-5">
      <div className="text-[#9DD2F2]">{icon}</div>
      <p className="mt-5 text-sm text-white/50">{label}</p>
      <p className="mt-1 text-3xl font-light text-white">{value}</p>
    </div>
  )
}

function StatusBadge({ connection }: { connection?: IntegrationConnection }) {
  if (!connection) {
    return <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">Sin conectar</span>
  }

  return (
    <span className={`w-fit rounded-full border px-3 py-1 text-xs ${statusStyles[connection.status]}`}>
      {statusLabels[connection.status]}
    </span>
  )
}

function StepCheck({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-[5px] px-3 py-2 text-sm ${active ? 'bg-[#4DA3D9]/12 text-[#C8EAFE]' : 'bg-white/5 text-white/35'}`}>
      {active ? <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} /> : <Clock3 className="h-4 w-4" strokeWidth={1.5} />}
      {label}
    </div>
  )
}

function ConnectionCard({ connection }: { connection: IntegrationConnection }) {
  return (
    <article className="rounded-[5px] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-white">{connection.name}</p>
          <p className="mt-1 text-sm text-white/45">{connection.accountName || 'Cuenta interna'}</p>
        </div>
        <StatusBadge connection={connection} />
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <InlineStat label="Endpoint" value={connection.endpoint || 'Pendiente'} />
        <InlineStat label="Equipos" value={connection.totalDevices.toString()} />
      </div>
      {connection.lastSyncAt && (
        <p className="mt-3 text-xs text-white/35">Ultima senal: {connection.lastSyncAt.toLocaleString('es-CL')}</p>
      )}
    </article>
  )
}

function EventRow({ event }: { event: IntegrationEvent }) {
  const eventType = scrubVisiblePayload(event.eventType)
  const eventTitle = scrubVisiblePayload(event.title)
  const entityId = scrubVisiblePayload(event.entityId)

  return (
    <article className="rounded-[5px] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-[#4DA3D9]/15 text-[#9DD2F2]">
          <Wrench className="h-4 w-4" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/55">
              {providerLabels[event.provider]}
            </span>
            <span className="text-[11px] text-white/35">{eventType}</span>
          </div>
          <p className="mt-2 text-sm text-white">{eventTitle}</p>
          {entityId && <p className="mt-1 truncate text-xs text-white/42">{entityId}</p>}
        </div>
      </div>
    </article>
  )
}

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[5px] bg-white/5 px-3 py-2">
      <p className="text-xs text-white/38">{label}</p>
      <p className="mt-1 break-all text-white/70">{value}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-[5px] border border-dashed border-white/10 p-6 text-center text-sm text-white/45">{text}</div>
}

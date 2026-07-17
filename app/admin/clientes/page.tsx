import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Cpu,
  KeyRound,
  MapPin,
  RadioTower,
  UserRound,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { ClientProvisionForm } from '@/components/client-provision-form'

export const dynamic = 'force-dynamic'

type OrganizationRow = {
  id: string
  name: string
  slug: string | null
  status: string | null
  created_at: string
  updated_at: string
}

type PropertyRow = {
  id: string
  organization_id: string
  name: string
  address: string | null
  status: string | null
}

type MembershipRow = {
  organization_id: string
  user_id: string
  role: string | null
}

type DeviceRow = {
  id: string
  organization_id: string
  property_id: string
  kind: string | null
  status: string | null
  last_seen_at: string | null
}

type GatewayRow = {
  id: string
  organization_id: string
  property_id: string
  status: string | null
  last_seen_at: string | null
}

type IncidentRow = {
  id: string
  organization_id: string
  property_id: string
  status: string | null
  severity: string | null
}

type CredentialRow = {
  id: string
  organization_id: string
  property_id: string
  status: string | null
  last_validated_at: string | null
}

function isOpenIncident(status: string | null) {
  return !status || !['resolved', 'closed'].includes(status)
}

function formatDate(value: string | null) {
  if (!value) return 'Sin actividad'
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getUserEmail(userById: Map<string, User>, userId: string) {
  return userById.get(userId)?.email || `usuario ${userId.slice(0, 8)}`
}

function getOperationalState({
  properties,
  devices,
  gateways,
  incidents,
  credentials,
}: {
  properties: PropertyRow[]
  devices: DeviceRow[]
  gateways: GatewayRow[]
  incidents: IncidentRow[]
  credentials: CredentialRow[]
}) {
  const openIncidents = incidents.filter((incident) => isOpenIncident(incident.status))
  const onlineGateways = gateways.filter((gateway) => gateway.status === 'online')
  const connectedCredentials = credentials.filter((credential) => credential.status === 'connected' || credential.status === 'active')

  if (openIncidents.some((incident) => incident.severity === 'critical' || incident.severity === 'high')) {
    return { label: 'Atencion alta', className: 'bg-red-500/15 text-red-200 border-red-400/30' }
  }

  if (openIncidents.length > 0) {
    return { label: 'Con alertas', className: 'bg-amber-500/15 text-amber-200 border-amber-400/30' }
  }

  if (properties.length === 0 || devices.length === 0 || onlineGateways.length === 0 || connectedCredentials.length === 0) {
    return { label: 'En onboarding', className: 'bg-sky-500/15 text-sky-200 border-sky-400/30' }
  }

  return { label: 'Operativo', className: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30' }
}

export default async function ClientsPage() {
  const auth = await getCurrentAuthSession()
  if (!auth) redirect('/login?next=/admin/clientes')
  if (auth.user.role === 'client') redirect('/app')

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return (
      <div className="glass-card p-8">
        <h1 className="text-3xl font-light text-white">Clientes</h1>
        <p className="mt-3 text-white/60">Falta configurar la conexion segura de datos para administrar clientes.</p>
      </div>
    )
  }

  const [organizationsResult, propertiesResult, membershipsResult, devicesResult, gatewaysResult, incidentsResult, credentialsResult, usersResult] = await Promise.all([
    supabase.from('organizations').select('id,name,slug,status,created_at,updated_at').order('created_at', { ascending: false }).limit(250),
    supabase.from('properties').select('id,organization_id,name,address,status'),
    supabase.from('memberships').select('organization_id,user_id,role'),
    supabase.from('devices').select('id,organization_id,property_id,kind,status,last_seen_at'),
    supabase.from('gateways').select('id,organization_id,property_id,status,last_seen_at'),
    supabase.from('incidents').select('id,organization_id,property_id,status,severity'),
    supabase.from('integration_credentials').select('id,organization_id,property_id,status,last_validated_at'),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  const queryError = organizationsResult.error || propertiesResult.error || membershipsResult.error || devicesResult.error || gatewaysResult.error || incidentsResult.error || credentialsResult.error || usersResult.error
  if (queryError) {
    return (
      <div className="glass-card p-8">
        <h1 className="text-3xl font-light text-white">Clientes</h1>
        <p className="mt-3 text-red-200">No se pudo leer clientes: {queryError.message}</p>
      </div>
    )
  }

  const organizations = (organizationsResult.data || []) as OrganizationRow[]
  const properties = (propertiesResult.data || []) as PropertyRow[]
  const memberships = (membershipsResult.data || []) as MembershipRow[]
  const devices = (devicesResult.data || []) as DeviceRow[]
  const gateways = (gatewaysResult.data || []) as GatewayRow[]
  const incidents = (incidentsResult.data || []) as IncidentRow[]
  const credentials = (credentialsResult.data || []) as CredentialRow[]
  const userById = new Map((usersResult.data.users || []).map((user) => [user.id, user]))

  const totalOpenIncidents = incidents.filter((incident) => isOpenIncident(incident.status)).length
  const totalOnlineGateways = gateways.filter((gateway) => gateway.status === 'online').length
  const totalConnectedCredentials = credentials.filter((credential) => credential.status === 'connected' || credential.status === 'active').length

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Onboarding interno</p>
          <h1 className="mt-2 text-3xl font-light text-white">Clientes</h1>
          <p className="mt-2 max-w-3xl text-white/55">
            Alta, portal, sitios, equipos y conectividad por empresa. Esta vista usa solo datos persistidos de la plataforma.
          </p>
        </div>
        <Link href="/admin/integraciones" className="btn-primary inline-flex w-fit items-center gap-2 px-4 py-2.5 text-[15px]">
          <RadioTower className="h-4 w-4" strokeWidth={1.5} />
          Configurar conectores
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Building2} label="Empresas" value={organizations.length.toString()} />
        <MetricCard icon={MapPin} label="Sitios" value={properties.length.toString()} />
        <MetricCard icon={Cpu} label="Equipos" value={devices.length.toString()} />
        <MetricCard icon={RadioTower} label="Enlaces online" value={totalOnlineGateways.toString()} />
        <MetricCard icon={AlertTriangle} label="Alertas abiertas" value={totalOpenIncidents.toString()} tone={totalOpenIncidents > 0 ? 'text-amber-200' : 'text-white'} />
      </div>

      <ClientProvisionForm />

      <section className="glass-card overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-light text-white">Empresas activas</h2>
          <p className="mt-1 text-sm text-white/50">
            Resumen operativo por cliente: usuarios, sitios, conectores, credenciales, equipos e incidentes.
          </p>
        </div>

        {organizations.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-white/30" strokeWidth={1} />
            <p className="text-white/70">Aun no hay empresas configuradas.</p>
            <p className="mt-2 text-sm text-white/45">Crea el primer portal de cliente desde el formulario superior.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/8">
            {organizations.map((organization) => {
              const orgProperties = properties.filter((property) => property.organization_id === organization.id)
              const orgMemberships = memberships.filter((membership) => membership.organization_id === organization.id)
              const orgDevices = devices.filter((device) => device.organization_id === organization.id)
              const orgGateways = gateways.filter((gateway) => gateway.organization_id === organization.id)
              const orgIncidents = incidents.filter((incident) => incident.organization_id === organization.id)
              const orgCredentials = credentials.filter((credential) => credential.organization_id === organization.id)
              const state = getOperationalState({
                properties: orgProperties,
                devices: orgDevices,
                gateways: orgGateways,
                incidents: orgIncidents,
                credentials: orgCredentials,
              })
              const lastSignal = orgDevices
                .map((device) => device.last_seen_at)
                .filter(Boolean)
                .sort()
                .at(-1) || orgGateways
                .map((gateway) => gateway.last_seen_at)
                .filter(Boolean)
                .sort()
                .at(-1) || organization.updated_at

              return (
                <article key={organization.id} className="p-5">
                  <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
                    <div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-xl font-light text-white">{organization.name}</h3>
                          <p className="mt-1 text-sm text-white/40">Slug interno: {organization.slug || organization.id.slice(0, 8)}</p>
                        </div>
                        <span className={`w-fit rounded-[5px] border px-2.5 py-1 text-xs ${state.className}`}>{state.label}</span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <InlineStat label="Sitios" value={orgProperties.length.toString()} />
                        <InlineStat label="Usuarios" value={orgMemberships.length.toString()} />
                        <InlineStat label="Equipos" value={orgDevices.length.toString()} />
                        <InlineStat label="Alertas" value={orgIncidents.filter((incident) => isOpenIncident(incident.status)).length.toString()} />
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <StatusPill icon={RadioTower} label={`${orgGateways.filter((gateway) => gateway.status === 'online').length}/${orgGateways.length} enlaces online`} />
                        <StatusPill icon={KeyRound} label={`${orgCredentials.filter((credential) => credential.status === 'connected' || credential.status === 'active').length}/${orgCredentials.length} cuentas listas`} />
                        <StatusPill icon={CheckCircle2} label={`Ultima senal: ${formatDate(lastSignal)}`} />
                      </div>
                    </div>

                    <div className="rounded-[5px] bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm text-white/55">
                        <UserRound className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.5} />
                        Accesos autorizados
                      </div>
                      <div className="mt-3 space-y-2">
                        {orgMemberships.length === 0 ? (
                          <p className="text-sm text-white/40">Sin usuarios asignados.</p>
                        ) : (
                          orgMemberships.slice(0, 4).map((membership) => (
                            <div key={`${membership.organization_id}-${membership.user_id}`} className="flex items-center justify-between gap-3 text-sm">
                              <span className="truncate text-white/70">{getUserEmail(userById, membership.user_id)}</span>
                              <span className="rounded-[5px] bg-white/8 px-2 py-1 text-xs text-white/45">{membership.role || 'client'}</span>
                            </div>
                          ))
                        )}
                        {orgMemberships.length > 4 && (
                          <p className="text-xs text-white/35">+{orgMemberships.length - 4} usuarios adicionales</p>
                        )}
                      </div>

                      <div className="mt-5 space-y-2">
                        <p className="text-sm text-white/55">Sitios</p>
                        {orgProperties.length === 0 ? (
                          <p className="text-sm text-white/40">Sin sitios configurados.</p>
                        ) : (
                          orgProperties.slice(0, 3).map((property) => (
                            <div key={property.id} className="rounded-[5px] bg-[#0B1D30] p-3">
                              <p className="text-sm text-white">{property.name}</p>
                              <p className="mt-1 text-xs text-white/40">{property.address || 'Direccion pendiente'}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <div className="glass-card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-light text-white">Estado de cuentas conectadas</h2>
            <p className="mt-1 text-sm text-white/50">
              {totalConnectedCredentials} credenciales listas para operar. Las credenciales se guardan como secreto interno y no se muestran en esta vista.
            </p>
          </div>
          <Link href="/admin/integraciones" className="inline-flex items-center gap-2 text-sm text-[#9DD2F2]">
            Revisar integraciones
            <RadioTower className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, tone = 'text-white' }: {
  icon: typeof Building2
  label: string
  value: string
  tone?: string
}) {
  return (
    <div className="glass-card p-4">
      <Icon className="mb-3 h-5 w-5 text-[#4DA3D9]" strokeWidth={1.5} />
      <p className="text-sm text-white/50">{label}</p>
      <p className={`mt-1 text-2xl font-light ${tone}`}>{value}</p>
    </div>
  )
}

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[5px] bg-white/5 p-3">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-lg font-light text-white">{value}</p>
    </div>
  )
}

function StatusPill({ icon: Icon, label }: { icon: typeof RadioTower; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[5px] bg-white/8 px-2.5 py-1.5 text-xs text-white/55">
      <Icon className="h-3.5 w-3.5 text-[#9DD2F2]" strokeWidth={1.5} />
      {label}
    </span>
  )
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  Building2,
  Camera,
  Cpu,
  FileText,
  MapPin,
  Radio,
  ShieldCheck,
  Siren,
} from 'lucide-react'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { ClientProvisionForm } from '@/components/client-provision-form'

export const dynamic = 'force-dynamic'

const openIncidentStatuses = ['new', 'validating', 'confirmed', 'responding']

type OrganizationRow = { id: string; name: string; status: string | null }
type PropertyRow = { id: string; organization_id: string; name: string; address: string | null; status: string | null; updated_at: string }
type DeviceRow = { id: string; property_id: string; kind: string; status: string; last_seen_at: string | null }
type IncidentRow = { id: string; property_id: string; title: string; severity: string; status: string; created_at: string; updated_at: string }
type GatewayRow = { id: string; property_id: string; name: string; status: string; last_seen_at: string | null; updated_at: string }
type NotificationRow = { id: string; property_id: string; severity: string; status: string; due_at: string; created_at: string }
type LeadRow = { id: string; name: string; email: string; property_type: string | null; status: string; created_at: string }
type AuditRow = { id: number; action: string; target_type: string; actor_label: string | null; created_at: string; property_id: string | null }
type HealthTone = 'ok' | 'warning' | 'critical'

function formatDate(value?: string | null) {
  if (!value) return 'sin datos'
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function isOpenIncident(status: string) {
  return openIncidentStatuses.includes(status)
}

function isGatewayStale(gateway: GatewayRow) {
  if (gateway.status !== 'online') return true
  if (!gateway.last_seen_at) return true
  return Date.now() - new Date(gateway.last_seen_at).getTime() > 15 * 60 * 1000
}

function getPropertyHealth({
  property,
  devices,
  gateways,
  incidents,
  notifications,
}: {
  property: PropertyRow
  devices: DeviceRow[]
  gateways: GatewayRow[]
  incidents: IncidentRow[]
  notifications: NotificationRow[]
}) {
  const propertyDevices = devices.filter((device) => device.property_id === property.id)
  const propertyGateways = gateways.filter((gateway) => gateway.property_id === property.id)
  const openIncidents = incidents.filter((incident) => incident.property_id === property.id && isOpenIncident(incident.status))
  const escalated = notifications.filter((notification) => notification.property_id === property.id && notification.status === 'escalated')
  const staleGateways = propertyGateways.filter(isGatewayStale)
  const alertDevices = propertyDevices.filter((device) => ['alert', 'offline', 'degraded'].includes(device.status))

  const score = Math.max(
    0,
    100 -
      openIncidents.filter((incident) => incident.severity === 'critical').length * 25 -
      openIncidents.filter((incident) => incident.severity !== 'critical').length * 14 -
      staleGateways.length * 18 -
      alertDevices.length * 8 -
      escalated.length * 16
  )

  const tone: HealthTone = score >= 82 ? 'ok' : score >= 55 ? 'warning' : 'critical'
  const label = tone === 'ok' ? 'Estable' : tone === 'warning' ? 'Revisar' : 'Prioridad alta'

  return {
    score,
    tone,
    label,
    openIncidents: openIncidents.length,
    criticalIncidents: openIncidents.filter((incident) => incident.severity === 'critical').length,
    staleGateways: staleGateways.length,
    alertDevices: alertDevices.length,
    escalated: escalated.length,
    deviceCount: propertyDevices.length,
    gatewayCount: propertyGateways.length,
  }
}

export default async function AdminDashboard() {
  const auth = await getCurrentAuthSession()
  if (!auth) redirect('/login?next=/admin')
  if (auth.user.role === 'client') redirect('/app')

  const supabase = createSupabaseAdminClient()
  const hasScopedAccess = auth.user.role === 'admin' || (auth.user.clientIds.length > 0 && auth.user.propertyIds.length > 0)

  let organizations: OrganizationRow[] = []
  let properties: PropertyRow[] = []
  let devices: DeviceRow[] = []
  let incidents: IncidentRow[] = []
  let notifications: NotificationRow[] = []
  let leads: LeadRow[] = []
  let gateways: GatewayRow[] = []
  let auditRows: AuditRow[] = []
  let snapshotCount = 0
  let evidenceCount = 0

  if (supabase && hasScopedAccess) {
    const orgQuery = auth.user.role === 'admin'
      ? supabase.from('organizations').select('id,name,status').order('name')
      : supabase.from('organizations').select('id,name,status').in('id', auth.user.clientIds).order('name')
    const propertyQuery = auth.user.role === 'admin'
      ? supabase.from('properties').select('id,organization_id,name,address,status,updated_at').order('updated_at', { ascending: false })
      : supabase.from('properties').select('id,organization_id,name,address,status,updated_at').in('id', auth.user.propertyIds).order('updated_at', { ascending: false })
    const deviceQuery = auth.user.role === 'admin'
      ? supabase.from('devices').select('id,property_id,kind,status,last_seen_at')
      : supabase.from('devices').select('id,property_id,kind,status,last_seen_at').in('property_id', auth.user.propertyIds)
    const incidentQuery = auth.user.role === 'admin'
      ? supabase.from('incidents').select('id,property_id,title,severity,status,created_at,updated_at').order('created_at', { ascending: false }).limit(80)
      : supabase.from('incidents').select('id,property_id,title,severity,status,created_at,updated_at').in('property_id', auth.user.propertyIds).order('created_at', { ascending: false }).limit(80)
    const notificationQuery = auth.user.role === 'admin'
      ? supabase.from('notifications').select('id,property_id,severity,status,due_at,created_at').order('created_at', { ascending: false }).limit(120)
      : supabase.from('notifications').select('id,property_id,severity,status,due_at,created_at').in('property_id', auth.user.propertyIds).order('created_at', { ascending: false }).limit(120)
    const gatewayQuery = auth.user.role === 'admin'
      ? supabase.from('gateways').select('id,property_id,name,status,last_seen_at,updated_at').order('updated_at', { ascending: false }).limit(40)
      : supabase.from('gateways').select('id,property_id,name,status,last_seen_at,updated_at').in('property_id', auth.user.propertyIds).order('updated_at', { ascending: false }).limit(40)
    const snapshotQuery = auth.user.role === 'admin'
      ? supabase.from('camera_snapshots').select('id', { count: 'exact', head: true })
      : supabase.from('camera_snapshots').select('id', { count: 'exact', head: true }).in('property_id', auth.user.propertyIds)
    const evidenceQuery = auth.user.role === 'admin'
      ? supabase.from('incident_evidence').select('id', { count: 'exact', head: true })
      : supabase.from('incident_evidence').select('id', { count: 'exact', head: true }).in('property_id', auth.user.propertyIds)
    const auditQuery = auth.user.role === 'admin'
      ? supabase.from('audit_log').select('id,action,target_type,actor_label,created_at,property_id').order('created_at', { ascending: false }).limit(8)
      : supabase.from('audit_log').select('id,action,target_type,actor_label,created_at,property_id').in('property_id', auth.user.propertyIds).order('created_at', { ascending: false }).limit(8)

    const [
      organizationsResult,
      propertiesResult,
      devicesResult,
      incidentsResult,
      notificationsResult,
      leadsResult,
      gatewaysResult,
      snapshotsResult,
      evidenceResult,
      auditResult,
    ] = await Promise.all([
      orgQuery,
      propertyQuery,
      deviceQuery,
      incidentQuery,
      notificationQuery,
      auth.user.role === 'admin'
        ? supabase.from('leads').select('id,name,email,property_type,status,created_at').order('created_at', { ascending: false }).limit(6)
        : Promise.resolve({ data: [] }),
      gatewayQuery,
      snapshotQuery,
      evidenceQuery,
      auditQuery,
    ])

    organizations = (organizationsResult.data || []) as OrganizationRow[]
    properties = (propertiesResult.data || []) as PropertyRow[]
    devices = (devicesResult.data || []) as DeviceRow[]
    incidents = (incidentsResult.data || []) as IncidentRow[]
    notifications = (notificationsResult.data || []) as NotificationRow[]
    leads = (leadsResult.data || []) as LeadRow[]
    gateways = (gatewaysResult.data || []) as GatewayRow[]
    auditRows = (auditResult.data || []) as AuditRow[]
    snapshotCount = snapshotsResult.count || 0
    evidenceCount = evidenceResult.count || 0
  }

  const organizationById = new Map(organizations.map((organization) => [organization.id, organization]))
  const propertyById = new Map(properties.map((property) => [property.id, property]))
  const openIncidents = incidents.filter((incident) => isOpenIncident(incident.status))
  const criticalIncidents = openIncidents.filter((incident) => incident.severity === 'critical')
  const escalatedNotifications = notifications.filter((notification) => notification.status === 'escalated')
  const staleGateways = gateways.filter(isGatewayStale)
  const cameraCount = devices.filter((device) => device.kind === 'camera').length
  const alertDevices = devices.filter((device) => ['alert', 'offline', 'degraded'].includes(device.status))
  const siteHealth = properties.map((property) => ({
    property,
    organization: organizationById.get(property.organization_id),
    health: getPropertyHealth({ property, devices, gateways, incidents, notifications }),
  }))
  const prioritySites = [...siteHealth].sort((left, right) => left.health.score - right.health.score).slice(0, 4)
  const stableSites = siteHealth.filter((site) => site.health.tone === 'ok').length
  const operationsScore = properties.length === 0
    ? 0
    : Math.round(siteHealth.reduce((total, site) => total + site.health.score, 0) / properties.length)

  const stats = [
    { label: 'Empresas', value: organizations.length, note: 'clientes configurados', icon: Building2, href: '/admin/clientes' },
    { label: 'Sitios', value: properties.length, note: `${stableSites} estables`, icon: MapPin, href: '/admin/proyectos' },
    { label: 'Equipos', value: devices.length, note: `${cameraCount} camaras`, icon: Cpu, href: '/admin/dispositivos' },
    {
      label: 'Prioridades',
      value: criticalIncidents.length + escalatedNotifications.length + staleGateways.length,
      note: `${openIncidents.length} incidentes abiertos`,
      icon: AlertTriangle,
      href: '/admin/incidentes',
      critical: criticalIncidents.length + escalatedNotifications.length + staleGateways.length > 0,
    },
  ]

  const priorityQueue = [
    ...criticalIncidents.slice(0, 4).map((incident) => ({
      id: `incident-${incident.id}`,
      title: incident.title,
      detail: `${propertyById.get(incident.property_id)?.name || 'Sitio'} - creado ${formatDate(incident.created_at)}`,
      tone: 'critical' as const,
      href: '/admin/incidentes',
      label: 'Incidente critico',
    })),
    ...escalatedNotifications.slice(0, 3).map((notification) => ({
      id: `notification-${notification.id}`,
      title: 'Confirmacion vencida',
      detail: `${propertyById.get(notification.property_id)?.name || 'Sitio'} - vencio ${formatDate(notification.due_at)}`,
      tone: 'warning' as const,
      href: '/admin/incidentes',
      label: 'SLA vencido',
    })),
    ...staleGateways.slice(0, 3).map((gateway) => ({
      id: `gateway-${gateway.id}`,
      title: gateway.name,
      detail: `${propertyById.get(gateway.property_id)?.name || 'Sitio'} - ultima senal ${formatDate(gateway.last_seen_at)}`,
      tone: 'warning' as const,
      href: '/admin/integraciones',
      label: 'Conector',
    })),
  ].slice(0, 6)

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.22),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.13),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] md:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />
        <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4DA3D9]/25 bg-[#4DA3D9]/12 px-4 py-2 text-sm text-[#9DD2F2]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.6} />
              Centro de operacion SegurIA
            </div>
            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-light leading-tight text-white md:text-5xl">
              Control operativo de clientes, sitios, alertas y evidencia.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
              Una vista interna para saber que cliente requiere atencion, que sitio esta estable, que conector dejo de reportar y que evidencia ya quedo asociada.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <SignalPill label="Salud global" value={`${operationsScore}%`} tone={operationsScore >= 82 ? 'ok' : operationsScore >= 55 ? 'warning' : 'critical'} />
              <SignalPill label="Gateways atentos" value={staleGateways.length.toString()} tone={staleGateways.length > 0 ? 'warning' : 'ok'} />
              <SignalPill label="Evidencia fijada" value={evidenceCount.toString()} tone="default" />
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-[#071524]/75 p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-white/40">Prioridad operativa</p>
                <h2 className="mt-2 text-xl font-light text-white">Que mirar primero</h2>
              </div>
              <Siren className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.7} />
            </div>
            <div className="mt-5 space-y-3">
              {priorityQueue.length === 0 ? (
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                  Sin prioridades abiertas. Mantener supervision normal.
                </div>
              ) : (
                priorityQueue.map((item) => (
                  <Link key={item.id} href={item.href} className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-white">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-white/45">{item.detail}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs ${item.tone === 'critical' ? 'bg-rose-400/12 text-rose-100' : 'bg-amber-400/12 text-amber-100'}`}>
                        {item.label}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon, href, critical }) => (
          <Link key={label} href={href} className={`group rounded-[24px] border p-6 transition hover:-translate-y-0.5 ${critical ? 'border-amber-300/20 bg-amber-400/8 hover:bg-amber-400/12' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/55">{label}</p>
                <p className="mt-2 text-3xl font-light text-white">{value}</p>
                <p className={`mt-2 text-xs ${critical ? 'text-amber-100' : 'text-[#9DD2F2]'}`}>{note}</p>
              </div>
              <div className="rounded-2xl bg-[#4DA3D9]/15 p-3 text-[#9DD2F2]">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Sitios</p>
              <h2 className="mt-2 text-2xl font-light text-white">Salud por cliente y propiedad</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">Priorizado por incidentes, conectividad, equipos en alerta y SLA.</p>
            </div>
            <Link href="/admin/proyectos" className="inline-flex items-center gap-2 text-sm text-[#9DD2F2]">
              Ver sitios
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4">
            {prioritySites.length === 0 ? (
              <EmptyState text="Todavia no hay sitios configurados." />
            ) : (
              prioritySites.map(({ property, organization, health }) => (
                <Link key={property.id} href="/admin/proyectos" className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4 transition hover:bg-white/8">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base text-white">{property.name}</p>
                        <span className={`rounded-full px-3 py-1 text-xs ${getHealthTone(health.tone)}`}>{health.label}</span>
                      </div>
                      <p className="mt-1 text-sm text-white/45">{organization?.name || 'Cliente'} - {property.address || 'Sin ubicacion'}</p>
                    </div>
                    <div className="grid min-w-[360px] grid-cols-4 gap-2 text-center text-xs text-white/55">
                      <MiniSignal label="Salud" value={`${health.score}%`} />
                      <MiniSignal label="Inc." value={health.openIncidents.toString()} />
                      <MiniSignal label="Gateway" value={`${Math.max(0, health.gatewayCount - health.staleGateways)}/${health.gatewayCount}`} />
                      <MiniSignal label="Equipos" value={health.deviceCount.toString()} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-6">
          <section className="glass-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#9DD2F2]">Conectividad</p>
                <h2 className="mt-2 text-xl font-light text-white">Gateways y ultima senal</h2>
              </div>
              <Radio className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.5} />
            </div>
            <div className="mt-5 divide-y divide-white/8">
              {gateways.length === 0 ? <EmptyState text="No hay gateways configurados. Crea un cliente para iniciar." /> : gateways.slice(0, 6).map((gateway) => {
                const stale = isGatewayStale(gateway)
                return (
                  <div key={gateway.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm text-white">{gateway.name}</p>
                      <p className="mt-1 text-xs text-white/45">{propertyById.get(gateway.property_id)?.name || 'Sitio'} - ultima senal {formatDate(gateway.last_seen_at)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs ${stale ? 'bg-amber-500/12 text-amber-200' : 'bg-emerald-500/12 text-emerald-300'}`}>
                      {stale ? 'Revisar' : 'En linea'}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="glass-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#9DD2F2]">Evidencia</p>
                <h2 className="mt-2 text-xl font-light text-white">Capturas y casos</h2>
              </div>
              <Camera className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.5} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniMetric icon={Camera} label="Capturas" value={snapshotCount.toString()} />
              <MiniMetric icon={FileText} label="Fijadas" value={evidenceCount.toString()} />
              <MiniMetric icon={BellRing} label="SLA" value={escalatedNotifications.length.toString()} tone={escalatedNotifications.length > 0 ? 'warning' : 'default'} />
            </div>
          </section>
        </div>
      </section>

      {auth.user.role === 'admin' ? <ClientProvisionForm /> : <AdminOnlyNotice />}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-light text-white">Contactos recientes</h2>
            <Link href="/admin/leads" className="flex items-center gap-1 text-sm text-[#9DD2F2]">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 divide-y divide-white/8">
            {leads.length === 0 ? <EmptyState text="Todavia no hay solicitudes comerciales." /> : leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm text-white">{lead.name}</p>
                  <p className="mt-1 text-xs text-white/45">{lead.email} - {lead.property_type || 'sin tipo'}</p>
                </div>
                <span className="rounded-full bg-[#4DA3D9]/12 px-3 py-1 text-xs text-[#9DD2F2]">{lead.status === 'new' ? 'Nuevo' : 'En seguimiento'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-light text-white">Auditoria reciente</h2>
            <Link href="/admin/auditoria" className="flex items-center gap-1 text-sm text-[#9DD2F2]">
              Ver auditoria <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 divide-y divide-white/8">
            {auditRows.length === 0 ? <EmptyState text="Aun no hay actividad auditada." /> : auditRows.map((row) => (
              <div key={row.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="text-sm text-white">{getActionLabel(row.action)}</p>
                  <p className="mt-1 text-xs text-white/45">{row.actor_label || 'SegurIA'} - {row.target_type}</p>
                </div>
                <span className="whitespace-nowrap rounded-full bg-white/5 px-3 py-1 text-xs text-white/45">{formatDate(row.created_at)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-white/45">{text}</p>
}

function SignalPill({ label, value, tone }: { label: string; value: string; tone: 'ok' | 'warning' | 'critical' | 'default' }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone === 'ok' ? 'border-emerald-400/18 bg-emerald-400/10' : tone === 'warning' ? 'border-amber-400/18 bg-amber-400/10' : tone === 'critical' ? 'border-rose-400/18 bg-rose-400/10' : 'border-white/10 bg-white/5'}`}>
      <p className="text-xs uppercase tracking-[0.16em] text-white/38">{label}</p>
      <p className="mt-2 text-2xl font-light text-white">{value}</p>
    </div>
  )
}

function MiniSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  )
}

function MiniMetric({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: typeof Camera
  label: string
  value: string
  tone?: 'default' | 'warning'
}) {
  return (
    <div className={`rounded-2xl border p-4 ${tone === 'warning' ? 'border-amber-400/20 bg-amber-400/10' : 'border-white/10 bg-[#0B1D30]'}`}>
      <Icon className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.7} />
      <p className="mt-3 text-xs uppercase tracking-[0.15em] text-white/38">{label}</p>
      <p className="mt-1 text-xl font-light text-white">{value}</p>
    </div>
  )
}

function getHealthTone(tone: 'ok' | 'warning' | 'critical') {
  if (tone === 'ok') return 'bg-emerald-400/10 text-emerald-100'
  if (tone === 'warning') return 'bg-amber-400/10 text-amber-100'
  return 'bg-rose-400/10 text-rose-100'
}

function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    'incident.evidence_attached': 'Evidencia fijada a incidente',
    'notification.escalated': 'Notificacion escalada',
    'notification.acknowledged': 'Aviso confirmado',
    'camera_snapshot.received': 'Captura recibida',
    'gateway.heartbeat': 'Senal de gateway',
  }
  return labels[action] || action.replace(/[._]/g, ' ')
}

function AdminOnlyNotice() {
  return (
    <div className="glass-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#4DA3D9]/15 p-3 text-[#9DD2F2]">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-lg font-light text-white">Alta de clientes protegida</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/50">
            Los tecnicos pueden revisar sitios, equipos e incidentes. La creacion de empresas y usuarios queda reservada para administradores.
          </p>
        </div>
      </div>
      <Link href="/admin/clientes" className="inline-flex items-center gap-2 text-sm text-[#9DD2F2]">
        Ver clientes
        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
      </Link>
    </div>
  )
}

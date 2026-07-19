import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Building2, CheckCircle2, CircleAlert, FileText, LayoutGrid, Radar, ShieldAlert, Siren, Wifi } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentAuthSession } from '@/lib/auth-store'
import {
  getAccessiblePortalSites,
  getPortalActivityFeed,
  getPortalAlertDevices,
  getPortalDashboardTotals,
  getPortalPortfolioReport,
  getPortalSensorRisk,
  isOpenPortalIncident,
} from '@/lib/client-portal'
import { CameraSnapshot } from '@/components/camera-snapshot'
import { CameraStreamControl } from '@/components/camera-stream-control'
import { ClientNotificationCenter } from '@/components/client-notification-center'

function formatDate(value?: Date) {
  if (!value) return 'Sin actualizacion'
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function formatDuration(value: number | undefined, unit: 'min' | 'h') {
  if (typeof value !== 'number') return 'Sin datos'
  return `${Math.round(value)} ${unit}`
}

function getStatusTone(status: string) {
  if (status === 'operativo') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
  if (status === 'revision') return 'border-amber-400/30 bg-amber-400/10 text-amber-100'
  return 'border-rose-400/30 bg-rose-400/10 text-rose-100'
}

function getAlertTone(status?: string) {
  if (status === 'falla') return 'border-rose-400/30 bg-rose-400/10 text-rose-100'
  if (status === 'mantencion') return 'border-amber-400/30 bg-amber-400/10 text-amber-100'
  return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
}

function getContinuityTone(hasRisk: boolean) {
  return hasRisk
    ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
    : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
}

function getCameraFrameTint(index: number) {
  return index % 2 === 0
    ? 'from-cyan-500/45 via-slate-950/30 to-slate-950'
    : 'from-emerald-500/35 via-slate-950/30 to-slate-950'
}

function getCameraLabel(deviceName: string) {
  const name = deviceName.toLowerCase()
  if (name.includes('front')) return 'Entrada principal'
  if (name.includes('patio')) return 'Patio lateral'
  if (name.includes('port')) return 'Porton'
  if (name.includes('gate')) return 'Acceso'
  return 'Perimetro'
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-light text-white">{value}</p>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1D30] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  )
}

function ReportMetric({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'critical'
}) {
  return (
    <div className={`rounded-2xl border p-4 ${tone === 'critical' ? 'border-rose-400/25 bg-rose-400/10' : 'border-white/10 bg-[#0B1D30]'}`}>
      <p className="text-xs uppercase tracking-[0.16em] text-white/35">{label}</p>
      <p className={`mt-2 text-xl font-light ${tone === 'critical' ? 'text-rose-100' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function OperationCard({
  site,
}: {
  site: Awaited<ReturnType<typeof getAccessiblePortalSites>>[number]
}) {
  const openIncidents = site.incidents.filter(isOpenPortalIncident)
  const gatewayRisk = site.gatewayHealth.offline + site.gatewayHealth.degraded

  return (
    <Link
      href={`/app/properties/${site.propertyId}`}
      className="group block overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.14),transparent_34%),rgba(255,255,255,0.045)] transition hover:-translate-y-0.5 hover:border-[#4DA3D9]/30 hover:bg-white/[0.065]"
    >
      <div className="relative h-48 overflow-hidden border-b border-white/10 bg-[#071524]">
        <img
          src={site.imageUrl}
          alt={site.imageAlt}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,36,0.08),rgba(7,21,36,0.72)),linear-gradient(90deg,rgba(7,21,36,0.42),transparent_60%)]" />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <Badge className={getStatusTone(site.status)}>{site.statusLabel}</Badge>
          {site.imageIsRepresentative ? (
            <span className="rounded-full border border-white/15 bg-[#071524]/75 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/65">
              Imagen referencial
            </span>
          ) : null}
        </div>
        <span
          className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-[#071524]/80 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-white/55 transition hover:text-white"
        >
          {site.imageCredit}
        </span>
      </div>

      <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
            <Building2 className="h-5 w-5" strokeWidth={1.7} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/38">Empresa</p>
            <h3 className="mt-1 text-xl font-light text-white">{site.organizationName}</h3>
            <p className="mt-2 text-sm leading-6 text-white/55">{site.profile.summary}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label={site.profile.metricLabels.camera} value={site.cameraCount} />
        <Metric label={site.profile.metricLabels.sensor} value={site.sensorCount} />
        <Metric label={site.profile.metricLabels.alert} value={site.alertCount} />
        <Metric label="Eventos hoy" value={site.report.eventsToday} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0B1D30] px-4 py-3">
        <p className="text-sm text-white/60">
          {openIncidents.length > 0
            ? `${openIncidents.length} incidente${openIncidents.length === 1 ? '' : 's'} en seguimiento`
            : gatewayRisk > 0
              ? 'Conexion con atencion operativa'
              : 'Operacion visible y conectada'}
        </p>
        <span className="inline-flex items-center gap-2 text-sm text-[#9DD2F2]">
          Abrir operacion
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
      </div>
    </Link>
  )
}

function CameraTile({
  deviceId,
  title,
  location,
  siteLabel,
  status,
  updatedAt,
  index,
}: {
  deviceId: string
  title: string
  location: string
  siteLabel: string
  status: string
  updatedAt?: Date
  index: number
}) {
  return (
    <div className={`relative min-h-[252px] overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br ${getCameraFrameTint(index)}`}>
      <CameraSnapshot deviceId={deviceId} alt={title} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_26%,rgba(255,255,255,0.18),transparent_22%),linear-gradient(180deg,transparent,rgba(2,6,23,0.72))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:22px_22px] opacity-25" />
      <div className="absolute left-[22%] top-[34%] h-16 w-24 rounded-2xl border border-cyan-300/70 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(125,211,252,0.2),0_0_24px_rgba(56,189,248,0.25)]" />
      <div className="absolute left-[40%] top-[48%] h-10 w-14 rounded-full border border-rose-300/70 bg-rose-300/10 shadow-[0_0_24px_rgba(251,113,133,0.25)]" />
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
        REC
      </div>
      <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[11px] text-white/70">
        <span>Zoom x2.4</span>
        <span className="h-1 w-1 rounded-full bg-white/35" />
        <span>{status === 'falla' ? 'Alerta' : status === 'mantencion' ? 'Revision' : 'OK'}</span>
      </div>
      <div className="absolute left-3 bottom-[74px] rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/70">
        {getCameraLabel(title)}
      </div>
      <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-xs text-white/60">{location}</p>
          </div>
          <Badge className={getAlertTone(status)}>
            {status === 'falla' ? 'Deteccion' : status === 'mantencion' ? 'Revision' : 'Perimetro estable'}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/55">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">{siteLabel}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">{formatDate(updatedAt)}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">HD 1080p</span>
        </div>
        <CameraStreamControl deviceId={deviceId} />
      </div>
    </div>
  )
}

export default async function ClientAppPage() {
  const session = await getCurrentAuthSession()
  if (!session || session.user.role !== 'client') {
    redirect('/login?next=/app')
  }

  const sites = await getAccessiblePortalSites(session.user)
  const totals = getPortalDashboardTotals(sites)
  const report = getPortalPortfolioReport(sites)
  const alerts = getPortalAlertDevices(sites)
  const activity = getPortalActivityFeed(sites)
  const primarySite = sites[0]
  const openIncidents = sites
    .flatMap((site) => site.incidents.filter(isOpenPortalIncident).map((incident) => ({ site, incident })))
    .sort((left, right) => right.incident.createdAt.getTime() - left.incident.createdAt.getTime())
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
  const primaryCamera = sites
    .flatMap((site) => site.devices.map((device) => ({ site, device })))
    .filter(({ device }) => device.tipo === 'camara_ip' || device.tipo === 'camara_analogica')
    .slice(0, 2)

  const spaces = sites
    .flatMap((site) =>
      site.spaces.map((space) => ({
        label: space.name,
        location: site.label,
        status: space.alertCount > 0 ? 'Revision' : 'Operativo',
        cameraCount: space.cameraCount,
        sensorCount: space.sensorCount,
        alertCount: space.alertCount,
        updatedAt: space.lastUpdatedAt || site.lastUpdatedAt,
      }))
    )
    .sort((left, right) => {
      const leftAt = left.updatedAt?.getTime() || 0
      const rightAt = right.updatedAt?.getTime() || 0
      return rightAt - leftAt
    })
    .slice(0, 4)

  const headline =
    alerts.length > 0
      ? 'Hay alertas activas en zonas puntuales.'
      : 'El sitio esta estable y listo para seguimiento.'
  const nextAction = alerts.length > 0
    ? 'Revisar los avisos activos y confirmar recepcion si corresponde.'
    : activity.length > 0
      ? 'Mantener monitoreo normal y revisar la ultima actividad.'
      : 'Esperar la primera sincronizacion del sitio.'
  const updatedLabel = `Actualizado ${formatDate(primarySite?.lastUpdatedAt)}`
  const continuityHasRisk = totals.offlineGateways > 0 || sensorRisk.critical > 0 || openIncidents.length > 0
  const primaryProfile = primarySite?.profile || {
    eyebrow: 'Portal de cliente',
    headline: 'Tu seguridad, clara y lista para decidir.',
    summary: 'Una sola pantalla para revisar camaras, espacios vigilados y alertas que necesitan atencion.',
    focusAreas: ['Cobertura', 'Continuidad', 'Respuesta'],
    metricLabels: { camera: 'Camaras', sensor: 'Sensores', alert: 'Alertas', access: 'Accesos' },
    recommendedStableAction: 'Mantener supervision normal.',
    recommendedAttentionAction: 'Revisar los avisos activos y confirmar recepcion si corresponde.',
  }
  const profileCards = [
    {
      label: primaryProfile.focusAreas[0] || 'Cobertura',
      value: 'Vista centralizada',
      description: primaryProfile.summary,
    },
    {
      label: primaryProfile.focusAreas[1] || 'Continuidad',
      value: 'Supervision activa',
      description: continuityHasRisk ? primaryProfile.recommendedAttentionAction : primaryProfile.recommendedStableAction,
    },
    {
      label: primaryProfile.focusAreas[2] || 'Respuesta',
      value: 'Alertas con contexto',
      description: 'Cada aviso indica donde ocurrio y que conviene revisar primero.',
    },
  ]

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(77,163,217,0.22),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.26)] lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,transparent_35%,rgba(255,255,255,0.02)_100%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="w-fit border-[#4DA3D9]/30 bg-[#4DA3D9]/15 text-[#9DD2F2] hover:bg-[#4DA3D9]/15">
                {primaryProfile.eyebrow}
              </Badge>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55">
                {primarySite ? `${totals.organizations} empresas` : 'Cliente'}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55">
                {updatedLabel}
              </span>
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="max-w-2xl text-balance text-4xl font-light leading-tight text-white md:text-5xl">
                {primaryProfile.headline}
              </h1>
              <p className="text-base leading-7 text-white/68 md:text-lg">
                {primaryProfile.summary}
              </p>
            </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="rounded-full bg-[#4DA3D9] text-white hover:bg-[#4DA3D9]/90">
              <Link href={primarySite ? `/app/properties/${primarySite.propertyId}` : '/contacto'}>
                Ver sitio principal
                <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                <Link href="/contacto">Pedir ayuda</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Empresas" value={totals.organizations} />
              <Metric label={primaryProfile.metricLabels.camera} value={totals.cameras} />
              <Metric label={primaryProfile.metricLabels.alert} value={totals.alerts} />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {profileCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">{card.label}</p>
                  <p className="mt-2 text-base font-light text-white">{card.value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{card.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {primaryCamera.length === 0 ? (
                <div className="sm:col-span-2 rounded-[24px] border border-white/10 bg-white/5 p-8 text-sm text-white/55">
                  Todavia no hay camaras cargadas.
                </div>
              ) : (
                primaryCamera.map(({ site, device }, index) => (
                  <CameraTile
                    key={`${site.propertyId}-${device.id}`}
                    deviceId={device.id}
                    title={device.displayName || 'Camara'}
                    location={device.ubicacionDescripcion || site.location}
                    siteLabel={site.label}
                    status={device.estado}
                    updatedAt={device.lastSeenAt || device.fechaActualizacion}
                    index={index}
                  />
                ))
              )}
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-[#9DD2F2]" />
                <p className="text-sm uppercase tracking-[0.2em] text-white/45">Espacios vigilados</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {spaces.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">
                    Todavia no hay espacios asociados a esta cuenta.
                  </p>
                ) : (
                  spaces.map((space) => (
                    <div key={space.label} className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-white">{space.label}</p>
                          <p className="mt-1 text-xs text-white/55">{space.location}</p>
                        </div>
                        <Badge className={getStatusTone(space.status.toLowerCase())}>{space.status}</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/60">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Camaras {space.cameraCount}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Sensores {space.sensorCount}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Alertas {space.alertCount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#4DA3D9]/20 bg-[#0B1D30] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#9DD2F2]">Lectura del portal</p>
              <h2 className="mt-2 text-xl font-light text-white">Una sola experiencia para el cliente</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                El cliente ve una vista clara y no necesita entender la complejidad tecnica. Si existe una excepcion, la
                resolvemos como tal en el panel interno.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Tus operaciones</p>
            <h2 className="mt-2 text-2xl font-light text-white">Empresas protegidas por SegurIA</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Cada empresa conserva su propio contexto, estado e historial. El cliente ve una lectura clara sin mezclar operaciones.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-white/5 text-white/55">
            {totals.organizations} empresas / {totals.sites} sitios
          </Badge>
        </div>

        {sites.length === 0 ? (
          <Card className="border-white/10 bg-white/5 shadow-none">
            <CardContent className="py-12 text-center text-white/60">Todavia no hay empresas asociadas a esta cuenta.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sites.map((site) => (
              <OperationCard key={site.propertyId} site={site} />
            ))}
          </div>
        )}
      </section>

      <ClientNotificationCenter />

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.14),transparent_28%),rgba(255,255,255,0.04)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Reporte operativo</p>
            <h2 className="mt-2 text-2xl font-light text-white">Resumen de seguridad para decidir rapido</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Lectura diaria y mensual consolidada para saber si hubo senales relevantes, incidentes activos y tiempos
              de respuesta en una operacion {primarySite?.profile.key === 'hotel' ? 'hotelera' : primarySite?.profile.key === 'dairy_field' ? 'lechera' : 'de seguridad'}.
            </p>
          </div>
          <Badge className={report.overdueConfirmations > 0 ? 'border-rose-400/25 bg-rose-400/10 text-rose-100' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'}>
            {report.overdueConfirmations > 0 ? 'Hay SLA vencidos' : 'SLA al dia'}
          </Badge>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <ReportMetric label="Eventos hoy" value={report.eventsToday.toString()} />
          <ReportMetric label="Criticos hoy" value={report.criticalEventsToday.toString()} tone={report.criticalEventsToday > 0 ? 'critical' : 'default'} />
          <ReportMetric label="Incidentes mes" value={report.incidentsThisMonth.toString()} />
          <ReportMetric label="Resueltos mes" value={report.resolvedThisMonth.toString()} />
          <ReportMetric label="Confirmacion" value={formatDuration(report.averageConfirmationMinutes, 'min')} />
          <ReportMetric label="Resolucion" value={formatDuration(report.averageResolutionHours, 'h')} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.8} />
              <CardTitle className="text-lg font-normal text-white">Estado operativo</CardTitle>
            </div>
            <CardDescription className="text-white/55">Lectura simple del sitio, sensores e incidentes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className={`rounded-2xl border p-5 ${getContinuityTone(continuityHasRisk)}`}>
              <p className="text-xs uppercase tracking-[0.18em] opacity-70">Continuidad</p>
              <p className="mt-2 text-2xl font-light">{continuityHasRisk ? 'Revisar' : 'Estable'}</p>
              <p className="mt-2 text-sm leading-6 opacity-75">
                {totals.onlineGateways} conexiones activas y {totals.offlineGateways} con atencion.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0B1D30] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Sensores</p>
              <p className="mt-2 text-2xl font-light text-white">{sensorRisk.stable + sensorRisk.attention + sensorRisk.critical}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-100">{sensorRisk.stable} estables</span>
                <span className="rounded-full bg-amber-400/10 px-3 py-1 text-amber-100">{sensorRisk.attention} revisar</span>
                <span className="rounded-full bg-rose-400/10 px-3 py-1 text-rose-100">{sensorRisk.critical} criticos</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0B1D30] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Incidentes abiertos</p>
              <p className="mt-2 text-2xl font-light text-white">{openIncidents.length}</p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {openIncidents.length > 0 ? 'Hay situaciones con seguimiento activo.' : 'Sin incidentes activos para el cliente.'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0B1D30] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">Proxima accion</p>
              <p className="mt-2 text-lg font-light text-white">
                {openIncidents.length > 0 ? 'Abrir incidente principal' : alerts.length > 0 ? 'Revisar alertas' : 'Mantener supervision'}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {continuityHasRisk ? primaryProfile.recommendedAttentionAction : nextAction}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.8} />
              <CardTitle className="text-lg font-normal text-white">Incidentes en seguimiento</CardTitle>
            </div>
            <CardDescription className="text-white/55">Situaciones agrupadas por sitio y prioridad.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {openIncidents.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">
                No hay incidentes abiertos. El portal queda atento a nuevas senales.
              </p>
            ) : (
              openIncidents.slice(0, 4).map(({ site, incident }) => (
                <Link
                  key={incident.id}
                  href={`/app/properties/${site.propertyId}`}
                  className="block rounded-2xl border border-white/10 bg-[#0B1D30] p-4 transition hover:bg-white/8"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">{incident.title}</p>
                      <p className="mt-1 text-xs text-white/45">{site.label} - {formatDate(incident.createdAt)}</p>
                    </div>
                    <Badge className={incident.severity === 'critical' ? 'border-rose-400/25 bg-rose-400/10 text-rose-100' : 'border-amber-400/25 bg-amber-400/10 text-amber-100'}>
                      {incident.statusLabel}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.8} />
              <CardTitle className="text-lg font-normal text-white">Actividad reciente</CardTitle>
            </div>
            <CardDescription className="text-white/55">Ultimos eventos, equipos y evidencias sincronizadas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/55">
                Todavia no hay actividad publicada para esta cuenta.
              </p>
            ) : (
              activity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
                    {item.kind === 'event' ? (
                      <ShieldAlert className="h-4 w-4" strokeWidth={1.8} />
                    ) : item.kind === 'document' ? (
                      <FileText className="h-4 w-4" strokeWidth={1.8} />
                    ) : (
                      <Wifi className="h-4 w-4" strokeWidth={1.8} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm text-white">{item.title}</p>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-white/55">
                        {item.kind === 'event' ? 'Evento' : item.kind === 'document' ? 'Evidencia' : 'Equipo'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-white/55">{item.detail}</p>
                  </div>
                  <p className="whitespace-nowrap text-xs text-white/35">{formatDate(item.at)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-normal text-white">Lo importante hoy</CardTitle>
                <CardDescription className="mt-1 text-white/55">{headline}</CardDescription>
              </div>
              <Badge className={primarySite ? getStatusTone(primarySite.status) : 'border-white/10 bg-white/5 text-white/60'}>
                {primarySite?.statusLabel || 'Sin datos'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoLine label="Sitio principal" value={primarySite?.label || 'Sin sitio asignado'} />
            <InfoLine label="Ubicacion" value={primarySite?.location || 'Ubicacion por definir'} />
            <InfoLine label="Ultima lectura" value={formatDate(primarySite?.lastUpdatedAt)} />
            <InfoLine label="Proxima accion" value={nextAction} />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                alerts.length > 0 ? 'Confirmar avisos pendientes.' : 'No hay avisos criticos.',
                primarySite ? 'Abrir el sitio para ver equipos.' : 'Asignar un sitio a la cuenta.',
                totals.documents > 0 ? 'Hay evidencia disponible.' : 'Aun no hay evidencia publicada.',
                totals.devices > 0 ? 'Inventario operativo visible.' : 'Inventario pendiente de carga.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" strokeWidth={1.8} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CircleAlert className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.8} />
              <CardTitle className="text-lg font-normal text-white">Alertas de hoy</CardTitle>
            </div>
            <CardDescription className="text-white/55">Solo los elementos que necesitan atencion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/55">Nada pendiente por ahora.</p>
            ) : (
              alerts.slice(0, 3).map(({ site, device }) => (
                <div key={`${site.propertyId}-${device.id}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">{device.displayName || 'Equipo'}</p>
                      <p className="mt-1 text-sm text-white/60">
                        {site.label} - {device.ubicacionDescripcion || site.location}
                      </p>
                    </div>
                    <Badge className={getAlertTone(device.estado)}>{device.estado}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section id="sitios" className="space-y-4 scroll-mt-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/40">Sitios</p>
            <h2 className="mt-2 text-2xl font-normal text-white">Detalle por sitio</h2>
          </div>
          <p className="text-sm text-white/45">Resumen simple por sitio.</p>
        </div>

        {sites.length === 0 ? (
          <Card className="border-white/10 bg-white/5 shadow-none">
            <CardContent className="py-12 text-center text-white/60">Todavia no hay sitios asociados a esta cuenta.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sites.map((site) => (
              <Card key={site.propertyId} className="border-white/10 bg-white/5 shadow-none">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl font-normal text-white">{site.label}</CardTitle>
                      <CardDescription className="mt-2 text-white/55">{site.organizationName} - {site.location}</CardDescription>
                    </div>
                    <Badge className={getStatusTone(site.status)}>{site.statusLabel}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Metric label="Equipos" value={site.deviceCount} />
                    <Metric label="Camaras" value={site.cameraCount} />
                    <Metric label="Sensores" value={site.sensorCount} />
                    <Metric label="Alertas" value={site.alertCount} />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1D30] px-4 py-3 text-sm">
                    <div className="text-white/55">
                      <p>Documentos</p>
                      <p className="mt-1 text-white">{site.documentCount} disponibles</p>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/10">
                      <Link href={`/app/properties/${site.propertyId}`}>Abrir</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

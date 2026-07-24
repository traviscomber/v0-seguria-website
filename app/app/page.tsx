// @ts-nocheck
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
  getPortalActionRegister,
  getPortalAlertDevices,
  getPortalBoardReport,
  getPortalCoverageZones,
  getPortalDailyPriorities,
  getPortalDashboardTotals,
  getPortalDecisionRoom,
  getPortalDecisionPackets,
  getPortalExecutiveBrief,
  getPortalGovernanceRituals,
  getPortalImprovementActions,
  getPortalLeadershipBrief,
  getPortalMeetingPack,
  getPortalMaturityScorecard,
  getPortalOperationalScore,
  getPortalOperationalFlow,
  getPortalOperationalForecast,
  getPortalPortfolioReport,
  getPortalRiskMap,
  getPortalResponsePlaybook,
  getPortalSensorRisk,
  getPortalServiceCommitments,
  getPortalShiftHandoff,
  getPortalSensitiveWindows,
  getPortalSiteHealthRanking,
  getPortalTraceabilityLedger,
  getPortalTrustCenter,
  getPortalWeeklyDecisionAgenda,
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

function getScoreTone(tone: 'ok' | 'warning' | 'critical') {
  if (tone === 'critical') return 'border-rose-400/25 bg-rose-400/10 text-rose-100'
  if (tone === 'warning') return 'border-amber-400/25 bg-amber-400/10 text-amber-100'
  return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
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

  // For now, show a welcome page if no sites data available
  let sites: any[] = []
  try {
    sites = await getAccessiblePortalSites(session.user)
  } catch (error) {
    console.log('[v0] Could not fetch portal sites, showing welcome page')
  }

  const totals = getPortalDashboardTotals(sites)
  const report = getPortalPortfolioReport(sites)
  const operationalScore = getPortalOperationalScore(sites)
  const operationalForecast = getPortalOperationalForecast(sites)
  const meetingPack = getPortalMeetingPack(sites)
  const maturityScorecard = getPortalMaturityScorecard(sites)
  const operationalFlow = getPortalOperationalFlow(sites)
  const boardReport = getPortalBoardReport(sites)
  const governanceRituals = getPortalGovernanceRituals(sites)
  const actionRegister = getPortalActionRegister(sites)
  const traceabilityLedger = getPortalTraceabilityLedger(sites)
  const weeklyDecisionAgenda = getPortalWeeklyDecisionAgenda(sites)
  const riskMap = getPortalRiskMap(sites)
  const dailyPriorities = getPortalDailyPriorities(sites)
  const coverageZones = sites.flatMap((site) => getPortalCoverageZones(site)).slice(0, 6)
  const serviceCommitments = getPortalServiceCommitments(sites)
  const executiveBrief = getPortalExecutiveBrief(sites)
  const leadershipBrief = getPortalLeadershipBrief(sites)
  const trustCenter = getPortalTrustCenter(sites)
  const decisionRoom = getPortalDecisionRoom(sites)
  const shiftHandoff = getPortalShiftHandoff(sites)
  const sensitiveWindows = getPortalSensitiveWindows(sites)
  const improvementActions = getPortalImprovementActions(sites)
  const decisionPackets = getPortalDecisionPackets(sites)
  const responsePlaybook = getPortalResponsePlaybook(sites)
  const siteHealthRanking = getPortalSiteHealthRanking(sites)
  const alerts = getPortalAlertDevices(sites)
  const activity = getPortalActivityFeed(sites)
  const primarySite = sites[0]
  const openIncidents = sites
    .flatMap((site) => site.incidents.filter(isOpenPortalIncident).map((incident: any) => ({ site, incident })))
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
  const portalIndex = [
    {
      href: '#decisiones',
      label: 'Decisiones',
      value: decisionRoom.title,
      detail: decisionRoom.headline,
      tone: decisionRoom.tone,
    },
    {
      href: '#sitios',
      label: 'Sitios',
      value: `${totals.sites} operaciones`,
      detail: 'Empresas, estado, actividad y acceso a cada sitio.',
      tone: continuityHasRisk ? 'warning' : 'ok',
    },
    {
      href: '#evidencia',
      label: 'Evidencia',
      value: `${traceabilityLedger.length} registros`,
      detail: 'Historia, prueba y decision vinculada.',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
    {
      href: '#camaras',
      label: 'Camaras',
      value: `${totals.cameras} vistas`,
      detail: 'Vistas recientes y zonas monitoreadas.',
      tone: alerts.length > 0 ? 'warning' : 'ok',
    },
    {
      href: '#acciones',
      label: 'Acciones',
      value: `${actionRegister.length} pendientes`,
      detail: actionRegister[0]?.nextStep || nextAction,
      tone: actionRegister[0]?.tone || operationalScore.tone,
    },
    {
      href: '#actividad',
      label: 'Actividad',
      value: `${activity.length} cambios`,
      detail: 'Ultimos eventos, documentos y equipos actualizados.',
      tone: activity.some((item) => item.status === 'critical' || item.status === 'falla') ? 'critical' : 'ok',
    },
  ] as const
  const professionalReadiness = [
    {
      label: 'Vista integral',
      value: `${totals.devices} equipos`,
      reading: 'Camaras, sensores, accesos, eventos e incidentes se leen como una sola operacion.',
      proof: `${totals.sites} sitios y ${totals.organizations} empresas en el mismo tablero.`,
      href: '#sitios',
      tone: continuityHasRisk ? 'warning' : 'ok',
    },
    {
      label: 'Inteligencia util',
      value: `${alerts.length} avisos`,
      reading: alerts.length > 0
        ? 'Las senales con atencion aparecen antes que el ruido operativo.'
        : 'La operacion conserva una lectura tranquila, con cambios visibles cuando corresponde.',
      proof: `${dailyPriorities.length} prioridades diarias ordenadas por impacto.`,
      href: '#acciones',
      tone: alerts.length > 0 ? 'warning' : 'ok',
    },
    {
      label: 'Evidencia y cierre',
      value: `${traceabilityLedger.length} pruebas`,
      reading: 'Cada decision importante debe quedar vinculada a historia, responsable y resultado.',
      proof: `${actionRegister.length} acciones abiertas con criterio de exito.`,
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || actionRegister[0]?.tone || 'ok',
    },
    {
      label: 'Continuidad',
      value: `${operationalScore.score}/100`,
      reading: 'La seguridad profesional no depende de mirar pantallas: depende de saber que cambio y que hacer.',
      proof: operationalScore.summary,
      href: '#decisiones',
      tone: operationalScore.tone,
    },
  ] as const
  const clientWorkPath = [
    {
      label: 'Abrir el dia',
      value: `${dailyPriorities.length} prioridades`,
      title: dailyPriorities[0]?.title || headline,
      detail: dailyPriorities[0]?.detail || 'Revisar estado general, cambios recientes y espacios con atencion antes de iniciar la jornada.',
      action: dailyPriorities[0]?.action || nextAction,
      proof: `${activity.length} cambios recientes y ${spaces.length} espacios visibles para partir con contexto.`,
      href: '#actividad',
      tone: dailyPriorities[0]?.tone || operationalScore.tone,
    },
    {
      label: 'Resolver lo urgente',
      value: `${actionRegister.length} acciones`,
      title: actionRegister[0]?.title || 'Mantener la operacion bajo control',
      detail: actionRegister[0]?.why || decisionRoom.reason,
      action: actionRegister[0]?.nextStep || nextAction,
      proof: `${openIncidents.length} incidentes abiertos y ${alerts.length} avisos activos en seguimiento.`,
      href: '#acciones',
      tone: actionRegister[0]?.tone || decisionRoom.tone,
    },
    {
      label: 'Preparar la reunion',
      value: meetingPack.title,
      title: meetingPack.decision,
      detail: meetingPack.opening,
      action: meetingPack.close,
      proof: meetingPack.evidence,
      href: '#decisiones',
      tone: meetingPack.tone,
    },
    {
      label: 'Cerrar aprendizaje',
      value: `${traceabilityLedger.length} registros`,
      title: boardReport.decision,
      detail: boardReport.outcome,
      action: traceabilityLedger[0]?.decisionLink || boardReport.risk,
      proof: `${boardReport.proofPoints.length} puntos de prueba y ${improvementActions.length} mejoras priorizadas.`,
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || boardReport.tone,
    },
  ] as const
  const visibleAssurance = [
    {
      label: 'Acceso claro',
      value: `${totals.organizations} empresas`,
      detail: 'Cada usuario ve solo la operacion que corresponde a su cuenta y sus sitios.',
      proof: trustCenter[0]?.customerMeaning || 'Roles, sitios y acciones se presentan con contexto de cliente.',
      href: '#confianza',
      tone: trustCenter[0]?.tone || 'ok',
    },
    {
      label: 'Evidencia lista',
      value: `${traceabilityLedger.length} registros`,
      detail: 'Las senales relevantes quedan vinculadas a prueba, decision y cierre.',
      proof: trustCenter[1]?.proof || 'La historia operativa queda preparada para explicar que paso y que se decidio.',
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || trustCenter[1]?.tone || 'ok',
    },
    {
      label: 'Tiempos visibles',
      value: formatDuration(report.averageConfirmationMinutes, 'min'),
      detail: 'Confirmacion, pendientes y excepciones se vuelven medibles para administrar mejor.',
      proof: report.overdueConfirmations > 0 ? `${report.overdueConfirmations} confirmaciones requieren atencion.` : 'Sin confirmaciones vencidas en la lectura actual.',
      href: '#acciones',
      tone: report.overdueConfirmations > 0 ? 'warning' : 'ok',
    },
    {
      label: 'Responsables',
      value: `${governanceRituals.length} rutinas`,
      detail: 'La operacion muestra quien mira, que pregunta responde y que salida debe quedar.',
      proof: trustCenter[2]?.promise || 'Responsables, criterios de cierre y reuniones quedan visibles para el cliente.',
      href: '#decisiones',
      tone: governanceRituals.some((ritual) => ritual.tone === 'critical') ? 'critical' : governanceRituals.some((ritual) => ritual.tone === 'warning') ? 'warning' : 'ok',
    },
  ] as const
  const serviceGaps = serviceCommitments.filter((commitment) => commitment.tone !== 'ok')
  const servicePassport = [
    {
      label: 'Alcance visible',
      value: `${totals.organizations} empresas / ${totals.sites} sitios`,
      detail: 'El cliente ve que operacion esta incluida, donde mirar y que espacios quedan bajo seguimiento.',
      proof: visibleAssurance[0]?.proof || `${totals.devices} equipos visibles en el portal.`,
      action: 'Revisar cobertura por sitio',
      href: '#sitios',
      tone: continuityHasRisk ? 'warning' : 'ok',
    },
    {
      label: 'Compromisos medibles',
      value: serviceGaps.length > 0 ? `${serviceGaps.length} por cerrar` : 'sin brechas visibles',
      detail: serviceCommitments[0]?.summary || 'Confirmacion, cierre y continuidad quedan medidos para administrar el servicio.',
      proof: serviceCommitments[0]?.target || 'Respuesta, evidencia y cierre se revisan con criterio comun.',
      action: serviceCommitments[0]?.action || 'Mantener compromisos visibles en cada revision.',
      href: '#acciones',
      tone: serviceCommitments[0]?.tone || 'ok',
    },
    {
      label: 'Evidencia defendible',
      value: `${traceabilityLedger.length} registros`,
      detail: traceabilityLedger[0]?.evidence || 'La historia operativa queda disponible para explicar eventos y decisiones.',
      proof: traceabilityLedger[0]?.decisionLink || 'Cada cierre importante debe quedar conectado con una prueba clara.',
      action: 'Abrir evidencia',
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
    {
      label: 'Proximo cierre',
      value: actionRegister[0]?.title || meetingPack.close,
      detail: actionRegister[0]?.why || meetingPack.commitment,
      proof: actionRegister[0]?.successCriteria || boardReport.proofPoints[0] || meetingPack.evidence,
      action: actionRegister[0]?.nextStep || meetingPack.close,
      href: '#decisiones',
      tone: actionRegister[0]?.tone || meetingPack.tone,
    },
  ] as const
  const servicePromise = [
    {
      label: 'Que cuidamos',
      value: `${totals.sites} sitios`,
      statement: 'La cobertura queda expresada en sitios, espacios y equipos visibles para que el cliente sepa que parte de la operacion esta incluida.',
      proof: `${spaces.length} espacios y ${totals.devices} equipos aparecen ordenados en el portal.`,
      decision: 'Revisar cobertura antes de pedir nuevos puntos de control.',
      href: '#sitios',
      tone: continuityHasRisk ? 'warning' : 'ok',
    },
    {
      label: 'Como respondemos',
      value: formatDuration(report.averageConfirmationMinutes, 'min'),
      statement: 'La respuesta no se promete de memoria: se lee por confirmaciones, pendientes y excepciones que requieren seguimiento.',
      proof: report.overdueConfirmations > 0 ? `${report.overdueConfirmations} confirmaciones requieren atencion.` : 'Sin confirmaciones vencidas en la lectura actual.',
      decision: actionRegister[0]?.nextStep || nextAction,
      href: '#acciones',
      tone: report.overdueConfirmations > 0 ? 'warning' : actionRegister[0]?.tone || 'ok',
    },
    {
      label: 'Que prueba queda',
      value: `${traceabilityLedger.length} registros`,
      statement: 'Cada evento importante debe poder explicarse con contexto, evidencia y salida esperada, sin reconstruir la historia despues.',
      proof: traceabilityLedger[0]?.evidence || traceabilityLedger[0]?.decisionLink || 'La evidencia queda disponible para revisar.',
      decision: traceabilityLedger[0]?.decisionLink || 'Conservar prueba y criterio antes de cerrar.',
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
    {
      label: 'Que mejora sigue',
      value: `${improvementActions.length} mejoras`,
      statement: 'El servicio se vuelve mas profesional cuando cada semana deja una mejora priorizada, medible y entendible para el cliente.',
      proof: improvementActions[0]?.expectedImpact || maturityScorecard[0]?.reading || 'La mejora queda ligada a continuidad, respuesta o cobertura.',
      decision: improvementActions[0]?.nextStep || maturityScorecard[0]?.nextStep || meetingPack.close,
      href: '#decisiones',
      tone: improvementActions[0]?.tone || maturityScorecard[0]?.tone || 'ok',
    },
  ] as const
  const businessValue = [
    {
      label: 'Menos incertidumbre',
      value: alerts.length > 0 ? `${alerts.length} avisos con contexto` : 'operacion tranquila',
      detail: alerts.length > 0
        ? 'Los avisos importantes llegan ordenados por impacto, sitio y siguiente paso.'
        : 'Cuando no hay excepciones, el cliente tambien lo sabe: la tranquilidad queda visible.',
      proof: `${dailyPriorities.length} prioridades listas para partir el dia.`,
      href: '#acciones',
      tone: alerts.length > 0 ? 'warning' : 'ok',
    },
    {
      label: 'Mejor respuesta',
      value: formatDuration(report.averageConfirmationMinutes, 'min'),
      detail: 'El portal convierte cambios dispersos en una lectura accionable para el equipo de turno.',
      proof: report.overdueConfirmations > 0 ? `${report.overdueConfirmations} confirmaciones requieren seguimiento.` : 'Sin confirmaciones vencidas en esta lectura.',
      href: '#actividad',
      tone: report.overdueConfirmations > 0 ? 'warning' : 'ok',
    },
    {
      label: 'Control administrativo',
      value: `${actionRegister.length} acciones`,
      detail: 'Cada pendiente queda con responsable, criterio de exito y salida esperada para no depender de memoria.',
      proof: actionRegister[0]?.successCriteria || 'Las decisiones quedan listas para revisar y cerrar.',
      href: '#decisiones',
      tone: actionRegister[0]?.tone || operationalScore.tone,
    },
    {
      label: 'Confianza demostrable',
      value: `${traceabilityLedger.length} registros`,
      detail: 'La evidencia no queda perdida entre equipos: se transforma en historia, decision y aprendizaje.',
      proof: traceabilityLedger[0]?.decisionLink || 'La operacion conserva prueba suficiente para explicar que paso.',
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
  ] as const
  const clientValueProof = [
    {
      label: 'Control ganado',
      value: `${totals.sites} sitios visibles`,
      benefit: 'El cliente sabe donde esta cada operacion, que esta estable y que requiere mirada.',
      proof: `${totals.devices} equipos y ${spaces.length} espacios ordenados en una lectura comun.`,
      next: continuityHasRisk ? 'Cerrar puntos de continuidad antes de ampliar cobertura.' : 'Mantener rutina diaria con evidencia visible.',
      href: '#sitios',
      tone: continuityHasRisk ? 'warning' : 'ok',
    },
    {
      label: 'Respuesta ganada',
      value: formatDuration(report.averageConfirmationMinutes, 'min'),
      benefit: 'La reaccion deja de ser intuicion: se mide por confirmaciones, pendientes y cierres.',
      proof: report.overdueConfirmations > 0 ? `${report.overdueConfirmations} confirmaciones necesitan seguimiento.` : 'Sin confirmaciones vencidas en esta lectura.',
      next: actionRegister[0]?.nextStep || nextAction,
      href: '#acciones',
      tone: report.overdueConfirmations > 0 ? 'warning' : actionRegister[0]?.tone || 'ok',
    },
    {
      label: 'Evidencia ganada',
      value: `${traceabilityLedger.length} registros`,
      benefit: 'Cada decision importante puede explicarse con historia, respaldo y salida esperada.',
      proof: traceabilityLedger[0]?.evidence || traceabilityLedger[0]?.decisionLink || 'La evidencia queda disponible para revisar.',
      next: traceabilityLedger[0]?.decisionLink || 'Mantener trazabilidad en cada cierre operativo.',
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
    {
      label: 'Mejora ganada',
      value: `${improvementActions.length} mejoras`,
      benefit: 'La seguridad evoluciona con prioridades claras, no con listas sueltas de equipos.',
      proof: improvementActions[0]?.expectedImpact || maturityScorecard[0]?.nextStep || 'La mejora queda conectada al resultado operativo.',
      next: improvementActions[0]?.nextStep || actionRegister[0]?.nextStep || 'Priorizar el siguiente avance visible.',
      href: '#decisiones',
      tone: improvementActions[0]?.tone || maturityScorecard[0]?.tone || 'ok',
    },
  ] as const
  const executiveImpact = [
    {
      label: 'Continuidad',
      value: continuityHasRisk ? 'requiere foco' : 'estable',
      effect: continuityHasRisk
        ? 'Hay puntos que pueden obligar al equipo a operar con informacion incompleta.'
        : 'La operacion mantiene visibilidad suficiente para trabajar sin rondas improvisadas.',
      proof: `${totals.onlineGateways} conexiones activas, ${totals.offlineGateways} con revision y ${totals.sites} sitios visibles.`,
      decision: continuityHasRisk ? 'Cerrar continuidad antes de ampliar alcance.' : 'Mantener rutina de revision por sitio.',
      href: '#sitios',
      tone: continuityHasRisk ? 'warning' : 'ok',
    },
    {
      label: 'Atencion',
      value: alerts.length > 0 ? `${alerts.length} avisos` : 'sin ruido critico',
      effect: alerts.length > 0
        ? 'La atencion del equipo se concentra en senales priorizadas, no en revisar todas las pantallas.'
        : 'El cliente puede distinguir tranquilidad real de falta de informacion.',
      proof: `${dailyPriorities.length} prioridades y ${actionRegister.length} acciones preparadas.`,
      decision: alerts.length > 0 ? 'Atender avisos segun prioridad y responsable.' : 'Conservar bitacora limpia y revisable.',
      href: '#acciones',
      tone: alerts.length > 0 ? 'warning' : 'ok',
    },
    {
      label: 'Exposicion',
      value: `${openIncidents.length} abiertos`,
      effect: openIncidents.length > 0
        ? 'Los incidentes abiertos todavia pueden impactar continuidad, experiencia o administracion del sitio.'
        : 'No hay incidentes abiertos que arrastren decisiones pendientes en esta lectura.',
      proof: `${report.resolvedThisMonth}/${report.incidentsThisMonth} cierres del mes y ${report.overdueConfirmations} confirmaciones vencidas.`,
      decision: openIncidents.length > 0 ? 'Asignar cierre, prueba y proximo paso visible.' : 'Usar cierres del mes para aprendizaje operativo.',
      href: '#decisiones',
      tone: openIncidents.length > 0 || report.overdueConfirmations > 0 ? 'critical' : 'ok',
    },
    {
      label: 'Confianza',
      value: `${traceabilityLedger.length} pruebas`,
      effect: 'La confianza mejora cuando cada decision puede explicarse con evidencia, contexto y salida esperada.',
      proof: traceabilityLedger[0]?.decisionLink || trustCenter[1]?.proof || 'La historia queda disponible para revisar.',
      decision: traceabilityLedger.length > 0 ? 'Usar evidencia en la proxima revision ejecutiva.' : 'Completar evidencia antes de cerrar eventos relevantes.',
      href: '#evidencia',
      tone: traceabilityLedger.length > 0 ? 'ok' : 'warning',
    },
  ] as const
  const worldClassCriteria = [
    {
      label: 'Visibilidad unificada',
      value: `${totals.sites} sitios`,
      detail: 'Todo lo importante se lee en una vista: sitios, equipos, eventos, acciones y evidencia.',
      proof: `${totals.devices} equipos conectados a una lectura operativa comun.`,
      href: '#sitios',
      tone: continuityHasRisk ? 'warning' : 'ok',
    },
    {
      label: 'Ruido controlado',
      value: `${dailyPriorities.length} prioridades`,
      detail: 'El portal no obliga a mirar todo: separa rutina, atencion y riesgo para actuar con foco.',
      proof: alerts.length > 0 ? `${alerts.length} avisos activos ordenados por impacto.` : 'Sin avisos activos que rompan la lectura diaria.',
      href: '#acciones',
      tone: alerts.length > 0 ? 'warning' : 'ok',
    },
    {
      label: 'Respuesta medible',
      value: formatDuration(report.averageConfirmationMinutes, 'min'),
      detail: 'Confirmaciones, pendientes y cierres dejan de ser percepcion y pasan a ser gestion visible.',
      proof: `${actionRegister.length} acciones con responsable y criterio de cierre.`,
      href: '#actividad',
      tone: report.overdueConfirmations > 0 ? 'warning' : operationalScore.tone,
    },
    {
      label: 'Auditoria viva',
      value: `${traceabilityLedger.length} registros`,
      detail: 'Cada evento relevante conserva prueba, decision y aprendizaje para explicar la operacion.',
      proof: traceabilityLedger[0]?.decisionLink || 'La evidencia queda lista para revisar sin reconstruir la historia.',
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
  ] as const
  const executiveDecisionSummary = [
    {
      label: 'Veredicto',
      value: executiveBrief.verdict,
      detail: executiveBrief.narrative,
      proof: executiveBrief.highlights[0] || operationalScore.summary,
      tone: executiveBrief.tone,
    },
    {
      label: 'Valor para el cliente',
      value: leadershipBrief.customerOutcome,
      detail: leadershipBrief.businessReading,
      proof: leadershipBrief.pillars[0]?.proof || leadershipBrief.nextConversation,
      tone: leadershipBrief.tone,
    },
    {
      label: 'Decision requerida',
      value: boardReport.decision,
      detail: boardReport.risk,
      proof: boardReport.proofPoints[0] || meetingPack.evidence,
      tone: boardReport.tone,
    },
    {
      label: 'Cierre esperado',
      value: meetingPack.close,
      detail: meetingPack.commitment,
      proof: meetingPack.evidence,
      tone: meetingPack.tone,
    },
  ] as const
  const meetingBrief = [
    {
      label: 'Decision',
      value: meetingPack.decision,
      detail: 'Lo que debe quedar resuelto o escalado al cierre de la reunion.',
      tone: meetingPack.tone,
    },
    {
      label: 'Evidencia',
      value: meetingPack.evidence,
      detail: 'Material que explica la lectura sin recorrer todo el portal.',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
    {
      label: 'Riesgo',
      value: boardReport.risk,
      detail: 'Punto que puede afectar continuidad, respuesta o confianza operativa.',
      tone: boardReport.tone,
    },
    {
      label: 'Cierre',
      value: meetingPack.close,
      detail: meetingPack.commitment,
      tone: actionRegister[0]?.tone || boardReport.tone,
    },
  ] as const
  const executiveMinutes = [
    {
      label: 'Tema',
      value: boardReport.verdict,
      detail: boardReport.outcome,
      proof: boardReport.periodLabel,
      tone: boardReport.tone,
    },
    {
      label: 'Decision',
      value: boardReport.decision,
      detail: boardReport.risk,
      proof: boardReport.proofPoints[0] || meetingPack.evidence,
      tone: boardReport.tone,
    },
    {
      label: 'Indicador',
      value: `${report.resolvedThisMonth}/${report.incidentsThisMonth}`,
      detail: report.incidentsThisMonth > 0 ? 'Cierres del mes frente a incidentes registrados.' : 'Sin incidentes mensuales que requieran cierre.',
      proof: report.overdueConfirmations > 0 ? `${report.overdueConfirmations} confirmaciones vencidas.` : 'Sin vencimientos pendientes.',
      tone: report.overdueConfirmations > 0 ? 'critical' : boardReport.tone,
    },
    {
      label: 'Acuerdo',
      value: meetingPack.close,
      detail: meetingPack.commitment,
      proof: meetingPack.evidence,
      tone: meetingPack.tone,
    },
  ] as const
  const weeklyClientAgenda = [
    {
      label: 'Decision de la semana',
      value: weeklyDecisionAgenda[0]?.decision || meetingPack.decision,
      owner: weeklyDecisionAgenda[0]?.owner || meetingPack.agenda[1]?.owner || 'Administracion',
      deadline: weeklyDecisionAgenda[0]?.deadline || 'Esta semana',
      detail: weeklyDecisionAgenda[0]?.customerValue || meetingPack.opening,
      output: weeklyDecisionAgenda[0]?.expectedOutcome || meetingPack.close,
      tone: weeklyDecisionAgenda[0]?.tone || meetingPack.tone,
      href: '#decisiones',
    },
    {
      label: 'Rutina de control',
      value: governanceRituals[0]?.title || 'Revisar operacion con evidencia',
      owner: governanceRituals[0]?.owner || 'Operacion',
      deadline: governanceRituals[0]?.cadence || 'Diario',
      detail: governanceRituals[0]?.question || 'Que cambio y que queda pendiente?',
      output: governanceRituals[0]?.output || actionRegister[0]?.nextStep || nextAction,
      tone: governanceRituals[0]?.tone || actionRegister[0]?.tone || operationalScore.tone,
      href: '#actividad',
    },
    {
      label: 'Mejora prioritaria',
      value: improvementActions[0]?.title || maturityScorecard[0]?.label || 'Sostener mejora continua',
      owner: improvementActions[0]?.siteLabel || 'Equipo cliente',
      deadline: 'Proximo ciclo',
      detail: improvementActions[0]?.why || maturityScorecard[0]?.reading || 'Reducir ruido y mejorar respuesta.',
      output: improvementActions[0]?.expectedImpact || maturityScorecard[0]?.nextStep || 'Mantener una mejora visible y medible.',
      tone: improvementActions[0]?.tone || maturityScorecard[0]?.tone || 'ok',
      href: '#acciones',
    },
  ] as const
  const executiveCadence = [
    {
      label: 'Diario',
      value: dailyPriorities[0]?.title || 'Abrir con foco',
      owner: actionRegister[0]?.owner || governanceRituals[0]?.owner || 'Operacion',
      evidence: `${dailyPriorities.length} prioridades y ${activity.length} cambios recientes.`,
      output: dailyPriorities[0]?.action || actionRegister[0]?.nextStep || nextAction,
      href: '#actividad',
      tone: dailyPriorities[0]?.tone || actionRegister[0]?.tone || operationalScore.tone,
    },
    {
      label: 'Semanal',
      value: weeklyClientAgenda[0]?.value || meetingPack.decision,
      owner: weeklyClientAgenda[0]?.owner || meetingPack.agenda[1]?.owner || 'Administracion',
      evidence: weeklyClientAgenda[0]?.detail || meetingPack.evidence,
      output: weeklyClientAgenda[0]?.output || meetingPack.close,
      href: '#decisiones',
      tone: weeklyClientAgenda[0]?.tone || meetingPack.tone,
    },
    {
      label: 'Mensual',
      value: `${report.resolvedThisMonth}/${report.incidentsThisMonth} cierres`,
      owner: 'Direccion',
      evidence: boardReport.proofPoints[0] || executiveImpact[2]?.proof || meetingPack.evidence,
      output: boardReport.decision,
      href: '#decisiones',
      tone: boardReport.tone,
    },
    {
      label: 'Cierre',
      value: actionRegister[0]?.title || meetingPack.close,
      owner: actionRegister[0]?.owner || 'Equipo cliente',
      evidence: actionRegister[0]?.successCriteria || traceabilityLedger[0]?.evidence || 'Evidencia pendiente de cierre.',
      output: actionRegister[0]?.nextStep || 'Cerrar con prueba y responsable visible.',
      href: '#acciones',
      tone: actionRegister[0]?.tone || 'ok',
    },
  ] as const
  const maturityAverage = Math.round(
    maturityScorecard.reduce((total, item) => total + item.score, 0) / Math.max(1, maturityScorecard.length)
  )
  const weakCommitments = serviceCommitments.filter((commitment) => commitment.tone !== 'ok')
  const operationalCompletenessTone: 'ok' | 'warning' | 'critical' =
    operationalScore.tone === 'critical' || maturityScorecard.some((item) => item.tone === 'critical')
      ? 'critical'
      : operationalScore.tone === 'warning' || weakCommitments.length > 0 || maturityScorecard.some((item) => item.tone === 'warning')
        ? 'warning'
        : 'ok'
  const operationalCompleteness = [
    {
      label: 'Base instalada',
      value: `${totals.devices} equipos`,
      detail: `${totals.cameras} camaras, ${totals.sensors} sensores y ${totals.sites} sitio${totals.sites === 1 ? '' : 's'} visibles para operar.`,
      tone: totals.devices > 0 ? 'ok' : 'warning',
    },
    {
      label: 'Servicio',
      value: weakCommitments.length > 0 ? `${weakCommitments.length} alertas` : 'en orden',
      detail: weakCommitments[0]?.action || 'Los compromisos principales no muestran brechas visibles en esta lectura.',
      tone: weakCommitments[0]?.tone || 'ok',
    },
    {
      label: 'Madurez',
      value: `${maturityAverage}/100`,
      detail: maturityScorecard[0]?.nextStep || 'La operacion mantiene una lectura de mejora continua.',
      tone: maturityScorecard[0]?.tone || operationalScore.tone,
    },
    {
      label: 'Trazabilidad',
      value: `${traceabilityLedger.length} registros`,
      detail: traceabilityLedger[0]?.decisionLink || 'Eventos, evidencia y decisiones quedan disponibles para revisar.',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
  ] as const
  const clientRoadmap = [
    {
      label: '0-30 dias',
      title: actionRegister[0]?.title || 'Consolidar operacion diaria',
      detail: actionRegister[0]?.nextStep || nextAction,
      outcome: actionRegister[0]?.successCriteria || 'Rutina diaria con responsables, prioridad y evidencia visible.',
      owner: actionRegister[0]?.owner || 'Operacion',
      tone: actionRegister[0]?.tone || operationalScore.tone,
    },
    {
      label: '31-60 dias',
      title: improvementActions[0]?.title || 'Reducir ruido y reforzar cobertura',
      detail: improvementActions[0]?.nextStep || maturityScorecard[0]?.nextStep || 'Revisar zonas, reglas y criterios de cierre.',
      outcome: improvementActions[0]?.expectedImpact || 'Menos dudas operativas y mejor lectura para administrar.',
      owner: improvementActions[0]?.siteLabel || 'Equipo cliente',
      tone: improvementActions[0]?.tone || maturityScorecard[0]?.tone || 'ok',
    },
    {
      label: '61-90 dias',
      title: weeklyDecisionAgenda[0]?.decision || 'Formalizar gobierno de seguridad',
      detail: weeklyDecisionAgenda[0]?.customerValue || governanceRituals[0]?.question || 'Convertir hallazgos en decisiones recurrentes.',
      outcome: weeklyDecisionAgenda[0]?.expectedOutcome || governanceRituals[0]?.output || 'Comite con evidencia, acuerdos y mejoras medibles.',
      owner: weeklyDecisionAgenda[0]?.owner || governanceRituals[0]?.owner || 'Administracion',
      tone: weeklyDecisionAgenda[0]?.tone || governanceRituals[0]?.tone || 'ok',
    },
  ] as const
  const nextMilestones = [
    {
      label: 'Esta semana',
      title: weeklyClientAgenda[0]?.value || meetingPack.decision,
      owner: weeklyClientAgenda[0]?.owner || meetingPack.agenda[1]?.owner || 'Administracion',
      due: weeklyClientAgenda[0]?.deadline || 'Esta semana',
      expected: weeklyClientAgenda[0]?.output || meetingPack.close,
      risk: weeklyClientAgenda[0]?.detail || meetingPack.opening,
      href: '#decisiones',
      tone: weeklyClientAgenda[0]?.tone || meetingPack.tone,
    },
    {
      label: 'Cierre operativo',
      title: actionRegister[0]?.title || 'Mantener seguimiento normal',
      owner: actionRegister[0]?.owner || 'Operacion',
      due: actionRegister[0]?.due || 'Proximo cierre',
      expected: actionRegister[0]?.successCriteria || actionRegister[0]?.nextStep || nextAction,
      risk: actionRegister[0]?.why || decisionRoom.reason,
      href: '#acciones',
      tone: actionRegister[0]?.tone || operationalScore.tone,
    },
    {
      label: 'Brecha de servicio',
      title: serviceGaps[0]?.label || serviceCommitments[0]?.label || 'Servicio en seguimiento',
      owner: serviceGaps[0]?.siteLabel || serviceCommitments[0]?.siteLabel || 'Equipo cliente',
      due: serviceGaps.length > 0 ? 'Por cerrar' : 'En seguimiento',
      expected: serviceGaps[0]?.action || serviceCommitments[0]?.action || 'Mantener revision visible del servicio.',
      risk: serviceGaps[0]?.summary || serviceCommitments[0]?.summary || 'Sin brechas visibles en esta lectura.',
      href: '#acciones',
      tone: serviceGaps[0]?.tone || serviceCommitments[0]?.tone || 'ok',
    },
    {
      label: 'Proxima reunion',
      title: meetingPack.decision,
      owner: meetingPack.agenda[1]?.owner || weeklyDecisionAgenda[0]?.owner || 'Administracion',
      due: meetingPack.title,
      expected: meetingPack.close,
      risk: meetingPack.evidence,
      href: '#decisiones',
      tone: meetingPack.tone,
    },
  ] as const
  const executiveRiskReading = [
    {
      label: 'Continuidad',
      impact: continuityHasRisk ? 'Puede afectar visibilidad o respuesta' : 'Operacion visible y estable',
      signal: operationalForecast.primaryRisk,
      decision: operationalForecast.bestMove,
      evidence: operationalForecast.summary,
      href: '#decisiones',
      tone: operationalForecast.tone,
    },
    {
      label: 'Servicio',
      impact: serviceGaps.length > 0 ? `${serviceGaps.length} compromiso${serviceGaps.length === 1 ? '' : 's'} requiere${serviceGaps.length === 1 ? '' : 'n'} cierre` : 'Compromisos sin brechas visibles',
      signal: serviceGaps[0]?.current || serviceCommitments[0]?.current || 'Sin brechas visibles',
      decision: serviceGaps[0]?.action || serviceCommitments[0]?.action || 'Mantener revision de respuesta y cierre.',
      evidence: serviceGaps[0]?.summary || serviceCommitments[0]?.summary || 'La lectura actual no muestra compromisos fuera de rango.',
      href: '#acciones',
      tone: serviceGaps[0]?.tone || serviceCommitments[0]?.tone || 'ok',
    },
    {
      label: 'Evidencia',
      impact: traceabilityLedger[0]?.tone === 'critical' ? 'Falta respaldo para explicar un cierre' : 'Respaldo listo para explicar decisiones',
      signal: traceabilityLedger[0]?.title || 'Evidencia operativa',
      decision: traceabilityLedger[0]?.decisionLink || 'Mantener la historia preparada para revision.',
      evidence: traceabilityLedger[0]?.evidence || `${traceabilityLedger.length} registros disponibles.`,
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
    {
      label: 'Decision',
      impact: boardReport.risk,
      signal: boardReport.verdict,
      decision: boardReport.decision,
      evidence: boardReport.proofPoints[0] || meetingPack.evidence,
      href: '#decisiones',
      tone: boardReport.tone,
    },
  ] as const
  const boardReviewBrief = [
    {
      label: 'Estado',
      value: boardReport.verdict,
      detail: boardReport.outcome,
      proof: boardReport.periodLabel,
      href: '#decisiones',
      tone: boardReport.tone,
    },
    {
      label: 'Riesgo',
      value: boardReport.risk,
      detail: executiveRiskReading[0]?.impact || operationalForecast.primaryRisk,
      proof: executiveRiskReading[0]?.decision || operationalForecast.bestMove,
      href: '#decisiones',
      tone: executiveRiskReading[0]?.tone || boardReport.tone,
    },
    {
      label: 'Acuerdo',
      value: meetingPack.close,
      detail: meetingPack.commitment,
      proof: meetingPack.evidence,
      href: '#decisiones',
      tone: meetingPack.tone,
    },
    {
      label: 'Proximo cierre',
      value: nextMilestones[0]?.title || actionRegister[0]?.title || meetingPack.decision,
      detail: nextMilestones[0]?.expected || actionRegister[0]?.nextStep || nextAction,
      proof: nextMilestones[0]?.owner || actionRegister[0]?.owner || 'Administracion',
      href: '#acciones',
      tone: nextMilestones[0]?.tone || actionRegister[0]?.tone || operationalScore.tone,
    },
  ] as const
  const responsibilityMap = [
    {
      label: 'Operacion diaria',
      owner: actionRegister[0]?.owner || governanceRituals[0]?.owner || 'Operacion',
      question: governanceRituals[0]?.question || 'Que cambio desde la ultima revision?',
      output: actionRegister[0]?.nextStep || governanceRituals[0]?.output || nextAction,
      proof: actionRegister[0]?.successCriteria || 'Rutina con responsable, accion y evidencia visible.',
      tone: actionRegister[0]?.tone || governanceRituals[0]?.tone || operationalScore.tone,
    },
    {
      label: 'Decision cliente',
      owner: weeklyDecisionAgenda[0]?.owner || meetingPack.agenda[1]?.owner || 'Administracion',
      question: weeklyDecisionAgenda[0]?.decision || meetingPack.decision,
      output: weeklyDecisionAgenda[0]?.expectedOutcome || meetingPack.close,
      proof: weeklyDecisionAgenda[0]?.customerValue || meetingPack.evidence,
      tone: weeklyDecisionAgenda[0]?.tone || meetingPack.tone,
    },
    {
      label: 'Mejora continua',
      owner: improvementActions[0]?.siteLabel || governanceRituals[1]?.owner || 'Equipo cliente',
      question: improvementActions[0]?.title || maturityScorecard[0]?.label || 'Que debemos mejorar?',
      output: improvementActions[0]?.nextStep || maturityScorecard[0]?.nextStep || 'Priorizar la siguiente mejora visible.',
      proof: improvementActions[0]?.expectedImpact || 'Menos ruido y mayor claridad operativa.',
      tone: improvementActions[0]?.tone || maturityScorecard[0]?.tone || 'ok',
    },
  ] as const
  const siteComparisonBrief = siteHealthRanking.slice(0, 3).map((item) => ({
    label: `#${item.position} / ${item.organizationName}`,
    value: item.siteLabel,
    score: item.score,
    status: item.status,
    summary: item.summary,
    attention: item.attentionPoint,
    nextMove: item.nextMove,
    href: `/app/properties/${item.propertyId}`,
    tone: item.tone,
  }))
  const roleBriefs = [
    {
      label: 'Direccion',
      value: executiveBrief.verdict,
      question: 'Que riesgo o decision requiere respaldo hoy?',
      action: boardReport.decision,
      proof: boardReport.proofPoints[0] || executiveBrief.highlights[0] || meetingPack.evidence,
      href: '#decisiones',
      tone: boardReport.tone,
    },
    {
      label: 'Administracion',
      value: leadershipBrief.customerOutcome,
      question: 'Que debe quedar ordenado para operar sin friccion?',
      action: weeklyDecisionAgenda[0]?.expectedOutcome || meetingPack.close,
      proof: leadershipBrief.nextConversation,
      href: '#acciones',
      tone: weeklyDecisionAgenda[0]?.tone || leadershipBrief.tone,
    },
    {
      label: 'Operacion',
      value: dailyPriorities[0]?.title || headline,
      question: 'Que mirar primero durante el turno?',
      action: actionRegister[0]?.nextStep || nextAction,
      proof: traceabilityLedger[0]?.decisionLink || `${activity.length} cambios recientes con contexto.`,
      href: '#actividad',
      tone: dailyPriorities[0]?.tone || actionRegister[0]?.tone || operationalScore.tone,
    },
  ] as const
  const clientAdoptionPath = [
    {
      label: 'Habito diario',
      value: dailyPriorities[0]?.title || 'Abrir con contexto',
      owner: actionRegister[0]?.owner || governanceRituals[0]?.owner || 'Operacion',
      routine: governanceRituals[0]?.cadence || 'Diario',
      evidence: `${activity.length} cambios recientes y ${dailyPriorities.length} prioridades listas.`,
      next: dailyPriorities[0]?.action || actionRegister[0]?.nextStep || nextAction,
      href: '#actividad',
      tone: dailyPriorities[0]?.tone || actionRegister[0]?.tone || operationalScore.tone,
    },
    {
      label: 'Habito de administracion',
      value: weeklyClientAgenda[0]?.value || meetingPack.decision,
      owner: weeklyClientAgenda[0]?.owner || meetingPack.agenda[1]?.owner || 'Administracion',
      routine: weeklyClientAgenda[0]?.deadline || 'Semanal',
      evidence: weeklyClientAgenda[0]?.detail || meetingPack.evidence,
      next: weeklyClientAgenda[0]?.output || meetingPack.close,
      href: '#decisiones',
      tone: weeklyClientAgenda[0]?.tone || meetingPack.tone,
    },
    {
      label: 'Habito de evidencia',
      value: traceabilityLedger[0]?.title || 'Revisar respaldo',
      owner: traceabilityLedger[0]?.siteLabel || 'Equipo cliente',
      routine: 'En cada cierre',
      evidence: traceabilityLedger[0]?.evidence || `${traceabilityLedger.length} registros disponibles.`,
      next: traceabilityLedger[0]?.decisionLink || 'Conservar prueba y decision antes de cerrar.',
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
    {
      label: 'Habito de mejora',
      value: improvementActions[0]?.title || maturityScorecard[0]?.label || 'Mejorar con foco',
      owner: improvementActions[0]?.siteLabel || governanceRituals[1]?.owner || 'Equipo cliente',
      routine: 'Ciclo de mejora',
      evidence: improvementActions[0]?.expectedImpact || maturityScorecard[0]?.reading || 'La mejora queda ligada al resultado operativo.',
      next: improvementActions[0]?.nextStep || maturityScorecard[0]?.nextStep || 'Definir la siguiente mejora visible.',
      href: '#acciones',
      tone: improvementActions[0]?.tone || maturityScorecard[0]?.tone || 'ok',
    },
  ] as const
  const executiveMaturity = [
    {
      label: 'Gobierno',
      value: `${governanceRituals.length} rutinas`,
      reading: governanceRituals[0]?.question || 'La operacion ya tiene preguntas recurrentes para decidir con calma.',
      proof: governanceRituals[0]?.output || responsibilityMap[0]?.proof || 'Responsables, ritmo y salida esperada quedan visibles.',
      next: governanceRituals[0]?.output || weeklyClientAgenda[0]?.output || meetingPack.close,
      href: '#decisiones',
      tone: governanceRituals.some((ritual) => ritual.tone === 'critical')
        ? 'critical'
        : governanceRituals.some((ritual) => ritual.tone === 'warning')
          ? 'warning'
          : 'ok',
    },
    {
      label: 'Adopcion',
      value: `${clientAdoptionPath.length} habitos`,
      reading: clientAdoptionPath[0]?.value || 'El equipo sabe como partir el dia sin perseguir informacion.',
      proof: clientAdoptionPath[0]?.evidence || `${activity.length} cambios recientes y prioridades listas.`,
      next: clientAdoptionPath[0]?.next || nextAction,
      href: '#actividad',
      tone: clientAdoptionPath[0]?.tone || operationalScore.tone,
    },
    {
      label: 'Auditoria',
      value: `${traceabilityLedger.length} registros`,
      reading: traceabilityLedger[0]?.decisionLink || 'La historia queda preparada para explicar que paso y por que se actuo.',
      proof: traceabilityLedger[0]?.evidence || 'Evidencia disponible para revisar sin reconstruir la operacion.',
      next: traceabilityLedger[0]?.decisionLink || 'Mantener prueba y criterio de cierre en cada excepcion.',
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
    {
      label: 'Mejora',
      value: `${maturityAverage}/100`,
      reading: maturityScorecard[0]?.reading || 'La operacion avanza con una lectura simple de mejora continua.',
      proof: improvementActions[0]?.expectedImpact || maturityScorecard[0]?.nextStep || 'La siguiente mejora queda ligada al resultado operativo.',
      next: improvementActions[0]?.nextStep || maturityScorecard[0]?.nextStep || 'Priorizar una mejora visible y medible.',
      href: '#acciones',
      tone: maturityScorecard[0]?.tone || operationalCompletenessTone,
    },
  ] as const
  const primaryProfile = primarySite?.profile || {
    eyebrow: 'Portal de cliente',
    headline: 'Tu seguridad, clara y lista para decidir.',
    summary: 'Una sola pantalla para revisar camaras, espacios vigilados y alertas que necesitan atencion.',
    operatingPromise: 'La seguridad se vuelve una operacion simple: ves que cambio, entiendes por que importa y decides sin perseguir pantallas.',
    integrationPromise: 'Conectamos los sistemas existentes y los ordenamos en una vista clara de estado, evidencia y respuesta.',
    focusAreas: ['Cobertura', 'Continuidad', 'Respuesta'],
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
    metricLabels: { camera: 'Camaras', sensor: 'Sensores', alert: 'Alertas', access: 'Accesos' },
    recommendedStableAction: 'Mantener supervision normal.',
    recommendedAttentionAction: 'Revisar los avisos activos y confirmar recepcion si corresponde.',
  }
  const profileCards = [
    {
      label: primaryProfile.commandCenter[0]?.label || primaryProfile.focusAreas[0] || 'Cobertura',
      value: primaryProfile.commandCenter[0]?.value || 'Vista centralizada',
      description: primaryProfile.commandCenter[0]?.detail || primaryProfile.summary,
    },
    {
      label: primaryProfile.commandCenter[1]?.label || primaryProfile.focusAreas[1] || 'Continuidad',
      value: primaryProfile.commandCenter[1]?.value || 'Supervision activa',
      description: primaryProfile.commandCenter[1]?.detail || (continuityHasRisk ? primaryProfile.recommendedAttentionAction : primaryProfile.recommendedStableAction),
    },
    {
      label: primaryProfile.commandCenter[2]?.label || primaryProfile.focusAreas[2] || 'Respuesta',
      value: primaryProfile.commandCenter[2]?.value || 'Alertas con contexto',
      description: primaryProfile.commandCenter[2]?.detail || 'Cada aviso indica donde ocurrio y que conviene revisar primero.',
    },
  ]
  const executiveLog = [
    {
      label: 'Lo que cambio',
      title: activity[0]?.title || headline,
      detail: activity[0]
        ? activity[0].detail
        : 'No hay cambios recientes relevantes para esta cuenta.',
      meta: activity[0] ? formatDate(activity[0].at) : updatedLabel,
      href: '#actividad',
      tone: activity[0]?.status === 'critical' || activity[0]?.status === 'falla' ? 'critical' : 'ok',
    },
    {
      label: 'Decision sugerida',
      title: decisionRoom.decisionNow,
      detail: decisionRoom.reason,
      meta: decisionRoom.owner,
      href: '#decisiones',
      tone: decisionRoom.tone,
    },
    {
      label: 'Accion abierta',
      title: actionRegister[0]?.title || 'Mantener seguimiento normal',
      detail: actionRegister[0]?.nextStep || nextAction,
      meta: actionRegister[0]?.owner || 'Operacion',
      href: '#acciones',
      tone: actionRegister[0]?.tone || operationalScore.tone,
    },
    {
      label: 'Prueba disponible',
      title: traceabilityLedger[0]?.title || 'Evidencia y actividad listas',
      detail: traceabilityLedger[0]?.decisionLink || 'El portal mantiene eventos, sitios y registros ordenados para revision.',
      meta: traceabilityLedger[0]?.siteLabel || `${traceabilityLedger.length} registros`,
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
  ] as const
  const executiveClosure = [
    {
      label: 'Veredicto',
      value: boardReport.verdict,
      detail: boardReport.outcome,
      proof: boardReport.periodLabel,
      href: '#decisiones',
      tone: boardReport.tone,
    },
    {
      label: 'Decision',
      value: decisionRoom.decisionNow,
      detail: decisionRoom.reason,
      proof: decisionRoom.owner,
      href: '#decisiones',
      tone: decisionRoom.tone,
    },
    {
      label: 'Responsable',
      value: actionRegister[0]?.owner || decisionRoom.owner,
      detail: actionRegister[0]?.nextStep || meetingPack.close,
      proof: actionRegister[0]?.successCriteria || 'Cierre con responsable, criterio y evidencia visible.',
      href: '#acciones',
      tone: actionRegister[0]?.tone || decisionRoom.tone,
    },
    {
      label: 'Prueba',
      value: traceabilityLedger[0]?.title || `${traceabilityLedger.length} registros`,
      detail: traceabilityLedger[0]?.decisionLink || decisionRoom.evidence,
      proof: traceabilityLedger[0]?.siteLabel || meetingPack.evidence,
      href: '#evidencia',
      tone: traceabilityLedger[0]?.tone || 'ok',
    },
  ] as const

  return (
    <div className="space-y-8">
      <section id="camaras" className="scroll-mt-32 relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(77,163,217,0.22),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.26)] lg:p-10">
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
              <p className="text-xs uppercase tracking-[0.18em] text-[#9DD2F2]">Operacion integral</p>
              <h2 className="mt-2 text-xl font-light text-white">Mejoramos lo que ya existe</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {primaryProfile.integrationPromise}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`rounded-[28px] border p-5 md:p-6 ${getScoreTone(boardReport.tone)}`}>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] opacity-70">Cierre ejecutivo cliente</p>
            <h2 className="mt-2 text-2xl font-light text-white">Lo minimo que gerencia necesita para actuar sin otra reunion</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
              Una lectura temprana con veredicto, decision, responsable y prueba. Si el cliente solo mira esta parte,
              debe poder entender el estado y saber que corresponde hacer.
            </p>
          </div>
          <Badge className={getScoreTone(boardReport.tone)}>{meetingPack.title}</Badge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {executiveClosure.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
                  <h3 className="mt-2 text-lg font-light leading-snug text-white">{item.value}</h3>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/42 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/66">{item.detail}</p>
              <p className="mt-auto pt-4 text-xs leading-5 text-white/48">{item.proof}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.024)),radial-gradient(circle_at_8%_0%,rgba(77,163,217,0.14),transparent_28%)] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Garantias visibles</p>
            <h2 className="mt-1 text-xl font-light text-white">Confianza operativa desde la primera lectura</h2>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            acceso / evidencia / tiempos / responsables
          </Badge>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleAssurance.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`group rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
                  <h3 className="mt-2 text-xl font-light text-white">{item.value}</h3>
                </div>
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-white/45 transition group-hover:text-white" />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/66">{item.detail}</p>
              <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/48">{item.proof}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(77,163,217,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.024))] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Bitacora ejecutiva</p>
            <h2 className="mt-1 text-xl font-light text-white">Una lectura corta para decidir sin perder contexto</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              En una sola mirada: cambio, decision, accion y prueba. El cliente no necesita perseguir pantallas;
              necesita entender que paso, por que importa y cual es el siguiente movimiento.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            actualizado con la operacion
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {executiveLog.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
                  <h3 className="mt-2 text-lg font-light leading-snug text-white">{item.title}</h3>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/42 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/66">{item.detail}</p>
              <p className="mt-auto pt-4 text-[11px] uppercase tracking-[0.14em] text-white/42">{item.meta}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_92%_0%,rgba(157,210,242,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.024))] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Valor operativo</p>
            <h2 className="mt-2 text-2xl font-light text-white">Lo que el cliente gana cuando la seguridad deja de ser una suma de pantallas</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              Menos dudas, mejor respuesta y una historia clara para administrar. El portal muestra beneficios concretos
              de la operacion diaria sin exigirle al cliente entender como se conecta todo.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            beneficio visible
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {businessValue.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
                  <h3 className="mt-2 text-xl font-light text-white">{item.value}</h3>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/42 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/66">{item.detail}</p>
              <p className="mt-auto pt-4 text-xs leading-5 text-white/48">{item.proof}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(157,210,242,0.14),transparent_30%),radial-gradient(circle_at_94%_0%,rgba(255,255,255,0.07),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.054),rgba(255,255,255,0.024))] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Prueba de valor cliente</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que valor concreto queda demostrado en la operacion</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              Una lectura ejecutiva para justificar continuidad, respuesta y mejora: beneficio visible, evidencia que lo
              sostiene y siguiente movimiento para aumentar el valor del servicio.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            beneficio / prueba / mejora
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {clientValueProof.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
                  <h3 className="mt-2 text-xl font-light leading-snug text-white">{item.value}</h3>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/42 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/66">{item.benefit}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/45 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Prueba</p>
                <p className="mt-2 text-xs leading-5 text-white/58">{item.proof}</p>
              </div>
              <p className="mt-auto pt-4 text-xs leading-5 text-white/50">{item.next}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_8%_0%,rgba(77,163,217,0.18),transparent_30%),radial-gradient(circle_at_90%_8%,rgba(255,255,255,0.08),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.058),rgba(255,255,255,0.024))] p-5 md:p-7">
        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[26px] border border-white/10 bg-[#071524]/52 p-5 md:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Impacto ejecutivo del servicio</p>
            <h2 className="mt-3 text-3xl font-light leading-tight text-white">
              La seguridad importa cuando protege continuidad, atencion y confianza.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/60">
              Esta lectura traduce eventos, avisos y evidencia en impacto operativo. Sirve para que gerencia entienda
              que se gana, que podria deteriorarse y que decision evita improvisacion.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">Criterio</p>
              <p className="mt-2 text-sm leading-6 text-white/68">
                No se inventan ahorros: se muestran riesgos, pruebas y decisiones respaldadas por la operacion visible.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {executiveImpact.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`group flex min-h-full flex-col rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                    <h3 className="mt-2 text-2xl font-light leading-snug text-white">{item.value}</h3>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/42 transition group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <p className="mt-4 text-sm leading-6 text-white/70">{item.effect}</p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Evidencia de impacto</p>
                  <p className="mt-2 text-xs leading-5 text-white/62">{item.proof}</p>
                </div>
                <p className="mt-auto pt-4 text-sm leading-6 text-white/76">{item.decision}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_8%_0%,rgba(77,163,217,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.024))] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Criterios de clase mundial</p>
            <h2 className="mt-2 text-2xl font-light text-white">El portal debe ordenar la operacion, bajar el ruido y dejar prueba</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              Los mejores sistemas no abruman al cliente: consolidan lo importante, priorizan la respuesta y mantienen
              una historia clara para administrar seguridad con confianza.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            estandar operativo
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {worldClassCriteria.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
                  <h3 className="mt-2 text-xl font-light text-white">{item.value}</h3>
                </div>
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-white/45 transition group-hover:text-white" />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/66">{item.detail}</p>
              <p className="mt-auto pt-4 text-xs leading-5 text-white/48">{item.proof}</p>
            </a>
          ))}
        </div>
      </section>

      <section className={`rounded-[28px] border p-5 md:p-6 ${getScoreTone(executiveBrief.tone)}`}>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] opacity-70">Resumen para direccion</p>
            <h2 className="mt-2 text-2xl font-light text-white">La version corta para decidir sin reconstruir la operacion</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
              Una lectura preparada para administracion y gerencia: que significa el estado actual, que valor produce,
              que decision corresponde y con que prueba se sostiene.
            </p>
          </div>
          <Badge className={getScoreTone(executiveBrief.tone)}>{executiveBrief.periodLabel}</Badge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {executiveDecisionSummary.map((item) => (
            <article key={item.label} className={`flex min-h-full flex-col rounded-[22px] border p-4 ${getScoreTone(item.tone)}`}>
              <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
              <h3 className="mt-2 text-lg font-light leading-snug text-white">{item.value}</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">{item.detail}</p>
              <p className="mt-auto pt-4 text-xs leading-5 text-white/48">{item.proof}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`rounded-[28px] border p-5 md:p-6 ${getScoreTone(boardReport.tone)}`}>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] opacity-70">Minuta ejecutiva</p>
            <h2 className="mt-2 text-2xl font-light text-white">Un resumen listo para comite, reunion o seguimiento</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
              La lectura queda preparada en cuatro piezas: tema, decision, indicador y acuerdo. Sirve para alinear al
              equipo sin volver a revisar toda la operacion.
            </p>
          </div>
          <Badge className={getScoreTone(boardReport.tone)}>{boardReport.periodLabel}</Badge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {executiveMinutes.map((item) => (
            <article key={item.label} className={`flex min-h-full flex-col rounded-[22px] border p-4 ${getScoreTone(item.tone)}`}>
              <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
              <h3 className="mt-2 text-lg font-light leading-snug text-white">{item.value}</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">{item.detail}</p>
              <p className="mt-auto pt-4 text-xs leading-5 text-white/48">{item.proof}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.056),rgba(255,255,255,0.024))] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Agenda semanal cliente</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que revisar esta semana y que compromiso debe quedar cerrado</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">
              La operacion se transforma en una pauta simple: mirar el punto correcto, asignar responsable y cerrar con
              evidencia. Menos reunion para entender el problema, mas tiempo para resolverlo.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            {weeklyClientAgenda.length} focos activos
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {weeklyClientAgenda.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
                  <h3 className="mt-2 text-xl font-light leading-snug text-white">{item.value}</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-[#071524]/60 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/48">
                  {item.deadline}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/66">{item.detail}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/45 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/38">Responsable</p>
                <p className="mt-1 text-sm text-white/78">{item.owner}</p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-white/52">
                <span className="line-clamp-2">{item.output}</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(77,163,217,0.18),transparent_30%),radial-gradient(circle_at_92%_8%,rgba(255,255,255,0.08),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.058),rgba(255,255,255,0.024))] p-5 md:p-7">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Cadencia ejecutiva cliente</p>
            <h2 className="mt-2 max-w-4xl text-3xl font-light leading-tight text-white">
              Un portal profesional tiene ritmo: mira, decide, asigna y cierra con evidencia.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
              La cadencia evita que el dashboard sea una pantalla pasiva. Convierte la lectura diaria en decisiones,
              responsables y cierres que administracion puede revisar sin reconstruir la historia.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            diario / semanal / mensual / cierre
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {executiveCadence.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                  <h3 className="mt-2 text-xl font-light leading-snug text-white">{item.value}</h3>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/42 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Responsable</p>
                <p className="mt-2 text-sm leading-5 text-white/72">{item.owner}</p>
              </div>
              <p className="mt-4 text-xs leading-5 text-white/54">{item.evidence}</p>
              <p className="mt-auto pt-4 text-sm leading-6 text-white/76">{item.output}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.14),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.024))] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Comparador operativo</p>
            <h2 className="mt-2 text-2xl font-light text-white">Donde mirar primero sin revisar sitio por sitio</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              Una lectura corta para comparar operaciones, entender cual esta mas fuerte y abrir directo el sitio que
              necesita atencion o cierre.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            {siteHealthRanking.length} sitios comparados
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {siteComparisonBrief.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
                  <h3 className="mt-2 text-xl font-light text-white">{item.value}</h3>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#071524]/55 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/38">salud</p>
                  <p className="text-xl font-light text-white">{item.score}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/66">{item.summary}</p>
              <p className="mt-3 rounded-2xl border border-white/10 bg-[#071524]/45 p-3 text-xs leading-5 text-white/56">
                {item.attention}
              </p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-white/52">
                <span className="line-clamp-2">{item.nextMove}</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_88%_0%,rgba(157,210,242,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.024))] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Lectura por rol</p>
            <h2 className="mt-2 text-2xl font-light text-white">La misma operacion, tres respuestas claras</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              Direccion necesita decision, administracion necesita orden y operacion necesita prioridad. El portal
              separa la lectura para que cada equipo actue sin traducir la informacion.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            direccion / administracion / operacion
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {roleBriefs.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[22px] border p-5 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
                  <h3 className="mt-2 text-lg font-light leading-snug text-white">{item.value}</h3>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/42 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <p className="mt-4 text-sm leading-6 text-white/66">{item.question}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Accion esperada</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{item.action}</p>
              </div>
              <p className="mt-auto pt-4 text-xs leading-5 text-white/48">{item.proof}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(77,163,217,0.15),transparent_30%),radial-gradient(circle_at_92%_0%,rgba(255,255,255,0.07),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.054),rgba(255,255,255,0.024))] p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Adopcion operativa cliente</p>
            <h2 className="mt-2 text-2xl font-light text-white">Como convertir la seguridad en rutina de equipo</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              Un portal profesional no sirve si nadie lo incorpora al trabajo diario. Esta vista muestra los habitos
              que sostienen control, respuesta, evidencia y mejora continua dentro del equipo cliente.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            rutina / responsable / evidencia
          </Badge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {clientAdoptionPath.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[22px] border p-4 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
                  <h3 className="mt-2 text-lg font-light leading-snug text-white">{item.value}</h3>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/42 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-[#071524]/45 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Responsable / ritmo</p>
                  <p className="mt-2 text-xs leading-5 text-white/62">{item.owner} / {item.routine}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#071524]/45 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Evidencia</p>
                  <p className="mt-2 text-xs leading-5 text-white/62">{item.evidence}</p>
                </div>
              </div>
              <p className="mt-auto pt-4 text-xs leading-5 text-white/50">{item.next}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_12%_8%,rgba(77,163,217,0.18),transparent_32%),radial-gradient(circle_at_88%_0%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.022))] p-5 md:p-7">
        <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="flex min-h-full flex-col rounded-[26px] border border-white/10 bg-[#071524]/52 p-5 md:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Madurez ejecutiva cliente</p>
            <h2 className="mt-3 text-3xl font-light leading-tight text-white">
              La seguridad madura cuando se puede gobernar, auditar y repetir.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/62">
              Esta lectura resume si la operacion depende de perseguir informacion o si ya funciona como un sistema:
              con habitos claros, responsables visibles, evidencia ordenada y mejoras que se sostienen.
            </p>
            <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">Lectura</p>
                <p className="mt-2 text-lg font-light text-white">{operationalCompletenessTone === 'ok' ? 'operacion gobernable' : operationalCompletenessTone === 'warning' ? 'madurez en progreso' : 'requiere orden ejecutivo'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">Indice</p>
                <p className="mt-2 text-lg font-light text-white">{maturityAverage}/100</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {executiveMaturity.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`group flex min-h-full flex-col rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                    <h3 className="mt-2 text-2xl font-light text-white">{item.value}</h3>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/42 transition group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <p className="mt-4 text-sm leading-6 text-white/70">{item.reading}</p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Prueba visible</p>
                  <p className="mt-2 text-xs leading-5 text-white/62">{item.proof}</p>
                </div>
                <p className="mt-auto pt-4 text-xs leading-5 text-white/50">{item.next}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <nav className="sticky top-4 z-20 rounded-[28px] border border-white/10 bg-[#071524]/88 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Indice ejecutivo</p>
            <h2 className="mt-1 text-xl font-light text-white">Ir directo a la operacion correcta</h2>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-white/5 text-white/58">
            {totals.organizations} empresas / {totals.sites} sitios
          </Badge>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {portalIndex.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <p className="text-[11px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
              <h3 className="mt-2 text-lg font-light text-white">{item.value}</h3>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/62">{item.detail}</p>
            </a>
          ))}
        </div>
      </nav>

      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.18),transparent_32%),radial-gradient(circle_at_92%_4%,rgba(255,255,255,0.08),transparent_25%),linear-gradient(135deg,rgba(255,255,255,0.058),rgba(255,255,255,0.024))] p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Estandar profesional</p>
            <h2 className="mt-3 text-3xl font-light leading-tight text-white md:text-4xl">
              Un sistema de seguridad no se mide por cuantos equipos tiene, sino por lo claro que ayuda a actuar.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/58">
              El portal ordena lo existente en una lectura ejecutiva: que esta protegido, que cambio, donde hay riesgo,
              quien debe responder y que evidencia queda para cerrar bien. Menos persecucion de pantallas, mas gobierno
              de la operacion.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoLine label="Lectura" value="Una sola historia operativa" />
              <InfoLine label="Respuesta" value="Prioridad antes que ruido" />
              <InfoLine label="Gobierno" value="Decision, prueba y cierre" />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {professionalReadiness.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`group rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                    <h3 className="mt-2 text-3xl font-light text-white">{item.value}</h3>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <p className="mt-4 text-sm leading-6 text-white/70">{item.reading}</p>
                <p className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/55 px-4 py-3 text-xs leading-5 text-white/55">
                  {item.proof}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_8%_10%,rgba(77,163,217,0.16),transparent_30%),radial-gradient(circle_at_96%_0%,rgba(255,255,255,0.07),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.022))] p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Ficha de servicio cliente</p>
            <h2 className="mt-3 text-3xl font-light leading-tight text-white md:text-4xl">
              Lo contratado debe poder leerse en una pagina, no perseguirse en conversaciones.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/58">
              Esta ficha traduce la seguridad en cuatro certezas: alcance, compromiso, evidencia y siguiente cierre.
              Sirve para que administracion sepa que esta bajo control, que falta y que debe quedar resuelto.
            </p>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-[#071524]/45 p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">Lectura esperada</p>
              <p className="mt-3 text-base leading-7 text-white/74">
                El cliente no necesita interpretar la operacion completa: necesita saber si el servicio esta cubriendo,
                si responde a tiempo y si cada decision queda explicada.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {servicePassport.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`group flex min-h-full flex-col rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                    <h3 className="mt-2 text-2xl font-light leading-snug text-white">{item.value}</h3>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <p className="mt-4 text-sm leading-6 text-white/68">{item.detail}</p>
                <p className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/50 px-4 py-3 text-xs leading-5 text-white/55">
                  {item.proof}
                </p>
                <p className="mt-auto pt-4 text-sm leading-6 text-white/76">{item.action}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_9%_0%,rgba(77,163,217,0.18),transparent_30%),radial-gradient(circle_at_92%_10%,rgba(255,255,255,0.08),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.056),rgba(255,255,255,0.022))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Promesa operativa cliente</p>
            <h2 className="mt-3 max-w-4xl text-3xl font-light leading-tight text-white md:text-4xl">
              La confianza se gana cuando el servicio se puede leer, exigir y demostrar.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">
              Un portal de clase mundial no solo muestra actividad: deja claro que se cuida, como se responde,
              que evidencia queda y cual es el siguiente avance para mejorar la operacion.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            cobertura / respuesta / evidencia / mejora
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {servicePromise.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                  <h3 className="mt-2 text-2xl font-light text-white">{item.value}</h3>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/42 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <p className="mt-4 text-sm leading-6 text-white/68">{item.statement}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Prueba de servicio</p>
                <p className="mt-2 text-xs leading-5 text-white/62">{item.proof}</p>
              </div>
              <p className="mt-auto pt-4 text-sm leading-6 text-white/76">{item.decision}</p>
            </a>
          ))}
        </div>
      </section>

      <section className={`rounded-[28px] border p-6 md:p-8 ${getScoreTone(operationalCompletenessTone)}`}>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] opacity-70">Completitud operativa</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que tan lista esta la seguridad para operar sin improvisar</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/68">
              Esta lectura junta inventario, compromisos, madurez y trazabilidad para mostrar si la operacion esta
              preparada para cuidar, responder y explicar sus decisiones.
            </p>
          </div>
          <Badge className={getScoreTone(operationalCompletenessTone)}>
            {operationalCompletenessTone === 'ok' ? 'lista para operar' : operationalCompletenessTone === 'warning' ? 'mejoras claras' : 'requiere cierre'}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {operationalCompleteness.map((item) => (
            <div key={item.label} className={`rounded-[22px] border p-5 ${getScoreTone(item.tone)}`}>
              <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
              <h3 className="mt-3 text-2xl font-light text-white">{item.value}</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_90%_0%,rgba(77,163,217,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.024))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Roadmap cliente</p>
            <h2 className="mt-2 text-2xl font-light text-white">Proximos 90 dias para operar con mas orden</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              La mejora queda dividida en tres horizontes: resolver lo inmediato, fortalecer la operacion y convertir
              la seguridad en una rutina de gobierno medible.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            30 / 60 / 90
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {clientRoadmap.map((item) => (
            <div key={item.label} className={`flex min-h-full flex-col rounded-[24px] border p-5 ${getScoreTone(item.tone)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                  <h3 className="mt-3 text-xl font-light leading-snug text-white">{item.title}</h3>
                </div>
                <Badge className={getScoreTone(item.tone)}>{item.owner}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/66">{item.detail}</p>
              <div className="mt-auto pt-5">
                <p className="rounded-2xl border border-white/10 bg-[#071524]/45 p-4 text-sm leading-6 text-white/72">
                  {item.outcome}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.15),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.056),rgba(255,255,255,0.022))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Hitos proximos</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que debe pasar ahora para que el servicio siga avanzando</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              La mejora profesional necesita continuidad: cada hito muestra responsable, plazo, riesgo a cuidar y salida
              esperada. Asi el cliente ve avance real sin esperar una reunion para reconstruir el estado.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            {nextMilestones.length} hitos abiertos
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {nextMilestones.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                  <h3 className="mt-3 text-xl font-light leading-snug text-white">{item.title}</h3>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Responsable / plazo</p>
                  <p className="mt-2 text-sm leading-6 text-white/74">{item.owner} · {item.due}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Salida esperada</p>
                  <p className="mt-2 text-sm leading-6 text-white/74">{item.expected}</p>
                </div>
              </div>
              <p className="mt-auto pt-4 text-xs leading-5 text-white/50">{item.risk}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_8%_0%,rgba(157,210,242,0.14),transparent_30%),radial-gradient(circle_at_92%_0%,rgba(255,255,255,0.07),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.056),rgba(255,255,255,0.022))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Revision de directorio cliente</p>
            <h2 className="mt-2 text-2xl font-light text-white">Una pagina para conversar estado, riesgo, acuerdo y proximo cierre</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              La operacion queda resumida para una conversacion ejecutiva: que esta pasando, que riesgo requiere
              criterio, que acuerdo debe sostenerse y cual es el cierre que no puede perderse.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            lista para reunion
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {boardReviewBrief.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                  <h3 className="mt-3 text-xl font-light leading-snug text-white">{item.value}</h3>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <p className="mt-4 text-sm leading-6 text-white/68">{item.detail}</p>
              <p className="mt-auto pt-4 text-xs leading-5 text-white/50">{item.proof}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_92%_0%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_8%_0%,rgba(77,163,217,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.054),rgba(255,255,255,0.022))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Lectura ejecutiva de riesgo</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que podria afectar la operacion y que decision reduce el riesgo</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              Una vista para direccion y administracion: separa continuidad, servicio, evidencia y decision. El objetivo
              no es alarmar; es saber que mirar, por que importa y que salida deja la operacion mas tranquila.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            continuidad / servicio / evidencia / decision
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {executiveRiskReading.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                  <h3 className="mt-3 text-xl font-light leading-snug text-white">{item.impact}</h3>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Senal visible</p>
                  <p className="mt-2 text-sm leading-6 text-white/74">{item.signal}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Decision recomendada</p>
                  <p className="mt-2 text-sm leading-6 text-white/74">{item.decision}</p>
                </div>
              </div>
              <p className="mt-auto pt-4 text-xs leading-5 text-white/50">{item.evidence}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(157,210,242,0.13),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.058),rgba(255,255,255,0.022))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Mapa de responsables</p>
            <h2 className="mt-2 text-2xl font-light text-white">Quien mira, quien decide y que debe quedar cerrado</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              La seguridad profesional no vive solo en eventos: vive en responsables claros, salidas esperadas y
              evidencia suficiente para que cada turno sepa como continuar.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            responsabilidad visible
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {responsibilityMap.map((item) => (
            <article key={item.label} className={`flex min-h-full flex-col rounded-[24px] border p-5 ${getScoreTone(item.tone)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                  <h3 className="mt-3 text-lg font-light leading-snug text-white">{item.question}</h3>
                </div>
                <Badge className={getScoreTone(item.tone)}>{item.owner}</Badge>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Salida esperada</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{item.output}</p>
              </div>
              <p className="mt-auto pt-4 text-xs leading-5 text-white/48">{item.proof}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_88%_0%,rgba(77,163,217,0.16),transparent_30%),radial-gradient(circle_at_8%_8%,rgba(255,255,255,0.07),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.056),rgba(255,255,255,0.024))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Ruta de trabajo del cliente</p>
            <h2 className="mt-3 max-w-4xl text-3xl font-light leading-tight text-white md:text-4xl">
              El portal debe decir que mirar ahora, que resolver hoy y que llevar a la reunion.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">
              Esta ruta convierte la seguridad diaria en una secuencia facil: abrir con contexto, resolver lo urgente,
              preparar decisiones y cerrar aprendizaje. La operacion deja de depender de memoria y queda lista para
              equipos, administracion y direccion.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            4 momentos operativos
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-4">
          {clientWorkPath.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`group flex min-h-full flex-col rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:bg-white/10 ${getScoreTone(item.tone)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">0{index + 1} / {item.label}</p>
                  <h3 className="mt-2 text-xl font-light text-white">{item.value}</h3>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <h4 className="mt-5 text-base font-normal text-white">{item.title}</h4>
              <p className="mt-3 text-sm leading-6 text-white/66">{item.detail}</p>
              <div className="mt-auto pt-5">
                <p className="rounded-2xl border border-white/10 bg-[#071524]/55 px-4 py-3 text-xs leading-5 text-white/56">
                  <span className="block text-[10px] uppercase tracking-[0.16em] text-white/35">Siguiente paso</span>
                  {item.action}
                </p>
                <p className="mt-3 text-xs leading-5 text-white/48">{item.proof}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <div className={`rounded-[28px] border p-6 shadow-none md:p-7 ${getScoreTone(operationalScore.tone)}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-70">Indice operativo</p>
              <h2 className="mt-3 text-5xl font-light text-white">{operationalScore.score}</h2>
              <p className="mt-1 text-sm text-white/55">sobre 100</p>
            </div>
            <Badge className={getScoreTone(operationalScore.tone)}>{operationalScore.label}</Badge>
          </div>
          <p className="mt-6 text-sm leading-7 text-white/66">{operationalScore.summary}</p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 md:p-7">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Lectura ejecutiva</p>
              <h2 className="mt-2 text-2xl font-light text-white">Que explica el estado de hoy</h2>
            </div>
            <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
              visible / medible / accionable
            </Badge>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {operationalScore.drivers.map((driver) => (
              <div key={driver} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" strokeWidth={1.8} />
                <p className="text-sm leading-6 text-white/64">{driver}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`rounded-[28px] border p-6 md:p-8 ${getScoreTone(executiveBrief.tone)}`}>
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] opacity-70">{executiveBrief.title}</p>
            <h2 className="mt-3 text-3xl font-light text-white">{executiveBrief.verdict}</h2>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/45">{executiveBrief.periodLabel}</p>
            <p className="mt-5 text-base leading-8 text-white/70">{executiveBrief.narrative}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-[#071524]/45 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/38">Indicadores para gerencia</p>
              <div className="mt-4 space-y-3">
                {executiveBrief.highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-6 text-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" strokeWidth={1.8} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-[#071524]/45 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/38">Foco recomendado</p>
              <div className="mt-4 space-y-3">
                {executiveBrief.focus.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-6 text-white/70">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" strokeWidth={1.8} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`rounded-[28px] border p-6 md:p-8 ${getScoreTone(leadershipBrief.tone)}`}>
        <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] opacity-70">{leadershipBrief.title}</p>
            <h2 className="mt-3 text-3xl font-light text-white">{leadershipBrief.headline}</h2>
            <p className="mt-5 text-base leading-8 text-white/70">{leadershipBrief.businessReading}</p>
            <div className="mt-5 grid gap-3">
              <InfoLine label="Valor para el cliente" value={leadershipBrief.customerOutcome} />
              <InfoLine label="Proxima conversacion" value={leadershipBrief.nextConversation} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {leadershipBrief.pillars.map((pillar) => (
              <div key={pillar.label} className={`rounded-[24px] border p-5 ${getScoreTone(pillar.tone)}`}>
                <p className="text-xs uppercase tracking-[0.18em] opacity-70">{pillar.label}</p>
                <h3 className="mt-3 text-2xl font-light text-white">{pillar.value}</h3>
                <p className="mt-3 text-sm leading-6 text-white/64">{pillar.detail}</p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/45 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/38">Prueba</p>
                  <p className="mt-2 text-xs leading-5 text-white/60">{pillar.proof}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="decisiones" className={`scroll-mt-32 relative overflow-hidden rounded-[32px] border p-6 md:p-8 ${getScoreTone(decisionRoom.tone)}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(157,210,242,0.18),transparent_30%),radial-gradient(circle_at_100%_15%,rgba(255,255,255,0.08),transparent_24%)]" />
        <div className="relative grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] opacity-70">{decisionRoom.title}</p>
            <h2 className="mt-3 text-3xl font-light text-white md:text-4xl">{decisionRoom.headline}</h2>
            <p className="mt-5 text-base leading-8 text-white/70">{decisionRoom.brief}</p>
            <div className="mt-6 grid gap-3">
              <InfoLine label="Decision ahora" value={decisionRoom.decisionNow} />
              <InfoLine label="Por que importa" value={decisionRoom.reason} />
              <InfoLine label="Evidencia para mostrar" value={decisionRoom.evidence} />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              {decisionRoom.lanes.map((lane) => (
                <div key={lane.label} className={`rounded-[24px] border p-5 ${getScoreTone(lane.tone)}`}>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{lane.label}</p>
                  <h3 className="mt-3 text-xl font-light text-white">{lane.value}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/64">{lane.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[26px] border border-white/10 bg-[#071524]/55 p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/38">{decisionRoom.siteLabel}</p>
                  <h3 className="mt-2 text-2xl font-light text-white">{decisionRoom.status}</h3>
                </div>
                <Badge className={getScoreTone(decisionRoom.tone)}>{decisionRoom.owner}</Badge>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {decisionRoom.sequence.map((step, index) => (
                  <div key={step.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#9DD2F2]">0{index + 1} / {step.label}</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">{step.detail}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/68">
                Cierre esperado: resultado visible antes de {decisionRoom.deadline}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="confianza" className="scroll-mt-32 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(77,163,217,0.16),transparent_32%),radial-gradient(circle_at_86%_6%,rgba(255,255,255,0.08),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Centro de confianza</p>
            <h2 className="mt-2 text-2xl font-light text-white">Por que el cliente puede operar con calma</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Garantias simples para revisar seguridad sin depender de explicaciones internas: acceso acotado,
              evidencia, respuesta, continuidad y mejora permanente.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            confianza operacional
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {trustCenter.map((item) => (
            <div key={item.id} className={`rounded-[24px] border p-5 ${getScoreTone(item.tone)}`}>
              <p className="text-xs uppercase tracking-[0.18em] opacity-70">{item.label}</p>
              <h3 className="mt-3 text-2xl font-light text-white">{item.value}</h3>
              <p className="mt-3 text-sm leading-6 text-white/64">{item.promise}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/38">Que significa</p>
                <p className="mt-2 text-sm leading-6 text-white/70">{item.customerMeaning}</p>
              </div>
              <p className="mt-3 text-xs leading-5 text-white/45">{item.proof}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`rounded-[28px] border p-6 md:p-8 ${getScoreTone(operationalForecast.tone)}`}>
        <div className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] opacity-70">{operationalForecast.title}</p>
            <h2 className="mt-3 text-3xl font-light text-white">{operationalForecast.direction}</h2>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/45">{operationalForecast.horizon}</p>
            <p className="mt-5 text-base leading-8 text-white/70">{operationalForecast.summary}</p>
            <div className="mt-5 grid gap-3">
              <InfoLine label="Riesgo principal" value={operationalForecast.primaryRisk} />
              <InfoLine label="Mejor movimiento" value={operationalForecast.bestMove} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {operationalForecast.signals.map((signal) => (
              <div key={signal.label} className={`rounded-[24px] border p-5 ${getScoreTone(signal.tone)}`}>
                <p className="text-xs uppercase tracking-[0.18em] opacity-70">{signal.label}</p>
                <h3 className="mt-3 text-2xl font-light text-white">{signal.value}</h3>
                <p className="mt-3 text-sm leading-6 text-white/64">{signal.reading}</p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/38">Accion</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{signal.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`rounded-[28px] border p-6 md:p-8 ${getScoreTone(meetingPack.tone)}`}>
        <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] opacity-70">{meetingPack.title}</p>
            <h2 className="mt-3 text-3xl font-light text-white">La reunion ya parte ordenada</h2>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/45">{meetingPack.subtitle}</p>
            <p className="mt-5 text-base leading-8 text-white/70">{meetingPack.opening}</p>
            <div className="mt-5 grid gap-3">
              <InfoLine label="Decision central" value={meetingPack.decision} />
              <InfoLine label="Evidencia para mostrar" value={meetingPack.evidence} />
              <InfoLine label="Cierre esperado" value={meetingPack.close} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {meetingPack.agenda.map((item) => (
              <div key={item.label} className={`rounded-[24px] border p-5 ${getScoreTone(item.tone)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                    <h3 className="mt-3 text-xl font-light text-white">{item.outcome}</h3>
                  </div>
                  <Badge className={getScoreTone(item.tone)}>{item.owner}</Badge>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/64">{item.detail}</p>
              </div>
            ))}
            <div className="rounded-[24px] border border-white/10 bg-[#071524]/45 p-5 lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-white/38">Compromiso de cierre</p>
              <p className="mt-3 text-sm leading-7 text-white/70">{meetingPack.commitment}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="reunion" className="scroll-mt-32 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_92%_0%,rgba(77,163,217,0.15),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.024))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Paquete de reunion</p>
            <h2 className="mt-2 text-2xl font-light text-white">Una pagina mental para gerencia y administracion</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              Este bloque resume lo que un cliente necesita llevar a una reunion: decision, evidencia, riesgo y cierre.
              La operacion queda explicada sin perderse entre camaras, eventos o documentos.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            listo para revisar
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {meetingBrief.map((item) => (
            <div key={item.label} className={`flex min-h-full flex-col rounded-[24px] border p-5 ${getScoreTone(item.tone)}`}>
              <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{item.label}</p>
              <h3 className="mt-3 text-xl font-light leading-snug text-white">{item.value}</h3>
              <p className="mt-auto pt-5 text-sm leading-6 text-white/64">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.15),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Scorecard de madurez</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que tan profesional esta la operacion</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Cinco pilares resumen si la seguridad se ve, responde, deja evidencia, tiene gobierno y mantiene
              continuidad.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            visibilidad / respuesta / evidencia / gobierno / continuidad
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {maturityScorecard.map((item) => (
            <div key={item.id} className={`rounded-[24px] border p-5 ${getScoreTone(item.tone)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{item.label}</p>
                  <h3 className="mt-3 text-4xl font-light text-white">{item.score}</h3>
                </div>
                <Badge className={getScoreTone(item.tone)}>{item.level}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/64">{item.reading}</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/38">Siguiente mejora</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{item.nextStep}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_18%_0%,rgba(77,163,217,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Flujo operativo</p>
            <h2 className="mt-2 text-2xl font-light text-white">Como una senal se convierte en decision</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Una lectura de punta a punta: detectar lo importante, verificar contexto, responder con responsable,
              cerrar con evidencia y mantener la operacion visible.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            detectar / verificar / responder / cerrar
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {operationalFlow.slice(0, 5).map((step, index) => (
            <div key={step.id} className={`relative rounded-[24px] border p-5 ${getScoreTone(step.tone)}`}>
              <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-[#071524]/45 px-2 py-1 text-[11px] text-white/46">
                0{index + 1}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#071524]/45 text-[#9DD2F2]">
                {step.stage === 'Detectar' ? (
                  <Radar className="h-4 w-4" strokeWidth={1.8} />
                ) : step.stage === 'Verificar' ? (
                  <FileText className="h-4 w-4" strokeWidth={1.8} />
                ) : step.stage === 'Responder' ? (
                  <Siren className="h-4 w-4" strokeWidth={1.8} />
                ) : step.stage === 'Continuidad' ? (
                  <Wifi className="h-4 w-4" strokeWidth={1.8} />
                ) : (
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                )}
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] opacity-70">{step.stage}</p>
              <h3 className="mt-2 text-xl font-light text-white">{step.title}</h3>
              <p className="mt-2 text-2xl font-light text-white">{step.metric}</p>
              <p className="mt-3 text-sm leading-6 text-white/64">{step.reading}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/38">Accion</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{step.action}</p>
              </div>
              <p className="mt-3 text-xs leading-5 text-white/45">{step.proof}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`rounded-[28px] border p-6 md:p-8 ${getScoreTone(boardReport.tone)}`}>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] opacity-70">{boardReport.title}</p>
            <h2 className="mt-3 text-3xl font-light text-white">{boardReport.verdict}</h2>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/45">{boardReport.periodLabel}</p>
            <p className="mt-5 text-base leading-8 text-white/70">{boardReport.outcome}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <InfoLine label="Riesgo principal" value={boardReport.risk} />
              <InfoLine label="Decision sugerida" value={boardReport.decision} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {boardReport.metrics.map((metric) => (
                <div key={metric.label} className={`rounded-2xl border p-4 ${getScoreTone(metric.tone)}`}>
                  <p className="text-xs uppercase tracking-[0.16em] opacity-70">{metric.label}</p>
                  <p className="mt-2 text-2xl font-light text-white">{metric.value}</p>
                  <p className="mt-2 text-xs leading-5 text-white/55">{metric.detail}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[24px] border border-white/10 bg-[#071524]/45 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/38">Evidencia para reunion</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {boardReport.proofPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" strokeWidth={1.8} />
                    <p className="text-sm leading-6 text-white/66">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_86%_0%,rgba(77,163,217,0.15),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.025))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Gobierno operativo</p>
            <h2 className="mt-2 text-2xl font-light text-white">La rutina que mantiene el sistema profesional</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              El portal no termina en mirar pantallas: ordena revisiones diarias, control semanal, mesa de decision,
              aprendizaje mensual y excepciones con responsable claro.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            cadencia / responsable / salida
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
          {governanceRituals.slice(0, 5).map((ritual) => (
            <div key={ritual.id} className={`rounded-[24px] border p-5 ${getScoreTone(ritual.tone)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{ritual.siteLabel}</p>
                  <h3 className="mt-3 text-xl font-light text-white">{ritual.title}</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-[#071524]/45 px-3 py-1 text-xs text-white/60">
                  {ritual.cadence}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/68">{ritual.question}</p>
              <div className="mt-5 grid gap-3">
                <InfoLine label="Responsable" value={ritual.owner} />
                <InfoLine label="Entrada" value={ritual.input} />
                <InfoLine label="Salida" value={ritual.output} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="acciones" className="scroll-mt-32 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025)),radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.15),transparent_30%)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Bandeja de acciones</p>
            <h2 className="mt-2 text-2xl font-light text-white">Lo que queda abierto hasta que alguien lo cierre</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Cada accion nace de un riesgo, decision o compromiso real: responsable, plazo, siguiente paso y criterio
              de cierre quedan visibles para operar sin perseguir informacion.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            {actionRegister.length} acciones priorizadas
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {actionRegister.slice(0, 6).map((action) => (
            <div key={action.id} className={`rounded-[24px] border p-5 ${getScoreTone(action.tone)}`}>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{action.siteLabel}</p>
                  <h3 className="mt-3 text-xl font-light text-white">{action.title}</h3>
                </div>
                <Badge className={getScoreTone(action.tone)}>{action.status}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/64">{action.why}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <InfoLine label="Responsable" value={action.owner} />
                <InfoLine label="Plazo" value={action.due} />
                <InfoLine label="Siguiente paso" value={action.nextStep} />
                <InfoLine label="Criterio de cierre" value={action.successCriteria} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.18),transparent_30%),radial-gradient(circle_at_92%_12%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.058),rgba(255,255,255,0.024))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Agenda semanal</p>
            <h2 className="mt-2 text-2xl font-light text-white">Decisiones que mejoran la seguridad de verdad</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Una agenda simple para conversar con gerencia u operacion: que decidir, que evidencia lo respalda,
              quien lo toma y que gana el cliente al cerrarlo.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            decision / beneficio / cierre
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {weeklyDecisionAgenda.slice(0, 6).map((item) => (
            <div key={item.id} className={`rounded-[24px] border p-5 ${getScoreTone(item.tone)}`}>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{item.siteLabel}</p>
                  <h3 className="mt-3 text-xl font-light text-white">{item.decision}</h3>
                </div>
                <Badge className={getScoreTone(item.tone)}>{item.priorityLabel}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/64">{item.customerValue}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <InfoLine label="Evidencia" value={item.evidence} />
                <InfoLine label="Responsable" value={item.owner} />
                <InfoLine label="Plazo" value={item.deadline} />
                <InfoLine label="Resultado esperado" value={item.expectedOutcome} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="evidencia" className="scroll-mt-32 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_90%_0%,rgba(77,163,217,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.025))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Trazabilidad cliente</p>
            <h2 className="mt-2 text-2xl font-light text-white">La historia que respalda cada decision</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Senal, evidencia, accion relacionada, estado y fecha quedan en una misma lectura para explicar decisiones
              sin reconstruir la operacion despues.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            evidencia / estado / fecha
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {traceabilityLedger.slice(0, 6).map((item) => (
            <div key={item.id} className={`rounded-[24px] border p-5 ${getScoreTone(item.tone)}`}>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{item.siteLabel}</p>
                  <h3 className="mt-3 text-xl font-light text-white">{item.title}</h3>
                </div>
                <Badge className={getScoreTone(item.tone)}>{item.status}</Badge>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <InfoLine label="Origen" value={item.source} />
                <InfoLine label="Evidencia" value={item.evidence} />
                <InfoLine label="Accion vinculada" value={item.decisionLink} />
                <InfoLine label="Fecha" value={formatDate(item.occurredAt)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Mapa de riesgo operativo</p>
            <h2 className="mt-2 text-2xl font-light text-white">Donde mirar, cuando mirar y que hacer</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Zonas, horarios sensibles y acciones activas se cruzan para mostrar los puntos donde la operacion exige
              mas criterio.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            zona / horario / accion
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {riskMap.slice(0, 4).map((item) => (
            <div key={item.id} className={`rounded-[24px] border p-5 ${getScoreTone(item.tone)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{item.siteLabel}</p>
                  <h3 className="mt-3 text-xl font-light text-white">{item.zone}</h3>
                </div>
                <Badge className={getScoreTone(item.tone)}>{item.window}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/64">{item.exposure}</p>
              <div className="mt-5 grid gap-3">
                <InfoLine label="Proteccion" value={item.protection} />
                <InfoLine label="Responsable" value={item.owner} />
                <InfoLine label="Accion" value={item.action} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.025)),radial-gradient(circle_at_15%_0%,rgba(77,163,217,0.15),transparent_30%)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Ventanas sensibles</p>
            <h2 className="mt-2 text-2xl font-light text-white">Cuando conviene mirar con mas criterio</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Eventos e incidentes se ordenan por horario para reforzar turnos, cierres y rondas sin convertir todo
              el dia en una alarma permanente.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            turnos / patrones / cierre
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sensitiveWindows.slice(0, 4).map((window) => (
            <div key={window.id} className={`rounded-[24px] border p-5 ${getScoreTone(window.tone)}`}>
              <p className="text-xs uppercase tracking-[0.18em] opacity-70">{window.siteLabel}</p>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-light text-white">{window.label}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/42">{window.range}</p>
                </div>
                <Badge className={getScoreTone(window.tone)}>{window.criticalCount > 0 ? 'critica' : window.incidentCount > 0 ? 'atencion' : 'normal'}</Badge>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-white/10 bg-[#071524]/45 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Eventos</p>
                  <p className="mt-1 text-lg font-light text-white">{window.eventCount}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#071524]/45 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Incid.</p>
                  <p className="mt-1 text-lg font-light text-white">{window.incidentCount}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#071524]/45 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Crit.</p>
                  <p className="mt-1 text-lg font-light text-white">{window.criticalCount}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/64">{window.summary}</p>
              <p className="mt-3 text-sm leading-6 text-white/74">{window.action}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_88%_0%,rgba(77,163,217,0.16),transparent_30%),rgba(255,255,255,0.045)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Plan de mejora</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que hacer para reducir riesgo y ruido</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              El portal convierte brechas de cobertura, servicio, evidencia y horarios en acciones priorizadas para
              mejorar la operacion sin agregar complejidad al cliente.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            mejora continua
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {improvementActions.slice(0, 4).map((action, index) => (
            <div key={action.id} className={`rounded-[24px] border p-5 ${getScoreTone(action.tone)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{action.siteLabel}</p>
                  <h3 className="mt-3 text-xl font-light text-white">{action.title}</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-[#071524]/45 px-3 py-1 text-xs text-white/60">
                  0{index + 1}
                </span>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/38">Por que</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{action.why}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/38">Siguiente paso</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{action.nextStep}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/38">Impacto</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{action.expectedImpact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.025)),radial-gradient(circle_at_10%_0%,rgba(77,163,217,0.15),transparent_30%)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Paquete de decision</p>
            <h2 className="mt-2 text-2xl font-light text-white">Lo que debe decidirse con evidencia</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Cada paquete resume decision, responsable, evidencia minima, momento recomendado e impacto esperado para
              reuniones operativas o gerenciales.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            decision / evidencia / responsable
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {decisionPackets.slice(0, 4).map((packet) => (
            <div key={packet.id} className={`rounded-[24px] border p-5 ${getScoreTone(packet.tone)}`}>
              <p className="text-xs uppercase tracking-[0.18em] opacity-70">{packet.siteLabel}</p>
              <h3 className="mt-3 text-xl font-light text-white">{packet.decision}</h3>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <InfoLine label="Responsable" value={packet.owner} />
                <InfoLine label="Momento" value={packet.timing} />
                <InfoLine label="Evidencia minima" value={packet.evidence} />
                <InfoLine label="Resultado esperado" value={packet.outcome} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_88%_0%,rgba(77,163,217,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Playbook de respuesta</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que hacer cuando algo cambia</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Respuesta por nivel: que activa la accion, que se hace primero, que se valida, cuando se escala y como
              se cierra sin perder evidencia.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            rutina / atencion / critico
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {responsePlaybook.slice(0, 6).map((item) => (
            <div key={item.id} className={`rounded-[24px] border p-5 ${getScoreTone(item.tone)}`}>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{item.siteLabel}</p>
                  <h3 className="mt-3 text-xl font-light text-white">{item.level}</h3>
                </div>
                <Badge className={getScoreTone(item.tone)}>{item.owner}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/64">{item.trigger}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <InfoLine label="Primero" value={item.firstMove} />
                <InfoLine label="Validar" value={item.verify} />
                <InfoLine label="Escalar" value={item.escalate} />
                <InfoLine label="Cerrar" value={item.close} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_16%_0%,rgba(77,163,217,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Traspaso de turno</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que debe saber el equipo antes de seguir</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Apertura, seguimiento, alerta y cierre quedan convertidos en una pauta simple para que el siguiente
              responsable no parta desde cero.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            apertura / alerta / cierre
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {shiftHandoff.slice(0, 4).map((item) => (
            <div key={item.id} className={`rounded-[24px] border p-5 ${getScoreTone(item.tone)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{item.siteLabel}</p>
                  <h3 className="mt-3 text-xl font-light text-white">{item.title}</h3>
                </div>
                <Badge className={getScoreTone(item.tone)}>{item.moment}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/64">{item.summary}</p>
              <div className="mt-5 space-y-2">
                {item.checklist.map((check) => (
                  <div key={check} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#071524]/45 p-3 text-sm leading-6 text-white/68">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" strokeWidth={1.8} />
                    <span>{check}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3">
                <InfoLine label="Ventana sensible" value={item.riskWindow} />
                <InfoLine label="Responsable" value={item.owner} />
                <InfoLine label="Salida esperada" value={item.output} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(77,163,217,0.16),transparent_30%),rgba(255,255,255,0.045)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Prioridad del dia</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que mirar primero para operar con calma</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              La plataforma ordena incidentes, continuidad, sensores y evidencia para que el cliente no pierda tiempo
              buscando donde empezar.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            {dailyPriorities.length} lecturas activas
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {dailyPriorities.map((priority, index) => (
            <div key={priority.id} className={`rounded-[24px] border p-5 ${getScoreTone(priority.tone)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{priority.siteLabel}</p>
                  <h3 className="mt-3 text-xl font-light text-white">{priority.title}</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-[#071524]/45 px-3 py-1 text-xs text-white/60">
                  0{index + 1}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/64">{priority.detail}</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/38">Accion recomendada</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{priority.action}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.025)),radial-gradient(circle_at_82%_0%,rgba(77,163,217,0.14),transparent_30%)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Cobertura operativa</p>
            <h2 className="mt-2 text-2xl font-light text-white">Zonas visibles, parciales y puntos ciegos</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Una lectura por zonas para saber donde hay respaldo suficiente, donde falta contexto y que espacio
              necesita atencion antes de que una alerta llegue tarde.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            camaras / sensores / avisos
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {coverageZones.map((zone) => (
            <div key={zone.id} className={`rounded-[24px] border p-5 ${getScoreTone(zone.tone)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">{zone.siteLabel}</p>
                  <h3 className="mt-3 text-xl font-light text-white">{zone.name}</h3>
                </div>
                <Badge className={getScoreTone(zone.tone)}>{zone.statusLabel}</Badge>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                <div className="rounded-xl border border-white/10 bg-[#071524]/45 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Score</p>
                  <p className="mt-1 text-lg font-light text-white">{zone.score}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#071524]/45 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Vistas</p>
                  <p className="mt-1 text-lg font-light text-white">{zone.cameraCount}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#071524]/45 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Senales</p>
                  <p className="mt-1 text-lg font-light text-white">{zone.sensorCount}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#071524]/45 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Avisos</p>
                  <p className="mt-1 text-lg font-light text-white">{zone.alertCount}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/64">{zone.summary}</p>
              <p className="mt-3 rounded-2xl border border-white/10 bg-[#071524]/45 p-4 text-sm leading-6 text-white/70">
                {zone.action}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_90%_0%,rgba(77,163,217,0.15),transparent_30%),rgba(255,255,255,0.04)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Compromisos operativos</p>
            <h2 className="mt-2 text-2xl font-light text-white">Servicio medible, no promesas sueltas</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Confirmacion, cierre, evidencia y continuidad quedan visibles para que el cliente entienda que esta
              bajo control y que requiere accion antes del cierre.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            respuesta / evidencia / cierre
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {serviceCommitments.slice(0, 4).map((commitment) => (
            <div key={commitment.id} className={`rounded-[24px] border p-5 ${getScoreTone(commitment.tone)}`}>
              <p className="text-xs uppercase tracking-[0.18em] opacity-70">{commitment.siteLabel}</p>
              <h3 className="mt-3 text-xl font-light text-white">{commitment.label}</h3>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/38">Objetivo</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">{commitment.target}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#071524]/45 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/38">Lectura actual</p>
                  <p className="mt-2 text-lg font-light text-white">{commitment.current}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/64">{commitment.summary}</p>
              <p className="mt-3 text-sm leading-6 text-white/74">{commitment.action}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025)),radial-gradient(circle_at_82%_0%,rgba(77,163,217,0.16),transparent_32%)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Salud por sitio</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que operacion esta mejor y cual necesita foco</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Una comparacion simple para decidir donde mirar primero: salud actual, fortaleza visible, punto de atencion
              y siguiente movimiento recomendado.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            {siteHealthRanking.length} sitios comparados
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {siteHealthRanking.map((item) => (
            <div key={item.id} className={`rounded-[24px] border p-5 ${getScoreTone(item.tone)}`}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">#{item.position} / {item.organizationName}</p>
                  <h3 className="mt-3 text-2xl font-light text-white">{item.siteLabel}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/64">{item.summary}</p>
                </div>
                <div className="min-w-24 rounded-2xl border border-white/10 bg-[#071524]/50 p-4 text-center">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">Salud</p>
                  <p className="mt-1 text-3xl font-light text-white">{item.score}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] opacity-70">{item.status}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <InfoLine label="Punto fuerte" value={item.strongestPoint} />
                <InfoLine label="Punto de atencion" value={item.attentionPoint} />
                <InfoLine label="Siguiente movimiento" value={item.nextMove} />
              </div>

              <Button asChild variant="outline" className="mt-5 w-fit rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10">
                <Link href={`/app/properties/${item.propertyId}`}>
                  Ver sitio
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-white/10 bg-[radial-gradient(circle_at_0%_0%,rgba(77,163,217,0.14),transparent_34%),rgba(255,255,255,0.045)] shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.8} />
              <CardTitle className="text-lg font-normal text-white">Centro de mando cliente</CardTitle>
            </div>
            <CardDescription className="text-white/55">
              Una lectura ejecutiva para operar seguridad, continuidad y evidencia sin ruido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-2xl border border-white/10 bg-[#0B1D30] p-5 text-sm leading-7 text-white/68">
              {primaryProfile.operatingPromise}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoLine label="Estado" value={continuityHasRisk ? 'Hay puntos para revisar antes del cierre.' : 'Operacion visible, conectada y sin incidentes abiertos.'} />
              <InfoLine label="Accion" value={continuityHasRisk ? primaryProfile.recommendedAttentionAction : primaryProfile.recommendedStableAction} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {primaryProfile.commandCenter.map((item) => (
            <div key={`${item.label}-${item.value}`} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/38">{item.label}</p>
              <h3 className="mt-3 text-2xl font-light text-white">{item.value}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{item.detail}</p>
            </div>
          ))}
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

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.16),transparent_28%),rgba(255,255,255,0.04)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Rutina de operacion</p>
            <h2 className="mt-2 text-2xl font-light text-white">Del primer vistazo al cierre con evidencia</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              La plataforma ordena la jornada en pasos simples: abrir, observar, escalar y cerrar. Asi el cliente sabe
              que hacer antes, durante y despues de cada alerta.
            </p>
          </div>
          <Badge className={continuityHasRisk ? 'border-amber-400/25 bg-amber-400/10 text-amber-100' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'}>
            {continuityHasRisk ? 'priorizar revision' : 'rutina estable'}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {primaryProfile.shiftFlow.map((step, index) => (
            <div key={`${step.label}-${step.moment}`} className="relative rounded-[22px] border border-white/10 bg-[#0B1D30] p-5">
              <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/38">
                0{index + 1}
              </span>
              <p className="text-xs uppercase tracking-[0.18em] text-[#9DD2F2]">{step.moment}</p>
              <h3 className="mt-3 text-xl font-light text-white">{step.label}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025)),radial-gradient(circle_at_90%_0%,rgba(77,163,217,0.14),transparent_30%)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Confianza operacional</p>
            <h2 className="mt-2 text-2xl font-light text-white">Profesional por dentro, simple por fuera</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              El cliente no necesita ver la tecnologia que sostiene la operacion: necesita privacidad, responsables claros,
              tiempos medibles y evidencia disponible cuando importa.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-white/5 text-white/58">
            roles / SLA / evidencia
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {primaryProfile.assurance.map((item) => (
            <div key={`${item.label}-${item.value}`} className="rounded-[22px] border border-white/10 bg-[#0B1D30] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">{item.label}</p>
              <h3 className="mt-3 text-xl font-light text-white">{item.value}</h3>
              <p className="mt-3 text-sm leading-6 text-white/56">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.8} />
              <CardTitle className="text-lg font-normal text-white">Protocolo de escalamiento</CardTitle>
            </div>
            <CardDescription className="text-white/55">
              Cuando algo cambia, el portal muestra criterio, responsable y respuesta esperada.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {primaryProfile.escalationMatrix.map((item) => (
              <div key={`${item.label}-${item.owner}`} className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#9DD2F2]">{item.label}</p>
                <p className="mt-3 text-sm leading-6 text-white/62">{item.trigger}</p>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/35">Responsable</p>
                  <p className="mt-1 text-sm text-white">{item.owner}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/55">{item.response}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[radial-gradient(circle_at_0%_0%,rgba(77,163,217,0.14),transparent_34%),rgba(255,255,255,0.045)] shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Paquete de evidencia</CardTitle>
            <CardDescription className="text-white/55">
              Cada incidente debe poder explicarse sin reconstruir la historia.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {primaryProfile.evidencePackage.map((item, index) => (
              <div key={`${item.label}-${index}`} className="flex gap-3 rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#4DA3D9]/25 bg-[#4DA3D9]/10 text-xs text-[#9DD2F2]">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm text-white">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-white/55">{item.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

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

      <section id="actividad" className="scroll-mt-32 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
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

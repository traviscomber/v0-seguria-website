import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileText,
  MapPin,
  Radar,
  ShieldAlert,
  Signal,
  Siren,
  Sparkles,
  Wifi,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CameraStreamControl } from '@/components/camera-stream-control'
import { getCurrentAuthSession } from '@/lib/auth-store'
import {
  getPortalActivityFeed,
  getPortalActionRegister,
  getPortalBoardReport,
  getPortalCoverageZones,
  getPortalDailyPriorities,
  getPortalDecisionPackets,
  getPortalDeviceBuckets,
  getPortalExecutiveBrief,
  getPortalGovernanceRituals,
  getPortalImprovementActions,
  getPortalMaturityScorecard,
  getPortalOperationalScore,
  getPortalOperationalFlow,
  getPortalRiskMap,
  getPortalSensorRisk,
  getPortalServiceCommitments,
  getPortalSensitiveWindows,
  getPortalSiteForUser,
  getPortalTraceabilityLedger,
  getPortalWeeklyDecisionAgenda,
  isOpenPortalIncident,
} from '@/lib/client-portal'

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
  if (status === 'operativo') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
  if (status === 'revision') return 'border-amber-400/30 bg-amber-400/10 text-amber-100'
  return 'border-rose-400/30 bg-rose-400/10 text-rose-100'
}

function getGroupTone(group: string) {
  if (group === 'camera') return 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100'
  if (group === 'sensor') return 'border-sky-400/25 bg-sky-400/10 text-sky-100'
  if (group === 'alert') return 'border-rose-400/25 bg-rose-400/10 text-rose-100'
  if (group === 'access') return 'border-amber-400/25 bg-amber-400/10 text-amber-100'
  return 'border-white/10 bg-white/5 text-white/70'
}

function groupLabel(group: string) {
  if (group === 'camera') return 'Camaras'
  if (group === 'sensor') return 'Sensores'
  if (group === 'alert') return 'Alertas'
  if (group === 'access') return 'Accesos'
  return 'Otros'
}

function getScoreTone(tone: 'ok' | 'warning' | 'critical') {
  if (tone === 'critical') return 'border-rose-400/25 bg-rose-400/10 text-rose-100'
  if (tone === 'warning') return 'border-amber-400/25 bg-amber-400/10 text-amber-100'
  return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params
  const session = await getCurrentAuthSession()
  if (!session || session.user.role !== 'client') {
    redirect(`/login?next=/app/properties/${propertyId}`)
  }

  const site = await getPortalSiteForUser(session.user, propertyId)
  if (!site) {
    notFound()
  }

  const activity = getPortalActivityFeed([site])
  const buckets = getPortalDeviceBuckets(site.devices)
  const cameraCount = site.cameraCount
  const sensorCount = site.sensorCount
  const accessCount = site.accessCount
  const activeCount = site.devices.filter((device) => device.estado === 'activo').length
  const sensorRisk = getPortalSensorRisk(site.devices)
  const openIncidents = site.incidents.filter(isOpenPortalIncident)
  const gatewayRisk = site.gatewayHealth.offline + site.gatewayHealth.degraded
  const operationalScore = getPortalOperationalScore([site])
  const maturityScorecard = getPortalMaturityScorecard([site])
  const operationalFlow = getPortalOperationalFlow([site])
  const boardReport = getPortalBoardReport([site])
  const governanceRituals = getPortalGovernanceRituals([site])
  const actionRegister = getPortalActionRegister([site])
  const traceabilityLedger = getPortalTraceabilityLedger([site])
  const weeklyDecisionAgenda = getPortalWeeklyDecisionAgenda([site])
  const riskMap = getPortalRiskMap([site])
  const dailyPriorities = getPortalDailyPriorities([site])
  const coverageZones = getPortalCoverageZones(site)
  const serviceCommitments = getPortalServiceCommitments([site])
  const executiveBrief = getPortalExecutiveBrief([site])
  const sensitiveWindows = getPortalSensitiveWindows([site])
  const improvementActions = getPortalImprovementActions([site])
  const decisionPackets = getPortalDecisionPackets([site])
  const recommendedAction = openIncidents.length > 0
    ? 'Atender el incidente abierto y confirmar recepcion.'
    : sensorRisk.critical > 0 || gatewayRisk > 0
      ? site.profile.recommendedAttentionAction
      : site.profile.recommendedStableAction

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(77,163,217,0.18),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(77,163,217,0.06)_0%,transparent_42%,rgba(255,255,255,0.03)_100%)]" />
        <div className="relative space-y-6">
          <Button asChild variant="ghost" className="w-fit rounded-full px-0 text-white/60 hover:bg-transparent hover:text-white">
            <Link href="/app">
              <ArrowLeft className="h-4 w-4" />
              Volver al portal
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={getStatusTone(site.status)}>{site.statusLabel}</Badge>
                <Badge variant="outline" className="border-white/10 bg-white/5 text-white/60">
                  {site.organizationName}
                </Badge>
              </div>

              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">{site.profile.eyebrow}</p>
                <h1 className="text-4xl font-light text-white text-balance md:text-5xl">{site.label}</h1>
                <p className="max-w-3xl text-base leading-7 text-white/65 md:text-lg">
                  {site.profile.headline}
                </p>
                <p className="max-w-3xl text-sm leading-7 text-white/55 md:text-base">
                  {site.profile.operatingPromise}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoTile label="Ubicacion" value={site.location} icon={MapPin} />
                <InfoTile label={site.profile.metricLabels.camera} value={cameraCount.toString()} icon={Camera} />
                <InfoTile label={site.profile.metricLabels.sensor} value={sensorCount.toString()} icon={Signal} />
                <InfoTile label={site.profile.metricLabels.access} value={accessCount.toString()} icon={Wifi} />
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#071524]/80 shadow-[0_20px_70px_rgba(0,0,0,0.26)] backdrop-blur">
              <div className="relative h-64 overflow-hidden border-b border-white/10">
                <img src={site.imageUrl} alt={site.imageAlt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,36,0.04),rgba(7,21,36,0.8))]" />
                <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/15 bg-[#071524]/75 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70">
                    {site.organizationName}
                  </span>
                  {site.imageIsRepresentative ? (
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-amber-100/80">
                      Imagen referencial
                    </span>
                  ) : null}
                </div>
                <a
                  href={site.imageCreditUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 rounded-full border border-white/10 bg-[#071524]/85 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-white/55 transition hover:text-white"
                >
                  {site.imageCredit}
                </a>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.8} />
                  <h2 className="text-lg font-normal text-white">Resumen rapido</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/55">{site.profile.summary}</p>
                <p className="mt-3 rounded-2xl border border-[#4DA3D9]/20 bg-[#4DA3D9]/10 p-4 text-sm leading-6 text-cyan-50/78">
                  {site.profile.integrationPromise}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <MiniMetric label="Dispositivos" value={site.deviceCount} />
                  <MiniMetric label="Activos" value={activeCount} />
                  <MiniMetric label="Documentos" value={site.documentCount} />
                  <MiniMetric label="Alertas" value={site.alertCount} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {site.profile.commandCenter.map((item) => (
          <div key={`${item.label}-${item.value}`} className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_0%_0%,rgba(77,163,217,0.13),transparent_34%),rgba(255,255,255,0.045)] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/38">{item.label}</p>
            <h2 className="mt-3 text-2xl font-light text-white">{item.value}</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className={`rounded-[28px] border p-6 md:p-7 ${getScoreTone(operationalScore.tone)}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-70">Indice del sitio</p>
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
              <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Lectura de prioridad</p>
              <h2 className="mt-2 text-2xl font-light text-white">Por que este sitio esta asi</h2>
            </div>
            <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
              accion clara
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
                    <ArrowLeft className="mt-0.5 h-4 w-4 shrink-0 rotate-180 text-[#9DD2F2]" strokeWidth={1.8} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.15),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Scorecard de madurez</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que tan madura esta la operacion de {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              La lectura resume visibilidad, respuesta, evidencia, gobierno y continuidad del sitio en una sola
              evaluacion.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            cinco pilares
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
            <h2 className="mt-2 text-2xl font-light text-white">Como opera la seguridad de {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              El sitio se lee como una secuencia simple: senal relevante, contexto suficiente, respuesta responsable,
              cierre auditable y continuidad visible.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            operacion completa
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
              <InfoTile label="Riesgo principal" value={boardReport.risk} icon={ShieldAlert} />
              <InfoTile label="Decision sugerida" value={boardReport.decision} icon={CheckCircle2} />
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
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" strokeWidth={1.8} />
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
            <h2 className="mt-2 text-2xl font-light text-white">La rutina de control de {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Cada revision tiene pregunta, entrada, salida y responsable. Asi la seguridad queda gobernada, no solo
              observada.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            cadencia del sitio
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
                <InfoTile label="Responsable" value={ritual.owner} icon={ShieldAlert} />
                <InfoTile label="Entrada" value={ritual.input} icon={FileText} />
                <InfoTile label="Salida" value={ritual.output} icon={CheckCircle2} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025)),radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.15),transparent_30%)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Bandeja de acciones</p>
            <h2 className="mt-2 text-2xl font-light text-white">Pendientes accionables de {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Riesgos, decisiones y mejoras quedan convertidos en trabajo concreto: responsable, plazo, siguiente paso
              y criterio de cierre.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            {actionRegister.length} acciones del sitio
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
                <InfoTile label="Responsable" value={action.owner} icon={ShieldAlert} />
                <InfoTile label="Plazo" value={action.due} icon={Siren} />
                <InfoTile label="Siguiente paso" value={action.nextStep} icon={FileText} />
                <InfoTile label="Criterio de cierre" value={action.successCriteria} icon={CheckCircle2} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.18),transparent_30%),radial-gradient(circle_at_92%_12%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.058),rgba(255,255,255,0.024))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Agenda semanal</p>
            <h2 className="mt-2 text-2xl font-light text-white">Decisiones que mejoran {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Una pauta breve para cerrar la semana con criterio: decision, evidencia, responsable, plazo y beneficio
              visible para la operacion.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            reunion semanal
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {weeklyDecisionAgenda.slice(0, 4).map((item) => (
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
                <InfoTile label="Evidencia" value={item.evidence} icon={FileText} />
                <InfoTile label="Responsable" value={item.owner} icon={ShieldAlert} />
                <InfoTile label="Plazo" value={item.deadline} icon={Siren} />
                <InfoTile label="Resultado esperado" value={item.expectedOutcome} icon={CheckCircle2} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_90%_0%,rgba(77,163,217,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.025))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Trazabilidad cliente</p>
            <h2 className="mt-2 text-2xl font-light text-white">Evidencia y decisiones de {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Cada senal relevante queda ligada a evidencia, accion, estado y fecha para explicar que se decidio y por
              que.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            historial explicable
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
                <InfoTile label="Origen" value={item.source} icon={ShieldAlert} />
                <InfoTile label="Evidencia" value={item.evidence} icon={FileText} />
                <InfoTile label="Accion vinculada" value={item.decisionLink} icon={CheckCircle2} />
                <InfoTile label="Fecha" value={formatDate(item.occurredAt)} icon={Siren} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Mapa de riesgo operativo</p>
            <h2 className="mt-2 text-2xl font-light text-white">Zonas y horarios sensibles de {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              La lectura cruza cobertura, actividad horaria y acciones abiertas para decidir donde concentrar la
              supervision.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            mapa del sitio
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
                <InfoTile label="Proteccion" value={item.protection} icon={ShieldAlert} />
                <InfoTile label="Responsable" value={item.owner} icon={Siren} />
                <InfoTile label="Accion" value={item.action} icon={CheckCircle2} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.025)),radial-gradient(circle_at_15%_0%,rgba(77,163,217,0.15),transparent_30%)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Ventanas sensibles</p>
            <h2 className="mt-2 text-2xl font-light text-white">Horarios que conviene mirar en {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              La lectura separa apertura, operacion diaria, cierre y noche para orientar turnos, rondas y evidencia
              con criterio operativo.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            patron por turno
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
            <h2 className="mt-2 text-2xl font-light text-white">Como mejorar la operacion de {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Acciones priorizadas para cerrar brechas, mejorar evidencia y reducir ruido operativo sin cambiar la
              forma en que el cliente entiende su seguridad.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            proxima mejora
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
            <h2 className="mt-2 text-2xl font-light text-white">Decisiones pendientes de {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Una sintesis para revisar decisiones con evidencia minima, responsable sugerido y resultado esperado
              antes de cerrar la reunion operativa.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            criterio de cierre
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {decisionPackets.slice(0, 4).map((packet) => (
            <div key={packet.id} className={`rounded-[24px] border p-5 ${getScoreTone(packet.tone)}`}>
              <p className="text-xs uppercase tracking-[0.18em] opacity-70">{packet.siteLabel}</p>
              <h3 className="mt-3 text-xl font-light text-white">{packet.decision}</h3>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <InfoTile label="Responsable" value={packet.owner} icon={ShieldAlert} />
                <InfoTile label="Momento" value={packet.timing} icon={Siren} />
                <InfoTile label="Evidencia minima" value={packet.evidence} icon={FileText} />
                <InfoTile label="Resultado esperado" value={packet.outcome} icon={CheckCircle2} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(77,163,217,0.16),transparent_30%),rgba(255,255,255,0.045)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Prioridad del dia</p>
            <h2 className="mt-2 text-2xl font-light text-white">Que revisar primero en {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Una lectura corta para decidir si el equipo mantiene rutina, revisa una senal o escala una situacion
              antes del cierre operativo.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            prioridad por impacto
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {dailyPriorities.slice(0, 3).map((priority, index) => (
            <div key={priority.id} className={`rounded-[24px] border p-5 ${getScoreTone(priority.tone)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">Lectura {index + 1}</p>
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
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Cobertura del sitio</p>
            <h2 className="mt-2 text-2xl font-light text-white">Donde esta protegido y donde falta contexto</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Cada zona combina vistas, sensores, avisos y recencia para mostrar si la operacion esta cubierta,
              parcial o con un punto ciego que conviene resolver.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            {coverageZones.length} zonas leidas
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {coverageZones.map((zone) => (
            <div key={zone.id} className={`rounded-[24px] border p-5 ${getScoreTone(zone.tone)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] opacity-70">Zona</p>
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
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Compromisos del sitio</p>
            <h2 className="mt-2 text-2xl font-light text-white">Respuesta, evidencia y continuidad de {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              La operacion se mide por tiempos visibles, incidentes cerrados con criterio y evidencia lista para
              explicar cada decision importante.
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-white/10 bg-[#0B1D30] text-white/58">
            servicio medible
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

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025)),radial-gradient(circle_at_90%_0%,rgba(77,163,217,0.14),transparent_30%)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Confianza del sitio</p>
            <h2 className="mt-2 text-2xl font-light text-white">Control que se puede explicar y auditar</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Cada senal debe servir para decidir, no para acumular pantallas. Esta vista ordena privacidad, roles,
              tiempos y evidencia segun la realidad de {site.label}.
            </p>
          </div>
          <Badge className={site.report.overdueConfirmations > 0 ? 'border-rose-400/25 bg-rose-400/10 text-rose-100' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'}>
            {site.report.overdueConfirmations > 0 ? 'Revisar SLA' : 'SLA visible'}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {site.profile.assurance.map((item) => (
            <div key={`${item.label}-${item.value}`} className="rounded-[22px] border border-white/10 bg-[#0B1D30] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">{item.label}</p>
              <h3 className="mt-3 text-xl font-light text-white">{item.value}</h3>
              <p className="mt-3 text-sm leading-6 text-white/56">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(77,163,217,0.16),transparent_28%),rgba(255,255,255,0.04)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Bitacora de turno</p>
            <h2 className="mt-2 text-2xl font-light text-white">Una forma simple de operar {site.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Cada turno queda guiado por una secuencia clara: abrir la operacion, observar cambios, responder con
              evidencia y cerrar con aprendizaje.
            </p>
          </div>
          <Badge className={openIncidents.length > 0 || site.alertCount > 0 ? 'border-amber-400/25 bg-amber-400/10 text-amber-100' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'}>
            {openIncidents.length > 0 || site.alertCount > 0 ? 'turno con atencion' : 'turno estable'}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          {site.profile.shiftFlow.map((step, index) => (
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

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Radar className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.8} />
              <CardTitle className="text-lg font-normal text-white">Estado de proteccion</CardTitle>
            </div>
            <CardDescription className="text-white/55">Lo que importa para operar este sitio hoy.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <RiskTile
              label="Continuidad"
              value={gatewayRisk > 0 ? 'Atencion' : site.gatewayHealth.total > 0 ? 'Conectada' : 'Pendiente'}
              detail={`${site.gatewayHealth.online} conexiones activas, ${gatewayRisk} con revision.`}
              tone={gatewayRisk > 0 ? 'warning' : 'ok'}
            />
            <RiskTile
              label="Sensores"
              value={`${sensorRisk.stable + sensorRisk.attention + sensorRisk.critical}`}
              detail={`${sensorRisk.stable} estables, ${sensorRisk.attention} en revision, ${sensorRisk.critical} criticos.`}
              tone={sensorRisk.critical > 0 ? 'critical' : sensorRisk.attention > 0 ? 'warning' : 'ok'}
            />
            <RiskTile
              label="Incidentes"
              value={openIncidents.length.toString()}
              detail={openIncidents.length > 0 ? 'Hay seguimiento activo en este sitio.' : 'Sin incidentes abiertos.'}
              tone={openIncidents.some((incident) => incident.severity === 'critical') ? 'critical' : openIncidents.length > 0 ? 'warning' : 'ok'}
            />
            <RiskTile label="Accion recomendada" value="Ahora" detail={recommendedAction} tone={openIncidents.length > 0 ? 'warning' : 'ok'} />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.8} />
              <CardTitle className="text-lg font-normal text-white">Incidentes del sitio</CardTitle>
            </div>
            <CardDescription className="text-white/55">Alertas convertidas en seguimiento operativo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {openIncidents.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">
                No hay incidentes abiertos en esta propiedad.
              </p>
            ) : (
              openIncidents.map((incident) => (
                <div key={incident.id} className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white">{incident.title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/55">{incident.description || 'Seguimiento activo sin detalle adicional.'}</p>
                    </div>
                    <Badge className={incident.severity === 'critical' ? 'border-rose-400/25 bg-rose-400/10 text-rose-100' : 'border-amber-400/25 bg-amber-400/10 text-amber-100'}>
                      {incident.statusLabel}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/35">Senales asociadas</p>
                      {incident.relatedEvents.length === 0 ? (
                        <p className="mt-3 text-sm leading-6 text-white/50">Sin eventos correlacionados publicados para el cliente.</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {incident.relatedEvents.slice(0, 3).map((event) => (
                            <div key={event.id} className="flex items-start gap-2 rounded-lg bg-[#071524]/80 p-3">
                              <ShieldAlert className={`mt-0.5 h-4 w-4 shrink-0 ${event.severity === 'critical' ? 'text-rose-200' : event.severity === 'warning' ? 'text-amber-200' : 'text-[#9DD2F2]'}`} strokeWidth={1.7} />
                              <div>
                                <p className="text-sm text-white/80">{event.title}</p>
                                <p className="mt-1 text-xs text-white/40">{formatDate(event.occurredAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/35">Evidencia visual</p>
                      {incident.evidence.length === 0 ? (
                        <p className="mt-3 text-sm leading-6 text-white/50">Sin capturas asociadas en la ventana operativa.</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {incident.evidence.map((evidence) => (
                            <div key={evidence.id} className="flex items-start gap-2 rounded-lg bg-[#071524]/80 p-3">
                              <Camera className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" strokeWidth={1.7} />
                              <div>
                                <p className="text-sm text-white/80">{evidence.title}</p>
                                <p className="mt-1 text-xs text-white/40">
                                  {formatDate(evidence.capturedAt)} - {evidence.pinned ? 'Fijada al incidente' : 'Asociada por actividad cercana'}
                                </p>
                                {evidence.note ? <p className="mt-2 text-xs leading-5 text-white/50">{evidence.note}</p> : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-white/40">Creado {formatDate(incident.createdAt)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.8} />
              <CardTitle className="text-lg font-normal text-white">Criterios de escalamiento</CardTitle>
            </div>
            <CardDescription className="text-white/55">
              Reglas simples para decidir cuando mirar, cuando avisar y cuando cerrar.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {site.profile.escalationMatrix.map((item) => (
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
            <CardTitle className="text-lg font-normal text-white">Paquete de cierre</CardTitle>
            <CardDescription className="text-white/55">
              Lo minimo que debe quedar respaldado para explicar una decision.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {site.profile.evidencePackage.map((item, index) => (
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

      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_86%_0%,rgba(77,163,217,0.13),transparent_30%),rgba(255,255,255,0.04)] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Reporte del sitio</p>
            <h2 className="mt-2 text-2xl font-light text-white">Actividad, respuesta y cierre</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Resumen operacional para entender que paso hoy y como se esta respondiendo durante el mes.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {site.profile.focusAreas.map((area) => (
                <span key={area} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/58">
                  {area}
                </span>
              ))}
            </div>
          </div>
          <Badge className={site.report.overdueConfirmations > 0 ? 'border-rose-400/25 bg-rose-400/10 text-rose-100' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'}>
            {site.report.overdueConfirmations > 0 ? 'Confirmaciones vencidas' : 'Confirmaciones al dia'}
          </Badge>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <ReportTile label="Eventos hoy" value={site.report.eventsToday.toString()} />
          <ReportTile label="Criticos hoy" value={site.report.criticalEventsToday.toString()} tone={site.report.criticalEventsToday > 0 ? 'critical' : 'default'} />
          <ReportTile label="Incidentes mes" value={site.report.incidentsThisMonth.toString()} />
          <ReportTile label="Resueltos mes" value={site.report.resolvedThisMonth.toString()} />
          <ReportTile label="Confirmacion" value={formatDuration(site.report.averageConfirmationMinutes, 'min')} />
          <ReportTile label="Resolucion" value={formatDuration(site.report.averageResolutionHours, 'h')} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Equipos del sitio</CardTitle>
            <CardDescription className="text-white/55">
              Equipos agrupados por tipo para entender la operacion de un vistazo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {buckets.map((bucket) => (
              <div key={bucket.key} className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white">{groupLabel(bucket.key)}</p>
                    <p className="mt-1 text-sm text-white/45">
                      {bucket.count} {bucket.count === 1 ? 'equipo' : 'equipos'}
                    </p>
                  </div>
                  <Badge className={getGroupTone(bucket.key)}>{bucket.count}</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {bucket.devices.slice(0, 4).map((device) => (
                    <div key={device.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white">{device.displayName || device.marca || 'Equipo'}</p>
                          <p className="mt-1 text-xs text-white/45">{device.ubicacionDescripcion || 'Sin ubicacion'}</p>
                        </div>
                        <Badge
                          className={
                            device.estado === 'activo'
                              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                              : device.estado === 'mantencion'
                                ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
                                : 'border-rose-400/30 bg-rose-400/10 text-rose-100'
                          }
                        >
                          {device.estado === 'activo' ? 'Activo' : device.estado === 'mantencion' ? 'Revision' : 'Alerta'}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-white/60">{device.notas || 'Sin notas'}</p>
                      {bucket.key === 'camera' && <CameraStreamControl deviceId={device.id} />}
                    </div>
                  ))}
                  {bucket.count === 0 && <p className="text-sm text-white/45">Sin equipos cargados.</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-normal text-white">Evidencia y documentos</CardTitle>
              <CardDescription className="text-white/55">Capturas, reportes y material seguro del sitio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {site.documents.length === 0 ? (
                <p className="py-6 text-sm text-white/55">No hay evidencia publicada todavia.</p>
              ) : (
                site.documents.map((document) => (
                  <div key={document.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
                      <FileText className="h-4 w-4" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white">{document.titulo}</p>
                      <p className="mt-1 text-sm text-white/55">{document.archivoNombre || document.autor}</p>
                    </div>
                    <p className="whitespace-nowrap text-xs text-white/40">{formatDate(document.fechaActualizacion)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-normal text-white">Siguiente paso</CardTitle>
              <CardDescription className="text-white/55">Lo que conviene revisar primero.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {site.alertCount > 0 ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                  {site.profile.recommendedAttentionAction}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                  {site.profile.recommendedStableAction}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {site.profile.responsePlan.map((step) => (
                  <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" strokeWidth={1.8} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Actividad reciente</CardTitle>
            <CardDescription className="text-white/55">Ultimos cambios visibles del sitio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <p className="py-6 text-sm text-white/55">Sin actividad reciente para este sitio.</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
                    {item.kind === 'event' ? (
                      <ShieldAlert className="h-4 w-4" strokeWidth={1.8} />
                    ) : item.kind === 'device' ? (
                      item.status === 'falla' ? (
                        <ShieldAlert className="h-4 w-4" strokeWidth={1.8} />
                      ) : (
                        <Wifi className="h-4 w-4" strokeWidth={1.8} />
                      )
                    ) : (
                      <FileText className="h-4 w-4" strokeWidth={1.8} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-white">{item.title}</p>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-white/60">
                        {item.kind === 'event' ? 'Evento' : item.kind === 'device' ? 'Equipo' : 'Documento'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-white/55">{item.detail}</p>
                  </div>
                  <p className="whitespace-nowrap text-xs text-white/40">{formatDate(item.at)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Lectura del sitio</CardTitle>
            <CardDescription className="text-white/55">
              Lo que esta operacion necesita entender en segundos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              site.profile.summary,
              site.profile.integrationPromise,
              `${site.profile.metricLabels.camera}, ${site.profile.metricLabels.sensor.toLowerCase()} y ${site.profile.metricLabels.access.toLowerCase()} agrupados con evidencia.`,
              'Alertas, incidentes y documentos convertidos en decisiones simples.',
            ].map((text) => (
              <div key={text} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" strokeWidth={1.8} />
                <span>{text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function InfoTile({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof MapPin
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
          <p className="mt-1 text-sm text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 text-2xl font-light text-white">{value}</p>
    </div>
  )
}

function ReportTile({
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

function RiskTile({
  label,
  value,
  detail,
  tone,
}: {
  label: string
  value: string
  detail: string
  tone: 'ok' | 'warning' | 'critical'
}) {
  const className =
    tone === 'critical'
      ? 'border-rose-400/25 bg-rose-400/10 text-rose-100'
      : tone === 'warning'
        ? 'border-amber-400/25 bg-amber-400/10 text-amber-100'
        : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'

  return (
    <div className={`rounded-2xl border p-5 ${className}`}>
      <p className="text-xs uppercase tracking-[0.18em] opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-light">{value}</p>
      <p className="mt-2 text-sm leading-6 opacity-75">{detail}</p>
    </div>
  )
}

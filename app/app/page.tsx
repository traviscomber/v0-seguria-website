import { Cpu, ScanSearch, ShieldCheck, WifiOff } from 'lucide-react'
import { redirect } from 'next/navigation'
import {
  DashboardActivity,
  DashboardAttention,
  DashboardCameras,
  DashboardHero,
  DashboardProperties,
  DashboardStats,
  DashboardSupport,
} from '@/components/portal/dashboard'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { buildClientDashboardView } from '@/lib/client-portal/dashboard-view'
import { getPortalDeviceLabel } from '@/lib/client-portal/presentation'
import { getClientTheme } from '@/lib/client-theme'

export default async function ClientAppPage() {
  const session = await getCurrentAuthSession()

  if (!session || session.user.role !== 'client') {
    redirect('/login?next=/app')
  }

  const model = await buildClientDashboardView(session.user)
  const organizationIdentifiers = model.sites.flatMap((site) => [
    site.organizationName,
    site.name,
    site.propertyId,
  ])
  const theme = getClientTheme(...session.user.organizationIds, ...organizationIdentifiers)
  const primaryImage = model.sites.find((site) => Boolean(site.imageUrl))?.imageUrl
  const firstIncident = model.incidents[0]
  const firstAlert = model.alerts[0]
  const priority = firstIncident
    ? {
        title: firstIncident.incident.title || firstIncident.incident.type || 'Incidente abierto',
        location: firstIncident.site.label || firstIncident.site.location || firstIncident.site.name || theme.vocabulary.properties,
        href: `/app/properties/${firstIncident.site.propertyId}`,
      }
    : firstAlert
      ? {
          title: getPortalDeviceLabel(firstAlert.device) || 'Equipo con alerta',
          location: firstAlert.site.label || firstAlert.site.location || firstAlert.site.name || theme.vocabulary.properties,
          href: `/app/properties/${firstAlert.site.propertyId}`,
        }
      : null

  return (
    <div
      className="relative -mx-4 min-h-screen overflow-hidden px-4 pb-12 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ backgroundColor: theme.pageBackground }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-fixed bg-center opacity-[0.04]"
        style={{ backgroundImage: `url('${theme.backgroundImage}')` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30" />

      <div className="relative z-10 space-y-12 pt-4">
        <section id="control" className="scroll-mt-24 space-y-4" aria-label="Centro de control operacional">
          <DashboardHero
            userName={session.user.name}
            attentionRequired={model.attentionRequired}
            overallStatus={model.overallStatus}
            theme={theme}
            siteCount={model.sites.length}
            imageUrl={primaryImage}
            priority={priority}
          />
          <DashboardStats
            totals={model.totals}
            sites={model.sites}
            alerts={model.alerts}
            incidents={model.incidents}
            theme={theme}
          />
        </section>

        <section id="infraestructura" className="scroll-mt-24 space-y-8" aria-label="Cámaras, sensores e infraestructura">
          <DashboardProperties sites={model.sites} theme={theme} />
          <DashboardCameras cameras={model.cameras} theme={theme} />
        </section>

        <section id="incidentes" className="scroll-mt-24" aria-label="Alertas e incidentes">
          <DashboardAttention incidents={model.incidents} alerts={model.alerts} theme={theme} />
        </section>

        <section id="evidencia" className="scroll-mt-24" aria-label="Evidencia y trazabilidad">
          <div className="mx-auto w-full max-w-5xl space-y-4">
            <div className="space-y-1">
              <p className={`text-xs uppercase tracking-[0.22em] ${theme.accentTextClass}`}>04 · Evidencia y video seguro</p>
              <h2 className="text-2xl font-normal tracking-tight text-white">Actividad y evidencia con contexto operacional</h2>
              <p className="max-w-3xl text-sm leading-6 text-white/55">
                La plataforma conserva actividad reciente, incidentes y evidencia vinculados a la propiedad y operación correctas. Las capturas privadas y el acceso a video se resuelven detrás de contratos autenticados; las credenciales de origen no se exponen al navegador.
              </p>
            </div>
            <DashboardActivity activity={model.activity} theme={theme} />
          </div>
        </section>

        <section id="vision" className="scroll-mt-24" aria-label="Inteligencia visual">
          <article className={`overflow-hidden rounded-[20px] border border-white/10 ${theme.cardClass}`}>
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-6 sm:p-8">
                <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] ${theme.accentTextClass}`}>
                  <ScanSearch className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                </div>
                <p className={`text-xs uppercase tracking-[0.22em] ${theme.accentTextClass}`}>05 · Inteligencia visual</p>
                <h2 className="mt-2 max-w-2xl text-3xl font-normal tracking-tight text-white">IA aplicada a evidencia, con revisión humana y control de acceso</h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/58">
                  SegurIA utiliza motores de N3uralia para analizar evidencia visual, diagnosticar calidad y enriquecer la operación. Los resultados de IA son derivados y revisables: no reemplazan silenciosamente la verdad operacional ni el criterio humano.
                </p>
              </div>
              <div className="grid border-t border-white/10 lg:border-l lg:border-t-0 sm:grid-cols-2 lg:grid-cols-1">
                <div className="flex gap-4 p-6">
                  <ShieldCheck className={`mt-0.5 h-5 w-5 shrink-0 ${theme.accentTextClass}`} strokeWidth={1.7} aria-hidden="true" />
                  <div>
                    <p className="text-sm text-white">Ownership explícito por operación</p>
                    <p className="mt-1 text-xs leading-5 text-white/48">Cámaras, inferencias y permisos se resuelven por `operation_id`, con aislamiento entre operaciones.</p>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-white/10 p-6 sm:border-l sm:border-t-0 lg:border-l-0 lg:border-t">
                  <ScanSearch className={`mt-0.5 h-5 w-5 shrink-0 ${theme.accentTextClass}`} strokeWidth={1.7} aria-hidden="true" />
                  <div>
                    <p className="text-sm text-white">Calidad, clasificación y revisión</p>
                    <p className="mt-1 text-xs leading-5 text-white/48">Diagnóstico de evidencia, clasificación asistida y estados de revisión humana sin inventar información ausente.</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section id="edge" className="scroll-mt-24" aria-label="Edge local y resiliencia offline">
          <article className={`overflow-hidden rounded-[20px] border border-white/10 ${theme.cardClass}`}>
            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="p-6 sm:p-8">
                <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] ${theme.accentTextClass}`}>
                  <Cpu className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                </div>
                <p className={`text-xs uppercase tracking-[0.22em] ${theme.accentTextClass}`}>06 · Edge local</p>
                <h2 className="mt-2 text-3xl font-normal tracking-tight text-white">Procesar cerca del lugar y sincronizar solo lo necesario</h2>
                <p className="mt-4 text-sm leading-6 text-white/58">
                  El agente local trabaja con RTSP dentro de la red, detecta movimiento, captura una ráfaga, filtra calidad y duplicados, y envía la mejor fotografía mediante el gateway autenticado. El video continuo permanece en la LAN.
                </p>
              </div>
              <div className="grid border-t border-white/10 sm:grid-cols-2 lg:border-l lg:border-t-0">
                <div className="flex gap-4 p-6">
                  <Cpu className={`mt-0.5 h-5 w-5 shrink-0 ${theme.accentTextClass}`} strokeWidth={1.7} aria-hidden="true" />
                  <div>
                    <p className="text-sm text-white">Photo-first</p>
                    <p className="mt-1 text-xs leading-5 text-white/48">Motion gate, burst corto, selección del mejor frame y deduplicación antes de subir evidencia.</p>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-white/10 p-6 sm:border-l sm:border-t-0">
                  <WifiOff className={`mt-0.5 h-5 w-5 shrink-0 ${theme.accentTextClass}`} strokeWidth={1.7} aria-hidden="true" />
                  <div>
                    <p className="text-sm text-white">Resiliencia offline</p>
                    <p className="mt-1 text-xs leading-5 text-white/48">Si Internet cae, la evidencia queda en spool local y se reintenta cuando la conectividad vuelve.</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <div className="mx-auto mt-8 w-full max-w-5xl">
            <DashboardSupport theme={theme} />
          </div>
        </section>
      </div>
    </div>
  )
}

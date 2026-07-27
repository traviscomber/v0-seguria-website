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
  const theme = getClientTheme(...session.user.clientIds, ...organizationIdentifiers)
  const primaryImage = model.sites.find((site) => Boolean(site.imageUrl))?.imageUrl

  return (
    <div
      className="relative -mx-4 min-h-screen overflow-hidden px-4 pb-12 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ backgroundColor: theme.pageBackground }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-fixed bg-center opacity-[0.055]"
        style={{ backgroundImage: `url('${theme.backgroundImage}')` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/35" />

      <div className="relative z-10 space-y-8 pt-4">
        <DashboardHero
          userName={session.user.name}
          attentionRequired={model.attentionRequired}
          overallStatus={model.overallStatus}
          theme={theme}
          siteCount={model.sites.length}
          imageUrl={primaryImage}
        />

        <DashboardStats
          totals={model.totals}
          sites={model.sites}
          alerts={model.alerts}
          incidents={model.incidents}
          theme={theme}
        />

        <section aria-label={theme.vocabulary.properties}>
          <DashboardProperties sites={model.sites} theme={theme} />
        </section>

        <section aria-label={`Prioridades de ${theme.vocabulary.operation}`}>
          <DashboardAttention incidents={model.incidents} alerts={model.alerts} theme={theme} />
        </section>

        <section aria-label="Vigilancia">
          <DashboardCameras cameras={model.cameras} theme={theme} />
        </section>

        <section id="actividad" className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <DashboardActivity activity={model.activity} theme={theme} />
          <DashboardSupport />
        </section>
      </div>
    </div>
  )
}

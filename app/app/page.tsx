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

export default async function ClientAppPage() {
  const session = await getCurrentAuthSession()

  if (!session || session.user.role !== 'client') {
    redirect('/login?next=/app')
  }

  const model = await buildClientDashboardView(session.user)

  return (
    <div className="space-y-8 pb-12">
      <DashboardHero
        userName={session.user.name}
        attentionRequired={model.attentionRequired}
        overallStatus={model.overallStatus}
      />
      <DashboardStats
        totals={model.totals}
        sites={model.sites}
        alerts={model.alerts}
        incidents={model.incidents}
      />
      <DashboardProperties sites={model.sites} />
      <DashboardAttention incidents={model.incidents} alerts={model.alerts} />
      <DashboardCameras cameras={model.cameras} />
      <section id="actividad" className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardActivity activity={model.activity} />
        <DashboardSupport />
      </section>
    </div>
  )
}

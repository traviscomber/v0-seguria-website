import { redirect } from 'next/navigation'
import { ClientPortalShell } from '@/components/client-portal-shell'
import { PortalRealtimeRefresh } from '@/components/portal-realtime-refresh'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { buildClientDashboardView } from '@/lib/client-portal/dashboard-view'
import { getClientTheme } from '@/lib/client-theme'

export default async function ClientAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCurrentAuthSession()
  if (!session) {
    redirect('/login?next=/app')
  }

  if (session.user.role !== 'client') {
    redirect('/admin')
  }

  const model = await buildClientDashboardView(session.user)
  const organizationIdentifiers = model.sites.flatMap((site) => [
    site.organizationName,
    site.name,
    site.propertyId,
  ])
  const theme = getClientTheme(...session.user.clientIds, ...organizationIdentifiers)

  return (
    <ClientPortalShell
      userName={session.user.name}
      userRole={session.user.role}
      theme={theme}
    >
      <PortalRealtimeRefresh organizationIds={session.user.clientIds} />
      {children}
    </ClientPortalShell>
  )
}

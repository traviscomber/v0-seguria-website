import { redirect } from 'next/navigation'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { ClientPortalShell } from '@/components/client-portal-shell'
import { PortalRealtimeRefresh } from '@/components/portal-realtime-refresh'

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

  return (
    <ClientPortalShell userName={session.user.name} userRole={session.user.role}>
      <PortalRealtimeRefresh organizationIds={session.user.clientIds} />
      {children}
    </ClientPortalShell>
  )
}

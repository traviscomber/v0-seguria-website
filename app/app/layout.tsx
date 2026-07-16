import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthSessionFromToken } from '@/lib/auth-store'
import { ClientPortalShell } from '@/components/client-portal-shell'

export default async function ClientAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('seguria_session')?.value || null

  if (!token) {
    redirect('/login?next=/app')
  }

  const session = await getAuthSessionFromToken(token)
  if (!session) {
    redirect('/login?next=/app')
  }

  if (session.user.role !== 'client') {
    redirect('/admin')
  }

  return (
    <ClientPortalShell userName={session.user.name} userRole={session.user.role}>
      {children}
    </ClientPortalShell>
  )
}

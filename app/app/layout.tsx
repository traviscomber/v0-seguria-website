import { redirect } from 'next/navigation'
import { getCurrentAuthSession } from '@/lib/auth-store'

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

  return <>{children}</>
}

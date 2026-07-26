import { redirect } from 'next/navigation'
import { ProposalBuilder } from '@/components/admin/proposals/proposal-builder'
import { getCurrentAuthSession } from '@/lib/auth-store'

export const dynamic = 'force-dynamic'

export default async function NewProposalPage() {
  const auth = await getCurrentAuthSession()
  if (!auth) redirect('/login?next=/admin/propuestas/nueva')
  if (auth.user.role !== 'admin') redirect(auth.user.role === 'client' ? '/app' : '/admin')

  return <ProposalBuilder />
}

import { redirect } from 'next/navigation'
import { ProposalBuilder } from '@/components/admin/proposals/proposal-builder'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type NewProposalPageProps = {
  searchParams: Promise<{ lead?: string }>
}

export default async function NewProposalPage({ searchParams }: NewProposalPageProps) {
  const auth = await getCurrentAuthSession()
  if (!auth) redirect('/login?next=/admin/propuestas/nueva')
  if (auth.user.role !== 'admin') redirect(auth.user.role === 'client' ? '/app' : '/admin')

  const { lead: leadId } = await searchParams
  let initialClientName = ''
  let initialContext = ''

  if (leadId) {
    const supabase = createSupabaseAdminClient()
    if (supabase) {
      const { data } = await supabase
        .from('leads')
        .select('name,property_type,message')
        .eq('id', leadId)
        .maybeSingle()

      if (data) {
        initialClientName = data.name || ''
        initialContext = [data.property_type, data.message].filter(Boolean).join('\n\n')
      }
    }
  }

  return (
    <ProposalBuilder
      initialClientName={initialClientName}
      initialContext={initialContext}
      leadId={leadId}
    />
  )
}

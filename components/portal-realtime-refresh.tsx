'use client'

import { startTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

export function PortalRealtimeRefresh({ organizationIds }: { organizationIds: string[] }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    if (!supabase || organizationIds.length === 0) return

    const refresh = () => startTransition(() => router.refresh())
    const channels = organizationIds.map((organizationId) =>
      supabase
        .channel(`portal:${organizationId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'events', filter: `organization_id=eq.${organizationId}` },
          refresh
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'entity_states', filter: `organization_id=eq.${organizationId}` },
          refresh
        )
        .subscribe()
    )

    return () => {
      channels.forEach((channel) => {
        void supabase.removeChannel(channel)
      })
    }
  }, [organizationIds, router])

  return null
}

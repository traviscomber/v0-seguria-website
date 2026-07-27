'use server'

import { revalidatePath } from 'next/cache'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { resolveWildlifeAuthorizationContext } from '@/lib/wildlife/authorization'

export async function reviewWildlifeObservation(formData: FormData) {
  const observationId = String(formData.get('observation_id') || '')
  const siteId = String(formData.get('site_id') || '')
  const decision = String(formData.get('decision') || '')
  const correctedCommonName = String(formData.get('corrected_common_name') || '').trim() || null
  const correctedScientificName = String(formData.get('corrected_scientific_name') || '').trim() || null
  const notes = String(formData.get('notes') || '').trim() || null

  if (!observationId || !siteId || !['validated', 'corrected', 'rejected'].includes(decision)) {
    throw new Error('Invalid Wildlife review request.')
  }

  const sessionClient = await createSupabaseServerClient()
  if (!sessionClient) throw new Error('Supabase is not configured.')

  const authorization = await resolveWildlifeAuthorizationContext(sessionClient, {
    siteId,
    capability: 'review:write',
  })

  const admin = createSupabaseAdminClient()
  if (!admin) throw new Error('Supabase admin is not configured.')

  const { error } = await admin.rpc('review_wildlife_observation', {
    p_observation_id: observationId,
    p_organization_id: authorization.organizationId,
    p_reviewer_user_id: authorization.userId,
    p_decision: decision,
    p_corrected_common_name: correctedCommonName,
    p_corrected_scientific_name: correctedScientificName,
    p_notes: notes,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/wildlife/review')
}

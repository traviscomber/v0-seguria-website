import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const reviewSchema = z.object({
  reviewId: z.string().uuid(),
  decision: z.enum(['approved', 'rejected']),
  taxonMatch: z.enum(['confirmed', 'uncertain', 'incorrect']),
  licenseDecision: z.enum(['approved', 'rejected', 'needs_legal_review']),
  visualQuality: z.enum(['high', 'medium', 'low', 'unusable']),
  notes: z.string().trim().max(2000).optional().nullable(),
  rejectionReason: z.string().trim().max(1000).optional().nullable(),
}).superRefine((value, context) => {
  if (value.decision === 'rejected' && !value.rejectionReason) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['rejectionReason'], message: 'El motivo de rechazo es obligatorio.' })
  }
  if (value.decision === 'approved' && (
    value.taxonMatch !== 'confirmed' ||
    value.licenseDecision !== 'approved' ||
    !['high', 'medium'].includes(value.visualQuality)
  )) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['decision'], message: 'La aprobacion exige taxon confirmado, licencia aprobada y calidad alta o media.' })
  }
})

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const status = request.nextUrl.searchParams.get('status') || 'pending'
  const allowedStatuses = new Set(['pending', 'in_review', 'approved', 'rejected', 'all'])
  const selectedStatus = allowedStatuses.has(status) ? status : 'pending'

  let query = supabase
    .from('wildlife_media_reviews')
    .select(`
      id, organization_id, media_id, status, priority, reviewer_user_id,
      taxon_match, license_decision, visual_quality, benchmark_eligible,
      training_eligible, rejection_reason, notes, reviewed_at, created_at, updated_at,
      wildlife_occurrence_media!inner(
        id, identifier_url, reference_url, creator, rights_holder, license_url,
        license_code, commercial_use_allowed, derivatives_allowed, license_verified,
        width_pixels, height_pixels, rejection_reason,
        wildlife_occurrences!inner(
          id, source_name, source_occurrence_id, occurrence_status, observed_at,
          locality, country_code, occurrence_reference_url, human_verified,
          wildlife_taxa!inner(id, scientific_name, common_name_es, common_name_en, animal_class),
          wildlife_regions!inner(id, name, slug)
        )
      ),
      wildlife_benchmark_items(dataset_version, item_status, split)
    `)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(200)

  if (selectedStatus !== 'all') query = query.eq('status', selectedStatus)

  const [{ data: reviews, error }, { data: counts, error: countError }] = await Promise.all([
    query,
    supabase.from('wildlife_media_reviews').select('status'),
  ])

  if (error || countError) {
    console.error('Wildlife media review load failed:', error?.message || countError?.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar la cola de revision.' }, { status: 500 })
  }

  const summary = { pending: 0, in_review: 0, approved: 0, rejected: 0, total: counts?.length || 0 }
  for (const row of counts || []) {
    const key = row.status as keyof typeof summary
    if (key in summary && key !== 'total') summary[key] += 1
  }

  return NextResponse.json({ success: true, data: { reviews: reviews || [], summary } })
}

export async function PATCH(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'wildlife.media_review.manage' })
  if (guard) return guard

  const auth = await getAuthorizedRequest(request, ['admin'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsed = reviewSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Revision invalida.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { data: review } = await supabase
    .from('wildlife_media_reviews')
    .select('id')
    .eq('id', parsed.data.reviewId)
    .maybeSingle()

  if (!review) return NextResponse.json({ success: false, error: 'Revision no encontrada.' }, { status: 404 })

  const { data, error } = await supabase.rpc('review_wildlife_media_candidate', {
    p_review_id: parsed.data.reviewId,
    p_reviewer_user_id: auth.user.id,
    p_decision: parsed.data.decision,
    p_taxon_match: parsed.data.taxonMatch,
    p_license_decision: parsed.data.licenseDecision,
    p_visual_quality: parsed.data.visualQuality,
    p_notes: parsed.data.notes || null,
    p_rejection_reason: parsed.data.rejectionReason || null,
  })

  if (error) {
    console.error('Wildlife media review update failed:', error.message)
    const invalid = error.message.includes('requires') || error.message.includes('Invalid') || error.message.includes('required')
    return NextResponse.json({ success: false, error: invalid ? error.message : 'No fue posible registrar la revision.' }, { status: invalid ? 409 : 500 })
  }

  return NextResponse.json({
    success: true,
    data,
    message: parsed.data.decision === 'approved' ? 'Imagen aprobada para el benchmark.' : 'Imagen rechazada y excluida del benchmark.',
  })
}

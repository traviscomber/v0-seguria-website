import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const reviewSchema = z.object({
  jobId: z.string().uuid(),
  reviewStatus: z.enum(['confirmed', 'corrected', 'rejected', 'unidentifiable']),
  correctedCommonName: z.string().trim().max(160).optional().nullable(),
  correctedScientificName: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
}).superRefine((value, context) => {
  if (value.reviewStatus === 'corrected' && !value.correctedCommonName && !value.correctedScientificName) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['correctedCommonName'], message: 'Debe indicar el nombre común o científico corregido.' })
  }
})

const REVIEW_STATUSES = ['pending', 'confirmed', 'corrected', 'rejected', 'unidentifiable'] as const

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const limitParam = Number(request.nextUrl.searchParams.get('limit') || 50)
  const limit = Number.isFinite(limitParam) ? Math.min(100, Math.max(1, Math.trunc(limitParam))) : 50

  let query = supabase
    .from('wildlife_inference_jobs')
    .select('id, original_filename, mime_type, byte_size, provider, model_name, status, review_status, result_json, error_code, error_message, corrected_common_name, corrected_scientific_name, review_notes, camera_id, zone_label, captured_at, reviewed_at, created_at, updated_at, wildlife_cameras(code, name, zone_label)')
    .eq('submitted_by_user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  const reviewStatus = request.nextUrl.searchParams.get('review_status')
  if (reviewStatus && REVIEW_STATUSES.includes(reviewStatus as typeof REVIEW_STATUSES[number])) query = query.eq('review_status', reviewStatus)

  const status = request.nextUrl.searchParams.get('status')
  if (status && ['queued', 'processing', 'completed', 'failed'].includes(status)) query = query.eq('status', status)

  const species = request.nextUrl.searchParams.get('species')?.trim().toLowerCase()
  if (species) query = query.or(`corrected_common_name.ilike.%${species}%,corrected_scientific_name.ilike.%${species}%,result_json->detections.cs.[{"species":"${species}"}]`)

  const zone = request.nextUrl.searchParams.get('zone')?.trim()
  if (zone) query = query.ilike('zone_label', `%${zone}%`)

  const cameraId = request.nextUrl.searchParams.get('camera_id')
  if (cameraId && z.string().uuid().safeParse(cameraId).success) query = query.eq('camera_id', cameraId)

  const { data, error } = await query
  if (error) {
    console.error('Wildlife inference job history failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar el historial.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: data || [] })
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsed = reviewSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Revisión inválida.' }, { status: 400 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('wildlife_inference_jobs')
    .update({
      review_status: parsed.data.reviewStatus,
      corrected_common_name: parsed.data.reviewStatus === 'corrected' ? parsed.data.correctedCommonName || null : null,
      corrected_scientific_name: parsed.data.reviewStatus === 'corrected' ? parsed.data.correctedScientificName || null : null,
      review_notes: parsed.data.notes || null,
      reviewed_by_user_id: auth.user.id,
      reviewed_at: now,
      updated_at: now,
    })
    .eq('id', parsed.data.jobId)
    .eq('submitted_by_user_id', auth.user.id)
    .select('id, review_status, corrected_common_name, corrected_scientific_name, review_notes, reviewed_at')
    .maybeSingle()

  if (error) {
    console.error('Wildlife inference job review failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible registrar la revisión.' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ success: false, error: 'Análisis no encontrado.' }, { status: 404 })

  return NextResponse.json({ success: true, data })
}

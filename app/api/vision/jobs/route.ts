import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const reviewSchema = z.object({
  jobId: z.string().uuid(),
  reviewStatus: z.enum(['confirmed', 'corrected', 'rejected', 'unidentifiable']),
})

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const limitParam = Number(request.nextUrl.searchParams.get('limit') || 50)
  const limit = Number.isFinite(limitParam) ? Math.min(100, Math.max(1, Math.trunc(limitParam))) : 50

  let query = supabase
    .from('wildlife_inference_jobs')
    .select('id, original_filename, mime_type, byte_size, provider, model_name, status, review_status, result_json, error_code, error_message, reviewed_at, created_at, updated_at')
    .eq('submitted_by_user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  const reviewStatus = request.nextUrl.searchParams.get('review_status')
  if (reviewStatus && ['pending', 'confirmed', 'corrected', 'rejected', 'unidentifiable'].includes(reviewStatus)) {
    query = query.eq('review_status', reviewStatus)
  }

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
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Revisión inválida.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('wildlife_inference_jobs')
    .update({
      review_status: parsed.data.reviewStatus,
      reviewed_by_user_id: auth.user.id,
      reviewed_at: now,
      updated_at: now,
    })
    .eq('id', parsed.data.jobId)
    .eq('submitted_by_user_id', auth.user.id)
    .select('id, review_status, reviewed_at')
    .maybeSingle()

  if (error) {
    console.error('Wildlife inference job review failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible registrar la revisión.' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ success: false, error: 'Análisis no encontrado.' }, { status: 404 })

  return NextResponse.json({ success: true, data })
}

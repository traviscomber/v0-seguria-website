import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const setSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).optional().nullable(),
  targetImageCount: z.number().int().min(1).max(100000).optional().nullable(),
})

const itemSchema = z.object({
  evaluationSetId: z.string().uuid(),
  jobId: z.string().uuid(),
  expectedCommonName: z.string().trim().max(160).optional().nullable(),
  expectedScientificName: z.string().trim().max(200).optional().nullable(),
  observedOutcome: z.enum(['true_positive', 'false_positive', 'false_negative', 'true_negative', 'unidentifiable']),
  imageQuality: z.enum(['good', 'blurred', 'dark', 'infrared', 'rain', 'snow', 'occluded', 'empty', 'other']),
  reviewerNotes: z.string().trim().max(1000).optional().nullable(),
})

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const [setsResult, jobsResult] = await Promise.all([
    supabase
      .from('wildlife_evaluation_sets')
      .select('id, name, description, status, target_image_count, started_at, completed_at, created_at, wildlife_evaluation_items(id, job_id, observed_outcome, image_quality, expected_common_name, expected_scientific_name, reviewer_notes, reviewed_at)')
      .eq('created_by_user_id', auth.user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('wildlife_inference_jobs')
      .select('id, original_filename, review_status, corrected_common_name, corrected_scientific_name, result_json, camera_id, zone_label, captured_at, created_at, wildlife_cameras(code, name)')
      .eq('submitted_by_user_id', auth.user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(250),
  ])

  if (setsResult.error || jobsResult.error) {
    console.error('Wildlife evaluations load failed:', setsResult.error?.message || jobsResult.error?.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar el piloto.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: { sets: setsResult.data || [], jobs: jobsResult.data || [] } })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsed = setSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos.' }, { status: 400 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { data, error } = await supabase
    .from('wildlife_evaluation_sets')
    .insert({
      organization_id: auth.user.clientIds[0] ?? null,
      created_by_user_id: auth.user.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      target_image_count: parsed.data.targetImageCount ?? null,
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .select('id, name, description, status, target_image_count, started_at, created_at')
    .single()

  if (error) {
    console.error('Wildlife evaluation set creation failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible crear el conjunto.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsed = itemSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Evaluación inválida.' }, { status: 400 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { data: evaluationSet } = await supabase
    .from('wildlife_evaluation_sets')
    .select('id')
    .eq('id', parsed.data.evaluationSetId)
    .eq('created_by_user_id', auth.user.id)
    .maybeSingle()
  if (!evaluationSet) return NextResponse.json({ success: false, error: 'Conjunto no encontrado.' }, { status: 404 })

  const { data: job } = await supabase
    .from('wildlife_inference_jobs')
    .select('id')
    .eq('id', parsed.data.jobId)
    .eq('submitted_by_user_id', auth.user.id)
    .maybeSingle()
  if (!job) return NextResponse.json({ success: false, error: 'Trabajo no encontrado.' }, { status: 404 })

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('wildlife_evaluation_items')
    .upsert({
      evaluation_set_id: parsed.data.evaluationSetId,
      job_id: parsed.data.jobId,
      expected_common_name: parsed.data.expectedCommonName || null,
      expected_scientific_name: parsed.data.expectedScientificName || null,
      observed_outcome: parsed.data.observedOutcome,
      image_quality: parsed.data.imageQuality,
      reviewer_notes: parsed.data.reviewerNotes || null,
      reviewed_by_user_id: auth.user.id,
      reviewed_at: now,
      updated_at: now,
    }, { onConflict: 'evaluation_set_id,job_id' })
    .select('id, evaluation_set_id, job_id, observed_outcome, image_quality, reviewed_at')
    .single()

  if (error) {
    console.error('Wildlife evaluation item save failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible guardar la evaluación.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

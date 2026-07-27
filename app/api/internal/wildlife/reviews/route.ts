import 'server-only'

import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 30

const reviewSchema = z
  .object({
    observation_id: z.string().uuid(),
    organization_id: z.string().uuid(),
    reviewer_user_id: z.string().uuid(),
    decision: z.enum(['validated', 'corrected', 'rejected']),
    corrected_common_name: z.string().trim().min(1).max(200).nullable().optional(),
    corrected_scientific_name: z.string().trim().min(1).max(200).nullable().optional(),
    notes: z.string().trim().min(1).max(2000).nullable().optional(),
  })
  .superRefine((value, context) => {
    if (
      value.decision === 'corrected' &&
      !value.corrected_common_name &&
      !value.corrected_scientific_name
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A corrected review requires a corrected common or scientific name',
        path: ['decision'],
      })
    }
  })

function hasValidInternalToken(request: Request) {
  const configuredToken = process.env.VISION_BACKEND_TOKEN
  const authorization = request.headers.get('authorization')
  if (!configuredToken || !authorization?.startsWith('Bearer ')) return false

  const suppliedToken = authorization.slice('Bearer '.length)
  const expected = Buffer.from(configuredToken)
  const supplied = Buffer.from(suppliedToken)
  return expected.length === supplied.length && timingSafeEqual(expected, supplied)
}

export async function POST(request: Request) {
  if (!hasValidInternalToken(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json(
      { error: 'supabase_admin_not_configured' },
      { status: 503 }
    )
  }

  let payload: z.infer<typeof reviewSchema>
  try {
    payload = reviewSchema.parse(await request.json())
  } catch (error) {
    return NextResponse.json(
      {
        error: 'invalid_review',
        details: error instanceof Error ? error.message : 'unknown validation error',
      },
      { status: 422 }
    )
  }

  const { data, error } = await supabase.rpc('submit_wildlife_human_review', {
    p_observation_id: payload.observation_id,
    p_organization_id: payload.organization_id,
    p_reviewer_user_id: payload.reviewer_user_id,
    p_decision: payload.decision,
    p_corrected_common_name: payload.corrected_common_name ?? null,
    p_corrected_scientific_name: payload.corrected_scientific_name ?? null,
    p_notes: payload.notes ?? null,
  })

  if (error) {
    const notFound = error.code === 'P0002'
    return NextResponse.json(
      {
        error: notFound ? 'observation_not_found' : 'review_persistence_failed',
        details: error.message,
      },
      { status: notFound ? 404 : 500 }
    )
  }

  const result = Array.isArray(data) ? data[0] : data
  if (!result) {
    return NextResponse.json({ error: 'empty_review_result' }, { status: 500 })
  }

  return NextResponse.json({
    review_id: result.review_id,
    observation_id: result.observation_id,
    status: result.status,
  })
}

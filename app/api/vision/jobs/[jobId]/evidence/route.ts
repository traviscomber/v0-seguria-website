import { NextRequest, NextResponse } from 'next/server'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveWildlifeAccess, writeTerritorialAudit } from '@/lib/wildlife/server-access'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const access = await resolveWildlifeAccess(auth)
  if (!access.capabilities.viewEvidence) {
    return NextResponse.json({ success: false, error: 'Tu rol no permite consultar evidencia.' }, { status: 403 })
  }

  const { jobId } = await context.params
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  let query = supabase
    .from('wildlife_inference_jobs')
    .select('id, storage_bucket, storage_path')
    .eq('id', jobId)

  query = access.operationId
    ? query.eq('operation_id', access.operationId)
    : query.eq('submitted_by_user_id', auth.user.id)

  const { data: job, error } = await query.maybeSingle()

  if (error) {
    console.error('Wildlife evidence lookup failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible consultar la evidencia.' }, { status: 500 })
  }
  if (!job) return NextResponse.json({ success: false, error: 'Analisis no encontrado.' }, { status: 404 })
  if (!job.storage_bucket || !job.storage_path) {
    return NextResponse.json({ success: false, error: 'Este analisis no tiene imagen almacenada.' }, { status: 404 })
  }

  const { data, error: signError } = await supabase.storage
    .from(job.storage_bucket)
    .createSignedUrl(job.storage_path, 300)

  if (signError || !data?.signedUrl) {
    console.error('Wildlife evidence signing failed:', signError?.message)
    return NextResponse.json({ success: false, error: 'No fue posible generar el acceso temporal.' }, { status: 500 })
  }

  await writeTerritorialAudit({
    request,
    auth,
    access,
    action: 'evidence.viewed',
    resourceType: 'wildlife_inference_job',
    resourceId: job.id,
    payload: { expiresInSeconds: 300 },
  })

  return NextResponse.json({ success: true, data: { url: data.signedUrl, expires_in: 300 } })
}

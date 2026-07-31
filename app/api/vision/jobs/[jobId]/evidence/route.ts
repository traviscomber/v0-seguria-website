import { NextRequest, NextResponse } from 'next/server'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const { jobId } = await context.params
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { data: job, error } = await supabase
    .from('wildlife_inference_jobs')
    .select('storage_bucket, storage_path')
    .eq('id', jobId)
    .eq('submitted_by_user_id', auth.user.id)
    .maybeSingle()

  if (error) {
    console.error('Wildlife evidence lookup failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible consultar la evidencia.' }, { status: 500 })
  }
  if (!job) return NextResponse.json({ success: false, error: 'Análisis no encontrado.' }, { status: 404 })
  if (!job.storage_bucket || !job.storage_path) {
    return NextResponse.json({ success: false, error: 'Este análisis no tiene imagen almacenada.' }, { status: 404 })
  }

  const { data, error: signError } = await supabase.storage
    .from(job.storage_bucket)
    .createSignedUrl(job.storage_path, 300)

  if (signError || !data?.signedUrl) {
    console.error('Wildlife evidence signing failed:', signError?.message)
    return NextResponse.json({ success: false, error: 'No fue posible generar el acceso temporal.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: { url: data.signedUrl, expires_in: 300 } })
}

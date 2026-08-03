import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

type EvidenceReference = {
  name?: string
  type?: string
  size?: number
  bucket?: string
  path?: string
  retentionUntil?: string
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const leadId = request.nextUrl.searchParams.get('leadId')
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  let query = supabase
    .from('leads')
    .select('id,name,email,phone,message,status,created_at')
    .eq('source', 'support_huilo_huilo')
    .order('created_at', { ascending: false })
    .limit(leadId ? 1 : 250)

  if (leadId) query = query.eq('id', leadId)

  const { data, error } = await query

  if (error) {
    console.error('Error reading support evidence:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar la evidencia.' }, { status: 500 })
  }

  const items = await Promise.all((data || []).map(async (lead) => {
    let details: Record<string, unknown> = {}
    try {
      details = lead.message ? JSON.parse(String(lead.message)) : {}
    } catch {
      details = { mensaje: lead.message || '' }
    }

    const references = Array.isArray(details.evidence) ? details.evidence as EvidenceReference[] : []
    const evidence = await Promise.all(references.map(async (reference) => {
      const bucket = reference.bucket || 'support-evidence'
      const path = reference.path || ''
      if (!path) return { ...reference, signedUrl: null }

      const { data: signed, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 15, { download: false })

      return {
        ...reference,
        bucket,
        path,
        signedUrl: signedError ? null : signed?.signedUrl || null,
      }
    }))

    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      createdAt: lead.created_at,
      location: String(details.ubicacion || ''),
      subject: String(details.necesidadPrincipal || ''),
      message: String(details.mensaje || ''),
      retentionDays: Number(details.evidenceRetentionDays || 0),
      retentionProcessedAt: details.evidenceRetentionProcessedAt || null,
      evidence,
    }
  }))

  return NextResponse.json(
    { success: true, data: leadId ? items[0] || null : items },
    { headers: { 'Cache-Control': 'private, no-store, max-age=0, must-revalidate' } },
  )
}

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

type SupportContext = {
  origin?: string
  section?: string
  kind?: string
  propertyId?: string
  itemId?: string
  itemLabel?: string
  returnPath?: string
}

const DEFAULT_DAILY_BUDGET_BYTES = 500 * 1024 * 1024

export const dynamic = 'force-dynamic'

function parseDetails(message: unknown) {
  try {
    return message ? JSON.parse(String(message)) as Record<string, unknown> : {}
  } catch {
    return { mensaje: message || '' }
  }
}

function getEvidenceBytes(details: Record<string, unknown>) {
  const storedTotal = Number(details.evidenceTotalBytes || 0)
  if (Number.isFinite(storedTotal) && storedTotal > 0) return storedTotal
  const references = Array.isArray(details.evidence) ? details.evidence as EvidenceReference[] : []
  return references.reduce((total, reference) => total + Number(reference.size || 0), 0)
}

function getDailyBudget() {
  const configured = Number(process.env.SUPPORT_EVIDENCE_DAILY_BUDGET_BYTES || DEFAULT_DAILY_BUDGET_BYTES)
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_DAILY_BUDGET_BYTES
}

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

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const [itemsResult, usageResult] = await Promise.all([
    query,
    supabase
      .from('leads')
      .select('message')
      .eq('source', 'support_huilo_huilo')
      .gte('created_at', todayStart.toISOString())
      .limit(2000),
  ])

  if (itemsResult.error) {
    console.error('Error reading support evidence:', itemsResult.error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar la evidencia.' }, { status: 500 })
  }

  if (usageResult.error) {
    console.error('Error reading evidence usage:', usageResult.error.message)
    return NextResponse.json({ success: false, error: 'No fue posible calcular el consumo de evidencia.' }, { status: 500 })
  }

  const items = await Promise.all((itemsResult.data || []).map(async (lead) => {
    const details = parseDetails(lead.message)
    const supportContext = (details.supportContext && typeof details.supportContext === 'object'
      ? details.supportContext
      : {}) as SupportContext
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
      supportContext: {
        origin: String(supportContext.origin || ''),
        section: String(supportContext.section || ''),
        kind: String(supportContext.kind || ''),
        propertyId: String(supportContext.propertyId || ''),
        itemId: String(supportContext.itemId || ''),
        itemLabel: String(supportContext.itemLabel || ''),
        returnPath: String(supportContext.returnPath || ''),
      },
      retentionDays: Number(details.evidenceRetentionDays || 0),
      retentionProcessedAt: details.evidenceRetentionProcessedAt || null,
      evidence,
    }
  }))

  const usedBytes = (usageResult.data || []).reduce((total, row) => total + getEvidenceBytes(parseDetails(row.message)), 0)
  const budgetBytes = getDailyBudget()
  const usagePercent = Math.min(100, Math.round((usedBytes / budgetBytes) * 100))
  const level = usagePercent >= 100 ? 'blocked' : usagePercent >= 90 ? 'critical' : usagePercent >= 70 ? 'warning' : 'normal'

  return NextResponse.json(
    {
      success: true,
      data: leadId ? items[0] || null : items,
      usage: {
        date: todayStart.toISOString().slice(0, 10),
        usedBytes,
        budgetBytes,
        remainingBytes: Math.max(0, budgetBytes - usedBytes),
        usagePercent,
        level,
      },
    },
    { headers: { 'Cache-Control': 'private, no-store, max-age=0, must-revalidate' } },
  )
}

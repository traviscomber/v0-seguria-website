import { NextRequest, NextResponse } from 'next/server'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { secretsMatch } from '@/lib/secret-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const OPEN_STATUSES = new Set(['new', 'contacted', 'qualified', 'proposal_sent'])

type EvidenceReference = {
  bucket?: string
  path?: string
  retentionUntil?: string
}

export async function GET(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'evidence.retention', requireProductionDeployment: true })
  if (guard) return guard

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!secretsMatch(token, process.env.CRON_SECRET)) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })

  const { data, error } = await supabase
    .from('leads')
    .select('id,message,status')
    .eq('source', 'support_huilo_huilo')
    .limit(500)

  if (error) {
    console.error('Evidence retention scan failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible revisar la retención.' }, { status: 500 })
  }

  const now = Date.now()
  let scanned = 0
  let deleted = 0
  let preserved = 0
  let failed = 0

  for (const lead of data || []) {
    let details: Record<string, unknown>
    try {
      details = lead.message ? JSON.parse(String(lead.message)) : {}
    } catch {
      continue
    }

    const evidence = Array.isArray(details.evidence) ? details.evidence as EvidenceReference[] : []
    if (evidence.length === 0) continue
    scanned += evidence.length

    if (OPEN_STATUSES.has(String(lead.status || 'new'))) {
      preserved += evidence.length
      continue
    }

    const expired = evidence.filter((item) => {
      const expiresAt = item.retentionUntil ? Date.parse(item.retentionUntil) : Number.NaN
      return item.path && Number.isFinite(expiresAt) && expiresAt <= now
    })

    if (expired.length === 0) continue

    const byBucket = new Map<string, string[]>()
    for (const item of expired) {
      const bucket = item.bucket || 'support-evidence'
      const paths = byBucket.get(bucket) || []
      paths.push(String(item.path))
      byBucket.set(bucket, paths)
    }

    let removalFailed = false
    for (const [bucket, paths] of byBucket) {
      const { error: removeError } = await supabase.storage.from(bucket).remove(paths)
      if (removeError) {
        removalFailed = true
        failed += paths.length
        console.error('Evidence retention removal failed:', { leadId: lead.id, bucket, message: removeError.message })
      } else {
        deleted += paths.length
      }
    }

    if (removalFailed) continue

    const expiredPaths = new Set(expired.map((item) => item.path))
    const remaining = evidence.filter((item) => !expiredPaths.has(item.path))
    const nextDetails = {
      ...details,
      evidence: remaining,
      evidenceRetentionLastRunAt: new Date().toISOString(),
      evidenceDeletedCount: Number(details.evidenceDeletedCount || 0) + expired.length,
    }

    const { error: updateError } = await supabase
      .from('leads')
      .update({ message: JSON.stringify(nextDetails), updated_at: new Date().toISOString() })
      .eq('id', lead.id)

    if (updateError) {
      failed += expired.length
      console.error('Evidence retention lead update failed:', { leadId: lead.id, message: updateError.message })
    }
  }

  return NextResponse.json({ success: true, data: { scanned, deleted, preserved, failed } })
}

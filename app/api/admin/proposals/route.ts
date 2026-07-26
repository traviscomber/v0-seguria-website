import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { PROPOSAL_BRANDBOOK } from '@/lib/proposals/brandbook'
import type { ProposalBlock } from '@/lib/proposals/types'

export const dynamic = 'force-dynamic'

type SaveProposalBody = {
  id?: string
  leadId?: string
  title?: string
  clientName?: string
  blocks?: ProposalBlock[]
  source?: 'manual' | 'autosave' | 'agent'
}

async function requireAdmin() {
  const auth = await getCurrentAuthSession()
  if (!auth || auth.user.role !== 'admin') return null
  return auth
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })

  const leadId = request.nextUrl.searchParams.get('leadId')
  const proposalId = request.nextUrl.searchParams.get('id')

  let query = supabase
    .from('proposals')
    .select('id,lead_id,title,client_name,status,brandbook_version,blocks,created_at,updated_at')

  if (proposalId) query = query.eq('id', proposalId)
  else if (leadId) query = query.eq('lead_id', leadId)
  else return NextResponse.json({ proposal: null })

  const { data, error } = await query.order('updated_at', { ascending: false }).limit(1).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ proposal: data || null })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })

  const body = await request.json() as SaveProposalBody
  const title = body.title?.trim() || 'Propuesta comercial'
  const clientName = body.clientName?.trim() || ''
  const blocks = Array.isArray(body.blocks) ? body.blocks : []
  const source = body.source || 'manual'

  const payload = {
    lead_id: body.leadId || null,
    title,
    client_name: clientName,
    status: 'draft',
    brandbook_version: PROPOSAL_BRANDBOOK.version,
    blocks,
    created_by: auth.user.id,
    updated_at: new Date().toISOString(),
  }

  let proposal

  if (body.id) {
    const { data, error } = await supabase
      .from('proposals')
      .update(payload)
      .eq('id', body.id)
      .select('id,lead_id,title,client_name,status,brandbook_version,blocks,created_at,updated_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    proposal = data
  } else {
    const { data, error } = await supabase
      .from('proposals')
      .insert(payload)
      .select('id,lead_id,title,client_name,status,brandbook_version,blocks,created_at,updated_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    proposal = data
  }

  const { count } = await supabase
    .from('proposal_revisions')
    .select('id', { count: 'exact', head: true })
    .eq('proposal_id', proposal.id)

  await supabase.from('proposal_revisions').insert({
    proposal_id: proposal.id,
    version: (count || 0) + 1,
    snapshot: proposal,
    source,
    created_by: auth.user.id,
  })

  return NextResponse.json({ proposal })
}

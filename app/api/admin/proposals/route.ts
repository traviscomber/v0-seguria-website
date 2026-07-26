import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { PROPOSAL_BRANDBOOK } from '@/lib/proposals/brandbook'
import type { ProposalBlock, ProposalBlockType } from '@/lib/proposals/types'

export const dynamic = 'force-dynamic'

const allowedBlockTypes = new Set<ProposalBlockType>([
  'cover',
  'executive-summary',
  'challenge',
  'solution',
  'gallery',
  'scope',
  'timeline',
  'pricing',
  'terms',
  'closing',
])

const allowedLayouts = new Set<string>(PROPOSAL_BRANDBOOK.proposalRules.allowedLayouts)

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

function validateBlocks(value: unknown): ProposalBlock[] | null {
  if (!Array.isArray(value) || value.length > 100) return null

  const ids = new Set<string>()
  const blocks: ProposalBlock[] = []

  for (const item of value) {
    if (!item || typeof item !== 'object') return null
    const block = item as Partial<ProposalBlock>

    if (
      typeof block.id !== 'string' ||
      !block.id.trim() ||
      ids.has(block.id) ||
      typeof block.type !== 'string' ||
      !allowedBlockTypes.has(block.type as ProposalBlockType) ||
      typeof block.title !== 'string' ||
      block.title.length > 200 ||
      typeof block.body !== 'string' ||
      block.body.length > 30_000 ||
      typeof block.layout !== 'string' ||
      !allowedLayouts.has(block.layout) ||
      !Array.isArray(block.imageIds) ||
      block.imageIds.some((id) => typeof id !== 'string')
    ) {
      return null
    }

    ids.add(block.id)
    blocks.push({
      id: block.id,
      type: block.type as ProposalBlockType,
      title: block.title,
      body: block.body,
      layout: block.layout as ProposalBlock['layout'],
      imageIds: block.imageIds,
    })
  }

  return blocks
}

async function saveRevision(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  proposal: Record<string, unknown>,
  source: NonNullable<SaveProposalBody['source']>,
  userId: string
) {
  if (!supabase || typeof proposal.id !== 'string') return

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data: latest } = await supabase
      .from('proposal_revisions')
      .select('version')
      .eq('proposal_id', proposal.id)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { error } = await supabase.from('proposal_revisions').insert({
      proposal_id: proposal.id,
      version: (latest?.version || 0) + 1,
      snapshot: proposal,
      source,
      created_by: userId,
    })

    if (!error) return
    if (error.code !== '23505' || attempt === 1) throw error
  }
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

  let body: SaveProposalBody
  try {
    body = await request.json() as SaveProposalBody
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const blocks = validateBlocks(body.blocks)
  if (!blocks) return NextResponse.json({ error: 'La estructura de la propuesta no es válida' }, { status: 400 })

  const title = body.title?.trim() || 'Propuesta comercial'
  const clientName = body.clientName?.trim() || ''
  const source = body.source || 'manual'

  if (title.length > 200 || clientName.length > 200) {
    return NextResponse.json({ error: 'Título o cliente demasiado extensos' }, { status: 400 })
  }

  const mutablePayload = {
    lead_id: body.leadId || null,
    title,
    client_name: clientName,
    status: 'draft',
    brandbook_version: PROPOSAL_BRANDBOOK.version,
    blocks,
    updated_at: new Date().toISOString(),
  }

  let proposal

  if (body.id) {
    const { data, error } = await supabase
      .from('proposals')
      .update(mutablePayload)
      .eq('id', body.id)
      .select('id,lead_id,title,client_name,status,brandbook_version,blocks,created_at,updated_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    proposal = data
  } else {
    const { data, error } = await supabase
      .from('proposals')
      .insert({ ...mutablePayload, created_by: auth.user.id })
      .select('id,lead_id,title,client_name,status,brandbook_version,blocks,created_at,updated_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    proposal = data
  }

  try {
    await saveRevision(supabase, proposal, source, auth.user.id)
  } catch (error) {
    console.error('[proposals] Failed to save revision', error)
    return NextResponse.json({ proposal, warning: 'La propuesta se guardó, pero no fue posible registrar la revisión.' })
  }

  return NextResponse.json({ proposal })
}

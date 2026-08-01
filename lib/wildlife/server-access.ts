import 'server-only'

import type { NextRequest } from 'next/server'

import type { RequestAuth } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  getWildlifeCapabilities,
  normalizeWildlifeRole,
  type CoordinatePrecision,
  type WildlifeCapabilities,
  type WildlifeOperationRole,
} from '@/lib/wildlife/access-control'

type OperationRelation = { name?: string | null } | Array<{ name?: string | null }> | null

type OperationLink = {
  operation_id: string
  role: string | null
  operations?: OperationRelation
}

export type WildlifeAccessContext = {
  operationId: string | null
  operationName: string | null
  role: WildlifeOperationRole
  capabilities: WildlifeCapabilities
  personalScope: boolean
}

function operationName(relation: OperationRelation | undefined) {
  if (!relation) return null
  if (Array.isArray(relation)) return relation[0]?.name || null
  return relation.name || null
}

export async function resolveWildlifeAccess(
  auth: RequestAuth,
  requestedOperationId?: string | null,
): Promise<WildlifeAccessContext> {
  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    const role = auth.user.role === 'admin' ? 'owner' : auth.user.role === 'technician' ? 'technician' : 'viewer'
    return {
      operationId: null,
      operationName: null,
      role,
      capabilities: getWildlifeCapabilities(role),
      personalScope: true,
    }
  }

  const { data, error } = await supabase
    .from('user_operations')
    .select('operation_id, role, operations(name)')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: true })

  if (error) console.error('Wildlife operation access lookup failed:', error.message)
  const links = (data || []) as unknown as OperationLink[]
  const selected = requestedOperationId
    ? links.find((link) => link.operation_id === requestedOperationId) || null
    : links[0] || null

  if (!selected) {
    const role = auth.user.role === 'admin' ? 'owner' : auth.user.role === 'technician' ? 'technician' : 'viewer'
    return {
      operationId: null,
      operationName: null,
      role,
      capabilities: getWildlifeCapabilities(role),
      personalScope: true,
    }
  }

  let role = normalizeWildlifeRole(selected.role)
  if (auth.user.role === 'admin') role = 'owner'
  else if (auth.user.role === 'technician' && role === 'viewer') role = 'technician'

  return {
    operationId: selected.operation_id,
    operationName: operationName(selected.operations),
    role,
    capabilities: getWildlifeCapabilities(role),
    personalScope: false,
  }
}

function requestIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip') || null
}

export async function writeTerritorialAudit(input: {
  request: NextRequest
  auth: RequestAuth
  access: WildlifeAccessContext
  action: string
  resourceType: string
  resourceId?: string | null
  coordinatePrecision?: CoordinatePrecision | null
  payload?: Record<string, unknown>
}) {
  const supabase = createSupabaseAdminClient()
  if (!supabase) return

  const { error } = await supabase.from('wildlife_territorial_access_log').insert({
    operation_id: input.access.operationId,
    actor_user_id: input.auth.user.id,
    action: input.action,
    resource_type: input.resourceType,
    resource_id: input.resourceId || null,
    coordinate_precision: input.coordinatePrecision || null,
    ip_address: requestIp(input.request),
    user_agent: input.request.headers.get('user-agent'),
    payload: input.payload || {},
  })

  if (error) console.error('Wildlife territorial audit write failed:', error.message)
}

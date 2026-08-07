import 'server-only'

import type { User } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type AuthRole = 'client' | 'technician' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: AuthRole
  clientIds: string[]
  propertyIds: string[]
  operationIds: string[]
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  userId: string
  expiresAt: string | null
  createdAt: string
}

type AuthScope = {
  organizationIds: string[]
  propertyIds: string[]
  operationIds: string[]
}

const EMPTY_AUTH_SCOPE: AuthScope = {
  organizationIds: [],
  propertyIds: [],
  operationIds: [],
}

function getPlatformRole(user: User): AuthRole {
  const role = user.app_metadata?.platform_role || user.app_metadata?.role
  if (role === 'admin' || role === 'technician') return role
  return 'client'
}

export function mapSupabaseUserToAuthUser(
  user: User,
  scope: AuthScope = EMPTY_AUTH_SCOPE
): AuthUser {
  const email = user.email?.toLowerCase() || ''
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name

  return {
    id: user.id,
    name: typeof displayName === 'string' && displayName.trim()
      ? displayName.trim()
      : email.split('@')[0] || 'Usuario',
    email,
    role: getPlatformRole(user),
    clientIds: scope.organizationIds,
    propertyIds: scope.propertyIds,
    operationIds: scope.operationIds,
    createdAt: user.created_at,
    updatedAt: user.updated_at || user.created_at,
  }
}

export async function getCurrentAuthSession() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const [{ data: userData, error: userError }, { data: sessionData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ])

  if (userError || !userData.user) return null

  let organizationIds: string[] = []
  let propertyIds: string[] = []
  let operationIds: string[] = []

  // Portal scope: organizations -> properties. These IDs must never be populated
  // from SegurIA Vision operations.
  try {
    const { data: memberships, error: membershipsError } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', userData.user.id)

    if (membershipsError) throw membershipsError

    organizationIds = Array.from(
      new Set((memberships || []).map((membership) => membership.organization_id as string))
    )

    if (organizationIds.length > 0) {
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id')
        .in('organization_id', organizationIds)

      if (propertiesError) throw propertiesError
      propertyIds = Array.from(
        new Set((properties || []).map((property) => property.id as string))
      )
    }
  } catch (scopeError) {
    console.error(
      '[auth] Portal scope lookup failed:',
      scopeError instanceof Error ? scopeError.message : 'unknown error'
    )
  }

  // SegurIA Vision scope: operations. Keep this independent from portal scope so
  // a failure in one model cannot contaminate the other IDs.
  try {
    const { data: operationLinks, error: operationsError } = await supabase
      .from('user_operations')
      .select('operation_id')
      .eq('user_id', userData.user.id)

    if (operationsError) throw operationsError

    operationIds = Array.from(
      new Set((operationLinks || []).map((link) => link.operation_id as string))
    )
  } catch (scopeError) {
    console.error(
      '[auth] Vision scope lookup failed:',
      scopeError instanceof Error ? scopeError.message : 'unknown error'
    )
  }

  const user = mapSupabaseUserToAuthUser(userData.user, {
    organizationIds,
    propertyIds,
    operationIds,
  })
  const expiresAt = sessionData.session?.expires_at
    ? new Date(sessionData.session.expires_at * 1000).toISOString()
    : null

  return {
    user,
    session: {
      userId: user.id,
      expiresAt,
      createdAt: userData.user.created_at,
    },
  }
}

export function canAccessProperty(user: AuthUser, propertyId: string) {
  if (user.role === 'admin') return true
  return user.propertyIds.includes(propertyId)
}

export function canAccessClient(user: AuthUser, clientId: string) {
  if (user.role === 'admin') return true
  return user.clientIds.includes(clientId)
}

export function canAccessOperation(user: AuthUser, operationId: string) {
  if (user.role === 'admin') return true
  return user.operationIds.includes(operationId)
}

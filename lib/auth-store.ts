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
}

function getPlatformRole(user: User): AuthRole {
  const role = user.app_metadata?.platform_role || user.app_metadata?.role
  if (role === 'admin' || role === 'technician') return role
  return 'client'
}

export function mapSupabaseUserToAuthUser(
  user: User,
  scope: AuthScope = { organizationIds: [], propertyIds: [] }
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

  // Try to get operations from user_operations table
  let organizationIds: string[] = []
  let propertyIds: string[] = []

  try {
    const { data: userOps } = await supabase
      .from('user_operations')
      .select('operation_id')
      .eq('user_id', userData.user.id)

    organizationIds = Array.from(
      new Set((userOps || []).map((op) => op.operation_id as string))
    )

    // Try to get properties from operations/properties relationship
    if (organizationIds.length > 0) {
      try {
        const { data: properties } = await supabase
          .from('properties')
          .select('id')
          .in('operation_id', organizationIds)
        propertyIds = (properties || []).map((property) => property.id as string)
      } catch {
        // Properties table might not exist, continue with empty
      }
    }
  } catch {
    // user_operations table might not exist, continue with empty ids
    console.log('[v0] Auth: user_operations table not available, continuing with empty scope')
  }

  const user = mapSupabaseUserToAuthUser(userData.user, { organizationIds, propertyIds })
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

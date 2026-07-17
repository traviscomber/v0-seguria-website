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
  expiresAt: string
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

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null

  const { data: memberships } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', data.user.id)

  const organizationIds = Array.from(
    new Set((memberships || []).map((membership) => membership.organization_id as string))
  )

  let propertyIds: string[] = []
  if (organizationIds.length > 0) {
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .in('organization_id', organizationIds)
    propertyIds = (properties || []).map((property) => property.id as string)
  }

  const user = mapSupabaseUserToAuthUser(data.user, { organizationIds, propertyIds })
  return {
    user,
    session: {
      userId: user.id,
      expiresAt: data.user.updated_at || data.user.created_at,
      createdAt: data.user.created_at,
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

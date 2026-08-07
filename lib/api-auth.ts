import 'server-only'

import type { NextRequest } from 'next/server'
import {
  getCurrentAuthSession,
  type AuthRole,
  type AuthSession,
  type AuthUser,
} from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type RequestAuth = {
  user: AuthUser
  session: AuthSession
}

async function canInvokeRawVisionProvider(request: NextRequest, auth: RequestAuth) {
  if (request.nextUrl.pathname !== '/api/vision/openai/infer') return true
  if (auth.user.role === 'admin') return true
  if (auth.user.operationIds.length === 0) return false

  const supabase = createSupabaseAdminClient()
  if (!supabase) return false

  const { data, error } = await supabase
    .from('user_operations')
    .select('operation_id, role')
    .eq('user_id', auth.user.id)
    .in('operation_id', auth.user.operationIds)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Raw Vision provider authorization failed:', error.message)
    return false
  }

  return (data || []).some((link) => ['owner', 'admin', 'operator'].includes(link.role || ''))
}

export async function getAuthorizedRequest(
  request: NextRequest,
  allowedRoles: readonly AuthRole[],
): Promise<RequestAuth | null> {
  const auth = await getCurrentAuthSession()
  if (!auth || !allowedRoles.includes(auth.user.role)) return null
  if (!(await canInvokeRawVisionProvider(request, auth))) return null
  return auth
}

import 'server-only'

import type { NextRequest } from 'next/server'
import {
  getCurrentAuthSession,
  type AuthRole,
  type AuthSession,
  type AuthUser,
} from '@/lib/auth-store'

export type RequestAuth = {
  user: AuthUser
  session: AuthSession
}

export async function getAuthorizedRequest(
  _request: NextRequest,
  allowedRoles: readonly AuthRole[]
): Promise<RequestAuth | null> {
  const auth = await getCurrentAuthSession()
  if (!auth || !allowedRoles.includes(auth.user.role)) return null
  return auth
}

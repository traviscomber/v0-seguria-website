import { NextRequest, NextResponse } from 'next/server'
import { getAuthTokenFromRequest, revokeAuthSession, clearSessionCookie } from '@/lib/auth-store'

export async function POST(request: NextRequest) {
  const token = getAuthTokenFromRequest(request)
  if (token) {
    await revokeAuthSession(token)
  }

  const response = NextResponse.json({ success: true, message: 'Sesion cerrada.' })
  response.headers.set('Set-Cookie', clearSessionCookie())
  return response
}

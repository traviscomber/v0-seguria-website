import { NextRequest, NextResponse } from 'next/server'
import { getAuthSessionFromToken, getAuthTokenFromRequest } from '@/lib/auth-store'

export async function GET(request: NextRequest) {
  const token = getAuthTokenFromRequest(request)
  if (!token) {
    return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 })
  }

  const session = await getAuthSessionFromToken(token)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Sesion invalida.' }, { status: 401 })
  }

  return NextResponse.json({
    success: true,
    data: {
      user: session.user,
    },
  })
}

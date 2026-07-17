import { NextResponse } from 'next/server'
import { getCurrentAuthSession } from '@/lib/auth-store'

export async function GET() {
  const session = await getCurrentAuthSession()
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

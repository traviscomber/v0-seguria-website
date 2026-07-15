import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateUser, serializeSessionCookie } from '@/lib/auth-store'

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const parsed = loginSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Credenciales invalidas.' }, { status: 400 })
    }

    const result = await authenticateUser(parsed.data.email, parsed.data.password)

    if (!result) {
      return NextResponse.json({ success: false, error: 'Email o contraseña incorrectos.' }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      data: {
        user: result.user,
      },
      message: 'Sesion iniciada.',
    })

    response.headers.set('Set-Cookie', serializeSessionCookie(result.session.token))
    return response
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

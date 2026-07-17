import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { mapSupabaseUserToAuthUser } from '@/lib/auth-store'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'El servicio de acceso no esta configurado.' },
        { status: 503 }
      )
    }

    const payload = await request.json()
    const parsed = loginSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Credenciales invalidas.' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error || !data.user || !data.session) {
      return NextResponse.json({ success: false, error: 'No pudimos validar tu acceso.' }, { status: 401 })
    }

    const authUser = mapSupabaseUserToAuthUser(data.user)
    return NextResponse.json({
      success: true,
      data: {
        user: authUser,
      },
      message: 'Sesion iniciada.',
    })

  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

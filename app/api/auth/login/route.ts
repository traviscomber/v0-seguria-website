import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { mapSupabaseUserToAuthUser, serializeSessionCookie } from '@/lib/auth-store'

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
})

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
}

export async function POST(request: NextRequest) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json(
        { success: false, error: 'Supabase no esta configurado en este entorno.' },
        { status: 503 }
      )
    }

    const payload = await request.json()
    const parsed = loginSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Credenciales invalidas.' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error || !data.user || !data.session?.access_token) {
      return NextResponse.json({ success: false, error: 'No pudimos validar tu acceso en Supabase.' }, { status: 401 })
    }

    const authUser = mapSupabaseUserToAuthUser(data.user)
    const response = NextResponse.json({
      success: true,
      data: {
        user: authUser,
      },
      message: 'Sesion iniciada.',
    })

    response.headers.set('Set-Cookie', serializeSessionCookie(data.session.access_token))
    return response
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

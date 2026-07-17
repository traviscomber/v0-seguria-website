import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  companyName: z.string().trim().min(2).max(120),
  siteName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  password: z.string().min(12).max(128),
  consent: z.literal(true),
})

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'El servicio de acceso no esta configurado.' }, { status: 503 })

  try {
    const parsed = signupSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Revisa los datos y usa una clave de al menos 12 caracteres.' }, { status: 400 })

    const origin = new URL(request.url).origin
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${origin}/login?registered=1`,
        data: {
          full_name: parsed.data.name,
          company_name: parsed.data.companyName,
          site_name: parsed.data.siteName,
          self_service_signup: true,
        },
      },
    })

    if (error) {
      console.error('Signup error:', error.message)
      return NextResponse.json({ success: false, error: 'No fue posible crear la cuenta. Verifica el correo o intenta mas tarde.' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: { requiresEmailConfirmation: !data.session },
      message: data.session ? 'Cuenta creada.' : 'Revisa tu correo para confirmar la cuenta.',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

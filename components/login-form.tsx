'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Leaf, MapPin, ShieldCheck, Sparkles, Wheat } from 'lucide-react'
import { getClientTheme } from '@/lib/client-theme'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

function resolvePostLoginPath(nextPath: string, role?: string) {
  const fallback = role === 'client' ? '/app' : '/admin'
  if (!nextPath.startsWith('/') || nextPath.startsWith('//')) return fallback
  return nextPath
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const theme = useMemo(() => getClientTheme(email), [email])
  const ThemeIcon = theme.key === 'santa-elena' ? Wheat : Leaf

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return

    const formData = new FormData(event.currentTarget)
    const submittedEmail = String(formData.get('email') || '').trim().toLowerCase()
    const submittedPassword = String(formData.get('password') || '')

    setEmail(submittedEmail)
    setPassword(submittedPassword)
    setLoading(true)
    setError(null)

    try {
      if (!submittedEmail || !submittedPassword) {
        throw new Error('Ingresa tu correo y clave.')
      }

      const supabase = createSupabaseBrowserClient()
      if (!supabase) {
        throw new Error('El servicio de acceso no esta configurado.')
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: submittedEmail,
        password: submittedPassword,
      })

      if (signInError || !data.user || !data.session) {
        throw new Error('No pudimos validar tu acceso. Revisa el correo y la clave.')
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session) {
        await supabase.auth.signOut()
        throw new Error('La sesion no pudo guardarse. Intenta nuevamente.')
      }

      const metadataRole = data.user.app_metadata?.platform_role || data.user.app_metadata?.role
      const role = metadataRole === 'admin' || metadataRole === 'technician' ? metadataRole : 'client'
      window.location.replace(resolvePostLoginPath(nextPath, role))
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible iniciar sesion.')
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white" style={{ backgroundColor: theme.pageBackground }}>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url('${theme.backgroundImage}')` }}
      />
      <div className={`absolute inset-0 ${theme.overlayClass}`} />
      <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradientClass}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] items-center gap-12 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 xl:px-20">
        <section className="hidden max-w-2xl lg:block">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm text-white/85 backdrop-blur-md">
            <ThemeIcon className="h-4 w-4" />
            {theme.badge}
          </div>

          <p className={`mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] ${theme.accentTextClass}`}>
            <MapPin className="h-4 w-4" />
            {theme.location}
          </p>

          <h1 className="max-w-2xl text-5xl font-light leading-[1.05] tracking-tight text-white xl:text-7xl">
            {theme.headline}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">{theme.description}</p>

          <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-black/20 p-5 backdrop-blur-md">
              <ShieldCheck className={`mb-4 h-6 w-6 ${theme.accentTextClass}`} />
              <p className="font-medium text-white">Operación protegida</p>
              <p className="mt-2 text-sm leading-6 text-white/55">Visibilidad clara y respuesta coordinada en tiempo real.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/20 p-5 backdrop-blur-md">
              <Sparkles className={`mb-4 h-6 w-6 ${theme.accentTextClass}`} />
              <p className="font-medium text-white">Experiencia personalizada</p>
              <p className="mt-2 text-sm leading-6 text-white/55">Información diseñada para cada operación y su entorno.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className={`rounded-[28px] border border-white/15 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9 ${theme.cardClass}`}>
            <div className="mb-8">
              <img src="/seguria-logo.png" alt="SegurIA" className="mb-7 h-auto w-48 rounded-md" />
              <p className={`text-sm font-medium ${theme.accentTextClass}`}>Acceso seguro</p>
              <h2 className="mt-2 text-3xl font-light text-white">Bienvenido de vuelta</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">Ingresa para acceder al estado de tu operación.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm text-white/75">Correo autorizado</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={`w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3.5 text-white placeholder-white/35 outline-none transition focus:bg-white/[0.13] focus:ring-2 ${theme.focusClass}`}
                  placeholder="usuario@empresa.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-2 block text-sm text-white/75">Clave</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3.5 text-white placeholder-white/35 outline-none transition focus:bg-white/[0.13] focus:ring-2 ${theme.focusClass}`}
                  placeholder="Ingresa tu clave"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && <p className="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl px-4 py-3.5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.accentButtonClass} ${theme.accentButtonTextClass}`}
              >
                {loading ? 'Ingresando...' : 'Entrar al portal'}
              </button>
            </form>

            <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
              <Link href="/contacto" className={`text-sm transition hover:text-white ${theme.accentTextClass}`}>Solicitar acceso</Link>
              <Link href="/" className="text-xs text-white/45 transition hover:text-white">Volver al sitio</Link>
            </div>
          </div>
          <p className="mt-5 text-center text-xs text-white/40">Acceso protegido y supervisado por SegurIA.</p>
        </section>
      </div>
    </main>
  )
}

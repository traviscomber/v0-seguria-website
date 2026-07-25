'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Leaf, MapPin, ShieldCheck, Sparkles } from 'lucide-react'

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No pudimos validar tu acceso.`)
      }

      const result = await response.json()

      if (!result?.success) {
        throw new Error(result?.error || 'No fue posible iniciar sesión.')
      }

      const role = result.data?.user?.role

      if (role === 'client') {
        router.replace(nextPath.startsWith('/app') ? nextPath : '/app')
      } else {
        router.replace('/admin')
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07140f] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=88')",
        }}
      />
      <div className="absolute inset-0 bg-[#04110c]/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#06130f]/95 via-[#071812]/75 to-[#071812]/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#03100c]/90 via-transparent to-[#0c261b]/25" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] items-center gap-12 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 xl:px-20">
        <section className="hidden max-w-2xl lg:block">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-950/35 px-4 py-2 text-sm text-emerald-100 backdrop-blur-md">
            <Leaf className="h-4 w-4" />
            Protección conectada con el entorno
          </div>

          <p className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-emerald-100/80">
            <MapPin className="h-4 w-4" />
            Reserva Biológica Huilo Huilo
          </p>

          <h1 className="max-w-xl text-5xl font-light leading-[1.05] tracking-tight text-white xl:text-7xl">
            Seguridad que cuida cada rincón de la naturaleza.
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">
            Monitoreo inteligente para proteger personas, instalaciones y espacios únicos sin perder la conexión con el paisaje.
          </p>

          <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-black/20 p-5 backdrop-blur-md">
              <ShieldCheck className="mb-4 h-6 w-6 text-emerald-200" />
              <p className="font-medium text-white">Operación protegida</p>
              <p className="mt-2 text-sm leading-6 text-white/55">Visibilidad clara y respuesta coordinada en tiempo real.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/20 p-5 backdrop-blur-md">
              <Sparkles className="mb-4 h-6 w-6 text-emerald-200" />
              <p className="font-medium text-white">Experiencia personalizada</p>
              <p className="mt-2 text-sm leading-6 text-white/55">Información relevante para cada propiedad y cada equipo.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-[28px] border border-white/15 bg-[#07140f]/72 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
            <div className="mb-8">
              <img
                src="/seguria-logo.png"
                alt="SegurIA"
                className="mb-7 h-auto w-48 rounded-md"
              />
              <p className="text-sm font-medium text-emerald-200">Acceso seguro</p>
              <h2 className="mt-2 text-3xl font-light text-white">Bienvenido de vuelta</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                Ingresa para acceder a la operación y al estado de tus propiedades.
              </p>
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
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3.5 text-white placeholder-white/35 outline-none transition focus:border-emerald-300/50 focus:bg-white/[0.13] focus:ring-2 focus:ring-emerald-300/10"
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
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3.5 text-white placeholder-white/35 outline-none transition focus:border-emerald-300/50 focus:bg-white/[0.13] focus:ring-2 focus:ring-emerald-300/10"
                  placeholder="Ingresa tu clave"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <p className="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-400 px-4 py-3.5 text-[15px] font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Ingresando...' : 'Entrar al portal'}
              </button>
            </form>

            <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
              <Link href="/contacto" className="text-sm text-emerald-200 transition hover:text-emerald-100">Solicitar acceso</Link>
              <Link href="/" className="text-xs text-white/45 transition hover:text-white">Volver al sitio</Link>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-white/40">
            Acceso protegido y supervisado por SegurIA.
          </p>
        </section>
      </div>
    </main>
  )
}

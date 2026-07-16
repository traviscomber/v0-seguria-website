'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
      const result = await response.json().catch(() => null)

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'No fue posible iniciar sesion.')
      }

      const role = result.data?.user?.role
      if (role === 'client') {
        router.replace(nextPath.startsWith('/app') ? nextPath : '/app')
      } else {
        router.replace('/admin')
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible iniciar sesion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A1B2E] px-6">
      <div className="glass-card w-full max-w-md p-8">
        <div className="mb-8">
          <p className="text-sm text-[#4DA3D9]">SegurIA Access</p>
          <h1 className="mt-2 text-3xl font-light text-white">Iniciar sesion</h1>
          <p className="mt-2 text-sm text-white/55">Acceso para clientes, tecnicos y administradores.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/70">Correo autorizado</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-[5px] bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
              placeholder="usuario@empresa.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/70">Clave</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-[5px] bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
              placeholder="Ingresa tu clave"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="rounded-[5px] border border-red-300/40 bg-red-500/10 px-4 py-3 text-[14px] text-red-100">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-[15px] disabled:opacity-60">
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 rounded-[5px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/55">
          Usa una cuenta autorizada por el equipo interno. La validacion de acceso se resuelve en Supabase.
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <Link href="/" className="text-sm text-[#4DA3D9] hover:underline">
            Volver al sitio
          </Link>
          <span className="text-xs text-white/35">Portal interno seguro</span>
        </div>
      </div>
    </main>
  )
}

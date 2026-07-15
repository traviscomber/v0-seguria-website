'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const nextPath = '/admin'
  const [email, setEmail] = useState('admin@seguria.local')
  const [password, setPassword] = useState('seguria-admin')
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

      router.replace(result.data?.user?.role === 'client' ? '/app' : nextPath)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible iniciar sesion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A1B2E] flex items-center justify-center px-6">
      <div className="w-full max-w-md glass-card p-8">
        <div className="mb-8">
          <p className="text-[#4DA3D9] text-sm">SegurIA Access</p>
          <h1 className="text-3xl font-light text-white mt-2">Iniciar sesion</h1>
          <p className="text-white/55 mt-2 text-sm">
            Acceso para clientes, tecnicos y administradores.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
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

        <div className="mt-6 text-sm text-white/55 space-y-1">
          <p>Demo admin: admin@seguria.local / seguria-admin</p>
          <p>Demo tecnico: tech@seguria.local / seguria-tech</p>
          <p>Demo cliente: client@seguria.local / seguria-client</p>
        </div>

        <div className="mt-6">
          <Link href="/" className="text-[#4DA3D9] text-sm hover:underline">
            Volver al sitio
          </Link>
        </div>
      </div>
    </main>
  )
}

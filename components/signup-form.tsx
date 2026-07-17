'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignupForm() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', companyName: '', siteName: '', email: '', password: '', consent: false })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible crear la cuenta.')
      router.replace(result.data?.requiresEmailConfirmation ? '/login?registered=1' : '/app')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible crear la cuenta.')
    } finally { setLoading(false) }
  }

  const update = (field: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }))

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.18),transparent_36%),#0A1B2E] px-6 py-12">
      <div className="glass-card w-full max-w-xl p-8">
        <p className="text-sm text-[#9DD2F2]">SegurIA Access</p>
        <h1 className="mt-2 text-3xl font-light text-white">Crear portal</h1>
        <p className="mt-2 text-sm leading-6 text-white/55">Configura tu empresa y primer sitio protegido. Luego podras conectar equipos y asignar espacios.</p>
        <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <Field label="Tu nombre"><Input value={form.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" required /></Field>
          <Field label="Empresa"><Input value={form.companyName} onChange={(e) => update('companyName', e.target.value)} autoComplete="organization" required /></Field>
          <Field label="Sitio principal"><Input value={form.siteName} onChange={(e) => update('siteName', e.target.value)} placeholder="Casa, oficina o sucursal" required /></Field>
          <Field label="Correo"><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" required /></Field>
          <div className="sm:col-span-2"><Field label="Clave segura"><Input type="password" minLength={12} value={form.password} onChange={(e) => update('password', e.target.value)} autoComplete="new-password" placeholder="Minimo 12 caracteres" required /></Field></div>
          <label className="sm:col-span-2 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/60"><input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} required className="mt-1 accent-[#4DA3D9]" /><span>Acepto el tratamiento de datos necesario para crear y operar mi portal.</span></label>
          {error && <p className="sm:col-span-2 rounded-xl border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
          <button disabled={loading} className="btn-primary sm:col-span-2 py-3 disabled:opacity-60">{loading ? 'Creando portal...' : 'Crear cuenta'}</button>
        </form>
        <div className="mt-6 flex justify-between text-sm"><Link href="/login" className="text-[#9DD2F2] hover:underline">Ya tengo una cuenta</Link><Link href="/" className="text-white/45 hover:text-white">Volver al sitio</Link></div>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm text-white/65">{label}</span>{children}</label> }
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]" /> }

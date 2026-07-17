'use client'

import { useState } from 'react'
import { CheckCircle2, Copy, Loader2, Plus, ShieldCheck } from 'lucide-react'

type ProvisionResult = {
  companyName: string
  clientEmail: string
  organizationId: string
  propertyId: string
}

const initialForm = {
  company_name: '',
  client_email: '',
  password: '',
  site_name: '',
  address: '',
}

function generatePassword() {
  const alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const symbols = '!@#$%+'
  const values = crypto.getRandomValues(new Uint32Array(18))
  const body = Array.from(values, (value) => alphabet[value % alphabet.length]).join('')
  const symbol = symbols[values[0] % symbols.length]
  return `${body}${symbol}7`
}

export function ClientProvisionForm() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ProvisionResult | null>(null)
  const [copied, setCopied] = useState(false)

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setCopied(false)

    try {
      const response = await fetch('/api/clients/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'No fue posible crear el cliente.')
      }
      setResult(payload.data)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible crear el cliente.')
    } finally {
      setLoading(false)
    }
  }

  async function copyAccess() {
    const text = [
      `Portal: ${window.location.origin}/login`,
      `Correo: ${form.client_email}`,
      `Clave temporal: ${form.password}`,
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }

  return (
    <section className="glass-card p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#4DA3D9]/25 bg-[#4DA3D9]/12 px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#9DD2F2]">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.7} />
            Alta interna
          </div>
          <h2 className="mt-4 text-2xl font-light text-white">Crear portal de cliente</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
            Crea la cuenta real en Supabase Auth, la empresa, el primer sitio y los espacios base. El cliente solo recibe
            acceso a su portal SegurIA.
          </p>
        </div>
        <button
          type="button"
          onClick={() => update('password', generatePassword())}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
        >
          <Plus className="h-4 w-4" strokeWidth={1.7} />
          Generar clave
        </button>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-4 lg:grid-cols-5">
        <Field label="Empresa" className="lg:col-span-2">
          <Input value={form.company_name} onChange={(event) => update('company_name', event.target.value)} autoComplete="organization" required />
        </Field>
        <Field label="Correo autorizado" className="lg:col-span-2">
          <Input type="email" value={form.client_email} onChange={(event) => update('client_email', event.target.value)} autoComplete="email" required />
        </Field>
        <Field label="Clave temporal">
          <Input type="text" minLength={12} value={form.password} onChange={(event) => update('password', event.target.value)} required />
        </Field>
        <Field label="Sitio principal" className="lg:col-span-2">
          <Input value={form.site_name} onChange={(event) => update('site_name', event.target.value)} placeholder="Casa, oficina, sucursal o campo" required />
        </Field>
        <Field label="Direccion / referencia" className="lg:col-span-3">
          <Input value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="Comuna, ciudad o referencia operativa" />
        </Field>

        {error && (
          <p className="lg:col-span-5 rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        )}

        {result && (
          <div className="lg:col-span-5 rounded-xl border border-emerald-300/25 bg-emerald-500/10 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" strokeWidth={1.8} />
                <div>
                  <p className="text-sm text-emerald-100">Portal creado para {result.companyName}.</p>
                  <p className="mt-1 text-xs text-white/45">
                    Organizacion {result.organizationId} | Sitio {result.propertyId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={copyAccess}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                <Copy className="h-4 w-4" strokeWidth={1.7} />
                {copied ? 'Copiado' : 'Copiar acceso'}
              </button>
            </div>
          </div>
        )}

        <div className="lg:col-span-5 flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary inline-flex min-w-44 items-center justify-center gap-2 px-5 py-3 text-sm disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />}
            {loading ? 'Creando...' : 'Crear cliente'}
          </button>
        </div>
      </form>
    </section>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm text-white/65">{label}</span>
      {children}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
    />
  )
}

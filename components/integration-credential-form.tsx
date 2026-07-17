'use client'

import { useState } from 'react'
import { CheckCircle2, KeyRound, Loader2, LockKeyhole, RefreshCw } from 'lucide-react'

type PropertyOption = {
  id: string
  name: string
  location: string
  organizationName: string
}

type CredentialSummary = {
  id: string
  propertyId: string
  provider: 'home_assistant' | 'tuya' | 'github'
  label: string
  accountIdentifier: string | null
  credentialKind: string
  secretHint: string | null
  status: string
  rotationDueAt: string | null
  lastValidatedAt: string | null
  updatedAt: string
}

const providerLabels = {
  home_assistant: 'Puente local',
  tuya: 'Cuenta de cliente',
}

const initialForm = {
  propertyId: '',
  provider: 'home_assistant',
  label: 'Conector principal',
  endpoint: '',
  accountIdentifier: '',
  credentialKind: 'api_token',
  secret: '',
  notes: '',
  rotationDays: '90',
}

const inputClass = 'w-full rounded-[5px] border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/35 outline-none ring-[#4DA3D9] focus:ring-1'

function formatDate(value: string | null) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(new Date(value))
}

export function IntegrationCredentialForm({
  properties,
  initialCredentials,
}: {
  properties: PropertyOption[]
  initialCredentials: CredentialSummary[]
}) {
  const [form, setForm] = useState({ ...initialForm, propertyId: properties[0]?.id || '' })
  const [credentials, setCredentials] = useState(initialCredentials)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function refreshCredentials() {
    const response = await fetch('/api/admin/integration-credentials', { cache: 'no-store' })
    const payload = await response.json().catch(() => null)
    if (response.ok && payload?.success) setCredentials(payload.data)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/integration-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          rotationDays: form.rotationDays ? Number(form.rotationDays) : undefined,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'No fue posible guardar la credencial.')
      }
      setSuccess('Credencial interna guardada. El secreto quedo cifrado y no se vuelve a mostrar.')
      setForm((current) => ({ ...current, secret: '' }))
      await refreshCredentials()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible guardar la credencial.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="glass-card border border-[#4DA3D9]/20 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[5px] bg-[#4DA3D9]/20">
            <LockKeyhole className="h-5 w-5 text-[#4DA3D9]" strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-sm text-[#4DA3D9]">Credenciales internas</p>
            <h2 className="mt-1 text-2xl font-light text-white">Cuenta o token por propiedad</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Registra el acceso operativo que usara SegurIA para preparar el puente, sincronizar equipos y dejar el
              portal listo para el cliente.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={refreshCredentials}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-sm text-white hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.7} />
          Actualizar
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="mt-6 rounded-[5px] bg-amber-500/10 p-4 text-sm text-amber-200">
          Primero crea una empresa y sitio desde el panel interno.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 grid gap-4 lg:grid-cols-6">
          <Field label="Propiedad" className="lg:col-span-2">
            <select value={form.propertyId} onChange={(event) => update('propertyId', event.target.value)} className={inputClass}>
              {properties.map((property) => (
                <option key={property.id} value={property.id} className="bg-[#123A5A]">
                  {property.organizationName} | {property.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo interno">
            <select value={form.provider} onChange={(event) => update('provider', event.target.value)} className={inputClass}>
              <option value="home_assistant" className="bg-[#123A5A]">Puente local</option>
              <option value="tuya" className="bg-[#123A5A]">Cuenta de cliente</option>
            </select>
          </Field>
          <Field label="Nombre" className="lg:col-span-2">
            <Input value={form.label} onChange={(event) => update('label', event.target.value)} required />
          </Field>
          <Field label="Rotacion">
            <select value={form.rotationDays} onChange={(event) => update('rotationDays', event.target.value)} className={inputClass}>
              <option value="30" className="bg-[#123A5A]">30 dias</option>
              <option value="90" className="bg-[#123A5A]">90 dias</option>
              <option value="180" className="bg-[#123A5A]">180 dias</option>
              <option value="" className="bg-[#123A5A]">Sin fecha</option>
            </select>
          </Field>
          <Field label="Endpoint interno" className="lg:col-span-2">
            <Input value={form.endpoint} onChange={(event) => update('endpoint', event.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Identificador cuenta" className="lg:col-span-2">
            <Input value={form.accountIdentifier} onChange={(event) => update('accountIdentifier', event.target.value)} placeholder="correo, cuenta o alias interno" />
          </Field>
          <Field label="Tipo credencial" className="lg:col-span-2">
            <select value={form.credentialKind} onChange={(event) => update('credentialKind', event.target.value)} className={inputClass}>
              <option value="api_token" className="bg-[#123A5A]">Token API</option>
              <option value="account_password" className="bg-[#123A5A]">Clave de cuenta</option>
              <option value="oauth_refresh" className="bg-[#123A5A]">Refresh token</option>
              <option value="webhook_secret" className="bg-[#123A5A]">Secreto webhook</option>
              <option value="other" className="bg-[#123A5A]">Otro</option>
            </select>
          </Field>
          <Field label="Secreto" className="lg:col-span-3">
            <Input type="password" value={form.secret} onChange={(event) => update('secret', event.target.value)} minLength={8} required />
          </Field>
          <Field label="Nota operativa" className="lg:col-span-3">
            <Input value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Uso, alcance o condicion especial" />
          </Field>

          {error && <p className="lg:col-span-6 rounded-[5px] bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
          {success && (
            <p className="lg:col-span-6 flex items-center gap-2 rounded-[5px] bg-emerald-500/10 p-4 text-sm text-emerald-200">
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.7} />
              {success}
            </p>
          )}

          <div className="lg:col-span-6 flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Guardar credencial
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-light text-white">Cuentas internas guardadas</h3>
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/50">{credentials.length} registros</span>
        </div>
        <div className="mt-4 grid gap-3">
          {credentials.length === 0 ? (
            <p className="rounded-[5px] bg-white/5 p-5 text-sm text-white/50">Todavia no hay credenciales guardadas.</p>
          ) : (
            credentials.map((credential) => {
              const property = properties.find((item) => item.id === credential.propertyId)
              return (
                <div key={credential.id} className="rounded-[5px] border border-white/8 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm text-white">{credential.label}</p>
                        <span className="rounded-full bg-[#4DA3D9]/12 px-2 py-1 text-[11px] text-[#9DD2F2]">
                          {providerLabels[credential.provider as keyof typeof providerLabels] || 'Interno'}
                        </span>
                        <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] text-white/50">{credential.status}</span>
                      </div>
                      <p className="mt-2 text-xs text-white/45">
                        {property ? `${property.organizationName} | ${property.name}` : credential.propertyId}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        Cuenta: {credential.accountIdentifier || 'sin alias'} | Secreto: {credential.secretHint || 'guardado'}
                      </p>
                    </div>
                    <div className="text-xs text-white/45 md:text-right">
                      <p>Rotacion: {formatDate(credential.rotationDueAt)}</p>
                      <p className="mt-1">Actualizado: {formatDate(credential.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
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
    <label className={`grid gap-2 text-sm text-white/65 ${className}`}>
      {label}
      {children}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />
}

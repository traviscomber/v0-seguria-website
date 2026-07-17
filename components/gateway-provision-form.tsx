'use client'

import { useState } from 'react'
import { Check, Copy, KeyRound, LoaderCircle, PlugZap } from 'lucide-react'

type PropertyOption = {
  id: string
  name: string
  location: string
}

type ProvisionResult = {
  gateway: {
    public_id: string
    name: string
    status: string
  }
  secret: string
}

export function GatewayProvisionForm({ properties }: { properties: PropertyOption[] }) {
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '')
  const [name, setName] = useState('Conector principal')
  const [result, setResult] = useState<ProvisionResult | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setResult(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/gateways/provision', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ propertyId, name }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'No fue posible crear el conector.')
      setResult(payload.data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible crear el conector.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function copyConfiguration() {
    if (!result) return
    await navigator.clipboard.writeText(
      `SEGURIA_GATEWAY_ID=${result.gateway.public_id}\nSEGURIA_GATEWAY_SECRET=${result.secret}`
    )
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="glass-card border border-[#4DA3D9]/25 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[5px] bg-[#4DA3D9]/20">
          <PlugZap className="h-5 w-5 text-[#4DA3D9]" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm text-[#4DA3D9]">Activacion segura</p>
          <h2 className="mt-1 text-2xl font-light text-white">Crear conector para una propiedad</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
            Cada instalacion recibe una identidad propia. Si una credencial debe revocarse, las demas propiedades siguen operando.
          </p>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="mt-6 rounded-[5px] bg-amber-500/10 p-4 text-sm text-amber-200">
          Primero crea una propiedad y asignala al equipo responsable.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="grid gap-2 text-sm text-white/65">
            Propiedad
            <select
              value={propertyId}
              onChange={(event) => setPropertyId(event.target.value)}
              className="rounded-[5px] bg-white/10 px-4 py-3 text-white outline-none ring-[#4DA3D9] focus:ring-1"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id} className="bg-[#123A5A]">
                  {property.name} - {property.location}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-white/65">
            Nombre interno
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={120}
              className="rounded-[5px] bg-white/10 px-4 py-3 text-white outline-none ring-[#4DA3D9] focus:ring-1"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting || !propertyId}
            className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Crear
          </button>
        </form>
      )}

      {error && <p className="mt-4 rounded-[5px] bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}

      {result && (
        <div className="mt-6 rounded-[5px] border border-green-500/25 bg-green-500/10 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-green-300">
                <Check className="h-4 w-4" /> Conector creado
              </p>
              <p className="mt-2 text-sm text-white/60">Guarda esta configuracion ahora. El secreto no volvera a mostrarse.</p>
            </div>
            <button type="button" onClick={copyConfiguration} className="inline-flex items-center gap-2 text-sm text-[#9DD2F2]">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado' : 'Copiar configuracion'}
            </button>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-[5px] bg-[#071625] p-4 text-xs leading-6 text-white/75">{`SEGURIA_GATEWAY_ID=${result.gateway.public_id}\nSEGURIA_GATEWAY_SECRET=${result.secret}`}</pre>
        </div>
      )}
    </section>
  )
}

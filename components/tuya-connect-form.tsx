'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, PlugZap } from 'lucide-react'

export function TuyaConnectForm() {
  const [accountName, setAccountName] = useState('N3uralia')
  const [accountEmail, setAccountEmail] = useState('juan@n3uralia.com')
  const [siteName, setSiteName] = useState('Sitio principal')
  const [accountScope, setAccountScope] = useState('Cuenta maestra')
  const [message, setMessage] = useState<string | null>(null)
  const [linkedAccount, setLinkedAccount] = useState<{
    accountName: string
    accountEmail: string
    siteName: string
    accountScope: string
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/integrations/tuya/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_name: accountName,
          account_email: accountEmail,
          site_name: siteName,
          account_scope: accountScope,
        }),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        setMessage(result.error || 'No se pudo vincular la cuenta maestra.')
        return
      }

      setMessage('Cuenta maestra lista. Ahora puedes importar dispositivos y ver su estado.')
      setLinkedAccount({
        accountName,
        accountEmail,
        siteName,
        accountScope,
      })
    } catch {
      setMessage('No se pudo vincular la cuenta maestra.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card space-y-5 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[5px] bg-[#4DA3D9]/20">
          <PlugZap className="w-5 h-5 text-[#4DA3D9]" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-lg font-light text-white">Vincular cuenta maestra</h3>
          <p className="text-sm text-white/55">Deja la cuenta central lista para traer dispositivos y eventos de todos los clientes.</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm text-white/55">Cuenta maestra</span>
          <input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full rounded-[5px] bg-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
            placeholder="N3uralia"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-white/55">Correo</span>
          <input
            type="email"
            value={accountEmail}
            onChange={(e) => setAccountEmail(e.target.value)}
            className="w-full rounded-[5px] bg-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
            placeholder="juan@n3uralia.com"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-white/55">Sitio</span>
          <input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full rounded-[5px] bg-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
            placeholder="Sitio principal"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-white/55">Alcance</span>
          <input
            value={accountScope}
            onChange={(e) => setAccountScope(e.target.value)}
            className="w-full rounded-[5px] bg-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
            placeholder="Cuenta maestra"
          />
        </label>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-[15px] disabled:opacity-70"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlugZap className="w-4 h-4" strokeWidth={1.5} />}
          {isSaving ? 'Vinculando...' : 'Vincular cuenta maestra y traer datos'}
        </button>
        <p className="text-sm text-white/45">
          Esto deja la cuenta central lista para importar equipos y empezar a mostrar estado.
        </p>
      </div>

      {message && (
        <div className="rounded-[5px] bg-white/5 px-4 py-3 text-sm text-white/75">
          {message}
        </div>
      )}

      {linkedAccount && (
        <div className="rounded-[5px] border border-[#4DA3D9]/30 bg-[#4DA3D9]/10 px-4 py-3 text-sm text-white/80">
          <p className="font-light text-white">Cuenta maestra vinculada</p>
          <p className="mt-1 text-white/60">Nombre: {linkedAccount.accountName}</p>
          <p className="text-white/60">Correo: {linkedAccount.accountEmail}</p>
          <p className="text-white/60">Sitio: {linkedAccount.siteName}</p>
          <p className="text-white/60">Alcance: {linkedAccount.accountScope}</p>
        </div>
      )}
    </form>
  )
}

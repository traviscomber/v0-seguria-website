'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, PlugZap } from 'lucide-react'

export function TuyaConnectForm() {
  const [accountName, setAccountName] = useState('Cuenta principal')
  const [siteName, setSiteName] = useState('Sitio principal')
  const [accountScope, setAccountScope] = useState('SegurIA Pro')
  const [message, setMessage] = useState<string | null>(null)
  const [linkedAccount, setLinkedAccount] = useState<{ accountName: string; siteName: string; accountScope: string } | null>(null)
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
          site_name: siteName,
          account_scope: accountScope,
        }),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        setMessage(result.error || 'No se pudo setear la cuenta del cliente.')
        return
      }

      setMessage('Cuenta lista. Ahora puedes importar dispositivos y ver su estado.')
      setLinkedAccount({
        accountName,
        siteName,
        accountScope,
      })
    } catch {
      setMessage('No se pudo setear la cuenta del cliente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center">
          <PlugZap className="w-5 h-5 text-[#4DA3D9]" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-white font-light text-lg">Setear cuenta del cliente</h3>
          <p className="text-white/55 text-sm">Deja la cuenta lista para traer dispositivos y eventos.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <label className="space-y-2">
          <span className="text-white/55 text-sm">Nombre de cuenta</span>
          <input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full rounded-[5px] bg-white/10 text-white px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
            placeholder="Cuenta principal"
          />
        </label>
        <label className="space-y-2">
          <span className="text-white/55 text-sm">Sitio</span>
          <input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full rounded-[5px] bg-white/10 text-white px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
            placeholder="Sitio principal"
          />
        </label>
        <label className="space-y-2">
          <span className="text-white/55 text-sm">Alcance</span>
          <input
            value={accountScope}
            onChange={(e) => setAccountScope(e.target.value)}
            className="w-full rounded-[5px] bg-white/10 text-white px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
            placeholder="SegurIA Pro"
          />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary px-5 py-3 text-[15px] inline-flex items-center gap-2 disabled:opacity-70"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlugZap className="w-4 h-4" strokeWidth={1.5} />}
          {isSaving ? 'Seteando...' : 'Setear cuenta del cliente'}
        </button>
        <p className="text-white/45 text-sm">
          Esto deja la cuenta lista para importar equipos y empezar a mostrar estado.
        </p>
      </div>

      {message && (
        <div className="rounded-[5px] bg-white/5 px-4 py-3 text-sm text-white/75">
          {message}
        </div>
      )}

      {linkedAccount && (
        <div className="rounded-[5px] border border-[#4DA3D9]/30 bg-[#4DA3D9]/10 px-4 py-3 text-sm text-white/80">
          <p className="font-light text-white">Cuenta vinculada</p>
          <p className="mt-1 text-white/60">Nombre: {linkedAccount.accountName}</p>
          <p className="text-white/60">Sitio: {linkedAccount.siteName}</p>
          <p className="text-white/60">Alcance: {linkedAccount.accountScope}</p>
        </div>
      )}
    </form>
  )
}

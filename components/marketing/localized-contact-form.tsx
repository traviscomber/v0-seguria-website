'use client'

import { useState } from 'react'
import type { Locale } from '@/lib/locales'
import { marketing } from '@/lib/marketing-content'

export function LocalizedContactForm({ locale }: { locale: Locale }) {
  const copy = marketing[locale].contact
  const isEnglish = locale === 'en'
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setError('')

    const data = new FormData(event.currentTarget)
    const payload = {
      nombre: String(data.get('nombre') || ''),
      telefono: String(data.get('telefono') || ''),
      email: String(data.get('email') || ''),
      tipoProyecto: String(data.get('tipoProyecto') || 'propiedad'),
      ubicacion: String(data.get('ubicacion') || ''),
      tamanoAproximado: '',
      necesidadPrincipal: 'integral',
      tieneCamaras: String(data.get('tieneCamaras') || 'parcial'),
      tieneInternet: 'si',
      cantidadSitios: 'uno',
      urgencia: 'normal',
      tipoServicio: 'propuesta',
      mensaje: String(data.get('mensaje') || ''),
      website: '',
      consent: data.get('consent') === 'on',
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || (isEnglish ? 'Could not send the request.' : 'No se pudo enviar la solicitud.'))
      }
      setStatus('sent')
      event.currentTarget.reset()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : isEnglish ? 'Could not send the request.' : 'No se pudo enviar la solicitud.')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[32px] border border-white/10 bg-white/6 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={copy.name}>
          <input name="nombre" required className={fieldClass} />
        </Field>
        <Field label={isEnglish ? 'Phone' : 'Telefono'}>
          <input name="telefono" required className={fieldClass} />
        </Field>
        <Field label={copy.email}>
          <input name="email" type="email" required className={fieldClass} />
        </Field>
        <Field label={isEnglish ? 'Type of site' : 'Tipo de sitio'}>
          <select name="tipoProyecto" required className={fieldClass} defaultValue="propiedad">
            <option value="propiedad">{isEnglish ? 'Property / business' : 'Propiedad / negocio'}</option>
            <option value="campo">{isEnglish ? 'Field / rural operation' : 'Campo / operacion rural'}</option>
          </select>
        </Field>
        <Field label={isEnglish ? 'Location' : 'Ubicacion'}>
          <input name="ubicacion" className={fieldClass} />
        </Field>
        <Field label={isEnglish ? 'Current equipment' : 'Equipos actuales'}>
          <select name="tieneCamaras" className={fieldClass} defaultValue="parcial">
            <option value="parcial">{isEnglish ? 'Some equipment, needs intelligence' : 'Algunos equipos, falta inteligencia'}</option>
            <option value="si">{isEnglish ? 'Existing cameras or sensors' : 'Camaras o sensores existentes'}</option>
            <option value="no">{isEnglish ? 'Starting from zero' : 'Partimos de cero'}</option>
          </select>
        </Field>
      </div>
      <div className="mt-5">
        <Field label={copy.message}>
          <textarea name="mensaje" rows={6} className={`${fieldClass} resize-none`} />
        </Field>
      </div>
      <label className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/65">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[#4DA3D9]" />
        <span>{isEnglish ? 'I authorize SegurIA to use this information to respond to my request.' : 'Acepto que SegurIA use estos datos para responder mi solicitud.'}</span>
      </label>
      {status === 'sent' && (
        <p className="mt-5 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {isEnglish ? 'Request received. We will contact you with the next step.' : 'Solicitud recibida. Te contactaremos con el siguiente paso.'}
        </p>
      )}
      {status === 'error' && <p className="mt-5 rounded-2xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
      <button type="submit" disabled={status === 'loading'} className="btn-primary mt-6 w-full px-6 py-4 text-[15px] disabled:opacity-60">
        {status === 'loading' ? (isEnglish ? 'Sending...' : 'Enviando...') : copy.send}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm text-white/72">
      <span>{label}</span>
      {children}
    </label>
  )
}

const fieldClass =
  'mt-2 w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]'


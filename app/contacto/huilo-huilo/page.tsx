'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Headphones, Leaf, Mail, MapPin, MessageCircle, Send, ShieldCheck, Trees } from 'lucide-react'

type SupportForm = {
  nombre: string
  telefono: string
  email: string
  mensaje: string
  website: string
  consent: boolean
}

export default function HuiloHuiloSupportPage() {
  const [form, setForm] = useState<SupportForm>({
    nombre: '',
    telefono: '',
    email: '',
    mensaje: '',
    website: '',
    consent: false,
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.target
    setForm((current) => ({
      ...current,
      [target.name]: target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value,
    }))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('sending')
    setError('')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tipoProyecto: 'hoteleria_huilo_huilo',
          ubicacion: 'Reserva Biológica Huilo Huilo',
          necesidadPrincipal: 'soporte_portal_cliente',
          urgencia: 'pronto',
          tipoServicio: 'soporte',
          cantidadSitios: 'uno',
          tieneCamaras: 'si',
          tieneInternet: 'si',
          tamanoAproximado: 'Operación Huilo Huilo',
        }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No se pudo enviar la solicitud.')
      setStatus('sent')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo enviar la solicitud.')
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-[#03140f] text-white">
      <header className="sticky top-0 z-40 border-b border-emerald-100/10 bg-[#041811]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/app" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200/15 bg-emerald-200/[0.06] text-emerald-200">
              <Trees className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <span>
              <span className="block text-[9px] uppercase tracking-[0.24em] text-white/35">Portal SegurIA</span>
              <span className="mt-0.5 block text-sm font-medium">Huilo Huilo</span>
            </span>
          </Link>
          <Link href="/app" className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-white/65 transition-colors hover:bg-white/[0.05] hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Volver al portal
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(110,231,183,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(110,231,183,0.035) 1px,transparent 1px)", backgroundSize: '48px 48px' }} />
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_65%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[28px] border border-emerald-100/10 bg-[#071d16]/80 p-7 shadow-2xl shadow-black/20 lg:p-9">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/[0.06] px-4 py-2 text-xs uppercase tracking-[0.18em] text-emerald-200">
              <Headphones className="h-4 w-4" />
              Ayuda Huilo Huilo
            </div>
            <h1 className="mt-7 text-balance text-4xl font-light leading-tight md:text-5xl">Soporte para la operación de la reserva.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/62">
              Describe lo que necesitas revisar en el portal, las cámaras, los espacios o las alertas. El equipo de SegurIA recibirá la solicitud con el contexto de Huilo Huilo.
            </p>

            <div className="mt-8 space-y-3">
              {[
                ['Portal y accesos', 'Problemas de ingreso, navegación o visualización.'],
                ['Vigilancia y cámaras', 'Revisión de imágenes, feeds y puntos de monitoreo.'],
                ['Alertas e incidentes', 'Ayuda con prioridades, seguimiento y cierres.'],
              ].map(([title, description]) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/45">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <Mail className="h-5 w-5 text-emerald-200" />
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/35">Email</p>
                <p className="mt-1 text-sm">contacto@seguria.cl</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <MapPin className="h-5 w-5 text-emerald-200" />
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/35">Contexto</p>
                <p className="mt-1 text-sm">Reserva Huilo Huilo</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-emerald-100/10 bg-[#081f17]/90 p-7 shadow-2xl shadow-black/25 lg:p-9">
            {status === 'sent' ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200/20 bg-emerald-200/[0.08] text-emerald-200">
                  <Leaf className="h-8 w-8" />
                </span>
                <h2 className="mt-6 text-3xl font-light">Solicitud recibida</h2>
                <p className="mt-4 max-w-md text-base leading-7 text-white/55">El equipo recibió tu solicitud identificada como soporte de Huilo Huilo.</p>
                <Link href="/app" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-sm font-medium text-[#052117]">
                  Volver al portal
                </Link>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Solicitud de soporte</p>
                    <h2 className="mt-2 text-2xl font-light">Cuéntanos qué está ocurriendo</h2>
                  </div>
                  <MessageCircle className="h-6 w-6 text-emerald-200/70" />
                </div>

                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" value={form.website} onChange={update} tabIndex={-1} autoComplete="off" />
                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <Field label="Nombre *"><Input name="nombre" value={form.nombre} onChange={update} required /></Field>
                  <Field label="Teléfono *"><Input name="telefono" value={form.telefono} onChange={update} required /></Field>
                  <div className="sm:col-span-2"><Field label="Email *"><Input name="email" type="email" value={form.email} onChange={update} required /></Field></div>
                  <div className="sm:col-span-2"><Field label="¿Qué necesitas resolver? *"><Textarea name="mensaje" rows={8} value={form.mensaje} onChange={update} placeholder="Describe el problema, la sección del portal y cualquier detalle relevante." required /></Field></div>
                </div>

                <label className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/55">
                  <input type="checkbox" name="consent" checked={form.consent} onChange={update} required className="mt-1 h-4 w-4 accent-emerald-300" />
                  <span>Acepto que SegurIA use estos datos para responder esta solicitud de soporte.</span>
                </label>

                {error ? <p className="mt-5 rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p> : null}

                <button type="submit" disabled={status === 'sending'} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-6 py-4 text-sm font-medium text-[#052117] transition-colors hover:bg-emerald-200 disabled:opacity-60">
                  <Send className="h-4 w-4" />
                  {status === 'sending' ? 'Enviando solicitud…' : 'Enviar a soporte SegurIA'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-2"><span className="block text-sm text-white/65">{label}</span>{children}</label>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-emerald-200/40 focus:ring-1 focus:ring-emerald-200/30" />
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full resize-none rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-emerald-200/40 focus:ring-1 focus:ring-emerald-200/30" />
}

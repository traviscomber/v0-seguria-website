'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft,
  BellRing,
  Camera,
  Check,
  ChevronRight,
  Headphones,
  KeyRound,
  Leaf,
  MessageCircle,
  Send,
  Trees,
} from 'lucide-react'

type SupportForm = {
  nombre: string
  telefono: string
  email: string
  mensaje: string
  website: string
  consent: boolean
}

type SupportTopic = 'acceso' | 'vigilancia' | 'alertas' | 'otro'

const supportTopics = [
  {
    id: 'acceso' as const,
    icon: KeyRound,
    label: 'Acceso y portal',
    prompt: 'Tengo un problema de acceso o navegación en el portal.',
  },
  {
    id: 'vigilancia' as const,
    icon: Camera,
    label: 'Vigilancia',
    prompt: 'Necesito revisar una cámara, imagen o punto de vigilancia.',
  },
  {
    id: 'alertas' as const,
    icon: BellRing,
    label: 'Alertas',
    prompt: 'Necesito ayuda con una alerta, prioridad o incidente.',
  },
  {
    id: 'otro' as const,
    icon: MessageCircle,
    label: 'Otro tema',
    prompt: '',
  },
]

export default function HuiloHuiloSupportPage() {
  const [form, setForm] = useState<SupportForm>({
    nombre: '',
    telefono: '',
    email: '',
    mensaje: '',
    website: '',
    consent: false,
  })
  const [topic, setTopic] = useState<SupportTopic>('acceso')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.target
    setForm((current) => ({
      ...current,
      [target.name]: target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value,
    }))
  }

  const selectTopic = (nextTopic: SupportTopic) => {
    setTopic(nextTopic)
    const selected = supportTopics.find((item) => item.id === nextTopic)
    if (!selected?.prompt) return

    setForm((current) => ({
      ...current,
      mensaje: current.mensaje.trim() ? current.mensaje : selected.prompt,
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
          necesidadPrincipal: `soporte_portal_cliente_${topic}`,
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
    <main className="min-h-screen bg-[#03130e] text-white">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#03130e]/86 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/app#resumen" className="flex min-w-0 items-center gap-3" aria-label="Volver al portal Huilo Huilo">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-emerald-200">
              <Trees className="h-4.5 w-4.5" strokeWidth={1.7} />
            </span>
            <span className="min-w-0">
              <span className="block text-[9px] uppercase tracking-[0.22em] text-white/35">Portal SegurIA</span>
              <span className="block truncate text-sm font-medium">Huilo Huilo</span>
            </span>
          </Link>

          <Link
            href="/app#resumen"
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-white/55 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver al portal</span>
          </Link>
        </div>
      </header>

      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-30 bg-cover bg-center"
          style={{ backgroundImage: "url('/api/demo/huilo-huilo/huilo-huilo-forest-trail.png')" }}
        />
        <div className="absolute inset-0 -z-20 bg-[#03130e]/72" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#03130e] via-[#03130e]/88 to-[#03130e]/55" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[#03130e] to-transparent" />

        <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-14">
          <div className="max-w-xl lg:pr-6">
            <div className="flex items-center gap-3 text-emerald-200">
              <span className="h-px w-10 bg-emerald-200/45" />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em]">Ayuda Huilo Huilo</span>
            </div>

            <h1 className="mt-6 text-balance text-4xl font-medium leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-[58px]">
              Resolvamos lo que está afectando la operación.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/58 sm:text-lg">
              La solicitud llegará al equipo de SegurIA identificada con el contexto de la reserva, la sección y el tipo de problema.
            </p>

            <div className="mt-9 border-y border-white/10 py-5">
              <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/30">Contexto</p>
                  <p className="mt-1.5 text-sm font-medium text-white/85">Reserva Huilo Huilo</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/30">Canal</p>
                  <p className="mt-1.5 text-sm font-medium text-white/85">Soporte SegurIA</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/30">Respuesta</p>
                  <p className="mt-1.5 text-sm font-medium text-white/85">Seguimiento directo</p>
                </div>
              </div>
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-white/42">
              <Leaf className="h-4 w-4 text-emerald-200/70" />
              contacto@seguria.cl
            </p>
          </div>

          <div className="overflow-hidden rounded-[26px] border border-white/12 bg-[#071b14]/88 shadow-[0_32px_100px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
            {status === 'sent' ? (
              <div className="flex min-h-[620px] flex-col items-center justify-center px-8 py-14 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-200 text-[#062017]">
                  <Check className="h-6 w-6" strokeWidth={2} />
                </span>
                <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-200">Solicitud enviada</p>
                <h2 className="mt-3 text-3xl font-medium tracking-tight">El equipo ya tiene el contexto.</h2>
                <p className="mt-4 max-w-md text-base leading-7 text-white/52">
                  Tu solicitud fue registrada como soporte de Huilo Huilo y será revisada por SegurIA.
                </p>
                <Link
                  href="/app#resumen"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-200 px-5 py-3 text-sm font-semibold text-[#052117] transition hover:bg-emerald-100"
                >
                  Volver al portal
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="p-6 sm:p-8 lg:p-9">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-200">Nueva solicitud</p>
                    <h2 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">¿Qué necesitas resolver?</h2>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.055] text-emerald-200">
                    <Headphones className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {supportTopics.map(({ id, icon: Icon, label }) => {
                    const active = topic === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => selectTopic(id)}
                        aria-pressed={active}
                        className={`flex min-h-24 flex-col items-start justify-between rounded-xl p-3.5 text-left transition ${
                          active
                            ? 'bg-emerald-200 text-[#052117]'
                            : 'bg-white/[0.045] text-white/58 hover:bg-white/[0.075] hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.8} />
                        <span className="text-xs font-medium leading-4">{label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" value={form.website} onChange={update} tabIndex={-1} autoComplete="off" />
                </div>

                <div className="mt-7 grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  <Field label="Nombre"><Input name="nombre" value={form.nombre} onChange={update} autoComplete="name" required /></Field>
                  <Field label="Teléfono"><Input name="telefono" value={form.telefono} onChange={update} autoComplete="tel" required /></Field>
                  <div className="sm:col-span-2">
                    <Field label="Email"><Input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Detalle">
                      <Textarea
                        name="mensaje"
                        rows={6}
                        value={form.mensaje}
                        onChange={update}
                        placeholder="Indica la sección, espacio, cámara o alerta involucrada."
                        required
                      />
                    </Field>
                  </div>
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/48">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={form.consent}
                    onChange={update}
                    required
                    className="mt-1 h-4 w-4 shrink-0 accent-emerald-200"
                  />
                  <span>Acepto que SegurIA utilice estos datos para responder esta solicitud.</span>
                </label>

                {error ? (
                  <p className="mt-5 border-l-2 border-red-300 bg-red-400/8 px-4 py-3 text-sm text-red-100">{error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-200 px-6 py-3.5 text-sm font-semibold text-[#052117] transition hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {status === 'sending' ? 'Enviando…' : 'Enviar solicitud'}
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
  return (
    <label className="space-y-2">
      <span className="block text-xs font-medium uppercase tracking-[0.12em] text-white/38">{label}</span>
      {children}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border-0 border-b border-white/12 bg-transparent px-0 py-3 text-[15px] text-white outline-none transition placeholder:text-white/20 focus:border-emerald-200/70 focus:ring-0"
    />
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full resize-none rounded-xl border border-white/10 bg-black/14 px-4 py-3.5 text-[15px] leading-6 text-white outline-none transition placeholder:text-white/22 focus:border-emerald-200/45 focus:ring-1 focus:ring-emerald-200/15"
    />
  )
}

'use client'

import Link from 'next/link'
import { useId, useRef, useState } from 'react'
import {
  ArrowLeft,
  BellRing,
  Camera,
  Check,
  ChevronRight,
  FileText,
  Headphones,
  KeyRound,
  Leaf,
  MessageCircle,
  Paperclip,
  Send,
  X,
} from 'lucide-react'
import { PortalBrandLink } from '@/components/portal/portal-brand-link'

type SupportForm = {
  nombre: string
  telefono: string
  email: string
  mensaje: string
  website: string
  consent: boolean
}

type SupportTopic = 'acceso' | 'vigilancia' | 'alertas' | 'otro'

const MAX_FILES = 4
const MAX_FILE_SIZE = 10 * 1024 * 1024
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'])

const supportTopics = [
  { id: 'acceso' as const, icon: KeyRound, label: 'Acceso', prompt: 'Tengo un problema de acceso o navegación en el portal.' },
  { id: 'vigilancia' as const, icon: Camera, label: 'Vigilancia', prompt: 'Necesito revisar una cámara, imagen o punto de vigilancia.' },
  { id: 'alertas' as const, icon: BellRing, label: 'Alertas', prompt: 'Necesito ayuda con una alerta, prioridad o incidente.' },
  { id: 'otro' as const, icon: MessageCircle, label: 'Otro', prompt: '' },
]

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function HuiloHuiloSupportPage() {
  const formId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<SupportForm>({ nombre: '', telefono: '', email: '', mensaje: '', website: '', consent: false })
  const [topic, setTopic] = useState<SupportTopic>('acceso')
  const [evidence, setEvidence] = useState<File[]>([])
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
    setForm((current) => ({ ...current, mensaje: current.mensaje.trim() ? current.mensaje : selected.prompt }))
  }

  const selectEvidence = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || [])
    setError('')

    const invalid = incoming.find((file) => !allowedTypes.has(file.type) || file.size > MAX_FILE_SIZE)
    if (invalid) {
      setError(!allowedTypes.has(invalid.type) ? `Formato no permitido: ${invalid.name}` : `${invalid.name} supera el límite de 10 MB.`)
      event.target.value = ''
      return
    }

    setEvidence((current) => {
      const next = [...current, ...incoming]
      if (next.length > MAX_FILES) {
        setError(`Puedes adjuntar hasta ${MAX_FILES} archivos.`)
        return current
      }
      return next
    })
    event.target.value = ''
  }

  const removeEvidence = (index: number) => {
    setEvidence((current) => current.filter((_, currentIndex) => currentIndex !== index))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('sending')
    setError('')

    try {
      const payload = {
        ...form,
        tipoProyecto: 'propiedad',
        ubicacion: 'Reserva Biológica Huilo Huilo',
        necesidadPrincipal: `soporte_portal_cliente_${topic}`,
        urgencia: 'pronto',
        tipoServicio: 'monitoreo',
        cantidadSitios: 'uno',
        tieneCamaras: 'si',
        tieneInternet: 'si',
        tamanoAproximado: 'Operación Huilo Huilo',
      }

      const body = new FormData()
      body.append('payload', JSON.stringify(payload))
      evidence.forEach((file) => body.append('evidence', file))

      const response = await fetch('/api/leads', { method: 'POST', body })
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
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#03130e]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <PortalBrandLink href="/app#resumen" name="Huilo Huilo" compact />
          <Link href="/app#resumen" className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Volver al portal</span>
          </Link>
        </div>
      </header>

      <section className="relative isolate overflow-hidden" aria-labelledby="support-title">
        <div className="absolute inset-0 -z-30 bg-cover bg-center" style={{ backgroundImage: "url('/api/demo/huilo-huilo/huilo-huilo-forest-trail.png')" }} />
        <div className="absolute inset-0 -z-20 bg-[#03130e]/74" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#03130e] via-[#03130e]/88 to-[#03130e]/55" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[#03130e] to-transparent" />

        <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-12">
          <div className="max-w-xl lg:pr-6">
            <div className="flex items-center gap-3 text-emerald-200">
              <span className="h-px w-10 bg-emerald-200/45" />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em]">Ayuda Huilo Huilo</span>
            </div>
            <h1 id="support-title" className="mt-5 text-balance text-4xl font-medium leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-[56px]">Resolvamos lo que afecta la operación.</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/68">Describe el problema y adjunta evidencia para acelerar la revisión.</p>
            <dl className="mt-8 grid gap-4 border-y border-white/10 py-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div><dt className="text-xs uppercase tracking-[0.16em] text-white/40">Contexto</dt><dd className="mt-1 text-sm font-medium text-white/90">Huilo Huilo</dd></div>
              <div><dt className="text-xs uppercase tracking-[0.16em] text-white/40">Canal</dt><dd className="mt-1 text-sm font-medium text-white/90">SegurIA</dd></div>
              <div><dt className="text-xs uppercase tracking-[0.16em] text-white/40">Adjuntos</dt><dd className="mt-1 text-sm font-medium text-white/90">Privados y seguros</dd></div>
            </dl>
            <p className="mt-5 flex items-center gap-2 text-sm text-white/55"><Leaf className="h-4 w-4 text-emerald-200" aria-hidden="true" />contacto@seguria.cl</p>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white/12 bg-[#071b14]/90 shadow-[0_32px_100px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
            <div className="sr-only" aria-live="polite">{status === 'sending' ? 'Enviando solicitud y evidencia' : status === 'sent' ? 'Solicitud enviada' : ''}</div>
            {status === 'sent' ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center px-8 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-200 text-[#062017]"><Check className="h-6 w-6" aria-hidden="true" /></span>
                <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-200">Solicitud enviada</p>
                <h2 className="mt-3 text-3xl font-medium tracking-tight">El equipo ya tiene el contexto.</h2>
                <p className="mt-4 max-w-md text-base leading-7 text-white/65">La evidencia quedó asociada de forma privada a la solicitud.</p>
                <Link href="/app#resumen" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-200 px-5 py-3 text-sm font-semibold text-[#052117] transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Volver al portal<ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
            ) : (
              <form onSubmit={submit} className="p-5 sm:p-8 lg:p-9">
                <div className="flex items-start justify-between gap-5">
                  <div><p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-200">Nueva solicitud</p><h2 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">¿Qué necesitas resolver?</h2></div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-emerald-200"><Headphones className="h-5 w-5" aria-hidden="true" /></span>
                </div>

                <fieldset className="mt-6">
                  <legend className="sr-only">Tipo de problema</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {supportTopics.map(({ id, icon: Icon, label }) => {
                      const active = topic === id
                      return <button key={id} type="button" onClick={() => selectTopic(id)} aria-pressed={active} className={`flex min-h-20 flex-col items-start justify-between rounded-xl p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 ${active ? 'bg-emerald-200 text-[#052117]' : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.08] hover:text-white'}`}><Icon className="h-4 w-4" aria-hidden="true" /><span className="text-xs font-medium leading-4">{label}</span></button>
                    })}
                  </div>
                </fieldset>

                <div className="sr-only" aria-hidden="true"><label htmlFor={`${formId}-website`}>Website</label><input id={`${formId}-website`} name="website" value={form.website} onChange={update} tabIndex={-1} autoComplete="off" /></div>

                <div className="mt-6 grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  <Field id={`${formId}-nombre`} label="Nombre"><Input id={`${formId}-nombre`} name="nombre" value={form.nombre} onChange={update} autoComplete="name" required /></Field>
                  <Field id={`${formId}-telefono`} label="Teléfono"><Input id={`${formId}-telefono`} name="telefono" value={form.telefono} onChange={update} autoComplete="tel" inputMode="tel" required /></Field>
                  <div className="sm:col-span-2"><Field id={`${formId}-email`} label="Email"><Input id={`${formId}-email`} name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></Field></div>
                  <div className="sm:col-span-2"><Field id={`${formId}-mensaje`} label="Detalle"><Textarea id={`${formId}-mensaje`} name="mensaje" rows={4} value={form.mensaje} onChange={update} placeholder="Indica la sección, espacio, cámara o alerta." required /></Field></div>
                </div>

                <div className="mt-5">
                  <input ref={fileInputRef} id={`${formId}-evidence`} type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4" onChange={selectEvidence} className="sr-only" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center justify-between rounded-xl border border-dashed border-white/20 bg-white/[0.035] px-4 py-3.5 text-left transition hover:border-emerald-200/50 hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
                    <span className="flex items-center gap-3"><Paperclip className="h-5 w-5 text-emerald-200" aria-hidden="true" /><span><span className="block text-sm font-medium text-white">Adjuntar evidencia</span><span className="mt-0.5 block text-xs text-white/50">Fotos, PDF o video · máximo 4 archivos de 10 MB</span></span></span>
                    <span className="text-xs font-medium text-emerald-200">Seleccionar</span>
                  </button>

                  {evidence.length > 0 ? (
                    <ul className="mt-3 space-y-2" aria-label="Evidencia seleccionada">
                      {evidence.map((file, index) => (
                        <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3 rounded-lg bg-black/15 px-3 py-2.5">
                          <FileText className="h-4 w-4 shrink-0 text-emerald-200" aria-hidden="true" />
                          <span className="min-w-0 flex-1"><span className="block truncate text-sm text-white/85">{file.name}</span><span className="block text-xs text-white/45">{formatBytes(file.size)}</span></span>
                          <button type="button" onClick={() => removeEvidence(index)} aria-label={`Quitar ${file.name}`} className="rounded-lg p-2 text-white/50 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"><X className="h-4 w-4" aria-hidden="true" /></button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/60"><input type="checkbox" name="consent" checked={form.consent} onChange={update} required className="mt-1 h-4 w-4 shrink-0 accent-emerald-200" /><span>Acepto el uso de estos datos para responder la solicitud.</span></label>
                {error ? <p className="mt-5 border-l-2 border-red-300 bg-red-400/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p> : null}
                <button type="submit" disabled={status === 'sending'} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-200 px-6 py-3.5 text-sm font-semibold text-[#052117] transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-60"><Send className="h-4 w-4" aria-hidden="true" />{status === 'sending' ? 'Enviando solicitud y evidencia…' : 'Enviar solicitud'}</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label htmlFor={id} className="block text-xs font-medium uppercase tracking-[0.12em] text-white/50">{label}</label>{children}</div>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-[15px] text-white outline-none transition placeholder:text-white/30 focus:border-emerald-200 focus:ring-0" />
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full resize-none rounded-xl border border-white/12 bg-black/15 px-4 py-3.5 text-[15px] leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-emerald-200/60 focus:ring-2 focus:ring-emerald-200/20" />
}

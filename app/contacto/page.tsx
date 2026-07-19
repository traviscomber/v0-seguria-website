'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Mail, MapPin, MessageCircle, Phone, Send, Sparkles, ShieldCheck } from 'lucide-react'

type FormData = {
  nombre: string
  telefono: string
  email: string
  tipoProyecto: string
  ubicacion: string
  tamanoAproximado: string
  necesidadPrincipal: string
  tieneCamaras: string
  tieneInternet: string
  cantidadSitios: string
  urgencia: string
  tipoServicio: string
  mensaje: string
  website: string
  consent: boolean
}

const benefits = [
  'Levantamiento claro para tu sitio',
  'Seguimiento interno con datos reales',
  'Ruta simple hacia portal cliente y monitoreo',
]

export default function ContactoPage() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    telefono: '',
    email: '',
    tipoProyecto: '',
    ubicacion: '',
    tamanoAproximado: '',
    necesidadPrincipal: '',
    tieneCamaras: '',
    tieneInternet: '',
    cantidadSitios: '',
    urgencia: '',
    tipoServicio: '',
    mensaje: '',
    website: '',
    consent: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target instanceof HTMLInputElement && e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'No se pudo enviar el formulario. Intenta nuevamente.')
      }

      setIsSubmitted(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo enviar el formulario. Intenta nuevamente.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-[#0A1B2E]">
        <Navigation />
        <section className="relative overflow-hidden px-6 pb-24 pt-28 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.18),transparent_35%),linear-gradient(180deg,rgba(10,27,46,0.96),rgba(10,27,46,0.99))]" />
          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-[#4DA3D9]/20 bg-[#4DA3D9]/15 text-[#9DD2F2]">
              <Sparkles className="h-10 w-10" strokeWidth={1.6} />
            </div>
            <h1 className="mt-8 text-4xl font-light text-white md:text-5xl">Solicitud recibida</h1>
            <p className="mt-5 text-lg leading-8 text-white/65">
              Gracias. Nuestro equipo revisara tu solicitud y te contactara con el siguiente paso recomendado para tu
              sitio o propiedad.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/" className="btn-primary px-8 py-4 text-[15px]">
                Volver al inicio
              </Link>
              <Link href="/soluciones" className="btn-secondary px-8 py-4 text-[15px]">
                Ver soluciones
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      <section className="relative overflow-hidden px-6 pt-28 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.16),transparent_32%),linear-gradient(180deg,rgba(10,27,46,0.95),rgba(10,27,46,0.99))]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(77,163,217,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(77,163,217,0.12) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

        <div className="relative mx-auto grid max-w-7xl gap-10 pb-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/12 px-4 py-2 text-sm text-[#9DD2F2]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.6} />
              Hablemos de tu sitio
            </div>
            <h1 className="max-w-2xl text-4xl font-light leading-tight text-white text-balance md:text-5xl">
              Cuentanos que necesitas y lo ordenamos en una propuesta clara.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-white/68">
              Te respondemos con foco en tu operacion, tu tipo de sitio y el nivel de control que quieres darle al
              cliente.
            </p>

            <div className="space-y-4 pt-4">
              {benefits.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#9DD2F2]" strokeWidth={1.6} />
                  <span className="text-sm leading-7 text-white/75">{item}</span>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Santiago" value="Chile" />
              <StatCard label="Respuesta" value="Priorizada" />
              <StatCard label="Enfoque" value="Portal pro" />
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
              <div className="grid gap-5 sm:grid-cols-3">
                <ContactChip icon={Phone} title="Telefono" value="+56 9 1234 5678" />
                <ContactChip icon={Mail} title="Email" value="contacto@seguria.cl" />
                <ContactChip icon={MapPin} title="Base" value="Santiago, Chile" />
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-[#0B1D30] p-5">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.6} />
                  <p className="text-white">Contacto directo</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  Si quieres una respuesta mas rapida, tambien puedes escribir directo y te orientamos sobre el
                  siguiente paso.
                </p>
                <a
                  href="https://wa.me/56912345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366]/90 px-5 py-3 text-[15px] text-white transition-colors hover:bg-[#25D366]"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.6} />
                  Escribir directo
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[32px] border border-white/10 bg-white/6 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Formulario</p>
                  <h2 className="mt-2 text-2xl font-light text-white">Cuentanos sobre tu proyecto</h2>
                </div>
                <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/45 sm:block">
                  Respuesta comercial
                </div>
              </div>

              <div className="sr-only" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input type="text" id="website" name="website" autoComplete="off" tabIndex={-1} value={formData.website} onChange={handleChange} />
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Nombre *">
                  <Input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Tu nombre" required />
                </Field>
                <Field label="Telefono *">
                  <Input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+56 9 1234 5678" required />
                </Field>
                <Field label="Email *">
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" required />
                </Field>
                <Field label="Tipo de proyecto *">
                  <Select name="tipoProyecto" value={formData.tipoProyecto} onChange={handleChange} required>
                    <option value="">Seleccionar...</option>
                    <option value="campo">Campo Inteligente</option>
                    <option value="propiedad">Propiedad Inteligente</option>
                  </Select>
                </Field>
                <Field label="Ubicacion">
                  <Input name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ciudad o region" />
                </Field>
                <Field label="Tamano aproximado">
                  <Input name="tamanoAproximado" value={formData.tamanoAproximado} onChange={handleChange} placeholder="Ej: 100 hectareas, 500 m2" />
                </Field>
                <Field label="Necesidad principal">
                  <Select name="necesidadPrincipal" value={formData.necesidadPrincipal} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    <option value="seguridad">Seguridad y monitoreo</option>
                    <option value="acceso">Control de acceso</option>
                    <option value="conectividad">Conectividad / redes</option>
                    <option value="sensores">Sensores ambientales</option>
                    <option value="integral">Solucion integral</option>
                  </Select>
                </Field>
                <Field label="Tiene camaras o sensores?">
                  <Select name="tieneCamaras" value={formData.tieneCamaras} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    <option value="si">Si, tengo equipos</option>
                    <option value="no">No, empiezo de cero</option>
                    <option value="parcial">Tengo algunos, quiero ampliar</option>
                  </Select>
                </Field>
                <Field label="Tiene internet?">
                  <Select name="tieneInternet" value={formData.tieneInternet} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    <option value="si">Si, tengo conexion</option>
                    <option value="no">No, necesito solucion</option>
                    <option value="inestable">Si, pero es inestable</option>
                  </Select>
                </Field>
                <Field label="Cantidad de sitios">
                  <Select name="cantidadSitios" value={formData.cantidadSitios} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    <option value="uno">Un sitio</option>
                    <option value="dos_a_cinco">2 a 5 sitios</option>
                    <option value="mas_de_cinco">Mas de 5 sitios</option>
                  </Select>
                </Field>
                <Field label="Urgencia">
                  <Select name="urgencia" value={formData.urgencia} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    <option value="normal">Quiero evaluarlo</option>
                    <option value="pronto">Necesito avanzar pronto</option>
                    <option value="critica">Tengo un problema activo</option>
                  </Select>
                </Field>
                <Field label="Que necesita?">
                  <Select name="tipoServicio" value={formData.tipoServicio} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    <option value="diagnostico">Diagnostico inicial</option>
                    <option value="instalacion">Instalacion completa</option>
                    <option value="monitoreo">Solo monitoreo</option>
                    <option value="propuesta">Propuesta / cotizacion</option>
                  </Select>
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Mensaje adicional">
                  <Textarea
                    name="mensaje"
                    rows={5}
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder="Cuentanos mas sobre tu proyecto..."
                  />
                </Field>
              </div>

              <label className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/65">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  required
                  className="mt-1 h-4 w-4 accent-[#4DA3D9]"
                />
                <span>Acepto que SegurIA use estos datos para responder mi solicitud y realizar seguimiento comercial.</span>
              </label>

              {submitError && (
                <p className="mt-5 rounded-2xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4DA3D9] px-6 py-4 text-[15px] text-white transition-colors hover:bg-[#4DA3D9]/90 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" strokeWidth={1.6} />
                    Solicitar asesoria
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm text-white/72">{label}</span>
      {children}
    </label>
  )
}

function Input({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]" />
}

function Select({
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]" />
}

function Textarea({
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9] resize-none" />
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 text-2xl font-light text-white">{value}</p>
    </div>
  )
}

function ContactChip({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  value: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/35">{title}</p>
          <p className="mt-1 text-sm text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

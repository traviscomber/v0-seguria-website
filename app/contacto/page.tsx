'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react'

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
  tipoServicio: string
  mensaje: string
  website: string
}

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
    tipoServicio: '',
    mensaje: '',
    website: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
        throw new Error(result?.error || 'No se pudo enviar el formulario. Intentá nuevamente.')
      }

      setIsSubmitted(true)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo enviar el formulario. Intentá nuevamente.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-[#0A1B2E]">
        <Navigation />
        <section className="min-h-screen flex items-center justify-center pt-20">
          <div className="max-w-xl mx-auto px-6 text-center">
            <div className="w-20 h-20 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center mx-auto mb-8">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-white mb-4">
              Solicitud recibida
            </h1>
            <p className="text-white/60 text-lg mb-8">
              Gracias por contactarnos. Nuestro equipo revisará tu solicitud y te contactará a la brevedad.
            </p>
            <Link href="/" className="btn-primary px-8 py-4 text-[15px] inline-block">
              Volver al inicio
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-[#0A1B2E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-light text-white text-balance">
            Conversemos sobre tu proyecto
          </h1>
          <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
            Completá el formulario y te contactaremos para entender tus necesidades
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-[#123A5A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-light text-white mb-6">
                  Información de contacto
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-[#4DA3D9]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Teléfono</p>
                      <p className="text-white">+56 9 1234 5678</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#4DA3D9]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Email</p>
                      <p className="text-white">contacto@seguria.cl</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#4DA3D9]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Ubicación</p>
                      <p className="text-white">Santiago, Chile</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-[5px] bg-[#25D366]/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-white font-light">WhatsApp</p>
                    <p className="text-white/50 text-sm">Respuesta rápida</p>
                  </div>
                </div>
                <a 
                  href="https://wa.me/56912345678" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-[5px] bg-[#25D366]/90 hover:bg-[#25D366] text-white text-[15px] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                  Escribir por WhatsApp
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    autoComplete="off"
                    tabIndex={-1}
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
                {/* Personal Info */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="block text-[14px] text-white/70 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      required
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="block text-[14px] text-white/70 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      required
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[14px] text-white/70 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Project Info */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="tipoProyecto" className="block text-[14px] text-white/70 mb-2">
                      Tipo de proyecto *
                    </label>
                    <select
                      id="tipoProyecto"
                      name="tipoProyecto"
                      required
                      value={formData.tipoProyecto}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9] appearance-none"
                    >
                      <option value="" className="bg-[#123A5A]">Seleccionar...</option>
                      <option value="campo" className="bg-[#123A5A]">Campo Inteligente</option>
                      <option value="propiedad" className="bg-[#123A5A]">Propiedad Inteligente</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ubicacion" className="block text-[14px] text-white/70 mb-2">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      id="ubicacion"
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
                      placeholder="Ciudad o región"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="tamanoAproximado" className="block text-[14px] text-white/70 mb-2">
                      Tamaño aproximado
                    </label>
                    <input
                      type="text"
                      id="tamanoAproximado"
                      name="tamanoAproximado"
                      value={formData.tamanoAproximado}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9]"
                      placeholder="Ej: 100 hectáreas, 500 m2"
                    />
                  </div>
                  <div>
                    <label htmlFor="necesidadPrincipal" className="block text-[14px] text-white/70 mb-2">
                      Necesidad principal
                    </label>
                    <select
                      id="necesidadPrincipal"
                      name="necesidadPrincipal"
                      value={formData.necesidadPrincipal}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9] appearance-none"
                    >
                      <option value="" className="bg-[#123A5A]">Seleccionar...</option>
                      <option value="seguridad" className="bg-[#123A5A]">Seguridad y monitoreo</option>
                      <option value="acceso" className="bg-[#123A5A]">Control de acceso</option>
                      <option value="conectividad" className="bg-[#123A5A]">Conectividad / redes</option>
                      <option value="sensores" className="bg-[#123A5A]">Sensores ambientales</option>
                      <option value="integral" className="bg-[#123A5A]">Solución integral</option>
                    </select>
                  </div>
                </div>

                {/* Technical Info */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="tieneCamaras" className="block text-[14px] text-white/70 mb-2">
                      ¿Tiene cámaras o sensores instalados?
                    </label>
                    <select
                      id="tieneCamaras"
                      name="tieneCamaras"
                      value={formData.tieneCamaras}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9] appearance-none"
                    >
                      <option value="" className="bg-[#123A5A]">Seleccionar...</option>
                      <option value="si" className="bg-[#123A5A]">Sí, tengo equipos</option>
                      <option value="no" className="bg-[#123A5A]">No, empiezo de cero</option>
                      <option value="parcial" className="bg-[#123A5A]">Tengo algunos, quiero ampliar</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="tieneInternet" className="block text-[14px] text-white/70 mb-2">
                      ¿Tiene internet en el lugar?
                    </label>
                    <select
                      id="tieneInternet"
                      name="tieneInternet"
                      value={formData.tieneInternet}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9] appearance-none"
                    >
                      <option value="" className="bg-[#123A5A]">Seleccionar...</option>
                      <option value="si" className="bg-[#123A5A]">Sí, tengo conexión</option>
                      <option value="no" className="bg-[#123A5A]">No, necesito solución</option>
                      <option value="inestable" className="bg-[#123A5A]">Sí, pero es inestable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="tipoServicio" className="block text-[14px] text-white/70 mb-2">
                    ¿Qué necesita?
                  </label>
                  <select
                    id="tipoServicio"
                    name="tipoServicio"
                    value={formData.tipoServicio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#4DA3D9] appearance-none"
                  >
                    <option value="" className="bg-[#123A5A]">Seleccionar...</option>
                    <option value="diagnostico" className="bg-[#123A5A]">Diagnóstico inicial</option>
                    <option value="instalacion" className="bg-[#123A5A]">Instalación completa</option>
                    <option value="monitoreo" className="bg-[#123A5A]">Solo monitoreo</option>
                    <option value="propuesta" className="bg-[#123A5A]">Propuesta / cotización</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-[14px] text-white/70 mb-2">
                    Mensaje adicional
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={4}
                    value={formData.mensaje}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-[5px] bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#4DA3D9] resize-none"
                    placeholder="Cuéntanos más sobre tu proyecto..."
                  />
                </div>

                {submitError && (
                  <p className="rounded-[5px] border border-red-300/40 bg-red-500/10 px-4 py-3 text-[14px] text-red-100">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-4 text-[15px] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" strokeWidth={1.5} />
                      Solicitar asesoría
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

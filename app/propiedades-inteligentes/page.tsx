import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Lock, Camera, Radio, Wifi, Search, PenTool, Wrench, Activity } from 'lucide-react'

export default function PropiedadesInteligentesPage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />
      
      {/* Hero Section - Residential/Commercial Style */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background - Modern property */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(10, 27, 46, 0.6), rgba(10, 27, 46, 0.85)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2575&auto=format&fit=crop')`
          }}
        />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(77, 163, 217, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 163, 217, 0.2) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[5px] bg-[#4DA3D9]/20 text-[#4DA3D9] text-sm mb-6">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Propiedades Inteligentes
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight text-balance">
            Seguridad y control para propiedades inteligentes.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed text-balance">
            Integramos tecnología avanzada para proteger lo que más valorás. Gestioná accesos, monitoreo y alertas desde cualquier lugar.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/contacto" 
              className="btn-primary px-8 py-4 text-[15px] inline-flex items-center gap-2"
            >
              Solicitar asesoría
            </Link>
            <Link 
              href="/soluciones" 
              className="btn-secondary px-8 py-4 text-[15px] inline-flex items-center gap-2"
            >
              Conocer soluciones
            </Link>
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-24 bg-[#123A5A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance">
              Tipos de propiedad
            </h2>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              Soluciones para cada tipo de espacio
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ),
                title: 'Hogares',
                description: 'Seguridad y control total para tu casa. Monitoreo 24/7, control de accesos y alertas en tiempo real.'
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: 'Condominios',
                description: 'Gestión centralizada de accesos, cámaras y áreas comunes para comunidades residenciales.'
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                ),
                title: 'Bodegas y oficinas',
                description: 'Protección inteligente para espacios comerciales e industriales con control de acceso avanzado.'
              }
            ].map((type, index) => (
              <div 
                key={index} 
                className="glass-card p-8 group hover:bg-[rgba(18,58,90,0.6)] transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center mb-6">
                  {type.icon}
                </div>
                <h3 className="text-xl font-light text-white mb-3">{type.title}</h3>
                <p className="text-[15px] text-white/60 leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-24 bg-[#0A1B2E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance">
              Capacidades
            </h2>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              Tecnología premium para propiedades de alto valor
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: 'Control de acceso',
                description: 'Portones, citófonos, cerraduras inteligentes y gestión de ingresos.'
              },
              {
                icon: Camera,
                title: 'Cámaras',
                description: 'Videovigilancia HD con visión nocturna y detección de movimiento.'
              },
              {
                icon: Radio,
                title: 'Sensores',
                description: 'Detección de intrusos, apertura de puertas y movimiento.'
              },
              {
                icon: Wifi,
                title: 'Redes Wi-Fi',
                description: 'Conectividad estable y segura para todos los dispositivos.'
              }
            ].map((tech, index) => (
              <div 
                key={index} 
                className="glass-card p-6 text-center group hover:bg-[rgba(18,58,90,0.6)] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center mx-auto mb-4">
                  <tech.icon className="w-6 h-6 text-[#4DA3D9]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-light text-white mb-2">{tech.title}</h3>
                <p className="text-[14px] text-white/60 leading-relaxed">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-[#E6F1F8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-[#0A1B2E] text-balance">
              Cómo trabajamos
            </h2>
            <p className="mt-4 text-[#6B7280] text-lg max-w-2xl mx-auto">
              Un proceso profesional de principio a fin
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                step: '01',
                title: 'Diagnóstico',
                description: 'Evaluamos la propiedad, identificamos riesgos y necesidades.'
              },
              {
                icon: PenTool,
                step: '02',
                title: 'Diseño',
                description: 'Diseñamos una solución personalizada para tu espacio.'
              },
              {
                icon: Wrench,
                step: '03',
                title: 'Instalación',
                description: 'Instalamos equipos con mínima intervención en tu propiedad.'
              },
              {
                icon: Activity,
                step: '04',
                title: 'Monitoreo',
                description: 'Activamos seguimiento y soporte técnico continuo.'
              }
            ].map((process, index) => (
              <div 
                key={index} 
                className="glass-card-light p-6 text-center"
              >
                <div className="text-[#4DA3D9] text-sm font-light mb-4">{process.step}</div>
                <div className="w-12 h-12 rounded-[5px] bg-[#2B5C7E]/10 flex items-center justify-center mx-auto mb-4">
                  <process.icon className="w-6 h-6 text-[#2B5C7E]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-light text-[#0A1B2E] mb-2">{process.title}</h3>
                <p className="text-[14px] text-[#6B7280] leading-relaxed">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0A1B2E]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-light text-white text-balance">
            Protegé tu propiedad con tecnología inteligente
          </h2>
          <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Conversemos sobre tu espacio. Te ayudamos a diseñar la seguridad ideal para tu hogar u oficina.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/contacto" 
              className="btn-primary px-8 py-4 text-[15px] inline-flex items-center gap-2"
            >
              Solicitar Asesoría
            </Link>
            <Link 
              href="/campos-inteligentes" 
              className="btn-secondary px-8 py-4 text-[15px] inline-flex items-center gap-2"
            >
              Ver Campos Inteligentes
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

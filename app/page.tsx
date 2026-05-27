import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Camera, Cpu, Wifi, Monitor, Search, PenTool, Wrench, Activity } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(10, 27, 46, 0.7), rgba(10, 27, 46, 0.9)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2532&auto=format&fit=crop')`
          }}
        />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(77, 163, 217, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 163, 217, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-tight text-balance">
            Infraestructura inteligente para campos y propiedades.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed text-balance">
            Conectamos y protegemos lo que más valorás. Tecnología, inteligencia y cobertura donde más lo necesitás.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/campos-inteligentes" 
              className="btn-primary px-8 py-4 text-[15px] inline-flex items-center gap-2 min-w-[220px] justify-center"
            >
              Campos Inteligentes
            </Link>
            <Link 
              href="/propiedades-inteligentes" 
              className="btn-secondary px-8 py-4 text-[15px] inline-flex items-center gap-2 min-w-[220px] justify-center"
            >
              Propiedades Inteligentes
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Two Directions Section */}
      <section className="py-24 bg-[#123A5A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance">
              Dos direcciones, una misión
            </h2>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              Soluciones especializadas para cada tipo de operación
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Campos Inteligentes */}
            <div className="glass-card p-8 md:p-10 group hover:bg-[rgba(18,58,90,0.6)] transition-all duration-300">
              <div className="w-14 h-14 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center mb-6">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-white mb-4">Campos Inteligentes</h3>
              <p className="text-white/60 leading-relaxed mb-6">
                Monitoreo inteligente para mejorar la productividad, proteger cada hectárea y operar con mayor control.
              </p>
              <div className="space-y-2 text-[14px] text-white/50 mb-8">
                <p>Campos • Ganadería • Agricultura • Parcelas</p>
                <p>Instalaciones remotas • Infraestructura productiva</p>
              </div>
              <Link 
                href="/campos-inteligentes" 
                className="btn-ghost px-6 py-3 text-[15px] inline-block"
              >
                Explorar soluciones
              </Link>
            </div>

            {/* Propiedades Inteligentes */}
            <div className="glass-card p-8 md:p-10 group hover:bg-[rgba(18,58,90,0.6)] transition-all duration-300">
              <div className="w-14 h-14 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center mb-6">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-white mb-4">Propiedades Inteligentes</h3>
              <p className="text-white/60 leading-relaxed mb-6">
                Seguridad y conectividad para estancias, casas de campo, condominios, bodegas, oficinas y propiedades de alto valor.
              </p>
              <div className="space-y-2 text-[14px] text-white/50 mb-8">
                <p>Casas • Condominios • Bodegas • Oficinas</p>
                <p>Casas de campo • Propiedades comerciales</p>
              </div>
              <Link 
                href="/propiedades-inteligentes" 
                className="btn-ghost px-6 py-3 text-[15px] inline-block"
              >
                Explorar soluciones
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-24 bg-[#0A1B2E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance">
              Tecnologías principales
            </h2>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              Herramientas integradas para una infraestructura completa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Camera,
                title: 'Cámaras',
                description: 'Monitoreo inteligente y visualización remota.'
              },
              {
                icon: Cpu,
                title: 'Sensores',
                description: 'Datos del entorno, movimiento, acceso, clima y eventos.'
              },
              {
                icon: Wifi,
                title: 'Redes',
                description: 'Conectividad estable para zonas urbanas, rurales o remotas.'
              },
              {
                icon: Monitor,
                title: 'Software',
                description: 'Visualización, reportes, documentación y gestión centralizada.'
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
              Nuestro proceso
            </h2>
            <p className="mt-4 text-[#6B7280] text-lg max-w-2xl mx-auto">
              De principio a fin, acompañamos cada etapa de tu proyecto
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                step: '01',
                title: 'Diagnóstico',
                description: 'Analizamos necesidades, entorno, riesgos y cobertura.'
              },
              {
                icon: PenTool,
                step: '02',
                title: 'Diseño',
                description: 'Creamos una solución técnica adaptada al lugar.'
              },
              {
                icon: Wrench,
                step: '03',
                title: 'Instalación',
                description: 'Implementamos dispositivos, redes y configuración.'
              },
              {
                icon: Activity,
                step: '04',
                title: 'Monitoreo',
                description: 'Activamos seguimiento, soporte y mejora continua.'
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
            Preparado para dar el siguiente paso
          </h2>
          <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Conversemos sobre tu proyecto. Te ayudamos a diseñar la solución ideal para tu campo o propiedad.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/contacto" 
              className="btn-primary px-8 py-4 text-[15px] inline-flex items-center gap-2"
            >
              Solicitar Asesoría
            </Link>
            <Link 
              href="/soluciones" 
              className="btn-secondary px-8 py-4 text-[15px] inline-flex items-center gap-2"
            >
              Ver Soluciones
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

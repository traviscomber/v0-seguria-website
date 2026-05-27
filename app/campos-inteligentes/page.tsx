import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Camera, Thermometer, Wifi, Sun, Search, PenTool, Wrench, Activity } from 'lucide-react'

export default function CamposInteligentesPage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />
      
      {/* Hero Section - Rural Style */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background - Rural landscape */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(10, 27, 46, 0.6), rgba(10, 27, 46, 0.85)), url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=2574&auto=format&fit=crop')`
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
              <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Campos Inteligentes
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight text-balance">
            Campos inteligentes para monitorear, proteger y optimizar.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed text-balance">
            Soluciones tecnológicas que conectan el campo para brindarte visibilidad, control y decisiones más precisas en tiempo real.
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
              Ver soluciones
            </Link>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-24 bg-[#123A5A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance">
              Aplicaciones
            </h2>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              Soluciones adaptadas a cada tipo de operación rural
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                ),
                title: 'Ganadería',
                description: 'Monitoreo del ganado, control de potreros y detección de anomalías.'
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
                title: 'Agricultura',
                description: 'Supervisión de cultivos, clima, riego y condiciones ambientales.'
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                ),
                title: 'Parcelas y lotes',
                description: 'Control de accesos, perímetros y movimiento remoto.'
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: 'Instalaciones remotas',
                description: 'Monitoreo de galpones, bombas, silos, bodegas e infraestructura crítica.'
              }
            ].map((app, index) => (
              <div 
                key={index} 
                className="glass-card p-8 group hover:bg-[rgba(18,58,90,0.6)] transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center mb-6">
                  {app.icon}
                </div>
                <h3 className="text-xl font-light text-white mb-3">{app.title}</h3>
                <p className="text-[15px] text-white/60 leading-relaxed">{app.description}</p>
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
              Tecnologías rurales
            </h2>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              Equipamiento diseñado para condiciones de campo
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Camera,
                title: 'Cámaras rurales',
                description: 'Alta definición para exteriores, visión nocturna y largo alcance.'
              },
              {
                icon: Thermometer,
                title: 'Sensores ambientales',
                description: 'Temperatura, humedad, viento, lluvia y calidad del aire.'
              },
              {
                icon: Wifi,
                title: 'Redes rurales',
                description: 'Conectividad para zonas sin cobertura tradicional.'
              },
              {
                icon: Sun,
                title: 'Energía solar',
                description: 'Paneles y baterías para operación autónoma.'
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
              Un proceso diseñado para operaciones rurales
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                step: '01',
                title: 'Diagnóstico',
                description: 'Visitamos el campo, evaluamos necesidades y mapeamos cobertura.'
              },
              {
                icon: PenTool,
                step: '02',
                title: 'Diseño',
                description: 'Diseñamos una solución técnica adaptada al terreno.'
              },
              {
                icon: Wrench,
                step: '03',
                title: 'Instalación',
                description: 'Instalamos equipos, redes y configuramos todo el sistema.'
              },
              {
                icon: Activity,
                step: '04',
                title: 'Monitoreo',
                description: 'Activamos seguimiento remoto y soporte continuo.'
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
            Conectá tu campo con tecnología inteligente
          </h2>
          <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Conversemos sobre las necesidades de tu operación. Te ayudamos a diseñar una solución a medida.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/contacto" 
              className="btn-primary px-8 py-4 text-[15px] inline-flex items-center gap-2"
            >
              Solicitar Asesoría
            </Link>
            <Link 
              href="/propiedades-inteligentes" 
              className="btn-secondary px-8 py-4 text-[15px] inline-flex items-center gap-2"
            >
              Ver Propiedades Inteligentes
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

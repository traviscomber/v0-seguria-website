import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ArrowRight, Camera, Cpu, GitBranch, Home, Wifi, Lock, Monitor, FileText, Search, PenTool, Wrench, Activity } from 'lucide-react'

export default function SolucionesPage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(10, 27, 46, 0.8), rgba(10, 27, 46, 0.95)), url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=70&w=1400&auto=format&fit=crop')`
          }}
        />
        
        {/* Tech grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(77, 163, 217, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 163, 217, 0.15) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight text-balance">
            Tecnología y servicios para campos y propiedades inteligentes.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed text-balance">
            Ofrecemos soluciones completas de principio a fin: diagnóstico, diseño, documentación, instalación y monitoreo continuo.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-24 bg-[#123A5A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance">
              Nuestras soluciones
            </h2>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              Capacidades técnicas para cada necesidad
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Camera,
                title: 'Cámaras inteligentes',
                description: 'Videovigilancia de alta definición con monitoreo remoto y analítica según necesidad.'
              },
              {
                icon: Cpu,
                title: 'Sensores y equipos',
                description: 'Sensores ambientales, perimetrales, de acceso, movimiento, agua, clima y eventos.'
              },
              {
                icon: Wifi,
                title: 'Redes y conectividad',
                description: 'Infraestructura estable para zonas urbanas, rurales y remotas.'
              },
              {
                icon: Lock,
                title: 'Control de acceso',
                description: 'Gestión segura de ingresos, portones, accesos vehiculares y espacios restringidos.'
              },
              {
                icon: Monitor,
                title: 'Software y monitoreo',
                description: 'Plataforma centralizada para visualizar información, recibir alertas y gestionar operaciones.'
              },
              {
                icon: FileText,
                title: 'Documentación técnica',
                description: 'Diagnósticos, esquemas, fichas, planos, reportes y propuestas profesionales.'
              }
            ].map((solution, index) => (
              <div 
                key={index} 
                className="glass-card p-8 group hover:bg-[rgba(18,58,90,0.6)] transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center mb-6">
                  <solution.icon className="w-7 h-7 text-[#4DA3D9]" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-light text-white mb-3">{solution.title}</h3>
                <p className="text-[15px] text-white/60 leading-relaxed">{solution.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Systems Intelligence Section */}
      <section className="py-24 bg-[#123A5A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance">
              Tus sistemas existentes se vuelven inteligentes
            </h2>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              No necesitas reemplazar lo que ya tienes. SegurIA lo transforma.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-light text-white mb-3">Cámaras que ven inteligente</h3>
                <p className="text-white/70 leading-relaxed">
                  Tu cámara normal se vuelve experta. Reconoce animales, detecta movimiento anómalo, identifica intrusos. Si hay un puma cerca del rebaño, lo sabes antes de que suceda algo.
                </p>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-light text-white mb-3">Sensores que predicen</h3>
                <p className="text-white/70 leading-relaxed">
                  Temperatura anómala, acceso no autorizado, cambios en el perímetro. Los datos que siempre tuviste ahora tienen significado. Te avisan antes del problema.
                </p>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-light text-white mb-3">Integraciones sin cambio</h3>
                <p className="text-white/70 leading-relaxed">
                  Conectamos cámaras, sensores y sistemas compatibles en una sola operación. Aprovechamos lo que ya tienes, sin reemplazos forzados ni inversión innecesaria.
                </p>
              </div>
            </div>

            <div className="glass-card p-8 lg:p-12">
              <div className="space-y-6">
                <div className="border-l-2 border-[#4DA3D9] pl-6">
                  <p className="text-[14px] uppercase text-[#4DA3D9] font-light tracking-wider mb-2">Ejemplo real</p>
                  <h4 className="text-2xl font-light text-white mb-3">Puma en la noche</h4>
                  <p className="text-white/70 leading-relaxed">
                    Tu cámara infrarroja ve movimiento. SegurIA lo reconoce como animal salvaje. Alertas solo a equipo de seguridad. Falsa alarma: 0. Protección: 100%.
                  </p>
                </div>

                <div className="border-l-2 border-[#4DA3D9] pl-6">
                  <p className="text-[14px] uppercase text-[#4DA3D9] font-light tracking-wider mb-2">Otro ejemplo</p>
                  <h4 className="text-2xl font-light text-white mb-3">Temperatura en el galpón</h4>
                  <p className="text-white/70 leading-relaxed">
                    Tus sensores detectan cambio extremo. SegurIA sabe qué es normal (noche fría) y qué es riesgo (incendio). Reacciona solo cuando importa.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Cámaras', subtitle: 'Video y evidencia' },
              { title: 'Sensores', subtitle: 'Estado y alertas' },
              { title: 'Accesos', subtitle: 'Puertas y perímetros' },
              { title: 'Automatización', subtitle: 'Respuesta coordinada' }
            ].map((item) => (
              <div key={item.title} className="glass-card p-4 text-center">
                <p className="text-[12px] uppercase text-[#9DD2F2] font-light tracking-wider mb-1">Compatible</p>
                <h4 className="text-white font-light">{item.title}</h4>
                <p className="text-[13px] text-white/50 mt-1">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Layer */}
      <section className="py-24 bg-[#0A1B2E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance mb-6">
              Una solución completa también necesita una forma simple de conectar todo.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              SegurIA conecta equipos y sistemas para que puedas ver estado, recibir avisos y responder rápido.
            </p>
            <Link href="/integraciones" className="btn-primary px-6 py-3 text-[15px] inline-flex items-center gap-2">
              Ver cómo funciona
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Home, title: 'Control central' },
              { icon: Cpu, title: 'Sensores' },
              { icon: GitBranch, title: 'Cambios' },
              { icon: Lock, title: 'Accesos' },
            ].map((item) => (
              <div key={item.title} className="glass-card p-5">
                <div className="w-11 h-11 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-[#4DA3D9]" strokeWidth={1.5} />
                </div>
                <h3 className="text-white font-light text-[16px] mb-1">{item.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">Listo para control simple y ordenado.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scalability Section */}
      <section className="py-24 bg-[#0A1B2E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-white text-balance mb-6">
                Preparado para crecer con varios equipos y marcas.
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                SegurIA está pensado para sumar cámaras, sensores y equipos sin enredar la operación.
              </p>
              <div className="space-y-4">
                {[
                  'Sumar marcas y equipos poco a poco',
                  'Conectar con sistemas que ya usas',
                  'Leer estado y recibir avisos',
                  'Crecer a más lugares cuando haga falta',
                  'Mantener todo claro y ordenado'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#4DA3D9]" />
                    <span className="text-white/70 text-[15px]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-8 lg:p-12">
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Cámaras', icon: Camera },
                  { label: 'Sensores', icon: Cpu },
                  { label: 'Redes', icon: Wifi },
                  { label: 'Accesos', icon: Lock },
                  { label: 'Software', icon: Monitor },
                  { label: 'Documentos', icon: FileText }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center mx-auto mb-2">
                      <item.icon className="w-5 h-5 text-[#4DA3D9]" strokeWidth={1.5} />
                    </div>
                    <span className="text-[12px] text-white/50">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-[14px] text-white/40">
                  Ecosistema unificado y escalable
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-[#E6F1F8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-[#0A1B2E] text-balance">
              Proceso completo
            </h2>
            <p className="mt-4 text-[#6B7280] text-lg max-w-2xl mx-auto">
              Te acompañamos en cada paso del proyecto
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                step: '01',
                title: 'Diagnóstico',
                description: 'Analizamos necesidades, entorno, riesgos y cobertura del lugar.'
              },
              {
                icon: PenTool,
                step: '02',
                title: 'Diseño',
                description: 'Creamos una solución técnica adaptada a tu operación.'
              },
              {
                icon: Wrench,
                step: '03',
                title: 'Instalación',
                description: 'Dejamos todo instalado y funcionando.'
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
            Encontrá la solución ideal para tu operación
          </h2>
          <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Conversemos sobre tus necesidades. Te ayudamos a elegir las tecnologías correctas.
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
              Ver Aplicaciones
            </Link>
            <Link 
              href="/integraciones" 
              className="btn-ghost px-8 py-4 text-[15px] inline-flex items-center gap-2"
            >
              Integraciones
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

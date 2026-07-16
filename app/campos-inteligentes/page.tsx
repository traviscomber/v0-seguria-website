import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Camera, Thermometer, Wifi, Sun, Search, PenTool, Wrench, Activity } from 'lucide-react'

const applicationCards = [
  {
    title: 'Ganaderia',
    description: 'Monitoreo y control para operaciones rurales con foco en seguridad y seguimiento.',
  },
  {
    title: 'Agricultura',
    description: 'Supervision de cultivos, clima, riego y condiciones clave para decidir mejor.',
  },
  {
    title: 'Parcelas y lotes',
    description: 'Control de accesos, perimetros y actividad remota en espacios dispersos.',
  },
  {
    title: 'Infraestructura remota',
    description: 'Galpones, bombas, bodegas y activos criticos con lectura simple de operacion.',
  },
]

const capabilityCards = [
  {
    icon: Camera,
    title: 'Camaras rurales',
    description: 'Vision clara para exteriores y seguimiento en lugares complejos.',
  },
  {
    icon: Thermometer,
    title: 'Sensores ambientales',
    description: 'Temperatura, humedad y otras lecturas que ayudan a actuar a tiempo.',
  },
  {
    icon: Wifi,
    title: 'Redes rurales',
    description: 'Conectividad estable para que la informacion llegue donde debe llegar.',
  },
  {
    icon: Sun,
    title: 'Energia autonoma',
    description: 'Paneles y baterias para mantener operacion en entornos exigentes.',
  },
]

const processCards = [
  {
    icon: Search,
    step: '01',
    title: 'Diagnostico',
    description: 'Visitamos la operacion y entendemos el escenario real.',
  },
  {
    icon: PenTool,
    step: '02',
    title: 'Diseno',
    description: 'Definimos una solucion simple, tecnica y facil de explicar.',
  },
  {
    icon: Wrench,
    step: '03',
    title: 'Instalacion',
    description: 'Montamos equipos, conectividad y puntos de control.',
  },
  {
    icon: Activity,
    step: '04',
    title: 'Monitoreo',
    description: 'La solucion queda lista para seguimiento y soporte continuo.',
  },
]

export default function CamposInteligentesPage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      <section className="relative flex min-h-[84vh] items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(10, 27, 46, 0.55), rgba(10, 27, 46, 0.88)), url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=70&w=1400&auto=format&fit=crop')",
          }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(rgba(77, 163, 217, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 163, 217, 0.2) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-[5px] bg-[#4DA3D9]/20 px-4 py-2 text-sm text-[#4DA3D9]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Campos Inteligentes
          </div>

          <h1 className="text-balance text-4xl font-light leading-tight text-white md:text-5xl lg:text-6xl">
            Campos inteligentes para monitorear, proteger y optimizar.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-balance text-lg leading-relaxed text-white/72 md:text-xl">
            Tecnologia pensada para operaciones rurales que necesitan visibilidad, control y decisiones mas precisas.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/contacto" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Solicitar asesoria
            </Link>
            <Link href="/soluciones" className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Ver soluciones
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#123A5A] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-3xl font-light text-white md:text-4xl">Aplicaciones</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">Soluciones para distintos tipos de operacion rural.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {applicationCards.map((item) => (
              <div key={item.title} className="glass-card p-8 transition-all duration-300 hover:bg-[rgba(18,58,90,0.6)]">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[5px] bg-[#4DA3D9]/20">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-light text-white">{item.title}</h3>
                <p className="text-[15px] leading-relaxed text-white/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-3xl font-light text-white md:text-4xl">Capacidades rurales</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">Equipamiento pensado para condiciones exigentes.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {capabilityCards.map((item) => (
              <div key={item.title} className="glass-card p-6 text-center transition-all duration-300 hover:bg-[rgba(18,58,90,0.6)]">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[5px] bg-[#4DA3D9]/20">
                  <item.icon className="h-6 w-6 text-[#4DA3D9]" strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 text-lg font-light text-white">{item.title}</h3>
                <p className="text-[14px] leading-relaxed text-white/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#E6F1F8] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-3xl font-light text-[#0A1B2E] md:text-4xl">Como trabajamos</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#6B7280]">Un proceso simple para pasar de la idea a la operacion.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processCards.map((item) => (
              <div key={item.title} className="glass-card-light p-6 text-center">
                <div className="mb-4 text-sm font-light text-[#4DA3D9]">{item.step}</div>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[5px] bg-[#2B5C7E]/10">
                  <item.icon className="h-6 w-6 text-[#2B5C7E]" strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 text-lg font-light text-[#0A1B2E]">{item.title}</h3>
                <p className="text-[14px] leading-relaxed text-[#6B7280]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-balance text-3xl font-light text-white md:text-4xl">
            Conecta tu campo con una solucion que si se entiende
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/60">
            Disenamos una experiencia clara para vender, instalar y operar con menos friccion.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/contacto" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Solicitar asesoria
            </Link>
            <Link href="/propiedades-inteligentes" className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Ver propiedades inteligentes
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

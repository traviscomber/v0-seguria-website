import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Lock, Camera, Radio, Wifi, Search, PenTool, Wrench, Activity } from 'lucide-react'

const propertyCards = [
  {
    title: 'Hogares',
    description: 'Seguridad, acceso y alertas para casas que necesitan control simple y claro.',
  },
  {
    title: 'Condominios',
    description: 'Gestion ordenada para accesos, camaras y espacios comunes.',
  },
  {
    title: 'Bodegas y oficinas',
    description: 'Proteccion para espacios comerciales e industriales con lectura rapida.',
  },
]

const capabilityCards = [
  {
    icon: Lock,
    title: 'Control de acceso',
    description: 'Portones, cerraduras, citofonos y gestion de ingresos.',
  },
  {
    icon: Camera,
    title: 'Camaras',
    description: 'Monitoreo visual con vistas claras y estado visible.',
  },
  {
    icon: Radio,
    title: 'Sensores',
    description: 'Movimiento, apertura, presencia y alertas puntuales.',
  },
  {
    icon: Wifi,
    title: 'Redes estables',
    description: 'Conectividad para que la operacion no dependa del azar.',
  },
]

const processCards = [
  {
    icon: Search,
    step: '01',
    title: 'Diagnostico',
    description: 'Levantamos la necesidad real y el nivel de cobertura esperado.',
  },
  {
    icon: PenTool,
    step: '02',
    title: 'Diseno',
    description: 'Armamos una propuesta simple, entendible y escalable.',
  },
  {
    icon: Wrench,
    step: '03',
    title: 'Instalacion',
    description: 'Implementamos equipos y dejamos todo listo para operar.',
  },
  {
    icon: Activity,
    step: '04',
    title: 'Monitoreo',
    description: 'La solucion queda preparada para seguimiento y soporte.',
  },
]

export default function PropiedadesInteligentesPage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      <section className="relative flex min-h-[84vh] items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(10, 27, 46, 0.55), rgba(10, 27, 46, 0.88)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=70&w=1400&auto=format&fit=crop')",
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
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Propiedades Inteligentes
          </div>

          <h1 className="text-balance text-4xl font-light leading-tight text-white md:text-5xl lg:text-6xl">
            Seguridad y control para propiedades inteligentes.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-balance text-lg leading-relaxed text-white/72 md:text-xl">
            Una experiencia simple para proteger, ordenar y supervisar espacios con tecnologia que se entiende rapido.
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
            <h2 className="text-balance text-3xl font-light text-white md:text-4xl">Tipos de propiedad</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">Soluciones pensadas para distintos espacios y niveles de exigencia.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {propertyCards.map((card) => (
              <div key={card.title} className="glass-card p-8 transition-all duration-300 hover:bg-[rgba(18,58,90,0.6)]">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[5px] bg-[#4DA3D9]/20">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#4DA3D9]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-light text-white">{card.title}</h3>
                <p className="text-[15px] leading-relaxed text-white/60">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-3xl font-light text-white md:text-4xl">Capacidades clave</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">Todo lo importante en un solo esquema de operacion.</p>
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
            Protege tu propiedad con una solucion que se entiende rapido
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/60">
            Disenamos una experiencia comercial y operativa simple para que puedas vender, instalar y mostrar valor sin complicaciones.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/contacto" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Solicitar asesoria
            </Link>
            <Link href="/campos-inteligentes" className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Ver campos inteligentes
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

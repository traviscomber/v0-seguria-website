import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import {
  ArrowRight,
  Activity,
  Building2,
  Camera,
  Cpu,
  GitBranch,
  Lock,
  Monitor,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
} from 'lucide-react'

const storyCards = [
  {
    icon: Camera,
    title: 'Camaras y visibilidad',
    description: 'Cada sitio puede verse con orden, claridad y foco en lo que importa.',
  },
  {
    icon: Cpu,
    title: 'Sensores y control',
    description: 'Movimiento, acceso, clima y alertas en una misma lectura simple.',
  },
  {
    icon: Building2,
    title: 'Sitios y clientes',
    description: 'Una experiencia pensada para clientes, soporte y operación interna.',
  },
]

const platformHighlights = [
  'Portal de cliente con login',
  'Equipos agrupados por tipo',
  'Alertas faciles de entender',
  'Base lista para version pro',
]

const processSteps = [
  {
    step: '01',
    icon: Search,
    title: 'Diagnostico',
    description: 'Entendemos el sitio, el entorno y el nivel de cobertura que necesita.',
  },
  {
    step: '02',
    icon: GitBranch,
    title: 'Configuracion',
    description: 'Preparamos la cuenta, cargamos el sitio y dejamos todo ordenado.',
  },
  {
    step: '03',
    icon: Monitor,
    title: 'Portal',
    description: 'Mostramos el estado en una interfaz simple para el cliente final.',
  },
  {
    step: '04',
    icon: Activity,
    title: 'Evolucion',
    description: 'Escalamos la plataforma sin cambiar la experiencia central.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(10, 27, 46, 0.68), rgba(10, 27, 46, 0.95)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=70&w=1400&auto=format&fit=crop')",
          }}
        />
        <div
          className="absolute inset-0 opacity-12"
          style={{
            backgroundImage:
              'linear-gradient(rgba(77, 163, 217, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 163, 217, 0.12) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.2),transparent_62%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/12 px-4 py-2 text-sm text-[#9DD2F2]">
            <Sparkles className="w-4 h-4" strokeWidth={1.6} />
            Infraestructura inteligente para campos y propiedades
          </div>

          <h1 className="mx-auto mt-8 max-w-5xl text-4xl font-light leading-tight text-white text-balance md:text-6xl lg:text-7xl">
            Una sola plataforma para ver, entender y operar tu seguridad.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/70 md:text-xl">
            SegurIA une sitios, equipos y alertas en una vista clara. El cliente entiende rapido, tu equipo tiene
            contexto y la operacion gana orden.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/integraciones" className="btn-primary inline-flex min-w-[220px] items-center justify-center gap-2 px-8 py-4 text-[15px]">
              Ver integraciones
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/app" className="btn-secondary inline-flex min-w-[220px] items-center justify-center gap-2 px-8 py-4 text-[15px]">
              Abrir portal
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-3">
            {storyCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-white/10 bg-white/6 p-6 text-left backdrop-blur-md">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#4DA3D9]/20 bg-[#4DA3D9]/15 text-[#9DD2F2]">
                  <card.icon className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <h3 className="text-xl font-light text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#123A5A] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">Plataforma</p>
              <h2 className="text-3xl font-light text-white text-balance md:text-4xl">
                Diseñada para verse bien, entenderse rápido y crecer con cada cliente.
              </h2>
              <p className="max-w-xl text-lg leading-8 text-white/65">
                No es una demo genérica. Es una base visual pensada para mostrar valor comercial y operar con
                precisión en sitios reales.
              </p>
              <div className="flex flex-wrap gap-2">
                {platformHighlights.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {processSteps.map((step) => (
                <div key={step.title} className="glass-card p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
                      <step.icon className="h-5 w-5" strokeWidth={1.7} />
                    </div>
                    <span className="text-xs uppercase tracking-[0.22em] text-white/35">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-light text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-light text-white text-balance md:text-4xl">
              Una narrativa simple para presentar una plataforma seria.
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-white/65">
              Campos, propiedades, cámaras y sensores se explican con una sola historia. Menos ruido, más lectura
              comercial y una ruta clara hacia la version pro.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Login para clientes',
                'Vista por sitio',
                'Acceso a documentos',
                'Soporte con contexto',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#9DD2F2]" strokeWidth={1.6} />
                  <span className="text-white/75">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.16),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.7} />
              <p className="text-sm uppercase tracking-[0.22em] text-white/45">Base actual</p>
            </div>
            <h3 className="mt-4 text-2xl font-light text-white">Un sistema que se entiende sin explicación extra.</h3>
            <p className="mt-4 text-sm leading-7 text-white/60">
              Desde el portal público hasta la vista del cliente, todo comparte el mismo lenguaje visual: orden,
              claridad y una ruta inmediata a la accion.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Metric label="Sitios" value="1+" />
              <Metric label="Equipos" value="8" />
              <Metric label="Capas" value="3" />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contacto" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-[15px]">
                Pedir llamada
              </Link>
              <Link href="/propiedades-inteligentes" className="btn-ghost inline-flex items-center gap-2 px-6 py-3 text-[15px]">
                Ver solución
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 text-2xl font-light text-white">{value}</p>
    </div>
  )
}

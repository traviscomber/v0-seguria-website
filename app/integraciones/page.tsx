import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import {
  ArrowRight,
  Building2,
  Cpu,
  GitBranch,
  Home,
  Lock,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react'

const heroMetrics = [
  { label: 'Portal por cliente', value: '1' },
  { label: 'Equipos base', value: '8' },
  { label: 'Pasos de puesta en marcha', value: '3' },
]

const pillars = [
  {
    icon: Home,
    title: 'Una vista unica',
    description: 'El cliente entra a un solo portal para revisar sitios, equipos y alertas sin saltar entre sistemas.',
  },
  {
    icon: Cpu,
    title: 'Datos ordenados',
    description: 'Camaras, sensores y accesos quedan agrupados para leer la operacion de inmediato.',
  },
  {
    icon: GitBranch,
    title: 'Operacion clara',
    description: 'Tu equipo sabe que esta activo, que requiere revision y que necesita seguimiento.',
  },
]

const capabilities = [
  'Un portal simple para cliente y soporte',
  'Alertas faciles de entender',
  'Equipos agrupados por tipo',
  'Base lista para crecer a version pro',
]

const flow = [
  {
    step: '01',
    title: 'Preparamos la cuenta',
    description: 'Asignamos el cliente al sitio correcto y dejamos el acceso listo.',
  },
  {
    step: '02',
    title: 'Cargamos el sitio',
    description: 'Importamos camaras, sensores, accesos y eventos clave.',
  },
  {
    step: '03',
    title: 'Publicamos el portal',
    description: 'El cliente entra y ve su operacion en una pantalla limpia y comercial.',
  },
]

export default function IntegracionesPage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.2),transparent_32%),linear-gradient(180deg,rgba(10,27,46,0.94),rgba(10,27,46,0.98))]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(77,163,217,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(77,163,217,0.14) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto grid min-h-[92vh] max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/12 px-4 py-2 text-sm text-[#9DD2F2]">
              <Workflow className="h-4 w-4" strokeWidth={1.6} />
              Plataforma de integraciones
            </div>

            <h1 className="mt-8 max-w-3xl text-balance text-4xl font-light leading-tight text-white md:text-5xl lg:text-6xl">
              Una experiencia premium para conectar sitios, equipos y alertas.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              SegurIA ordena lo complejo para que el cliente vea solo lo importante: que hay instalado, que esta
              funcionando y que requiere atencion. La experiencia busca ser clara, directa y facil de explicar.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/contacto" className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-[15px]">
                Solicitar demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/app" className="btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4 text-[15px]">
                Ver portal
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <p className="text-3xl font-light text-white">{metric.value}</p>
                  <p className="mt-1 text-sm text-white/55">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative w-full rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
              <div className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/45">
                Portal live
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
                    <Sparkles className="h-5 w-5" strokeWidth={1.7} />
                  </div>
                  <div>
                    <p className="text-sm text-white/45">Lectura ejecutiva</p>
                    <p className="text-lg text-white">Una sola vista para operacion y cliente</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    'Sitios claros por cliente',
                    'Camaras, sensores y accesos agrupados',
                    'Alertas entendibles de inmediato',
                    'Version pro lista para escalar',
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                      {item}
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#0B1D30] p-5">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.6} />
                    <p className="text-white">Pensado para escalar</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    El portal queda listo para recibir datos, mostrar estado y crecer hacia una experiencia pro sin
                    rehacer la historia de marca.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#123A5A] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-light text-white md:text-4xl">
              Hecho para que el cliente entienda en segundos
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/62">
              El portal no intenta mostrar todo. Muestra lo que ayuda a tomar decisiones rapido.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="glass-card p-8 transition-all duration-300 hover:bg-[rgba(18,58,90,0.65)]">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#4DA3D9]/20 bg-[#4DA3D9]/15">
                  <pillar.icon className="h-7 w-7 text-[#4DA3D9]" strokeWidth={1.6} />
                </div>
                <h3 className="text-xl font-light text-white">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">Lo que resuelve</p>
            <h2 className="mt-3 text-balance text-3xl font-light text-white md:text-4xl">
              Un portal limpio, comercial y listo para crecer.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
              Primero preparamos la cuenta. Luego mostramos el sitio con una estructura clara: camaras, sensores,
              accesos, documentos y alertas.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {capabilities.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#9DD2F2]" strokeWidth={1.6} />
                  <span className="text-sm leading-7 text-white/78">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3">
              <Network className="h-6 w-6 text-[#9DD2F2]" strokeWidth={1.6} />
              <h3 className="text-xl font-light text-white">Como funciona</h3>
            </div>

            <div className="mt-8 space-y-5">
              {flow.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#4DA3D9]/20 bg-[#4DA3D9]/15 text-sm text-[#9DD2F2]">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-[15px] font-light text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-7 text-white/58">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6 text-sm text-white/62">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.6} />
                Cuenta lista, datos importados y un portal simple para operar sin friccion.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#E6F1F8] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-balance text-3xl font-light text-[#0A1B2E] md:text-4xl">
            La base que necesita una version pro
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#6B7280]">
            La idea es simple: dar una vista premium, clara y comercial que permita crecer sin cambiar de enfoque.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/contacto" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Pedir una llamada
            </Link>
            <Link href="/soluciones" className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Ver la solucion
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

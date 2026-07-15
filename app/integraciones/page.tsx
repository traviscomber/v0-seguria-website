import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ArrowRight, Cpu, GitBranch, Home, Lock, Network, ShieldCheck, Workflow } from 'lucide-react'

const pillars = [
  {
    icon: Home,
    title: 'Una vista unica',
    description: 'El cliente entra a un solo portal para revisar sitios, equipos y alertas sin saltar entre sistemas.',
  },
  {
    icon: Cpu,
    title: 'Datos ordenados',
    description: 'Camaras, sensores y accesos quedan agrupados de forma simple para entender rapido que esta pasando.',
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

const proofPoints = [
  { value: '01', label: 'Portal unico por cliente' },
  { value: '08', label: 'Equipos base importados' },
  { value: '03', label: 'Pasos para ponerlo en marcha' },
]

export default function IntegracionesPage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      <section className="relative min-h-[76vh] flex items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(10, 27, 46, 0.66), rgba(10, 27, 46, 0.96)), url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=70&w=1400&auto=format&fit=crop')",
          }}
        />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(rgba(77, 163, 217, 0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 163, 217, 0.16) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(77,163,217,0.22),transparent_65%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/12 text-[#9DD2F2] text-sm mb-8 shadow-[0_0_0_1px_rgba(77,163,217,0.08)]">
            <Workflow className="w-4 h-4" strokeWidth={1.5} />
            Plataforma de integraciones
          </div>

          <h1 className="max-w-5xl mx-auto text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight text-balance">
            Una sola experiencia para conectar sitios, equipos y alertas.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/72 max-w-3xl mx-auto leading-relaxed text-balance">
            SegurIA ordena lo complejo para que el cliente vea solo lo importante: que hay instalado, que esta
            funcionando y que requiere atencion.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contacto" className="btn-primary px-8 py-4 text-[15px] inline-flex items-center gap-2">
              Solicitar demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/app" className="btn-secondary px-8 py-4 text-[15px] inline-flex items-center gap-2">
              Ver portal
            </Link>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
            {proofPoints.map((point) => (
              <div key={point.label} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                <p className="text-3xl font-light text-white">{point.value}</p>
                <p className="mt-1 text-sm text-white/55">{point.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#123A5A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance">Hecho para que el cliente entienda en segundos</h2>
            <p className="mt-4 text-white/62 text-lg max-w-2xl mx-auto">
              El portal no intenta mostrar todo. Muestra lo que ayuda a tomar decisiones rapido.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="glass-card p-8 group hover:bg-[rgba(18,58,90,0.65)] transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#4DA3D9]/18 flex items-center justify-center mb-6 border border-[#4DA3D9]/20">
                  <pillar.icon className="w-7 h-7 text-[#4DA3D9]" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-light text-white mb-3">{pillar.title}</h3>
                <p className="text-[15px] text-white/62 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0A1B2E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance mb-6">Que resuelve hoy</h2>
            <p className="text-white/62 text-lg leading-relaxed mb-8 max-w-xl">
              Primero preparamos la cuenta. Luego mostramos el sitio con una estructura limpia: camaras, sensores,
              accesos, documentos y alertas.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {capabilities.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-[#4DA3D9] mt-0.5 shrink-0" strokeWidth={1.5} />
                  <span className="text-white/78 text-[15px] leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <Network className="w-6 h-6 text-[#4DA3D9]" strokeWidth={1.5} />
              <h3 className="text-xl font-light text-white">Como funciona</h3>
            </div>
            <div className="space-y-5">
              {flow.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#4DA3D9]/18 flex items-center justify-center text-[#9DD2F2] text-sm border border-[#4DA3D9]/20">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-white font-light text-[15px]">{item.title}</p>
                    <p className="text-white/55 text-sm leading-relaxed mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 text-white/62 text-sm">
                <Lock className="w-4 h-4 text-[#4DA3D9]" strokeWidth={1.5} />
                Cuenta lista, datos importados y un portal simple para operar sin friccion
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#E6F1F8]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-light text-[#0A1B2E] text-balance">
            La base que necesita una version pro
          </h2>
          <p className="mt-4 text-[#6B7280] text-lg max-w-2xl mx-auto leading-relaxed">
            La idea es simple: dar una vista premium, clara y comercial que permita crecer sin cambiar de enfoque.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contacto" className="btn-primary px-8 py-4 text-[15px] inline-flex items-center gap-2">
              Pedir una llamada
            </Link>
            <Link href="/soluciones" className="btn-secondary px-8 py-4 text-[15px] inline-flex items-center gap-2">
              Ver la solucion
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

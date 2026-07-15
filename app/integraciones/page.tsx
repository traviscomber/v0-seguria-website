import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ArrowRight, Cpu, GitBranch, Home, Lock, Network, ShieldCheck, Workflow } from 'lucide-react'

const pillars = [
  {
    icon: Home,
    title: 'Seteo interno',
    description: 'Nosotros dejamos la cuenta del cliente lista.',
  },
  {
    icon: Cpu,
    title: 'Ver sus equipos',
    description: 'La app muestra dispositivos, camaras y sensores del cliente.',
  },
  {
    icon: GitBranch,
    title: 'Mostrar estado',
    description: 'Se ve que esta activo, en alerta o requiere revision.',
  },
]

const capabilities = [
  'Nosotros seteamos la cuenta del cliente',
  'Ver dispositivos, camaras y sensores',
  'Mostrar estado y alertas simples',
  'Abrir una vista clara para soporte interno',
  'Dejar lista la base para la version pro',
]

const flow = [
  {
    step: '01',
    title: 'Setear cuenta',
    description: 'Nuestro equipo configura la cuenta del cliente.',
  },
  {
    step: '02',
    title: 'Traer datos',
    description: 'La app lee equipos, estado y alertas.',
  },
  {
    step: '03',
    title: 'Mostrar portal',
    description: 'SegurIA enseña los datos de forma simple y entendible.',
  },
]

export default function IntegracionesPage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      <section className="relative min-h-[72vh] flex items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(10, 27, 46, 0.72), rgba(10, 27, 46, 0.95)), url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=70&w=1400&auto=format&fit=crop')",
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(77, 163, 217, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 163, 217, 0.15) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[5px] bg-[#4DA3D9]/20 text-[#4DA3D9] text-sm mb-6">
            <Workflow className="w-4 h-4" strokeWidth={1.5} />
            Operacion interna
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight text-balance">
            Nosotros dejamos la cuenta del cliente lista y mostramos sus datos.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed text-balance">
            La primera version de SegurIA es interna: nuestro equipo configura la cuenta del cliente y luego ve sus
            dispositivos, estado y alertas en un solo lugar.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contacto" className="btn-primary px-8 py-4 text-[15px] inline-flex items-center gap-2">
              Hablar de la cuenta
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/admin/dispositivos" className="btn-secondary px-8 py-4 text-[15px] inline-flex items-center gap-2">
              Ver el portal
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#123A5A]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance">Tres pasos simples</h2>
            <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
              Lo minimo para que nuestro equipo deje la cuenta operativa rapido.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="glass-card p-8 group hover:bg-[rgba(18,58,90,0.6)] transition-all duration-300">
                <div className="w-14 h-14 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center mb-6">
                  <pillar.icon className="w-7 h-7 text-[#4DA3D9]" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-light text-white mb-3">{pillar.title}</h3>
                <p className="text-[15px] text-white/60 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0A1B2E]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance mb-6">Que permite hoy</h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Primero configuramos la cuenta del cliente. Luego mostramos sus datos de forma clara.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {capabilities.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[5px] bg-white/5 p-4">
                  <ShieldCheck className="w-5 h-5 text-[#4DA3D9] mt-0.5 shrink-0" strokeWidth={1.5} />
                  <span className="text-white/75 text-[15px] leading-relaxed">{item}</span>
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
                  <div className="w-10 h-10 shrink-0 rounded-[5px] bg-[#4DA3D9]/20 flex items-center justify-center text-[#4DA3D9] text-sm">
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
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Lock className="w-4 h-4 text-[#4DA3D9]" strokeWidth={1.5} />
                Solo lo necesario para empezar: seteo interno, datos y visualizacion clara
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#E6F1F8]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-light text-[#0A1B2E] text-balance">
            Esta puede ser la base simple del producto
          </h2>
          <p className="mt-4 text-[#6B7280] text-lg max-w-2xl mx-auto leading-relaxed">
            La primera meta es que nuestro equipo setee la cuenta y el cliente vea sus equipos sin friccion.
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

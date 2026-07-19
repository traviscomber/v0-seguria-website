import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ArrowRight } from 'lucide-react'

const solutionPages = [
  {
    eyebrow: 'Campos Inteligentes',
    title: 'El campo despierta antes que el riesgo.',
    description: 'Integramos camaras, sensores, portones y alarmas existentes para detectar senales utiles antes de que el problema avance.',
    href: '/campos-inteligentes',
    background:
      "linear-gradient(to bottom, rgba(10, 27, 46, 0.55), rgba(10, 27, 46, 0.88)), url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=70&w=1400&auto=format&fit=crop')",
  },
  {
    eyebrow: 'Propiedades Inteligentes',
    title: 'Tu casa tranquila. Tu mundo en orden.',
    description: 'Aprovechamos camaras, alarmas, accesos y sensores actuales para transformar una propiedad en un sistema que avisa con inteligencia.',
    href: '/propiedades-inteligentes',
    background:
      "linear-gradient(to bottom, rgba(10, 27, 46, 0.55), rgba(10, 27, 46, 0.88)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=70&w=1400&auto=format&fit=crop')",
  },
]

export default function SolucionesPage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      <section className="relative flex min-h-[64vh] items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(10, 27, 46, 0.54), rgba(10, 27, 46, 0.93)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=70&w=1400&auto=format&fit=crop')",
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(77, 163, 217, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 163, 217, 0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h1 className="text-balance text-4xl font-light leading-tight text-white md:text-5xl lg:text-6xl">
            Seguridad integral para operar con calma.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-balance text-lg leading-8 text-white/72 md:text-xl">
            Nos conectamos a tus sistemas actuales de camaras, alarmas, sensores y accesos para agregar IA, alertas utiles, evidencia y respuesta.
          </p>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-balance text-3xl font-light text-white md:text-4xl">
              Inteligencia sobre lo que ya existe.
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/62">
              SegurIA no parte borrando tu infraestructura. La lee, la ordena y la convierte en una operacion integral de seguridad.
            </p>
          </div>

          <div className="grid gap-6">
            {solutionPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="group relative flex min-h-[420px] items-end overflow-hidden rounded-[8px] border border-white/10 bg-cover bg-center p-8 transition-all duration-300 hover:border-[#9DD2F2]/45 md:p-12"
                style={{ backgroundImage: page.background }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(77, 163, 217, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 163, 217, 0.2) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                  }}
                />
                <div className="relative max-w-3xl">
                  <p className="mb-5 inline-flex rounded-[5px] bg-[#4DA3D9]/20 px-4 py-2 text-sm text-[#9DD2F2]">
                    {page.eyebrow}
                  </p>
                  <h3 className="text-balance text-4xl font-light leading-tight text-white md:text-5xl">
                    {page.title}
                  </h3>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">{page.description}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-[15px] text-[#9DD2F2]">
                    Ver solucion
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}

            <Link
              href="/hoteleria-inteligente"
              className="group relative flex min-h-[420px] items-end overflow-hidden rounded-[8px] border border-white/10 bg-cover bg-center p-8 transition-all duration-300 hover:border-[#9DD2F2]/45 md:p-12"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom, rgba(10, 27, 46, 0.3), rgba(10, 27, 46, 0.9)), url('/portal/huilo-huilo.jpg')",
              }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(77, 163, 217, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 163, 217, 0.2) 1px, transparent 1px)',
                  backgroundSize: '60px 60px',
                }}
              />

              <div className="relative max-w-3xl">
                <p className="mb-5 inline-flex rounded-[5px] bg-[#4DA3D9]/20 px-4 py-2 text-sm text-[#9DD2F2]">
                  Hoteleria Inteligente
                </p>
                <h3 className="text-balance text-4xl font-light leading-tight text-white md:text-5xl">
                  Tu hotel sereno. Cada detalle bajo control.
                </h3>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
                  Integramos camaras, accesos, alarmas y sistemas operativos para que la IA detecte lo importante sin incomodar al huesped.
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-[15px] text-[#9DD2F2]">
                  Ver solucion
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

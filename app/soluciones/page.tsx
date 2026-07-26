import type { Metadata } from 'next'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ArrowRight, Camera, PawPrint, ScanSearch, UserRoundSearch } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sistemas de seguridad integral y reconocimiento de objetos con IA',
  description:
    'SegurIA convierte cámaras convencionales en sistemas inteligentes capaces de detectar personas, vehículos, animales y fauna como pumas, generando alertas útiles para campos, empresas y propiedades en Chile.',
  keywords: [
    'reconocimiento de objetos con inteligencia artificial',
    'detección de personas con cámaras',
    'detección de animales con cámaras',
    'detección de pumas Chile',
    'cámaras con inteligencia artificial',
    'convertir cámara normal en cámara inteligente',
    'analítica de video Chile',
  ],
  alternates: { canonical: '/soluciones' },
}

const solutionPages = [
  {
    eyebrow: 'Campos Inteligentes',
    title: 'El campo despierta antes que el riesgo.',
    description:
      'Integramos cámaras, sensores, portones y alarmas existentes para detectar personas, vehículos, animales y señales útiles antes de que el problema avance.',
    href: '/campos-inteligentes',
    background:
      "linear-gradient(to bottom, rgba(10, 27, 46, 0.55), rgba(10, 27, 46, 0.88)), url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=70&w=1400&auto=format&fit=crop')",
  },
  {
    eyebrow: 'Propiedades Inteligentes',
    title: 'Tu casa tranquila. Tu mundo en orden.',
    description:
      'Aprovechamos cámaras, alarmas, accesos y sensores actuales para distinguir actividad relevante, reducir falsas alarmas y avisar con inteligencia.',
    href: '/propiedades-inteligentes',
    background:
      "linear-gradient(to bottom, rgba(10, 27, 46, 0.55), rgba(10, 27, 46, 0.88)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=70&w=1400&auto=format&fit=crop')",
  },
]

const recognitionCapabilities = [
  {
    icon: UserRoundSearch,
    title: 'Personas y comportamiento',
    description:
      'Detecta presencia humana, cruces de perímetro, permanencia inusual y movimiento en zonas restringidas, según las reglas definidas para cada sitio.',
  },
  {
    icon: PawPrint,
    title: 'Animales y fauna',
    description:
      'Distingue animales de personas y vehículos. Puede configurarse para identificar categorías relevantes para el entorno, incluida fauna como pumas.',
  },
  {
    icon: ScanSearch,
    title: 'Objetos y vehículos',
    description:
      'Reconoce clases de objetos, vehículos y eventos visuales para transformar video continuo en alertas concretas y evidencia fácil de revisar.',
  },
  {
    icon: Camera,
    title: 'Cámaras existentes, nueva inteligencia',
    description:
      'En muchos casos no necesitas reemplazar la cámara. SegurIA procesa el flujo de video y agrega analítica inteligente sobre infraestructura compatible ya instalada.',
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
            Seguridad integral que entiende lo que ve.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-balance text-lg leading-8 text-white/72 md:text-xl">
            Nos conectamos a tus cámaras, alarmas, sensores y accesos para reconocer personas, vehículos, objetos y animales, agregar contexto y generar alertas realmente útiles.
          </p>
        </div>
      </section>

      <section className="bg-[#123A5A] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-[0.24em] text-[#9DD2F2]">Visión artificial SegurIA</p>
            <h2 className="mt-4 text-balance text-3xl font-light text-white md:text-5xl">
              Una cámara normal puede convertirse en una cámara inteligente.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/68">
              Nuestra tecnología analiza video compatible sin obligarte a reemplazar toda la infraestructura. La cámara sigue capturando imágenes; SegurIA agrega la capacidad de interpretar lo que ocurre, clasificar eventos y activar respuestas según el riesgo.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {recognitionCapabilities.map((capability) => (
              <article key={capability.title} className="rounded-[10px] border border-white/10 bg-[#0A1B2E]/55 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#4DA3D9]/18 text-[#9DD2F2]">
                  <capability.icon className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <h3 className="mt-6 text-2xl font-light text-white">{capability.title}</h3>
                <p className="mt-4 text-base leading-7 text-white/64">{capability.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-[10px] border border-[#9DD2F2]/20 bg-[#0A1B2E]/65 p-7">
            <p className="text-sm leading-7 text-white/72">
              La precisión y las categorías disponibles dependen de la calidad de imagen, iluminación, ángulo, conectividad y compatibilidad del flujo de video. Cada instalación se valida técnicamente antes de definir reglas y niveles de alerta.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-balance text-3xl font-light text-white md:text-4xl">
              Inteligencia sobre lo que ya existe.
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/62">
              SegurIA no parte borrando tu infraestructura. La lee, la ordena y la convierte en una operación integral de seguridad.
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
                <div className="relative max-w-3xl">
                  <p className="mb-5 inline-flex rounded-[5px] bg-[#4DA3D9]/20 px-4 py-2 text-sm text-[#9DD2F2]">
                    {page.eyebrow}
                  </p>
                  <h3 className="text-balance text-4xl font-light leading-tight text-white md:text-5xl">{page.title}</h3>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">{page.description}</p>
                  <span className="mt-8 inline-flex items-center gap-2 text-[15px] text-[#9DD2F2]">
                    Ver solución
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
              <div className="relative max-w-3xl">
                <p className="mb-5 inline-flex rounded-[5px] bg-[#4DA3D9]/20 px-4 py-2 text-sm text-[#9DD2F2]">
                  Hotelería Inteligente
                </p>
                <h3 className="text-balance text-4xl font-light leading-tight text-white md:text-5xl">
                  Tu hotel sereno. Cada detalle bajo control.
                </h3>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
                  Integramos cámaras, accesos, alarmas y sistemas operativos para que la IA detecte lo importante sin incomodar al huésped.
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-[15px] text-[#9DD2F2]">
                  Ver solución
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

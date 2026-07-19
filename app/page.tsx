import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import {
  ArrowRight,
  BellRing,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  FileSearch,
  Home,
  Hotel,
  Leaf,
  Moon,
  ShieldCheck,
  Siren,
} from 'lucide-react'

const coreBenefits = [
  {
    icon: Moon,
    title: 'Todo conectado en una sola mirada',
    description: 'Camaras, accesos, sensores, alertas y evidencia viven en un mismo sistema, ordenados por sitio y prioridad.',
  },
  {
    icon: Siren,
    title: 'Alertas que llegan con sentido',
    description: 'No se trata de hacer ruido. Se trata de avisar cuando algo importa, con contexto suficiente para actuar bien.',
  },
  {
    icon: FileSearch,
    title: 'Evidencia lista cuando la necesitas',
    description: 'Cada evento deja una historia clara: que paso, donde paso, quien fue avisado y que decision se tomo.',
  },
]

const customerWins = [
  'Una operacion que se entiende sin perseguir pantallas',
  'Camaras y sensores convertidos en informacion util',
  'Incidentes ordenados desde la primera senal hasta el cierre',
  'Clientes, tecnicos y administradores mirando la misma verdad',
  'Menos llamadas, menos dudas y menos decisiones a ciegas',
  'Una experiencia profesional que se siente simple desde el primer dia',
]

const places = [
  {
    icon: Leaf,
    title: 'Campos',
    description: 'Perimetros, portones, bodegas, caminos y zonas remotas con vigilancia que avisa antes de que el problema avance.',
    href: '/campos-inteligentes',
  },
  {
    icon: Home,
    title: 'Casas y propiedades',
    description: 'Accesos, patios, condominios, oficinas y segundas viviendas protegidas con claridad, calma y respuesta.',
    href: '/propiedades-inteligentes',
  },
  {
    icon: Hotel,
    title: 'Hoteles',
    description: 'Areas comunes, accesos, staff, proveedores y eventos bajo control sin romper la experiencia del huesped.',
    href: '/hoteleria-inteligente',
  },
]

const proofPoints = [
  { label: 'Sitios', value: 'visibles' },
  { label: 'Eventos', value: 'claros' },
  { label: 'Respuesta', value: 'a tiempo' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      <section className="relative flex min-h-screen items-start overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "linear-gradient(110deg, rgba(10, 27, 46, 0.96) 0%, rgba(10, 27, 46, 0.78) 42%, rgba(10, 27, 46, 0.42) 100%), url('https://images.unsplash.com/photo-1757358598889-1381c175d541?q=70&w=1800&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(77,163,217,0.22),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(157,210,242,0.16),transparent_28%),linear-gradient(to_bottom,transparent_62%,#0A1B2E_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(77, 163, 217, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(77, 163, 217, 0.12) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="absolute left-0 top-24 h-px w-full bg-gradient-to-r from-transparent via-[#9DD2F2]/35 to-transparent" />
        <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-[#0A1B2E] to-transparent" />

        <div className="relative z-10 mx-auto grid w-full max-w-[1480px] items-start gap-12 px-6 pb-16 pt-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(500px,0.78fr)] lg:gap-16 lg:px-8 lg:pt-24 xl:grid-cols-[minmax(0,0.86fr)_minmax(560px,0.74fr)] xl:gap-20 xl:pt-28">
          <div className="flex max-w-3xl flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/12 px-4 py-2 text-sm text-[#9DD2F2]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.6} />
              Sistema integral de seguridad operativa
            </div>

            <h1 className="mt-8 max-w-[720px] text-balance text-5xl font-light leading-[1.02] text-white md:text-[4rem] lg:text-[4.7rem]">
              Lo que proteges, por fin habla claro.
            </h1>

            <p className="mt-6 max-w-2xl text-balance text-xl leading-9 text-white/78">
              SegurIA une camaras, sensores, accesos, eventos e incidentes en una experiencia simple: sabes que pasa, entiendes por que importa y respondes sin improvisar.
            </p>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {['Mas control', 'Menos ruido', 'Mejor reaccion'].map((item) => (
                <div key={item} className="rounded-[8px] border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white/76 backdrop-blur-md">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/soluciones" className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-[15px]">
                Ver sistema
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contacto" className="btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4 text-[15px]">
                Disenar mi operacion
              </Link>
            </div>
          </div>

          <div className="relative flex justify-end lg:pl-6 xl:translate-x-8 2xl:translate-x-14">
            <div className="w-full max-w-[580px] rounded-[12px] border border-white/12 bg-[#061525]/76 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-6 xl:max-w-[620px]">
              <div className="overflow-hidden rounded-[10px] border border-white/10 bg-[#0A1B2E]">
                <div className="relative h-56 overflow-hidden bg-cover bg-center md:h-72"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(10, 27, 46, 0.12), rgba(10, 27, 46, 0.82)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=70&w=1400&auto=format&fit=crop')",
                  }}
                >
                  <div className="absolute left-5 top-5 rounded-full border border-[#9DD2F2]/30 bg-[#0A1B2E]/70 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#9DD2F2] backdrop-blur">
                    Operacion protegida
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-3">
                    {proofPoints.map((point) => (
                      <div key={point.label} className="rounded-[8px] border border-white/10 bg-[#0A1B2E]/72 p-4 backdrop-blur-md">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/42">{point.label}</p>
                        <p className="mt-2 text-xl font-light text-white">{point.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-px bg-white/10 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="bg-[#0A1B2E]/95 p-5">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.6} />
                      <p className="text-sm uppercase tracking-[0.2em] text-white/50">Claridad diaria</p>
                    </div>
                    <div className="mt-5 space-y-3">
                      {['Acceso fuera de horario', 'Movimiento en zona sensible', 'Equipo notificado'].map((item, index) => (
                        <div key={item} className="flex items-center justify-between rounded-[8px] bg-white/[0.06] px-4 py-3">
                          <span className="text-sm text-white/74">{item}</span>
                          <span className="text-xs text-[#9DD2F2]">0{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0A1B2E]/95 p-5">
                    <div className="flex items-center gap-3">
                      <Camera className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.6} />
                      <p className="text-sm uppercase tracking-[0.2em] text-white/50">Lo que cambia</p>
                    </div>
                    <div className="mt-5 space-y-4">
                      {[
                        'Sabes que paso sin perseguir grabaciones.',
                        'Tu equipo actua con informacion, no intuicion.',
                        'Tus clientes sienten orden, no improvisacion.',
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#9DD2F2]" strokeWidth={1.6} />
                          <p className="text-[15px] leading-7 text-white/74">{item}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 rounded-[8px] border border-[#9DD2F2]/20 bg-[#123A5A]/70 p-4">
                      <p className="text-sm leading-6 text-white/72">
                        La seguridad deja de ser una suma de equipos y se vuelve una operacion viva: observa, entiende y acompana cada decision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#123A5A] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">Que hace SegurIA</p>
            <h2 className="mt-4 text-balance text-3xl font-light text-white md:text-4xl">
              Convierte tecnologia dispersa en una operacion de seguridad entendible.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {coreBenefits.map((benefit) => (
              <div key={benefit.title} className="glass-card p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#4DA3D9]/18 text-[#9DD2F2]">
                  <benefit.icon className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <h3 className="text-xl font-light text-white">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">Por que importa</p>
            <h2 className="mt-4 text-balance text-3xl font-light text-white md:text-4xl">
              El riesgo no aparece de golpe. Primero deja senales.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/62">
              Una puerta abierta, un movimiento fuera de horario, una camara sin revision o una bodega expuesta pueden parecer detalles. SegurIA los ordena antes de que se transformen en perdida, conflicto o desorden.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {customerWins.map((win) => (
              <div key={win} className="flex items-start gap-3 rounded-[8px] border border-white/10 bg-white/5 p-5">
                <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-[#9DD2F2]" strokeWidth={1.7} />
                <span className="text-[15px] leading-7 text-white/75">{win}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#E6F1F8] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-[#2B5C7E]">Donde vive</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-light text-[#0A1B2E] md:text-4xl">
              Un mismo sistema, adaptado al ritmo de cada lugar.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {places.map((place) => (
              <Link key={place.href} href={place.href} className="glass-card-light group p-8 transition-all duration-300 hover:-translate-y-1">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#2B5C7E]/10 text-[#2B5C7E]">
                  <place.icon className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <h3 className="text-xl font-light text-[#0A1B2E]">{place.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5C6670]">{place.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-[15px] text-[#2B5C7E]">
                  Ver solucion
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1B2E] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <Clock className="mx-auto mb-6 h-10 w-10 text-[#9DD2F2]" strokeWidth={1.4} />
          <h2 className="text-balance text-3xl font-light text-white md:text-4xl">
            Seguridad integral, sin hacer compleja la vida de nadie.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/62">
            Cuentanos que lugares quieres proteger y armamos una ruta clara para unir monitoreo, inventario, eventos, incidentes y respuesta en una sola experiencia.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/contacto" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Pedir asesoria
            </Link>
            <Link href="/soluciones" className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Ver sistema
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

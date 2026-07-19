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
    title: 'Dormir sin revisar todo',
    description: 'El campo, la casa o el hotel siguen observados mientras tu no estas mirando.',
  },
  {
    icon: Siren,
    title: 'Responder antes del dano',
    description: 'Si algo se mueve fuera de lugar, si alguien entra o si una zona queda expuesta, lo sabes a tiempo.',
  },
  {
    icon: FileSearch,
    title: 'Tener evidencia clara',
    description: 'Cuando hay dudas, no dependes de recuerdos ni versiones cruzadas. Tienes una historia para revisar.',
  },
]

const customerWins = [
  'Menos llamadas preguntando que paso',
  'Menos falsas alarmas que cansan al equipo',
  'Mas claridad para decidir rapido',
  'Mas control sobre accesos y zonas sensibles',
  'Mejor respuesta ante intrusos, fallas o movimientos raros',
  'Una experiencia simple para duenos, administradores y equipos',
]

const places = [
  {
    icon: Leaf,
    title: 'Campos',
    description: 'Ganado, cultivos, bodegas, portones, caminos y zonas remotas con una mirada continua.',
    href: '/campos-inteligentes',
  },
  {
    icon: Home,
    title: 'Casas y propiedades',
    description: 'Familia, entradas, patios, condominios y negocios protegidos sin complicar la vida diaria.',
    href: '/propiedades-inteligentes',
  },
  {
    icon: Hotel,
    title: 'Hoteles',
    description: 'Huespedes tranquilos, staff coordinado, areas comunes visibles y eventos bajo control.',
    href: '/hoteleria-inteligente',
  },
]

const proofPoints = [
  { label: 'Noche', value: 'vigilada' },
  { label: 'Accesos', value: 'claros' },
  { label: 'Alertas', value: 'utiles' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A1B2E]">
      <Navigation />

      <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
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

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/12 px-4 py-2 text-sm text-[#9DD2F2]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.6} />
              Seguridad integral para operar con calma
            </div>

            <h1 className="mt-8 max-w-5xl text-balance text-5xl font-light leading-[0.98] text-white md:text-6xl lg:text-7xl">
              Protege sin perseguir camaras.
            </h1>

            <p className="mt-6 max-w-2xl text-balance text-xl leading-9 text-white/78">
              SegurIA te muestra lo importante, avisa cuando algo cambia y deja evidencia clara para decidir antes de que el problema crezca.
            </p>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {['Menos incertidumbre', 'Mejor respuesta', 'Mas tranquilidad'].map((item) => (
                <div key={item} className="rounded-[8px] border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white/76 backdrop-blur-md">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/soluciones" className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-[15px]">
                Ver soluciones
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contacto" className="btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4 text-[15px]">
                Pedir asesoria
              </Link>
            </div>
          </div>

          <div className="relative flex items-center">
            <div className="absolute -left-5 top-10 hidden rounded-[8px] border border-white/10 bg-[#E6F1F8]/92 p-4 text-[#0A1B2E] shadow-2xl backdrop-blur-md lg:block">
              <p className="text-xs uppercase tracking-[0.18em] text-[#2B5C7E]">Ahora</p>
              <p className="mt-1 text-2xl font-light">Todo visible</p>
            </div>

            <div className="w-full rounded-[12px] border border-white/12 bg-[#061525]/76 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-6">
              <div className="overflow-hidden rounded-[10px] border border-white/10 bg-[#0A1B2E]">
                <div className="relative h-56 overflow-hidden bg-cover bg-center md:h-72"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(10, 27, 46, 0.12), rgba(10, 27, 46, 0.82)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=70&w=1400&auto=format&fit=crop')",
                  }}
                >
                  <div className="absolute left-5 top-5 rounded-full border border-[#9DD2F2]/30 bg-[#0A1B2E]/70 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[#9DD2F2] backdrop-blur">
                    Vista protegida
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
                        'Tu equipo responde con informacion, no intuicion.',
                        'Tus clientes sienten orden, no improvisacion.',
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#9DD2F2]" strokeWidth={1.6} />
                          <p className="text-[15px] leading-7 text-white/74">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-7 right-4 hidden max-w-xs rounded-[8px] border border-[#9DD2F2]/25 bg-[#123A5A]/90 p-5 shadow-2xl backdrop-blur-md md:block">
              <p className="text-sm leading-6 text-white/76">
                Un lugar cuidado se nota antes de que ocurra algo: hay orden, hay respuesta y hay calma.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#123A5A] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">Beneficios directos</p>
            <h2 className="mt-4 text-balance text-3xl font-light text-white md:text-4xl">
              Seguridad que se siente en la vida diaria.
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
              El costo real no es la alarma. Es enterarte tarde.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/62">
              Una puerta abierta, una visita fuera de horario, una bodega expuesta o una camara que nadie reviso pueden terminar en perdida, conflicto o desorden.
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
            <p className="text-sm uppercase tracking-[0.25em] text-[#2B5C7E]">Aplicaciones</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-light text-[#0A1B2E] md:text-4xl">
              Cada lugar tiene sus riesgos. SegurIA los vuelve visibles.
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
            Si algo pasa, la diferencia es saberlo a tiempo.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/62">
            Cuentanos que quieres proteger y armamos una ruta simple para darte visibilidad, evidencia y respuesta.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/contacto" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Pedir llamada
            </Link>
            <Link href="/soluciones" className="btn-secondary inline-flex items-center gap-2 px-8 py-4 text-[15px]">
              Ver soluciones
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

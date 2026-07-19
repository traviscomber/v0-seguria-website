import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Lock, Camera, Radio, Wifi, Search, PenTool, Wrench, Activity, Users, AlertCircle, TrendingUp } from 'lucide-react'

const propertyCards = [
  {
    title: 'Hoteles y resorts',
    description: 'Huéspedes seguros. Staff controlado. Áreas comunes vigiladas. Operación clara, 24/7.',
  },
  {
    title: 'Hostales y alojamientos',
    description: 'Acceso por huésped. Alertas de movimiento extraño. Control de llaves. Tranquilidad a escala.',
  },
  {
    title: 'Restaurantes y bares',
    description: 'Caja monitoreada. Cocina vigilada. Entrada y salida registrada. Todo bajo control.',
  },
]

const capabilityCards = [
  {
    icon: Users,
    title: 'Controlas quién entra y sale',
    description: 'Acceso por habitación, llaves inteligentes, huéspedes identificados. Nadie entra donde no debe.',
  },
  {
    icon: Camera,
    title: 'Ves todo en vivo',
    description: 'Lobby, pasillos, cocina, bar, áreas comunes. HD 24/7. Si algo pasa, lo ves primero.',
  },
  {
    icon: AlertCircle,
    title: 'Alertas inteligentes',
    description: 'Movimiento anómalo, acceso no autorizado, aglomeración. Actúas antes del problema.',
  },
  {
    icon: Wifi,
    title: 'Integración total',
    description: 'Conecta con tu sistema de reservas, control de acceso, facturación. Todo en un dashboard.',
  },
]

const processCards = [
  {
    icon: Search,
    step: '01',
    title: 'Diagnosticamos tu operación',
    description: 'Visitamos. Entendemos flujos, puntos de riesgo, necesidades de control real.',
  },
  {
    icon: PenTool,
    step: '02',
    title: 'Diseñamos sin interrupciones',
    description: 'Sin afectar operación. Cámaras discretas. Sistemas que van con el flujo de huéspedes.',
  },
  {
    icon: Wrench,
    step: '03',
    title: 'Instalamos y entrenamos',
    description: 'Todo listo. Tu staff capacitado. Tu gerencia con dashboard completo.',
  },
  {
    icon: Activity,
    step: '04',
    title: 'Escala sin problema',
    description: 'Otro hotel. Otra sucursal. La plataforma crece. Tu control aumenta.',
  },
]

export const metadata = {
  title: 'Hotelería Inteligente | SegurIA',
  description: 'Seguridad y control para hoteles, hostales y restaurantes. Huéspedes seguros, operación transparente.',
}

export default function HoteleriaPage() {
  return (
    <>
      <Navigation />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative min-h-screen bg-gradient-to-b from-[#1a3a52] to-[#0A1B2E] flex items-center">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 right-10 w-72 h-72 bg-[#4DA3D9] rounded-full mix-blend-screen filter blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#2A5A7A] rounded-full mix-blend-screen filter blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">Hotelería Inteligente</p>
                <h1 className="text-5xl md:text-6xl font-light text-white leading-tight">
                  Tu hotel bajo control. Tus huéspedes seguros.
                </h1>
                <p className="text-lg text-white/70 leading-relaxed max-w-lg">
                  No es solo vigilancia. Es operación inteligente. Sabes qué pasa en cada rincón. Actúas cuando importa. Tus clientes nunca se enteran.
                </p>
                <div className="flex gap-4 pt-4">
                  <Link href="/contacto" className="btn-primary px-8 py-3">
                    Comenzar
                  </Link>
                  <Link href="/soluciones" className="px-8 py-3 border border-white/30 text-white hover:border-white/60 transition-colors rounded-lg">
                    Ver más
                  </Link>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="glass-card overflow-hidden p-0">
                  <div className="relative h-[430px]">
                    <img
                      src="/portal/huilo-huilo.jpg"
                      alt="Hotel Huilo Huilo rodeado de bosque nativo"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,27,46,0.05),rgba(10,27,46,0.82)),linear-gradient(90deg,rgba(10,27,46,0.34),transparent_65%)]" />
                    <div className="absolute left-6 top-6 rounded-full border border-[#9DD2F2]/30 bg-[#0A1B2E]/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#9DD2F2] backdrop-blur">
                      Hotel Huilo Huilo
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 grid gap-3 sm:grid-cols-3">
                      {['Huespedes tranquilos', 'Staff atento', 'Operacion clara'].map((item) => (
                        <div key={item} className="rounded-[8px] border border-white/10 bg-[#0A1B2E]/76 p-4 text-sm text-white/80 backdrop-blur-md">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Property Types */}
        <section className="py-24 bg-[#0A1B2E]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">Para cada tipo</p>
              <h2 className="text-3xl md:text-4xl font-light text-white text-balance mt-4">
                Hoteles, hostales, restaurantes
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {propertyCards.map((card) => (
                <div key={card.title} className="glass-card p-6 hover:bg-white/5 transition-colors">
                  <h3 className="text-xl font-light text-white mb-3">{card.title}</h3>
                  <p className="text-white/70 leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="py-24 bg-[#123A5A]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">Capacidades</p>
              <h2 className="text-3xl md:text-4xl font-light text-white text-balance mt-4">
                Lo que SegurIA trae a tu hotel
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {capabilityCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.title} className="glass-card p-8">
                    <div className="flex gap-4">
                      <Icon size={32} className="text-[#4DA3D9] flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-light text-white mb-2">{card.title}</h3>
                        <p className="text-white/70 leading-relaxed">{card.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Real Examples */}
        <section className="py-24 bg-[#0A1B2E]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2] mb-3">Caso 1</p>
                  <h3 className="text-2xl font-light text-white mb-3">Intento de entrada no autorizada</h3>
                  <p className="text-white/70 leading-relaxed">
                    Alguien intenta abrir puerta de habitación vacía a las 3 AM. SegurIA lo detecta de inmediato. Alerta silenciosa a seguridad. Antes de que pase algo. Problema resuelto.
                  </p>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2] mb-3">Caso 2</p>
                  <h3 className="text-2xl font-light text-white mb-3">Robo en caja o bodega</h3>
                  <p className="text-white/70 leading-relaxed">
                    Alguien abre la caja fuera de horario. Cámara inteligente identifica quién. Dashboard muestra acceso no autorizado. Gerencia lo sabe al instante. Responsable claro.
                  </p>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2] mb-3">Caso 3</p>
                  <h3 className="text-2xl font-light text-white mb-3">Control de acceso de staff</h3>
                  <p className="text-white/70 leading-relaxed">
                    Personal nuevo con llaves inteligentes. Geolocalización de tareas. Quién entró, cuándo, dónde. Operación transparente. Auditoria fácil. Responsabilidad clara.
                  </p>
                </div>
              </div>

              <div className="glass-card p-8 h-fit">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#4DA3D9]/20 flex items-center justify-center">
                      <TrendingUp size={24} className="text-[#4DA3D9]" />
                    </div>
                    <div>
                      <p className="text-[12px] uppercase text-[#9DD2F2] font-light">Beneficio clave</p>
                      <h4 className="text-white font-light">Cero sorpresas</h4>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Sabes exactamente qué está pasando en tu hotel. Control total sin paranoia. Transparencia operativa. Huéspedes seguros, staff responsable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-24 bg-[#123A5A]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.25em] text-[#9DD2F2]">Nuestro Proceso</p>
              <h2 className="text-3xl md:text-4xl font-light text-white text-balance mt-4">
                Paso a paso hacia el control
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.step} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-light text-[#4DA3D9]">{card.step}</span>
                      <Icon size={24} className="text-[#9DD2F2]" />
                    </div>
                    <h3 className="text-lg font-light text-white mb-2">{card.title}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{card.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-[#0A1B2E]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-light text-white text-balance mb-6">
              Controla tu hotel. Protege a tus huéspedes.
            </h2>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              SegurIA no es un sistema costoso. Es inteligencia aplicada a lo que ya tienes. Cámaras nuevas, viejas o integradas. Control total desde día uno.
            </p>
            <Link href="/contacto" className="btn-primary px-8 py-3">
              Hablemos
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

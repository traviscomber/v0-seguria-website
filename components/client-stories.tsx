import { CheckCircle2, Users, Shield } from 'lucide-react'

export function ClientStories() {
  const stories = [
    {
      company: 'Fundo Los Aromos',
      industry: 'Ganadería / 450 hectáreas',
      challenge: 'Vigilancia manual de perimetral de 8km + alertas constantes de animales salvajes',
      result: '40% reducción en tiempo de vigilancia',
      impact: 'Operación 24/7 con 2 personas menos dedicadas a patrullaje',
      quote: 'Ahora sabemos al instante si es un puma o un zorro. Antes perdíamos horas investigando falsas alarmas.'
    },
    {
      company: 'Hostal Mar Pacífico',
      industry: 'Hotelería / 32 habitaciones',
      challenge: 'Control de accesos, seguridad de huéspedes, staff accountability',
      result: '0 robos en 18 meses desde implementación',
      impact: 'Mejora en rating de seguridad (+ 0.8 estrellas en plataformas)',
      quote: 'Los huéspedes sienten que está seguro. Nosotros sabemos exactamente quién entra y cuándo.'
    },
    {
      company: 'Condominio La Paz',
      industry: 'Propiedades / 48 unidades',
      challenge: 'Accesos no autorizados, seguimiento de visitas, resolución de incidentes',
      result: '60% menos reportes sin resolver',
      impact: 'Junta directiva toma decisiones en 1 día vs 2 semanas antes',
      quote: 'Por primera vez tenemos evidencia clara. Esto terminó con las especulaciones en asambleas.'
    },
  ]

  return (
    <section className="py-24 bg-[#123A5A]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-[#9DD2F2] mb-3">Casos reales</p>
          <h2 className="text-4xl md:text-5xl font-light text-white text-balance">
            Lo que otros ya están logrando
          </h2>
          <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
            Historias de clientes SegurIA en Chile. Diferentes realidades, mismo resultado: control real.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div key={story.company} className="rounded-lg border border-[#4DA3D9]/20 bg-[#0F2F48]/50 p-8 backdrop-blur-sm hover:border-[#4DA3D9]/50 transition-colors">
              {/* Header */}
              <div className="mb-6">
                <h3 className="text-xl font-light text-white mb-1">{story.company}</h3>
                <p className="text-sm text-[#9DD2F2]">{story.industry}</p>
              </div>

              {/* Quote */}
              <blockquote className="mb-6 pl-4 border-l-2 border-[#4DA3D9]">
                <p className="text-white/80 italic text-sm leading-relaxed">"{story.quote}"</p>
              </blockquote>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase text-white/50 tracking-widest mb-1">Desafío inicial</p>
                  <p className="text-sm text-white/70">{story.challenge}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-[#9DD2F2] tracking-widest mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Resultado
                  </p>
                  <p className="text-sm text-white font-medium">{story.result}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-white/50 tracking-widest mb-1">Impacto real</p>
                  <p className="text-sm text-white/70">{story.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

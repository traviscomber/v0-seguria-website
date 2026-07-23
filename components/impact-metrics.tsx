import { TrendingUp, AlertCircle, Clock, BarChart3 } from 'lucide-react'

export function ImpactMetrics() {
  const metrics = [
    {
      icon: AlertCircle,
      stat: '85%',
      label: 'Reducción de falsas alarmas',
      description: 'Con IA que entiende lo normal vs lo que importa'
    },
    {
      icon: Clock,
      stat: '3s',
      label: 'Tiempo promedio de respuesta',
      description: 'vs 5+ minutos en vigilancia manual'
    },
    {
      icon: TrendingUp,
      stat: '40%',
      label: 'Mejora en efectividad operativa',
      description: 'Menos horas perdidas en falsas alarmas'
    },
    {
      icon: BarChart3,
      stat: '6 meses',
      label: 'ROI promedio',
      description: 'Clientes ven retorno en primera mitad del año'
    },
  ]

  return (
    <section className="py-24 bg-[#0A1B2E]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-[#9DD2F2] mb-3">Números que importan</p>
          <h2 className="text-4xl md:text-5xl font-light text-white text-balance">
            Impacto medible desde el primer día
          </h2>
          <p className="mt-4 text-white/60 text-lg max-w-2xl mx-auto">
            Estos son números reales de clientes SegurIA en operación. No promesas, solo resultados.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.stat} className="rounded-lg border border-white/10 bg-white/[0.05] p-6 backdrop-blur hover:border-[#4DA3D9]/50 transition-colors">
                <Icon className="h-8 w-8 text-[#4DA3D9] mb-4" strokeWidth={1.5} />
                <p className="text-3xl font-light text-white mb-1">{metric.stat}</p>
                <p className="text-white/80 font-medium text-sm mb-2">{metric.label}</p>
                <p className="text-white/50 text-xs leading-relaxed">{metric.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

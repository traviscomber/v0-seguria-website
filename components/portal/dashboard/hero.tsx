import Link from 'next/link'
import { Binoculars, Camera, MapPin, Milk, Siren, Sparkles, Trees, Wheat } from 'lucide-react'
import { PortalStatusBadge } from '@/components/portal/portal-ui'
import { Button } from '@/components/ui/button'
import { getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'
import type { ClientTheme } from '@/lib/client-theme'

interface DashboardHeroProps {
  userName: string
  attentionRequired: ClientDashboardView['attentionRequired']
  overallStatus: ClientDashboardView['overallStatus']
  theme: ClientTheme
  siteCount: number
  imageUrl?: string | null
}

export function DashboardHero({
  userName,
  attentionRequired,
  overallStatus,
  theme,
  siteCount,
  imageUrl,
}: DashboardHeroProps) {
  const isForest = theme.key === 'huilo-huilo'
  const isDairy = theme.key === 'santa-elena'
  const ThemeIcon = isForest ? Trees : isDairy ? Wheat : Sparkles
  const heroImage = imageUrl || theme.heroImage

  const title = isForest
    ? 'Control operativo de la reserva'
    : isDairy
      ? `Hola, ${userName}`
      : `Hola, ${userName}`

  const description = isForest
    ? 'Una lectura rápida del estado de hoteles, senderos, accesos y zonas sensibles.'
    : isDairy
      ? 'Supervisa predios, ganado, sala de ordeña, maquinaria y puntos críticos para mantener la continuidad de la operación.'
      : 'Revisa el estado de tu operación, sus alertas y los incidentes que requieren atención.'

  const highlights = isForest
    ? [
        { icon: Trees, label: 'Cobertura', value: `${siteCount} espacios` },
        { icon: Binoculars, label: 'Foco', value: 'Operación y visitantes' },
      ]
    : isDairy
      ? [
          { icon: Milk, label: 'Operación', value: 'Producción lechera' },
          { icon: Wheat, label: 'Prioridad', value: 'Ganado y continuidad' },
        ]
      : [
          { icon: Sparkles, label: 'Operación', value: 'Monitoreo inteligente' },
          { icon: MapPin, label: 'Cobertura', value: `${siteCount} ubicaciones` },
        ]

  return (
    <section className="group relative min-h-[410px] overflow-hidden rounded-[32px] border border-white/10 shadow-2xl shadow-black/25">
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-[1.025]"
        style={{ backgroundImage: `url('${heroImage}')` }}
      />
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/58 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15" />

      <div className="relative z-10 flex min-h-[410px] flex-col justify-between p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2 text-sm text-white/85 backdrop-blur-xl">
            <ThemeIcon className={`h-4 w-4 ${theme.accentTextClass}`} />
            {theme.name}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-xl">
            <PortalStatusBadge tone={getPortalTone(attentionRequired > 0 ? 'revision' : 'operativo')}>
              {overallStatus}
            </PortalStatusBadge>
            <span className="hidden text-xs text-white/45 sm:inline">Actualizado ahora</span>
          </div>
        </div>

        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <p className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] ${theme.accentTextClass}`}>
              <MapPin className="h-4 w-4" />
              {theme.location}
            </p>
            <h1 className="text-4xl font-light leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/68 sm:text-lg">
              {description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className={`${theme.accentButtonClass} ${theme.accentButtonTextClass}`}>
                <Link href="#propiedades"><Trees className="h-4 w-4" />Ver espacios</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-black/20 text-white backdrop-blur-xl hover:bg-white/15 hover:text-white">
                <Link href="#incidentes"><Siren className="h-4 w-4" />Revisar prioridades</Link>
              </Button>
              {isForest ? (
                <Button asChild variant="ghost" className="text-white/70 hover:bg-white/10 hover:text-white">
                  <Link href="#camaras"><Camera className="h-4 w-4" />Abrir vigilancia</Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
            {highlights.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-black/35">
                <Icon className={`h-5 w-5 ${theme.accentTextClass}`} />
                <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/40">{label}</p>
                <p className="mt-1 text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

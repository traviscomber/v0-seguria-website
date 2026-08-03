import Link from 'next/link'
import { ArrowRight, Camera, MapPin, Siren, Sparkles, Trees, Wheat } from 'lucide-react'
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
  priority?: {
    title: string
    location: string
    href: string
  } | null
}

export function DashboardHero({
  userName,
  attentionRequired,
  overallStatus,
  theme,
  siteCount,
  imageUrl,
  priority,
}: DashboardHeroProps) {
  const isForest = theme.key === 'huilo-huilo'
  const isDairy = theme.key === 'santa-elena'
  const ThemeIcon = isForest ? Trees : isDairy ? Wheat : Sparkles
  const heroImage = imageUrl || theme.heroImage
  const title = isForest ? 'Control operativo de la reserva' : `Hola, ${userName}`
  const description = isForest
    ? 'Estado general, zonas que requieren atención y evidencia disponible.'
    : isDairy
      ? 'Supervisa predios, ganado, maquinaria y puntos críticos.'
      : 'Revisa el estado general y actúa sobre lo pendiente.'

  return (
    <section className="group relative min-h-[330px] overflow-hidden rounded-[24px] border border-white/10 shadow-xl shadow-black/20" aria-labelledby="dashboard-title">
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-1000 motion-safe:group-hover:scale-[1.015]"
        style={{ backgroundImage: `url('${heroImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/62 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      <div className="relative z-10 flex min-h-[330px] flex-col justify-between p-6 sm:p-8 lg:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-white/80">
            <ThemeIcon className={`h-4 w-4 ${theme.accentTextClass}`} strokeWidth={1.8} aria-hidden="true" />
            {theme.name}
          </div>
          <div className="flex items-center gap-3">
            <PortalStatusBadge tone={getPortalTone(attentionRequired > 0 ? 'revision' : 'operativo')}>
              {overallStatus}
            </PortalStatusBadge>
            <span className="hidden text-xs text-white/55 sm:inline">Actualizado ahora</span>
          </div>
        </div>

        <div className="max-w-3xl">
          <p className={`mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] ${theme.accentTextClass}`}>
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {theme.location}
          </p>
          <h1 id="dashboard-title" className="max-w-2xl text-3xl font-medium leading-tight tracking-[-0.025em] text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">{description}</p>

          {priority ? (
            <Link
              href={priority.href}
              className="mt-5 flex max-w-2xl items-center justify-between gap-4 border-l-2 border-amber-300 bg-black/25 px-4 py-3 text-left transition hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">Acción prioritaria</span>
                <span className="mt-1 block truncate text-sm font-medium text-white">{priority.title}</span>
                <span className="mt-0.5 block truncate text-xs text-white/55">{priority.location}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
            </Link>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild className={`${theme.accentButtonClass} ${theme.accentButtonTextClass}`}>
              <Link href="#propiedades"><Trees className="h-4 w-4" aria-hidden="true" />Ver espacios</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/15 bg-black/15 text-white hover:bg-white/10 hover:text-white">
              <Link href="#incidentes"><Siren className="h-4 w-4" aria-hidden="true" />Prioridades</Link>
            </Button>
            {isForest ? (
              <Link href="#camaras" className="inline-flex h-10 items-center gap-2 px-2 text-sm font-medium text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
                <Camera className="h-4 w-4" aria-hidden="true" />Vigilancia
              </Link>
            ) : null}
          </div>
        </div>

        <div className="absolute bottom-7 right-8 hidden items-center gap-6 text-right lg:flex" aria-label={`${siteCount} espacios y ${attentionRequired} elementos por revisar`}>
          <div>
            <p className="text-2xl font-medium text-white">{siteCount}</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Espacios</p>
          </div>
          <div className="h-8 w-px bg-white/15" />
          <div>
            <p className="text-2xl font-medium text-white">{attentionRequired}</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Por revisar</p>
          </div>
        </div>
      </div>
    </section>
  )
}

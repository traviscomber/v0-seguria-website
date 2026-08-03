import { BellRing, Building2, Camera, Siren, Trees, Wheat } from 'lucide-react'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'
import type { ClientTheme } from '@/lib/client-theme'

type Props = Pick<ClientDashboardView, 'totals' | 'sites' | 'alerts' | 'incidents'> & {
  theme: ClientTheme
}

export function DashboardStats({ totals, sites, alerts, incidents, theme }: Props) {
  const SiteIcon = theme.key === 'huilo-huilo' ? Trees : theme.key === 'santa-elena' ? Wheat : Building2
  const siteLabel = theme.key === 'huilo-huilo' ? 'Espacios operativos' : theme.key === 'santa-elena' ? 'Predios' : 'Propiedades'
  const deviceLabel = theme.key === 'huilo-huilo' ? 'Puntos de vigilancia' : theme.key === 'santa-elena' ? 'Equipos conectados' : 'Dispositivos'

  const metrics = [
    { icon: SiteIcon, label: siteLabel, value: totals.sites || sites.length },
    { icon: Camera, label: deviceLabel, value: totals.devices || 0 },
    { icon: BellRing, label: 'Señales activas', value: alerts.length },
    { icon: Siren, label: 'Casos abiertos', value: incidents.length },
  ]

  return (
    <section
      aria-label="Estado general"
      className={`grid overflow-hidden rounded-[20px] border border-white/10 ${theme.cardClass} sm:grid-cols-2 xl:grid-cols-4`}
    >
      {metrics.map(({ icon: Icon, label, value }, index) => (
        <article
          key={label}
          className={`flex items-center justify-between gap-4 px-5 py-4 ${index > 0 ? 'border-t border-white/10 sm:border-l sm:border-t-0' : ''} ${index === 2 ? 'sm:border-l-0 sm:border-t xl:border-l xl:border-t-0' : ''}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Icon className={`h-4 w-4 shrink-0 ${theme.accentTextClass}`} strokeWidth={1.8} />
            <span className="truncate text-sm text-white/55">{label}</span>
          </div>
          <span className="text-2xl font-medium tracking-tight text-white">{value}</span>
        </article>
      ))}
    </section>
  )
}

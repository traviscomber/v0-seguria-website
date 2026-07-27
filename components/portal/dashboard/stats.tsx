import { BellRing, Building2, Camera, Siren, Trees, Wheat } from 'lucide-react'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'
import type { ClientTheme } from '@/lib/client-theme'

type Props = Pick<ClientDashboardView, 'totals' | 'sites' | 'alerts' | 'incidents'> & {
  theme: ClientTheme
}

export function DashboardStats({ totals, sites, alerts, incidents, theme }: Props) {
  const SiteIcon = theme.key === 'huilo-huilo' ? Trees : theme.key === 'santa-elena' ? Wheat : Building2
  const siteLabel = theme.key === 'huilo-huilo' ? 'Espacios protegidos' : theme.key === 'santa-elena' ? 'Predios' : 'Propiedades'
  const deviceLabel = theme.key === 'huilo-huilo' ? 'Puntos de vigilancia' : theme.key === 'santa-elena' ? 'Equipos conectados' : 'Dispositivos'

  const cards = [
    { icon: SiteIcon, label: siteLabel, value: totals.sites || sites.length, detail: `Cobertura de la ${theme.vocabulary.operation}` },
    { icon: Camera, label: deviceLabel, value: totals.devices || 0, detail: 'Monitoreo disponible' },
    { icon: BellRing, label: 'Alertas activas', value: alerts.length, detail: alerts.length > 0 ? 'Requieren revisión' : 'Sin alertas pendientes' },
    { icon: Siren, label: 'Incidentes abiertos', value: incidents.length, detail: incidents.length > 0 ? 'Actualmente en seguimiento' : 'Sin incidentes abiertos' },
  ]

  return (
    <section aria-label="Estado general" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ icon: Icon, label, value, detail }) => (
        <article key={label} className={`group rounded-[24px] border border-white/10 ${theme.cardClass} p-5 shadow-lg shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20`}>
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <Icon className={`h-5 w-5 ${theme.accentTextClass}`} strokeWidth={1.6} />
            </span>
            <span className="text-3xl font-light tracking-tight text-white">{value}</span>
          </div>
          <p className="mt-5 text-sm font-medium text-white/90">{label}</p>
          <p className="mt-1 text-xs leading-5 text-white/45">{detail}</p>
          <div className={`mt-4 h-px w-10 bg-current opacity-40 transition-all duration-300 group-hover:w-full ${theme.accentTextClass}`} />
        </article>
      ))}
    </section>
  )
}

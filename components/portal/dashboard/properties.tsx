import Link from 'next/link'
import { ArrowRight, Building2, Trees, Wheat } from 'lucide-react'
import {
  PortalEmptyState,
  PortalSectionHeading,
  PortalStatusBadge,
} from '@/components/portal/portal-ui'
import { getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'
import type { ClientTheme } from '@/lib/client-theme'

interface DashboardPropertiesProps {
  sites: ClientDashboardView['sites']
  theme: ClientTheme
}

function isOpenIncident(incident: NonNullable<ClientDashboardView['sites'][number]['incidents']>[number]) {
  const status = String(incident.status || '').toLowerCase()
  return status !== 'closed' && status !== 'resolved' && status !== 'resuelto'
}

export function DashboardProperties({ sites, theme }: DashboardPropertiesProps) {
  const PropertiesIcon = theme.key === 'huilo-huilo' ? Trees : theme.key === 'santa-elena' ? Wheat : Building2
  const title = theme.key === 'huilo-huilo' ? 'Estado por espacio protegido' : theme.key === 'santa-elena' ? 'Estado por predio' : 'Estado por ubicación'
  const description = theme.key === 'huilo-huilo'
    ? 'Revisa hoteles, senderos y zonas críticas de la reserva.'
    : theme.key === 'santa-elena'
      ? 'Entra a cada predio para revisar ganado, equipos, cámaras e incidentes.'
      : 'Entra a una propiedad para revisar sus cámaras, equipos e incidentes.'

  return (
    <div className="space-y-4">
      <PortalSectionHeading
        eyebrow={`Mis ${theme.vocabulary.properties}`}
        title={title}
        description={description}
      />
      {sites.length === 0 ? (
        <PortalEmptyState
          title={`Todavía no hay ${theme.vocabulary.properties} disponibles`}
          detail={`Cuando tu cuenta sea asociada a un espacio de la ${theme.vocabulary.operation}, aparecerá aquí.`}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sites.map((site) => {
            const openSiteIncidents = (site.incidents || []).filter(isOpenIncident)
            const status = site.statusLabel || (openSiteIncidents.length > 0 ? 'Atención requerida' : 'Operativo')
            const siteLabel = site.label || site.name || theme.vocabulary.properties

            return (
              <Link
                key={site.propertyId}
                href={`/app/properties/${site.propertyId}`}
                className={`group overflow-hidden rounded-[24px] border border-white/10 ${theme.cardClass} shadow-lg shadow-black/10 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20`}
              >
                <div className="relative h-48 overflow-hidden bg-black/20">
                  {site.imageUrl ? (
                    <img src={site.imageUrl} alt={site.imageAlt || siteLabel} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/25">
                      <PropertiesIcon className="h-12 w-12" strokeWidth={1.3} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  <PortalStatusBadge className="absolute left-4 top-4" tone={getPortalTone(site.status || status)}>
                    {status}
                  </PortalStatusBadge>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-xs uppercase tracking-[0.16em] ${theme.accentTextClass}`}>
                        {site.organizationName || theme.name}
                      </p>
                      <h3 className="mt-1 text-xl font-light text-white">{siteLabel}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">
                        {site.profile?.summary || `Resumen de seguridad y actividad para este espacio de la ${theme.vocabulary.operation}.`}
                      </p>
                    </div>
                    <ArrowRight className={`mt-1 h-5 w-5 transition group-hover:translate-x-1 ${theme.accentTextClass}`} />
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <DashboardMetric label="Cámaras" value={site.cameraCount || 0} />
                    <DashboardMetric label="Sensores" value={site.sensorCount || 0} />
                    <DashboardMetric label="Incidentes" value={openSiteIncidents.length} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DashboardMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-lg text-white">{value}</p>
    </div>
  )
}

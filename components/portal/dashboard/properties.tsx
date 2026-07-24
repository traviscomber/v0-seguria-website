import Link from 'next/link'
import { ArrowRight, Building2 } from 'lucide-react'
import {
  PortalEmptyState,
  PortalSectionHeading,
  PortalStatusBadge,
} from '@/components/portal/portal-ui'
import { isOpenPortalIncident } from '@/lib/client-portal'
import { getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'

interface DashboardPropertiesProps {
  sites: ClientDashboardView['sites']
}

export function DashboardProperties({ sites }: DashboardPropertiesProps) {
  return (
    <section id="propiedades" className="space-y-4">
      <PortalSectionHeading
        eyebrow="Mis propiedades"
        title="Estado por ubicación"
        description="Entra a una propiedad para revisar sus cámaras, equipos e incidentes."
      />
      {sites.length === 0 ? (
        <PortalEmptyState
          title="Todavía no hay propiedades disponibles"
          detail="Cuando tu cuenta sea asociada a una propiedad aparecerá aquí."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sites.map((site) => {
            const openSiteIncidents = (site.incidents || []).filter(isOpenPortalIncident)
            const status = site.statusLabel || (openSiteIncidents.length > 0 ? 'Atención requerida' : 'Operativo')
            const siteLabel = site.label || site.name || 'Propiedad'

            return (
              <Link
                key={site.propertyId}
                href={`/app/properties/${site.propertyId}`}
                className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] transition hover:-translate-y-0.5 hover:border-[#4DA3D9]/35 hover:bg-white/[0.06]"
              >
                <div className="relative h-44 overflow-hidden bg-[#071524]">
                  {site.imageUrl ? (
                    <img
                      src={site.imageUrl}
                      alt={site.imageAlt || siteLabel}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/25">
                      <Building2 className="h-12 w-12" strokeWidth={1.3} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071524] via-[#071524]/30 to-transparent" />
                  <PortalStatusBadge className="absolute left-4 top-4" tone={getPortalTone(site.status || status)}>
                    {status}
                  </PortalStatusBadge>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                        {site.organizationName || 'Mi empresa'}
                      </p>
                      <h3 className="mt-1 text-xl font-light text-white">{siteLabel}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">
                        {site.profile?.summary || 'Resumen de seguridad y actividad de la propiedad.'}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 text-[#9DD2F2] transition group-hover:translate-x-1" />
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
    </section>
  )
}

function DashboardMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#0B1D30] p-3">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-lg text-white">{value}</p>
    </div>
  )
}

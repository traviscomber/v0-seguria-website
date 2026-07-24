import { MapPin } from 'lucide-react'
import { PortalStatusBadge } from '@/components/portal/portal-ui'
import { formatPortalDate, getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientPropertyView } from '@/lib/client-portal/property-view'

interface PropertyHeaderProps {
  model: ClientPropertyView
}

export function PropertyHeader({ model }: PropertyHeaderProps) {
  const { site, overallStatus } = model

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(77,163,217,0.22),transparent_36%),rgba(255,255,255,0.045)]">
      {site.imageUrl ? (
        <div className="relative h-52 overflow-hidden border-b border-white/10 sm:h-64">
          <img
            src={site.imageUrl}
            alt={site.imageAlt || site.label}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081624] via-[#081624]/35 to-transparent" />
        </div>
      ) : null}

      <div className="p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <PortalStatusBadge tone={getPortalTone(site.status || overallStatus)}>
                {site.statusLabel || overallStatus}
              </PortalStatusBadge>
              <span className="inline-flex items-center gap-1 text-xs text-white/45">
                <MapPin className="h-3.5 w-3.5" />
                {site.address || site.location || site.organizationName || 'Propiedad del cliente'}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-light tracking-tight text-white sm:text-4xl">
              {site.label || site.name || 'Propiedad'}
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-7 text-white/60">
              {site.profile?.summary || 'Estado de seguridad, dispositivos, incidentes y actividad de esta propiedad.'}
            </p>
          </div>

          <p className="text-sm text-white/45">
            Última actualización: {formatPortalDate(site.lastUpdatedAt)}
          </p>
        </div>
      </div>
    </section>
  )
}

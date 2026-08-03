import Link from 'next/link'
import { ArrowUpRight, BellRing, CircleAlert, MapPin, Siren } from 'lucide-react'
import { PortalEmptyState, PortalSectionHeading, PortalStatusBadge } from '@/components/portal/portal-ui'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'
import { formatPortalDate, getPortalDeviceLabel, getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientTheme } from '@/lib/client-theme'

type DashboardAttentionProps = Pick<ClientDashboardView, 'incidents' | 'alerts'> & {
  theme: ClientTheme
}

export function DashboardAttention({ incidents, alerts, theme }: DashboardAttentionProps) {
  const isHuiloHuilo = theme.key === 'huilo-huilo'
  const total = incidents.length + alerts.length

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PortalSectionHeading
          eyebrow="Prioridades"
          title={isHuiloHuilo ? 'Qué requiere acción' : 'En seguimiento'}
          description={isHuiloHuilo ? 'Ordenado para decidir qué revisar primero.' : `Incidentes y alertas activas de la ${theme.vocabulary.operation}.`}
        />
        <div className="flex items-center gap-3 text-sm text-white/45">
          <span className={`text-2xl font-semibold tracking-tight ${total > 0 ? 'text-white' : theme.accentTextClass}`}>{total}</span>
          <span>{total === 1 ? 'pendiente' : 'pendientes'}</span>
        </div>
      </div>

      {total === 0 ? (
        <PortalEmptyState title="Sin pendientes" detail="No hay casos ni señales técnicas que requieran acción." />
      ) : (
        <div className={`overflow-hidden rounded-[22px] border border-white/10 ${theme.cardClass} backdrop-blur-xl`}>
          <div className="grid grid-cols-[1fr_auto] border-b border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-white/35 sm:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)_120px_auto] sm:px-5">
            <span>Situación</span>
            <span className="hidden sm:block">Ubicación</span>
            <span className="hidden sm:block">Registro</span>
            <span>Estado</span>
          </div>

          <div className="divide-y divide-white/10">
            {incidents.map(({ site, incident }, index) => (
              <Link
                key={`${site.propertyId}-${incident.id || index}`}
                href={`/app/properties/${site.propertyId}`}
                className="group grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition hover:bg-white/[0.045] sm:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)_120px_auto] sm:px-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-400/10 text-rose-200">
                    <CircleAlert className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{incident.title || incident.type || 'Incidente operativo'}</p>
                    <p className="mt-1 text-xs text-white/35">Caso operativo</p>
                  </div>
                </div>
                <p className="hidden truncate text-sm text-white/55 sm:flex sm:items-center sm:gap-2">
                  <MapPin className={`h-3.5 w-3.5 shrink-0 ${theme.accentTextClass}`} />
                  {site.label || site.location || theme.vocabulary.properties}
                </p>
                <p className="hidden text-xs text-white/40 sm:block">{formatPortalDate(incident.createdAt)}</p>
                <div className="flex items-center justify-end gap-2">
                  <PortalStatusBadge tone={getPortalTone(incident.status)}>
                    {incident.statusLabel || incident.status || 'Abierto'}
                  </PortalStatusBadge>
                  <ArrowUpRight className="h-4 w-4 text-white/20 transition group-hover:text-white/60" />
                </div>
              </Link>
            ))}

            {alerts.slice(0, 6).map(({ site, device }, index) => (
              <Link
                key={device.id || index}
                href={`/app/properties/${site.propertyId}`}
                className="group grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition hover:bg-white/[0.045] sm:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)_120px_auto] sm:px-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-300/10 text-amber-200">
                    <BellRing className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{getPortalDeviceLabel(device) || 'Equipo con alerta'}</p>
                    <p className="mt-1 text-xs text-white/35">Señal técnica</p>
                  </div>
                </div>
                <p className="hidden truncate text-sm text-white/55 sm:flex sm:items-center sm:gap-2">
                  <MapPin className={`h-3.5 w-3.5 shrink-0 ${theme.accentTextClass}`} />
                  {site.label || site.location || device.location || device.ubicacion || 'Ver ficha'}
                </p>
                <p className="hidden text-xs text-white/40 sm:block">Ahora</p>
                <div className="flex items-center justify-end gap-2">
                  <PortalStatusBadge tone={getPortalTone(device.status || device.estado)}>
                    {device.statusLabel || device.status || device.estado || 'Revisar'}
                  </PortalStatusBadge>
                  <ArrowUpRight className="h-4 w-4 text-white/20 transition group-hover:text-white/60" />
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 px-5 py-3 text-xs text-white/35">
            <Siren className={`h-3.5 w-3.5 ${theme.accentTextClass}`} />
            Selecciona una fila para abrir la ficha del espacio.
          </div>
        </div>
      )}
    </div>
  )
}

import Link from 'next/link'
import { ArrowUpRight, BellRing, CircleAlert, Headphones, MapPin, Siren } from 'lucide-react'
import { PortalEmptyState, PortalSectionHeading, PortalStatusBadge } from '@/components/portal/portal-ui'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'
import { formatPortalDate, getPortalDeviceLabel, getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientTheme } from '@/lib/client-theme'

type DashboardAttentionProps = Pick<ClientDashboardView, 'incidents' | 'alerts'> & {
  theme: ClientTheme
}

function supportHref(params: Record<string, string | null | undefined>) {
  const query = new URLSearchParams({ from: 'prioridades', topic: 'alertas', returnTo: '/app#incidentes' })
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value)
  })
  return `/contacto/huilo-huilo?${query.toString()}`
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
            {incidents.map(({ site, incident }, index) => {
              const title = incident.title || incident.type || 'Incidente operativo'
              const location = site.label || site.location || theme.vocabulary.properties
              return (
                <div key={`${site.propertyId}-${incident.id || index}`} className="group grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition hover:bg-white/[0.045] sm:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)_120px_auto] sm:px-5">
                  <Link href={`/app/properties/${site.propertyId}`} className="flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-400/10 text-rose-200"><CircleAlert className="h-4 w-4" /></span>
                    <span className="min-w-0"><span className="block truncate text-sm font-medium text-white">{title}</span><span className="mt-1 block text-xs text-white/35">Caso operativo</span></span>
                  </Link>
                  <p className="hidden truncate text-sm text-white/55 sm:flex sm:items-center sm:gap-2"><MapPin className={`h-3.5 w-3.5 shrink-0 ${theme.accentTextClass}`} />{location}</p>
                  <p className="hidden text-xs text-white/40 sm:block">{formatPortalDate(incident.createdAt)}</p>
                  <div className="flex items-center justify-end gap-2">
                    <PortalStatusBadge tone={getPortalTone(incident.status)}>{incident.statusLabel || incident.status || 'Abierto'}</PortalStatusBadge>
                    {isHuiloHuilo ? (
                      <Link href={supportHref({ kind: 'incident', propertyId: site.propertyId, itemId: incident.id ? String(incident.id) : undefined, item: title, property: location })} aria-label={`Reportar problema relacionado con ${title}`} className="flex h-8 w-8 items-center justify-center rounded-full text-white/35 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"><Headphones className="h-4 w-4" /></Link>
                    ) : <ArrowUpRight className="h-4 w-4 text-white/20 transition group-hover:text-white/60" />}
                  </div>
                </div>
              )
            })}

            {alerts.slice(0, 6).map(({ site, device }, index) => {
              const title = getPortalDeviceLabel(device) || 'Equipo con alerta'
              const location = site.label || site.location || device.location || device.ubicacion || 'Ver ficha'
              return (
                <div key={device.id || index} className="group grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition hover:bg-white/[0.045] sm:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)_120px_auto] sm:px-5">
                  <Link href={`/app/properties/${site.propertyId}`} className="flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-300/10 text-amber-200"><BellRing className="h-4 w-4" /></span>
                    <span className="min-w-0"><span className="block truncate text-sm font-medium text-white">{title}</span><span className="mt-1 block text-xs text-white/35">Señal técnica</span></span>
                  </Link>
                  <p className="hidden truncate text-sm text-white/55 sm:flex sm:items-center sm:gap-2"><MapPin className={`h-3.5 w-3.5 shrink-0 ${theme.accentTextClass}`} />{location}</p>
                  <p className="hidden text-xs text-white/40 sm:block">Ahora</p>
                  <div className="flex items-center justify-end gap-2">
                    <PortalStatusBadge tone={getPortalTone(device.status || device.estado)}>{device.statusLabel || device.status || device.estado || 'Revisar'}</PortalStatusBadge>
                    {isHuiloHuilo ? (
                      <Link href={supportHref({ kind: 'alert', propertyId: site.propertyId, itemId: device.id ? String(device.id) : undefined, item: title, property: location })} aria-label={`Reportar problema relacionado con ${title}`} className="flex h-8 w-8 items-center justify-center rounded-full text-white/35 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"><Headphones className="h-4 w-4" /></Link>
                    ) : <ArrowUpRight className="h-4 w-4 text-white/20 transition group-hover:text-white/60" />}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 px-5 py-3 text-xs text-white/35"><Siren className={`h-3.5 w-3.5 ${theme.accentTextClass}`} />Selecciona el nombre para abrir la ficha o usa soporte para reportar ese elemento.</div>
        </div>
      )}
    </div>
  )
}

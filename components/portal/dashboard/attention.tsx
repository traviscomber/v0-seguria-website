import Link from 'next/link'
import { BellRing, CircleAlert, Siren } from 'lucide-react'
import {
  PortalEmptyState,
  PortalSectionHeading,
  PortalStatusBadge,
} from '@/components/portal/portal-ui'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'
import {
  formatPortalDate,
  getPortalDeviceLabel,
  getPortalTone,
} from '@/lib/client-portal/presentation'

type DashboardAttentionProps = Pick<ClientDashboardView, 'incidents' | 'alerts'>

export function DashboardAttention({ incidents, alerts }: DashboardAttentionProps) {
  return (
    <section id="incidentes" className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <PortalSectionHeading eyebrow="Incidentes" title="En seguimiento" />
          <Siren className="h-5 w-5 text-rose-200" strokeWidth={1.6} />
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <PortalEmptyState title="Sin incidentes abiertos" detail="No hay situaciones pendientes en este momento." />
          ) : (
            <div className="space-y-3">
              {incidents.map(({ site, incident }, index) => (
                <Link
                  key={`${site.propertyId}-${incident.id || index}`}
                  href={`/app/properties/${site.propertyId}`}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B1D30] p-4 transition hover:border-[#4DA3D9]/35"
                >
                  <div className="flex min-w-0 gap-3">
                    <span className="mt-0.5 rounded-xl bg-rose-400/10 p-2 text-rose-200">
                      <CircleAlert className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {incident.title || incident.type || 'Incidente'}
                      </p>
                      <p className="mt-1 truncate text-xs text-white/45">
                        {site.label || site.name || 'Propiedad'} · {formatPortalDate(incident.createdAt)}
                      </p>
                    </div>
                  </div>
                  <PortalStatusBadge tone={getPortalTone(incident.status)}>
                    {incident.statusLabel || incident.status || 'Abierto'}
                  </PortalStatusBadge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <PortalSectionHeading eyebrow="Alertas" title="Revisión necesaria" />
          <BellRing className="h-5 w-5 text-amber-200" strokeWidth={1.6} />
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <PortalEmptyState title="Sin alertas activas" detail="Los equipos no reportan problemas pendientes." />
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 6).map(({ site, device }, index) => (
                <div key={device.id || index} className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {getPortalDeviceLabel(device) || 'Equipo con alerta'}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {site.label || site.name || device.location || device.ubicacion || 'Ubicación disponible en la propiedad'}
                      </p>
                    </div>
                    <PortalStatusBadge tone={getPortalTone(device.status || device.estado)}>
                      {device.statusLabel || device.status || device.estado || 'Revisar'}
                    </PortalStatusBadge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

import Link from 'next/link'
import { BellRing, CircleAlert, Siren, Trees, Wheat } from 'lucide-react'
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
import type { ClientTheme } from '@/lib/client-theme'

type DashboardAttentionProps = Pick<ClientDashboardView, 'incidents' | 'alerts'> & {
  theme: ClientTheme
}

export function DashboardAttention({ incidents, alerts, theme }: DashboardAttentionProps) {
  const ContextIcon = theme.key === 'huilo-huilo' ? Trees : theme.key === 'santa-elena' ? Wheat : Siren
  const incidentTitle = theme.key === 'huilo-huilo'
    ? 'Situaciones en seguimiento'
    : theme.key === 'santa-elena'
      ? 'Eventos operacionales'
      : 'En seguimiento'
  const alertTitle = theme.key === 'huilo-huilo'
    ? 'Señales del territorio'
    : theme.key === 'santa-elena'
      ? 'Equipos que requieren revisión'
      : 'Revisión necesaria'

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className={`border-white/10 ${theme.cardClass} shadow-lg shadow-black/10 backdrop-blur-xl`}>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <PortalSectionHeading
            eyebrow={`Prioridades de ${theme.vocabulary.operation}`}
            title={incidentTitle}
            description={`Incidentes abiertos en tus ${theme.vocabulary.properties}.`}
          />
          <ContextIcon className={`h-5 w-5 ${theme.accentTextClass}`} strokeWidth={1.6} />
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <PortalEmptyState
              title="Sin incidentes abiertos"
              detail={`No hay situaciones pendientes en la ${theme.vocabulary.operation} en este momento.`}
            />
          ) : (
            <div className="space-y-3">
              {incidents.map(({ site, incident }, index) => (
                <Link
                  key={`${site.propertyId}-${incident.id || index}`}
                  href={`/app/properties/${site.propertyId}`}
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
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
                        {site.label || site.location || theme.vocabulary.properties} · {formatPortalDate(incident.createdAt)}
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

      <Card className={`border-white/10 ${theme.cardClass} shadow-lg shadow-black/10 backdrop-blur-xl`}>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <PortalSectionHeading
            eyebrow="Alertas"
            title={alertTitle}
            description={`Equipos y señales que necesitan atención en tus ${theme.vocabulary.properties}.`}
          />
          <BellRing className={`h-5 w-5 ${theme.accentTextClass}`} strokeWidth={1.6} />
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <PortalEmptyState
              title="Sin alertas activas"
              detail={`Los equipos de la ${theme.vocabulary.operation} no reportan problemas pendientes.`}
            />
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 6).map(({ site, device }, index) => (
                <Link
                  key={device.id || index}
                  href={`/app/properties/${site.propertyId}`}
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {getPortalDeviceLabel(device) || 'Equipo con alerta'}
                      </p>
                      <p className="mt-1 truncate text-xs text-white/45">
                        {site.label || site.location || device.location || device.ubicacion || `Ubicación disponible en ${theme.vocabulary.properties}`}
                      </p>
                    </div>
                    <PortalStatusBadge tone={getPortalTone(device.status || device.estado)}>
                      {device.statusLabel || device.status || device.estado || 'Revisar'}
                    </PortalStatusBadge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

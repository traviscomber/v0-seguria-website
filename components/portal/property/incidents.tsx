import { CircleAlert, Siren } from 'lucide-react'
import {
  PortalEmptyState,
  PortalSectionHeading,
  PortalStatusBadge,
} from '@/components/portal/portal-ui'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatPortalDate, getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientPropertyView } from '@/lib/client-portal/property-view'

interface PropertyIncidentsProps {
  model: ClientPropertyView
}

export function PropertyIncidents({ model }: PropertyIncidentsProps) {
  return (
    <section id="incidentes" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <PortalSectionHeading eyebrow="Incidentes" title="Situaciones en seguimiento" />
          <Siren className="h-5 w-5 text-rose-200" strokeWidth={1.6} />
        </CardHeader>
        <CardContent>
          {model.incidents.length === 0 ? (
            <PortalEmptyState
              title="Sin incidentes abiertos"
              detail="No existen situaciones pendientes en esta propiedad."
            />
          ) : (
            <div className="space-y-3">
              {model.incidents.map((incident, index) => (
                <div
                  key={incident.id || index}
                  className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <span className="mt-0.5 rounded-xl bg-rose-400/10 p-2 text-rose-200">
                        <CircleAlert className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">
                          {incident.title || incident.type || 'Incidente'}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {incident.description || formatPortalDate(incident.createdAt)}
                        </p>
                      </div>
                    </div>
                    <PortalStatusBadge tone={getPortalTone(incident.status)}>
                      {incident.statusLabel || incident.status || 'Abierto'}
                    </PortalStatusBadge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader>
          <PortalSectionHeading eyebrow="Estado" title="Lectura rápida" />
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/35">Estado general</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-lg font-light text-white">{model.overallStatus}</p>
              <PortalStatusBadge tone={getPortalTone(model.overallStatus)}>
                {model.overallStatus}
              </PortalStatusBadge>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

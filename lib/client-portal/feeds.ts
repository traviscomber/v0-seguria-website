import type { PortalSiteSummary } from '@/lib/client-portal/types'

export function getPortalActivityFeed(sites: PortalSiteSummary[]) {
  const eventActivity = sites.flatMap((site) =>
    site.events.map((event) => ({
      id: event.id,
      title: event.title,
      detail: site.label,
      kind: 'event' as const,
      status: event.severity,
      at: event.occurredAt,
    }))
  )

  const deviceActivity = sites.flatMap((site) =>
    site.devices.map((device) => ({
      id: `${site.propertyId}-device-${device.id}`,
      title: device.displayName || 'Dispositivo',
      detail: device.ubicacionDescripcion || 'Equipo del sitio',
      kind: 'device' as const,
      status: device.estado,
      at: device.lastSeenAt || device.fechaActualizacion,
    }))
  )

  const documentActivity = sites.flatMap((site) =>
    site.documents.map((document) => ({
      id: `${site.propertyId}-document-${document.id}`,
      title: document.titulo,
      detail: site.label,
      kind: 'document' as const,
      status: document.estado,
      at: document.fechaActualizacion,
    }))
  )

  return [...eventActivity, ...deviceActivity, ...documentActivity]
    .sort((left, right) => right.at.getTime() - left.at.getTime())
    .slice(0, 8)
}

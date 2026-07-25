import type { PortalSiteSummary, PortalTraceabilityItem } from '@/lib/client-portal/types'
import { isOpenPortalIncident } from '@/lib/client-portal/devices'
import { getPortalActionRegister } from '@/lib/client-portal/actions'

export function getPortalTraceabilityLedger(sites: PortalSiteSummary[]): PortalTraceabilityItem[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-traceability', siteLabel: 'Sin sitio', title: 'Primera evidencia pendiente',
      source: 'Operacion inicial', evidence: 'Aun no hay eventos, documentos o incidentes publicados.',
      decisionLink: 'Activar sitio e inventario para iniciar trazabilidad.', status: 'Pendiente',
      occurredAt: new Date(), tone: 'warning', rank: 90,
    }]
  }

  const ledger = sites.flatMap((site) => {
    const primaryAction = getPortalActionRegister([site])[0]
    const open = site.incidents.filter(isOpenPortalIncident)
    const incidentItems: PortalTraceabilityItem[] = site.incidents.flatMap((incident) => {
      if (incident.evidence.length === 0) {
        return [{
          id: `${site.propertyId}-incident-${incident.id}-no-evidence`, siteLabel: site.label,
          title: incident.title, source: incident.relatedEvents[0]?.title || 'Incidente operativo',
          evidence: 'Sin respaldo visual publicado para el cliente.',
          decisionLink: primaryAction?.title || 'Completar evidencia antes del cierre.',
          status: incident.statusLabel, occurredAt: incident.updatedAt,
          tone: incident.severity === 'critical' ? 'critical' as const : 'warning' as const,
          rank: incident.severity === 'critical' ? 98 : 78,
        }]
      }

      return incident.evidence.slice(0, 3).map((evidence) => ({
        id: `${site.propertyId}-evidence-${evidence.id}`, siteLabel: site.label,
        title: incident.title, source: incident.relatedEvents[0]?.title || 'Incidente operativo',
        evidence: evidence.title,
        decisionLink: evidence.pinned ? 'Evidencia fijada para explicar la decision.' : 'Evidencia asociada al contexto del incidente.',
        status: incident.statusLabel, occurredAt: evidence.capturedAt,
        tone: incident.severity === 'critical' ? 'critical' as const : 'warning' as const,
        rank: evidence.pinned ? 88 : 72,
      }))
    })

    const eventItems: PortalTraceabilityItem[] = site.events
      .filter((event) => event.severity !== 'info')
      .slice(0, 4)
      .map((event) => ({
        id: `${site.propertyId}-event-${event.id}`, siteLabel: site.label,
        title: event.title, source: 'Senal relevante',
        evidence: event.state ? `Estado registrado: ${event.state}.` : 'Evento con severidad y horario publicado.',
        decisionLink: primaryAction?.nextStep || site.profile.recommendedAttentionAction,
        status: event.severity === 'critical' ? 'Critico' : 'Atencion',
        occurredAt: event.occurredAt,
        tone: event.severity === 'critical' ? 'critical' as const : 'warning' as const,
        rank: event.severity === 'critical' ? 82 : 62,
      }))

    const documentItems: PortalTraceabilityItem[] = site.documents.slice(0, 3).map((document) => ({
      id: `${site.propertyId}-document-${document.id}`, siteLabel: site.label,
      title: document.titulo, source: 'Documento operativo',
      evidence: document.archivoNombre || document.autor || 'Documento publicado para respaldo.',
      decisionLink: 'Disponible para revisar o explicar una decision.',
      status: document.estado, occurredAt: document.fechaActualizacion,
      tone: 'ok', rank: open.length > 0 ? 48 : 22,
    }))

    if (incidentItems.length + eventItems.length + documentItems.length === 0) {
      return [{
        id: `${site.propertyId}-stable-traceability`, siteLabel: site.label,
        title: 'Operacion sin excepciones abiertas', source: 'Lectura actual',
        evidence: 'Sin eventos relevantes, incidentes o documentos nuevos en esta lectura.',
        decisionLink: 'Mantener rutina de control y conservar historial disponible.',
        status: 'Al dia', occurredAt: site.lastUpdatedAt || new Date(), tone: 'ok' as const, rank: 10,
      }]
    }

    return [...incidentItems, ...eventItems, ...documentItems]
  })

  return ledger
    .sort((left, right) => right.rank - left.rank || right.occurredAt.getTime() - left.occurredAt.getTime())
    .slice(0, 10)
}

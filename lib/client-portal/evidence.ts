import type { PortalEvidenceGalleryItem, PortalSiteSummary } from '@/lib/client-portal/types'
import { getPortalActionRegister } from '@/lib/client-portal/actions'
import { getPortalTraceabilityLedger } from '@/lib/client-portal/traceability'

export function getPortalEvidenceGallery(site: PortalSiteSummary): PortalEvidenceGalleryItem[] {
  const traceability = getPortalTraceabilityLedger([site])
  const primaryAction = getPortalActionRegister([site])[0]
  const incidentItems = site.incidents.flatMap((incident) => {
    const hasEvidence = incident.evidence.length > 0
    const tone: PortalEvidenceGalleryItem['tone'] = incident.severity === 'critical'
      ? 'critical'
      : hasEvidence ? 'warning' : 'critical'

    if (!hasEvidence) {
      return [{
        id: `${incident.id}-missing-evidence`, label: 'Incidente', title: incident.title,
        detail: incident.description || 'Incidente en seguimiento sin respaldo publicado.',
        proof: 'Evidencia pendiente de adjuntar.', status: incident.statusLabel,
        action: 'Adjuntar captura, senal relacionada o causa documentada antes del cierre.',
        at: incident.updatedAt, tone,
        rank: incident.severity === 'critical' ? 100 : 84,
      }]
    }

    return incident.evidence.slice(0, 2).map((evidence) => ({
      id: `${incident.id}-${evidence.id}`,
      label: evidence.pinned ? 'Evidencia clave' : 'Evidencia',
      title: evidence.title, detail: incident.title,
      proof: evidence.note || evidence.fileName, status: incident.statusLabel,
      action: incident.status === 'resolved'
        ? 'Mantener como respaldo de cierre.'
        : 'Usar esta prueba para confirmar causa, responsable y cierre.',
      at: evidence.capturedAt, tone,
      rank: (evidence.pinned ? 12 : 0) + (incident.severity === 'critical' ? 94 : 72),
    }))
  })

  const documentItems = site.documents.slice(0, 4).map((document) => ({
    id: `${site.propertyId}-document-gallery-${document.id}`, label: 'Documento',
    title: document.titulo,
    detail: document.resumenIA || document.archivoNombre || 'Documento disponible para respaldo del sitio.',
    proof: document.archivoNombre || document.autor,
    status: document.estado === 'aprobado' ? 'Aprobado' : document.estado === 'revision' ? 'En revision' : document.estado,
    action: document.estado === 'aprobado'
      ? 'Disponible para respaldar decisiones del sitio.'
      : 'Revisar antes de usar como respaldo formal.',
    at: document.fechaActualizacion,
    tone: document.estado === 'aprobado' ? 'ok' as const : 'warning' as const,
    rank: document.estado === 'aprobado' ? 42 : 58,
  }))

  const traceabilityItems = traceability.slice(0, 4).map((item) => ({
    id: `${item.id}-gallery`, label: 'Trazabilidad', title: item.title,
    detail: item.decisionLink, proof: item.evidence, status: item.status,
    action: 'Mantener esta historia disponible para explicar decisiones.',
    at: item.occurredAt, tone: item.tone, rank: item.rank - 12,
  }))

  const eventItems = site.events.slice(0, 4).map((event) => {
    const tone: PortalEvidenceGalleryItem['tone'] = event.severity === 'critical'
      ? 'critical'
      : event.severity === 'warning' ? 'warning' : 'ok'
    return {
      id: `${event.id}-gallery`, label: 'Senal', title: event.title,
      detail: event.type, proof: event.state || 'Actividad registrada por el sitio.',
      status: event.severity === 'critical' ? 'Critica' : event.severity === 'warning' ? 'Atencion' : 'Informativa',
      action: event.severity === 'info'
        ? 'Conservar como contexto operativo.'
        : primaryAction?.nextStep || site.profile.recommendedAttentionAction,
      at: event.occurredAt, tone,
      rank: event.severity === 'critical' ? 86 : event.severity === 'warning' ? 64 : 28,
    }
  })

  const gallery: PortalEvidenceGalleryItem[] = [
    ...incidentItems,
    ...documentItems,
    ...traceabilityItems,
    ...eventItems,
  ]

  if (gallery.length === 0) {
    return [{
      id: `${site.propertyId}-empty-gallery`, label: 'Evidencia', title: 'Sin evidencia publicada',
      detail: 'Aun no hay respaldo reciente visible para este sitio.', proof: 'Pendiente',
      status: 'Inicial', action: 'Publicar la primera evidencia o documento operativo del sitio.',
      tone: 'warning', rank: 1,
    }]
  }

  return gallery
    .sort((left, right) => right.rank - left.rank || (right.at?.getTime() || 0) - (left.at?.getTime() || 0))
    .slice(0, 8)
}

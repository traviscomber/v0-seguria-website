import type { PortalDecisionPacket, PortalSiteSummary } from '@/lib/client-portal/types'
import { isOpenPortalIncident } from '@/lib/client-portal/devices'
import {
  getPortalCoverageZones,
  getPortalImprovementActions,
  getPortalSensitiveWindows,
  getPortalServiceCommitments,
} from '@/lib/client-portal/operations'

export function getPortalDecisionPackets(sites: PortalSiteSummary[]): PortalDecisionPacket[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-decision',
      siteLabel: 'Sin sitio',
      decision: 'Activar la primera operacion cliente',
      owner: 'Equipo SegurIA',
      evidence: 'Aun no hay sitios, inventario o actividad publicada.',
      timing: 'Inicio del proyecto',
      outcome: 'Primer sitio visible con responsables y criterio de atencion.',
      tone: 'warning',
      rank: 90,
    }]
  }

  return sites.flatMap((site) => {
    const open = site.incidents.filter(isOpenPortalIncident)
    const critical = open.find((incident) => incident.severity === 'critical')
    const coverage = getPortalCoverageZones(site)
    const commitments = getPortalServiceCommitments([site])
    const windows = getPortalSensitiveWindows([site])
    const improvements = getPortalImprovementActions([site])
    const blind = coverage.find((zone) => zone.tone === 'critical')
    const weakCommitment = commitments.find((item) => item.tone !== 'ok')
    const sensitive = windows.find((item) => item.tone !== 'ok')
    const improvement = improvements[0]
    const owner = site.profile.escalationMatrix[0]?.owner || 'Responsable del sitio'
    const items: PortalDecisionPacket[] = []

    if (critical) items.push({
      id: `${site.propertyId}-critical-decision`, siteLabel: site.label,
      decision: `Definir respuesta y cierre para ${critical.title}`,
      owner,
      evidence: critical.evidence[0]?.title || critical.relatedEvents[0]?.title || critical.description || 'Incidente critico abierto.',
      timing: 'Hoy, antes del cierre de turno',
      outcome: 'Incidente con responsable, evidencia, causa y estado actualizado.',
      tone: 'critical', rank: 100,
    })

    if (blind) items.push({
      id: `${site.propertyId}-coverage-decision`, siteLabel: site.label,
      decision: `Definir cobertura para ${blind.name}`,
      owner: site.profile.escalationMatrix[1]?.owner || owner,
      evidence: blind.summary,
      timing: 'Proxima revision de sitio',
      outcome: blind.action,
      tone: 'critical', rank: 92,
    })

    if (weakCommitment) items.push({
      id: `${site.propertyId}-service-decision`, siteLabel: site.label,
      decision: `Acordar mejora para ${weakCommitment.label.toLowerCase()}`,
      owner: 'Administrador del cliente',
      evidence: `${weakCommitment.current}. ${weakCommitment.summary}`,
      timing: 'Revision semanal',
      outcome: weakCommitment.action,
      tone: weakCommitment.tone,
      rank: weakCommitment.rank,
    })

    if (sensitive) items.push({
      id: `${site.propertyId}-window-decision`, siteLabel: site.label,
      decision: `Ajustar respuesta durante ${sensitive.label.toLowerCase()}`,
      owner,
      evidence: sensitive.summary,
      timing: 'Antes de la siguiente ventana',
      outcome: sensitive.action,
      tone: sensitive.tone,
      rank: sensitive.rank + 36,
    })

    if (items.length === 0 && improvement) items.push({
      id: `${site.propertyId}-improvement-decision`, siteLabel: site.label,
      decision: improvement.title,
      owner: 'Administrador del cliente',
      evidence: improvement.why,
      timing: 'Revision mensual',
      outcome: improvement.expectedImpact,
      tone: improvement.tone,
      rank: improvement.rank,
    })

    return items
  }).sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel)).slice(0, 8)
}

import type { PortalActionRegisterItem, PortalSiteSummary } from '@/lib/client-portal/types'
import { isOpenPortalIncident } from '@/lib/client-portal/devices'
import { getPortalDecisionPackets } from '@/lib/client-portal/decisions'
import {
  getPortalCoverageZones,
  getPortalImprovementActions,
  getPortalSensitiveWindows,
  getPortalServiceCommitments,
} from '@/lib/client-portal/operations'

export function getPortalActionRegister(sites: PortalSiteSummary[]): PortalActionRegisterItem[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-action-register', siteLabel: 'Sin sitio', title: 'Activar primer plan de accion',
      owner: 'Equipo SegurIA', due: 'Antes del inicio operativo', status: 'Pendiente',
      why: 'Sin sitio publicado no hay acciones priorizadas para el cliente.',
      nextStep: 'Crear sitio, cargar inventario y asignar responsables.',
      successCriteria: 'Portal con acciones visibles, responsables y criterios de cierre.',
      tone: 'warning', rank: 90,
    }]
  }

  return sites.flatMap((site) => {
    const open = site.incidents.filter(isOpenPortalIncident)
    const critical = open.find((incident) => incident.severity === 'critical')
    const overdue = site.report.overdueConfirmations
    const connectionRisk = site.gatewayHealth.offline + site.gatewayHealth.degraded
    const blind = getPortalCoverageZones(site).find((zone) => zone.tone === 'critical')
    const evidenceGap = open.find((incident) => incident.evidence.length === 0)
    const weakCommitment = getPortalServiceCommitments([site]).find((item) => item.tone !== 'ok')
    const sensitive = getPortalSensitiveWindows([site]).find((item) => item.tone !== 'ok')
    const decision = getPortalDecisionPackets([site])[0]
    const improvement = getPortalImprovementActions([site])[0]
    const operationsOwner = site.profile.escalationMatrix[0]?.owner || 'Responsable del sitio'
    const continuityOwner = site.profile.escalationMatrix[1]?.owner || 'Operacion'
    const items: PortalActionRegisterItem[] = []

    if (critical) items.push({
      id: `${site.propertyId}-critical-action`, siteLabel: site.label, title: critical.title,
      owner: operationsOwner, due: 'Hoy, antes del cierre de turno', status: critical.statusLabel,
      why: critical.description || 'Incidente critico abierto con impacto potencial en la operacion.',
      nextStep: critical.evidence.length > 0 ? 'Confirmar evidencia, asignar respuesta y registrar cierre.' : 'Completar evidencia antes de escalar o cerrar.',
      successCriteria: 'Incidente con causa, responsable, evidencia y estado actualizado.',
      tone: 'critical', rank: 100,
    })

    if (overdue > 0) items.push({
      id: `${site.propertyId}-overdue-action`, siteLabel: site.label, title: 'Cerrar confirmaciones vencidas',
      owner: operationsOwner, due: 'Antes del cambio de turno', status: 'Vencido',
      why: `${overdue} avisos estan fuera del tiempo esperado.`,
      nextStep: 'Confirmar recepcion, escalar o documentar motivo de excepcion.',
      successCriteria: 'Sin confirmaciones vencidas y con trazabilidad de respuesta.',
      tone: 'critical', rank: 96,
    })

    if (connectionRisk > 0) items.push({
      id: `${site.propertyId}-continuity-action`, siteLabel: site.label, title: 'Restaurar continuidad visible',
      owner: continuityOwner, due: 'Proxima revision operativa', status: 'En revision',
      why: `${connectionRisk} conexiones requieren atencion para sostener visibilidad.`,
      nextStep: 'Revisar recencia, enlace y equipos prioritarios antes de sumar nuevas reglas.',
      successCriteria: 'Conexiones activas y lectura reciente del sitio.',
      tone: 'warning', rank: 84,
    })

    if (blind) items.push({
      id: `${site.propertyId}-coverage-action`, siteLabel: site.label, title: `Cubrir ${blind.name}`,
      owner: continuityOwner, due: 'Proxima visita o reunion de sitio', status: blind.statusLabel,
      why: blind.summary, nextStep: blind.action,
      successCriteria: 'Zona con vista, senal o criterio de revision suficiente.',
      tone: 'critical', rank: 88,
    })

    if (evidenceGap) items.push({
      id: `${site.propertyId}-evidence-action`, siteLabel: site.label, title: 'Completar respaldo pendiente',
      owner: site.profile.escalationMatrix[2]?.owner || operationsOwner,
      due: 'Antes de cerrar incidente', status: evidenceGap.statusLabel,
      why: `${evidenceGap.title} sigue sin respaldo visual publicado.`,
      nextStep: 'Adjuntar captura, senal relacionada o causa documentada.',
      successCriteria: 'Decision explicable sin reconstruir la historia.',
      tone: 'warning', rank: 78,
    })

    if (weakCommitment) items.push({
      id: `${site.propertyId}-commitment-action`, siteLabel: site.label, title: weakCommitment.label,
      owner: 'Administrador del cliente', due: 'Revision semanal', status: weakCommitment.current,
      why: weakCommitment.summary, nextStep: weakCommitment.action,
      successCriteria: weakCommitment.target, tone: weakCommitment.tone, rank: weakCommitment.rank - 2,
    })

    if (sensitive) items.push({
      id: `${site.propertyId}-window-action`, siteLabel: site.label, title: `Ajustar ${sensitive.label}`,
      owner: operationsOwner, due: 'Antes de la siguiente ventana',
      status: sensitive.criticalCount > 0 ? 'Critica' : 'Atencion',
      why: sensitive.summary, nextStep: sensitive.action,
      successCriteria: 'Turno con criterio, responsable y evidencia esperada.',
      tone: sensitive.tone, rank: sensitive.rank + 40,
    })

    if (decision) items.push({
      id: `${site.propertyId}-decision-action`, siteLabel: site.label, title: decision.decision,
      owner: decision.owner, due: decision.timing, status: 'Por decidir',
      why: decision.evidence, nextStep: decision.outcome,
      successCriteria: 'Decision registrada con responsable y evidencia minima.',
      tone: decision.tone, rank: decision.rank - 10,
    })

    if (improvement) items.push({
      id: `${site.propertyId}-improvement-action`, siteLabel: site.label, title: improvement.title,
      owner: 'Administrador del cliente', due: 'Mejora mensual', status: 'Planificado',
      why: improvement.why, nextStep: improvement.nextStep,
      successCriteria: improvement.expectedImpact, tone: improvement.tone, rank: improvement.rank - 14,
    })

    if (items.length === 0) items.push({
      id: `${site.propertyId}-stable-action`, siteLabel: site.label, title: 'Mantener rutina de control',
      owner: 'Administrador del cliente', due: 'Revision mensual', status: 'Al dia',
      why: 'La lectura actual no muestra brechas criticas o advertencias abiertas.',
      nextStep: 'Revisar patrones, reglas y tiempos para seguir reduciendo ruido.',
      successCriteria: 'Operacion consistente, visible y facil de explicar.',
      tone: 'ok', rank: 18,
    })

    return items
  }).sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel)).slice(0, 10)
}

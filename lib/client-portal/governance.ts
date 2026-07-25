import type { PortalGovernanceRitual, PortalSiteSummary } from '@/lib/client-portal/types'
import { isOpenPortalIncident } from '@/lib/client-portal/devices'
import { getPortalDecisionPackets } from '@/lib/client-portal/decisions'
import {
  getPortalImprovementActions,
  getPortalSensitiveWindows,
  getPortalServiceCommitments,
} from '@/lib/client-portal/operations'
import { getPortalOperationalScore } from '@/lib/client-portal/scores'

export function getPortalGovernanceRituals(sites: PortalSiteSummary[]): PortalGovernanceRitual[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-governance', siteLabel: 'Sin sitio', cadence: 'Inicio',
      title: 'Preparar primera revision', owner: 'Equipo SegurIA',
      question: 'Que debe ver el cliente para confiar en la operacion?',
      input: 'Sitio, zonas, inventario y responsables iniciales.',
      output: 'Primera lectura ejecutiva lista para operar.',
      tone: 'warning', rank: 90,
    }]
  }

  const rituals = sites.flatMap((site) => {
    const score = getPortalOperationalScore([site])
    const decision = getPortalDecisionPackets([site])[0]
    const improvement = getPortalImprovementActions([site])[0]
    const commitments = getPortalServiceCommitments([site])
    const windows = getPortalSensitiveWindows([site])
    const open = site.incidents.filter(isOpenPortalIncident)
    const critical = open.filter((incident) => incident.severity === 'critical')
    const overdue = site.report.overdueConfirmations
    const weakCommitment = commitments.find((item) => item.tone !== 'ok')
    const sensitive = windows.find((item) => item.tone !== 'ok')
    const operationsOwner = site.profile.escalationMatrix[0]?.owner || 'Responsable del sitio'
    const continuityOwner = site.profile.escalationMatrix[1]?.owner || 'Operacion'

    const items: PortalGovernanceRitual[] = [
      {
        id: `${site.propertyId}-daily-brief`, siteLabel: site.label, cadence: 'Diario',
        title: 'Apertura de operacion', owner: operationsOwner,
        question: 'Que cambio desde la ultima revision?',
        input: `${site.report.eventsToday} eventos hoy, ${open.length} incidentes abiertos.`,
        output: open.length > 0 ? 'Responsable y siguiente accion asignados.' : 'Rutina normal confirmada.',
        tone: critical.length > 0 ? 'critical' : open.length > 0 ? 'warning' : 'ok',
        rank: critical.length > 0 ? 100 : open.length > 0 ? 76 : 20,
      },
      {
        id: `${site.propertyId}-weekly-control`, siteLabel: site.label, cadence: 'Semanal',
        title: 'Control de servicio', owner: continuityOwner,
        question: 'Estamos respondiendo con evidencia y dentro del tiempo esperado?',
        input: weakCommitment ? `${weakCommitment.label}: ${weakCommitment.current}.` : 'Compromisos sin brechas visibles.',
        output: weakCommitment ? weakCommitment.action : 'Mantener compromisos y revisar excepciones puntuales.',
        tone: weakCommitment?.tone || 'ok',
        rank: weakCommitment?.tone === 'critical' ? 94 : weakCommitment?.tone === 'warning' ? 72 : 18,
      },
      {
        id: `${site.propertyId}-decision-review`, siteLabel: site.label, cadence: 'Reunion',
        title: 'Mesa de decision', owner: decision?.owner || 'Administrador del cliente',
        question: 'Que decision no debe quedar abierta?',
        input: decision?.evidence || 'Lectura de estado, cobertura y evidencia disponible.',
        output: decision?.outcome || 'Decision registrada con responsable y criterio.',
        tone: decision?.tone || score.tone,
        rank: decision?.rank || 50,
      },
      {
        id: `${site.propertyId}-monthly-learning`, siteLabel: site.label, cadence: 'Mensual',
        title: 'Aprendizaje y ajuste', owner: 'Administrador del cliente',
        question: 'Que patron se repite y que se puede simplificar?',
        input: improvement?.why || `Salud operativa ${score.score}/100.`,
        output: improvement?.expectedImpact || 'Reglas mas claras, menos ruido y mejor respuesta.',
        tone: improvement?.tone || score.tone,
        rank: improvement?.rank ? improvement.rank - 4 : 44,
      },
    ]

    if (overdue > 0 || sensitive) {
      items.push({
        id: `${site.propertyId}-exception-review`, siteLabel: site.label, cadence: 'Excepcion',
        title: overdue > 0 ? 'Cierre de confirmaciones vencidas' : 'Revision de horario sensible',
        owner: operationsOwner,
        question: overdue > 0 ? 'Que aviso sigue sin confirmacion?' : 'Que franja requiere mas criterio?',
        input: overdue > 0 ? `${overdue} confirmaciones vencidas.` : `${sensitive?.label || 'Horario sensible'} concentra senales operativas.`,
        output: overdue > 0
          ? 'Aviso cerrado, escalado o documentado antes del cambio de turno.'
          : sensitive?.action || 'Turno ajustado con evidencia y responsable.',
        tone: overdue > 0 ? 'critical' : sensitive?.tone || 'warning',
        rank: overdue > 0 ? 98 : 74,
      })
    }

    return items
  })

  return rituals
    .sort((left, right) => right.rank - left.rank || left.siteLabel.localeCompare(right.siteLabel))
    .slice(0, 10)
}

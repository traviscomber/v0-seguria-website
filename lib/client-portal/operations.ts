import type {
  PortalCoverageZone,
  PortalImprovementAction,
  PortalSensitiveWindow,
  PortalServiceCommitment,
  PortalSiteSummary,
} from '@/lib/client-portal/types'
import { isOpenPortalIncident } from '@/lib/client-portal/devices'
import { getPortalOperationalScore } from '@/lib/client-portal/scores'

function formatDuration(value: number | undefined, unit: 'min' | 'h') {
  return typeof value === 'number' ? `${Math.round(value)} ${unit}` : 'Sin dato'
}

export function getPortalCoverageZones(site: PortalSiteSummary): PortalCoverageZone[] {
  const zones = site.spaces.length > 0
    ? site.spaces
    : site.profile.focusAreas.map((name, index) => ({
        id: `${site.propertyId}-focus-${index}`,
        name,
        cameraCount: index === 0 ? site.cameraCount : 0,
        sensorCount: index === 0 ? site.sensorCount : 0,
        alertCount: index === 0 ? site.alertCount : 0,
        lastUpdatedAt: site.lastUpdatedAt,
      }))

  return zones.map((zone) => {
    const hasCamera = zone.cameraCount > 0
    const hasSensor = zone.sensorCount > 0
    const hasAlert = zone.alertCount > 0
    const updatedAt = zone.lastUpdatedAt
    const isFresh = updatedAt ? Date.now() - updatedAt.getTime() <= 86_400_000 : false
    const score = Math.max(0, Math.min(100,
      (hasCamera ? 38 : 0) +
      (hasSensor ? 34 : 0) +
      (isFresh ? 18 : 0) +
      (!hasAlert ? 10 : -18)
    ))

    if (!hasCamera && !hasSensor) {
      return {
        id: `${site.propertyId}-${zone.id}`,
        siteLabel: site.label,
        name: zone.name,
        cameraCount: zone.cameraCount,
        sensorCount: zone.sensorCount,
        alertCount: zone.alertCount,
        score,
        statusLabel: 'Punto ciego',
        summary: 'No hay lectura visible asociada a esta zona.',
        action: 'Asignar una vista, sensor o revision operativa para cubrir este punto.',
        tone: 'critical' as const,
        updatedAt,
      }
    }

    if (hasAlert || score < 70) {
      return {
        id: `${site.propertyId}-${zone.id}`,
        siteLabel: site.label,
        name: zone.name,
        cameraCount: zone.cameraCount,
        sensorCount: zone.sensorCount,
        alertCount: zone.alertCount,
        score,
        statusLabel: hasAlert ? 'Con atencion' : 'Cobertura parcial',
        summary: hasAlert
          ? 'La zona tiene cobertura, pero aparece con avisos que conviene revisar.'
          : 'La zona esta visible, aunque falta reforzar lectura o recencia.',
        action: hasAlert
          ? site.profile.recommendedAttentionAction
          : 'Revisar si falta una senal complementaria o una actualizacion reciente.',
        tone: 'warning' as const,
        updatedAt,
      }
    }

    return {
      id: `${site.propertyId}-${zone.id}`,
      siteLabel: site.label,
      name: zone.name,
      cameraCount: zone.cameraCount,
      sensorCount: zone.sensorCount,
      alertCount: zone.alertCount,
      score,
      statusLabel: 'Cubierta',
      summary: 'La zona cuenta con lectura visible y sin avisos abiertos.',
      action: site.profile.recommendedStableAction,
      tone: 'ok' as const,
      updatedAt,
    }
  }).sort((left, right) => {
    const rank = { critical: 3, warning: 2, ok: 1 }
    return rank[right.tone] - rank[left.tone] || left.score - right.score
  })
}

function getWindowSlot(date: Date) {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 23) return 'evening'
  return 'night'
}

const windowLabels = {
  morning: { label: 'Apertura', range: '05:00 - 12:00' },
  afternoon: { label: 'Operacion diaria', range: '12:00 - 18:00' },
  evening: { label: 'Cierre y cambios', range: '18:00 - 23:00' },
  night: { label: 'Noche sensible', range: '23:00 - 05:00' },
} as const

export function getPortalSensitiveWindows(sites: PortalSiteSummary[]): PortalSensitiveWindow[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-window', siteLabel: 'Sin sitio', label: 'Sin lectura', range: 'Pendiente',
      eventCount: 0, incidentCount: 0, criticalCount: 0,
      summary: 'Aun no hay actividad suficiente para detectar horarios sensibles.',
      action: 'Publicar eventos e incidentes del primer sitio para construir la lectura.',
      tone: 'warning', rank: 80,
    }]
  }

  return sites.flatMap((site) => {
    const groups = {
      morning: { events: 0, incidents: 0, critical: 0 },
      afternoon: { events: 0, incidents: 0, critical: 0 },
      evening: { events: 0, incidents: 0, critical: 0 },
      night: { events: 0, incidents: 0, critical: 0 },
    }
    for (const event of site.events) {
      const group = groups[getWindowSlot(event.occurredAt)]
      group.events += 1
      if (event.severity === 'critical') group.critical += 1
    }
    for (const incident of site.incidents) {
      const group = groups[getWindowSlot(incident.createdAt)]
      group.incidents += 1
      if (incident.severity === 'critical') group.critical += 1
    }

    return Object.entries(groups).map(([slot, metrics]) => {
      const meta = windowLabels[slot as keyof typeof windowLabels]
      const tone: PortalSensitiveWindow['tone'] = metrics.critical > 0
        ? 'critical'
        : metrics.incidents > 0 || metrics.events >= 3 ? 'warning' : 'ok'
      return {
        id: `${site.propertyId}-${slot}`,
        siteLabel: site.label,
        label: meta.label,
        range: meta.range,
        eventCount: metrics.events,
        incidentCount: metrics.incidents,
        criticalCount: metrics.critical,
        summary: metrics.events + metrics.incidents === 0
          ? 'Sin senales relevantes en esta franja.'
          : `${metrics.events} eventos y ${metrics.incidents} incidentes aparecen en esta franja.`,
        action: tone === 'critical'
          ? 'Reforzar revision, evidencia y responsable durante esta ventana.'
          : tone === 'warning'
            ? 'Dejar esta franja en seguimiento y revisar si hay patron repetido.'
            : 'Mantener rutina normal y conservar lectura disponible.',
        tone,
        rank: metrics.critical * 25 + metrics.incidents * 12 + metrics.events * 3,
      }
    })
  }).sort((left, right) => right.rank - left.rank).slice(0, 8)
}

export function getPortalServiceCommitments(sites: PortalSiteSummary[]): PortalServiceCommitment[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-service', siteLabel: 'Sin sitio', label: 'Activacion inicial',
      target: 'Sitio visible', current: 'Pendiente',
      summary: 'Aun no hay una operacion publicada para medir servicio.',
      action: 'Asignar sitio, inventario y responsables antes de medir compromisos.',
      tone: 'warning', rank: 90,
    }]
  }

  return sites.flatMap((site) => {
    const open = site.incidents.filter(isOpenPortalIncident)
    const missingEvidence = open.filter((incident) => incident.evidence.length === 0).length
    const continuityRisk = site.gatewayHealth.offline + site.gatewayHealth.degraded
    return [
      {
        id: `${site.propertyId}-acknowledgement`, siteLabel: site.label,
        label: 'Confirmacion de avisos', target: 'Alta en 5 min / atencion en 30 min',
        current: site.report.overdueConfirmations > 0
          ? `${site.report.overdueConfirmations} vencidas`
          : formatDuration(site.report.averageConfirmationMinutes, 'min'),
        summary: 'Los avisos quedan medidos para saber si el equipo responde a tiempo.',
        action: site.report.overdueConfirmations > 0
          ? 'Confirmar recepcion y documentar si corresponde escalamiento.'
          : 'Mantener confirmacion visible y revisar demoras al cierre del turno.',
        tone: site.report.overdueConfirmations > 0 ? 'critical' as const : 'ok' as const,
        rank: site.report.overdueConfirmations > 0 ? 100 : 25,
      },
      {
        id: `${site.propertyId}-incident-closure`, siteLabel: site.label,
        label: 'Cierre de incidentes', target: 'Responsable, causa y cierre trazable',
        current: open.length > 0 ? `${open.length} abiertos` : formatDuration(site.report.averageResolutionHours, 'h'),
        summary: open.length > 0 ? 'Hay situaciones que todavia necesitan seguimiento operativo.' : 'Los cierres quedan medidos para mejorar respuesta y aprendizaje.',
        action: open.length > 0 ? 'Asignar responsable, revisar evidencia y dejar siguiente accion clara.' : 'Revisar cierres mensuales y ajustar reglas si hubo ruido operativo.',
        tone: open.some((incident) => incident.severity === 'critical') ? 'critical' as const : open.length > 0 ? 'warning' as const : 'ok' as const,
        rank: open.some((incident) => incident.severity === 'critical') ? 96 : open.length > 0 ? 80 : 22,
      },
      {
        id: `${site.propertyId}-evidence-quality`, siteLabel: site.label,
        label: 'Evidencia lista', target: 'Evento + contexto + respaldo',
        current: missingEvidence > 0 ? `${missingEvidence} incompletas` : 'Disponible',
        summary: missingEvidence > 0 ? 'Algunos incidentes abiertos aun no muestran respaldo.' : 'La informacion critica queda preparada para explicar decisiones.',
        action: missingEvidence > 0 ? 'Completar respaldo o cerrar con causa documentada.' : 'Mantener capturas y documentos asociados.',
        tone: missingEvidence > 0 ? 'warning' as const : 'ok' as const,
        rank: missingEvidence > 0 ? 72 : 18,
      },
      {
        id: `${site.propertyId}-continuity`, siteLabel: site.label,
        label: 'Continuidad visible', target: 'Lectura operativa sin puntos mudos',
        current: continuityRisk > 0 ? `${continuityRisk} con revision` : 'Conectada',
        summary: continuityRisk > 0 ? 'Hay conexiones que pueden reducir visibilidad del sitio.' : 'La operacion mantiene lectura disponible.',
        action: continuityRisk > 0 ? 'Restituir lectura antes de depender de supervision manual.' : 'Mantener revision normal de zonas.',
        tone: continuityRisk > 0 ? 'warning' as const : 'ok' as const,
        rank: continuityRisk > 0 ? 68 : 15,
      },
    ] satisfies PortalServiceCommitment[]
  }).sort((left, right) => right.rank - left.rank).slice(0, 8)
}

export function getPortalImprovementActions(sites: PortalSiteSummary[]): PortalImprovementAction[] {
  if (sites.length === 0) {
    return [{
      id: 'empty-improvement', siteLabel: 'Sin sitio', title: 'Completar base operativa',
      why: 'Sin sitios ni equipos publicados no es posible medir cobertura, respuesta o evidencia.',
      nextStep: 'Activar el primer sitio, cargar inventario y asignar responsables.',
      expectedImpact: 'Primer tablero ejecutivo util para el cliente.',
      tone: 'warning', rank: 90,
    }]
  }

  return sites.flatMap((site) => {
    const score = getPortalOperationalScore([site])
    const coverage = getPortalCoverageZones(site)
    const commitments = getPortalServiceCommitments([site])
    const windows = getPortalSensitiveWindows([site])
    const open = site.incidents.filter(isOpenPortalIncident)
    const items: PortalImprovementAction[] = []
    const blind = coverage.find((zone) => zone.tone === 'critical')
    const weakCommitment = commitments.find((item) => item.tone !== 'ok')
    const sensitive = windows.find((item) => item.tone !== 'ok')
    const evidenceGap = open.find((incident) => incident.evidence.length === 0)

    if (score.score < 86) items.push({
      id: `${site.propertyId}-score`, siteLabel: site.label, title: 'Subir salud operativa',
      why: `El sitio marca ${score.score}/100 y muestra ${score.label.toLowerCase()}.`,
      nextStep: score.drivers.slice(0, 2).join(' y ') || site.profile.recommendedAttentionAction,
      expectedImpact: 'Mejor lectura ejecutiva y menos dudas al iniciar turno.',
      tone: score.tone === 'critical' ? 'critical' : 'warning', rank: score.tone === 'critical' ? 100 : 82,
    })
    if (blind) items.push({
      id: `${site.propertyId}-blind-zones`, siteLabel: site.label, title: 'Cerrar puntos ciegos',
      why: blind.summary, nextStep: blind.action,
      expectedImpact: 'Menos areas sin contexto cuando ocurre una alerta.', tone: 'critical', rank: 96,
    })
    if (weakCommitment) items.push({
      id: `${site.propertyId}-service-risk`, siteLabel: site.label, title: 'Mejorar cumplimiento operativo',
      why: `${weakCommitment.label}: ${weakCommitment.current}.`, nextStep: weakCommitment.action,
      expectedImpact: 'Respuesta mas medible y cierres con menos friccion.', tone: weakCommitment.tone, rank: weakCommitment.rank,
    })
    if (sensitive) items.push({
      id: `${site.propertyId}-sensitive-window`, siteLabel: site.label, title: `Ajustar ${sensitive.label}`,
      why: sensitive.summary, nextStep: sensitive.action,
      expectedImpact: 'Mejor preparacion durante la franja de mayor exposicion.', tone: sensitive.tone, rank: sensitive.rank + 40,
    })
    if (evidenceGap) items.push({
      id: `${site.propertyId}-evidence-gap`, siteLabel: site.label, title: 'Completar evidencia',
      why: `${evidenceGap.title} sigue sin respaldo visible.`, nextStep: 'Adjuntar captura, senal relacionada o causa documentada.',
      expectedImpact: 'Decisiones explicables y cierres trazables.', tone: 'warning', rank: 78,
    })
    if (items.length === 0) items.push({
      id: `${site.propertyId}-stable-improvement`, siteLabel: site.label, title: 'Reducir ruido operativo',
      why: 'La operacion esta estable y permite trabajar en optimizacion.',
      nextStep: site.profile.recommendedStableAction,
      expectedImpact: 'Menos revisiones innecesarias y mayor claridad.', tone: 'ok', rank: 18,
    })
    return items
  }).sort((left, right) => right.rank - left.rank).slice(0, 8)
}

import type {
  PortalOperationalScore,
  PortalSiteSummary,
} from '@/lib/client-portal/types'
import { getPortalSensorRisk } from '@/lib/client-portal/devices'
import { getPortalDashboardTotals } from '@/lib/client-portal/reports'

export function getPortalOperationalScore(
  sites: PortalSiteSummary[]
): PortalOperationalScore {
  if (sites.length === 0) {
    return {
      score: 0,
      label: 'Sin datos',
      tone: 'warning',
      summary: 'Aun no hay sitios conectados para calcular salud operativa.',
      drivers: [
        'Agregar el primer sitio protegido',
        'Cargar inventario y eventos iniciales',
      ],
    }
  }

  const totals = getPortalDashboardTotals(sites)
  const sensorRisk = sites.reduce(
    (current, site) => {
      const next = getPortalSensorRisk(site.devices)
      current.stable += next.stable
      current.attention += next.attention
      current.critical += next.critical
      return current
    },
    { stable: 0, attention: 0, critical: 0 }
  )
  const penalties = [
    totals.criticalEventsToday * 10,
    totals.openIncidents * 8,
    totals.offlineGateways * 6,
    sensorRisk.critical * 6,
    sensorRisk.attention * 3,
    totals.overdueConfirmations * 8,
  ]
  const score = Math.max(
    0,
    Math.min(100, 100 - penalties.reduce((total, value) => total + value, 0))
  )
  const drivers = [
    totals.openIncidents > 0
      ? `${totals.openIncidents} incidente${totals.openIncidents === 1 ? '' : 's'} abierto${totals.openIncidents === 1 ? '' : 's'}`
      : 'Sin incidentes abiertos',
    totals.offlineGateways > 0
      ? `${totals.offlineGateways} conexion${totals.offlineGateways === 1 ? '' : 'es'} con revision`
      : 'Conexiones estables',
    sensorRisk.critical > 0
      ? `${sensorRisk.critical} sensor${sensorRisk.critical === 1 ? '' : 'es'} critico${sensorRisk.critical === 1 ? '' : 's'}`
      : 'Sensores sin criticidad',
    totals.overdueConfirmations > 0
      ? `${totals.overdueConfirmations} confirmacion${totals.overdueConfirmations === 1 ? '' : 'es'} vencida${totals.overdueConfirmations === 1 ? '' : 's'}`
      : 'Confirmaciones al dia',
  ]

  if (score >= 86) {
    return {
      score,
      label: 'Operacion sana',
      tone: 'ok',
      summary: 'La operacion esta visible, trazable y sin senales criticas abiertas.',
      drivers,
    }
  }

  if (score >= 68) {
    return {
      score,
      label: 'Operacion con atencion',
      tone: 'warning',
      summary: 'Hay puntos puntuales que conviene revisar antes del cierre operativo.',
      drivers,
    }
  }

  return {
    score,
    label: 'Operacion exigida',
    tone: 'critical',
    summary: 'La prioridad es estabilizar eventos, conexiones o confirmaciones pendientes.',
    drivers,
  }
}

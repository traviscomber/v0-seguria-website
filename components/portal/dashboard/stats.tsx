import { BellRing, Building2, Siren, Wifi } from 'lucide-react'
import { PortalStatCard } from '@/components/portal/portal-ui'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'

type Props = Pick<ClientDashboardView, 'totals' | 'sites' | 'alerts' | 'incidents'>

export function DashboardStats({ totals, sites, alerts, incidents }: Props) {
  return (
    <section aria-label="Estado general" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <PortalStatCard icon={Building2} label="Propiedades" value={totals.sites || sites.length} detail="Sitios bajo seguimiento" />
      <PortalStatCard icon={Wifi} label="Dispositivos" value={totals.devices || 0} detail="Equipos registrados" />
      <PortalStatCard icon={BellRing} label="Alertas activas" value={alerts.length} detail={alerts.length > 0 ? 'Requieren revisión' : 'Sin alertas pendientes'} />
      <PortalStatCard icon={Siren} label="Incidentes abiertos" value={incidents.length} detail={incidents.length > 0 ? 'Actualmente en seguimiento' : 'Sin incidentes abiertos'} />
    </section>
  )
}

import { BellRing, Camera, Siren, Wifi } from 'lucide-react'
import { PortalStatCard } from '@/components/portal/portal-ui'
import type { ClientPropertyView } from '@/lib/client-portal/property-view'

interface PropertyStatsProps {
  model: ClientPropertyView
}

export function PropertyStats({ model }: PropertyStatsProps) {
  return (
    <section aria-label="Resumen de propiedad" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <PortalStatCard
        icon={Wifi}
        label="Dispositivos"
        value={model.devices.length}
        detail={`${model.activeDevices} disponibles`}
      />
      <PortalStatCard
        icon={Camera}
        label="Cámaras"
        value={model.cameras.length}
        detail="Vistas asociadas a la propiedad"
      />
      <PortalStatCard
        icon={BellRing}
        label="Equipos con atención"
        value={model.devicesWithAttention}
        detail={model.devicesWithAttention > 0 ? 'Requieren revisión' : 'Todos disponibles'}
      />
      <PortalStatCard
        icon={Siren}
        label="Incidentes abiertos"
        value={model.incidents.length}
        detail={model.incidents.length > 0 ? 'Actualmente en seguimiento' : 'Sin incidentes pendientes'}
      />
    </section>
  )
}

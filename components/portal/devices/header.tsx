import { PortalStatusBadge } from '@/components/portal/portal-ui'
import { getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientDevicesView } from '@/lib/client-portal/devices-view'

interface DevicesHeaderProps {
  model: ClientDevicesView
}

export function DevicesHeader({ model }: DevicesHeaderProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(77,163,217,0.2),transparent_35%),rgba(255,255,255,0.045)] p-6 sm:p-8">
      <PortalStatusBadge tone={getPortalTone(model.overallStatus)}>
        {model.overallStatus}
      </PortalStatusBadge>
      <h1 className="mt-4 text-3xl font-light tracking-tight text-white sm:text-4xl">
        Dispositivos
      </h1>
      <p className="mt-3 max-w-3xl text-white/60">
        Consulta el estado de tus equipos conectados, cámaras y sensores sin necesidad de revisar configuraciones técnicas.
      </p>
    </section>
  )
}

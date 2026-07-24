import { Camera, Radio } from 'lucide-react'
import { PortalEmptyState, PortalSectionHeading, PortalStatusBadge } from '@/components/portal/portal-ui'
import { formatPortalDate, getPortalDeviceLabel, getPortalDeviceLocation, getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientPropertyView } from '@/lib/client-portal/property-view'

interface PropertyDevicesProps {
  model: ClientPropertyView
}

export function PropertyDevices({ model }: PropertyDevicesProps) {
  return (
    <section id="dispositivos" className="space-y-4">
      <PortalSectionHeading
        eyebrow="Dispositivos"
        title="Equipos de la propiedad"
        description="Nombre, ubicación, estado y última comunicación. Sin configuraciones técnicas innecesarias."
      />

      {model.devices.length === 0 ? (
        <PortalEmptyState title="Sin dispositivos registrados" detail="Los equipos asociados aparecerán aquí." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {model.devices.map((device, index) => (
            <div
              key={device.id || index}
              className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex min-w-0 gap-3">
                <span className="mt-0.5 rounded-xl bg-[#4DA3D9]/10 p-2 text-[#9DD2F2]">
                  {device.tipo?.includes('camara') ? (
                    <Camera className="h-4 w-4" />
                  ) : (
                    <Radio className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {getPortalDeviceLabel(device)}
                  </p>
                  <p className="mt-1 truncate text-xs text-white/45">
                    {getPortalDeviceLocation(device)}
                  </p>
                  <p className="mt-2 text-xs text-white/35">
                    Última comunicación: {formatPortalDate(device.updatedAt || device.lastSeenAt)}
                  </p>
                </div>
              </div>

              <PortalStatusBadge tone={getPortalTone(device.estado || device.status)}>
                {device.statusLabel || device.estado || device.status || 'Sin estado'}
              </PortalStatusBadge>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

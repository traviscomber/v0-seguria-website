import { MapPin } from 'lucide-react'
import { CameraSnapshot } from '@/components/camera-snapshot'
import { PortalSectionHeading, PortalStatusBadge } from '@/components/portal/portal-ui'
import { formatPortalDate, getPortalDeviceLabel, getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientPropertyView } from '@/lib/client-portal/property-view'

interface PropertyCamerasProps {
  model: ClientPropertyView
}

export function PropertyCameras({ model }: PropertyCamerasProps) {
  if (model.cameras.length === 0) return null

  return (
    <section id="camaras" className="space-y-4">
      <PortalSectionHeading
        eyebrow="Cámaras"
        title="Vistas disponibles"
        description="Revisa las cámaras asociadas a esta propiedad."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {model.cameras.map((device, index) => {
          const deviceId = device.id ? String(device.id) : null
          const label = getPortalDeviceLabel(device)

          return (
            <div
              key={deviceId || index}
              className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04]"
            >
              <div className="relative h-52 overflow-hidden bg-[#071524]">
                {deviceId ? (
                  <CameraSnapshot deviceId={deviceId} alt={label} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/35">
                    Vista no disponible
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071524] via-transparent to-transparent" />
                <PortalStatusBadge
                  className="absolute left-3 top-3"
                  tone={getPortalTone(device.estado || device.status)}
                >
                  {device.statusLabel || device.estado || device.status || 'Disponible'}
                </PortalStatusBadge>
              </div>

              <div className="p-4">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-white/45">
                  <MapPin className="h-3 w-3" />
                  {device.location || device.ubicacion || 'Propiedad'}
                </p>
                <p className="mt-2 text-xs text-white/35">
                  Actualizado: {formatPortalDate(device.updatedAt || device.lastSeenAt)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { CameraSnapshot } from '@/components/camera-snapshot'
import { PortalSectionHeading } from '@/components/portal/portal-ui'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'
import { getPortalDeviceLabel } from '@/lib/client-portal/presentation'

interface DashboardCamerasProps {
  cameras: ClientDashboardView['cameras']
}

export function DashboardCameras({ cameras }: DashboardCamerasProps) {
  if (cameras.length === 0) return null

  return (
    <section id="camaras" className="space-y-4">
      <PortalSectionHeading
        eyebrow="Cámaras"
        title="Vistas recientes"
        description="Acceso rápido a las cámaras disponibles en tus propiedades."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cameras.map(({ site, device }, index) => {
          const deviceId = device.id ? String(device.id) : null
          const label = getPortalDeviceLabel(device) || 'Cámara'

          return (
            <Link
              key={deviceId || `${site.propertyId}-${index}`}
              href={`/app/properties/${site.propertyId}`}
              className="group overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] transition hover:border-[#4DA3D9]/35"
            >
              <div className="relative h-44 overflow-hidden bg-[#071524]">
                {deviceId ? (
                  <CameraSnapshot deviceId={deviceId} alt={label} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/35">Vista no disponible</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071524] via-transparent to-transparent" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#071524]/80 px-3 py-1 text-[11px] text-white/70">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Disponible
                </span>
              </div>
              <div className="p-4">
                <p className="truncate text-sm font-medium text-white">{label}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-white/45">
                  <MapPin className="h-3 w-3" />
                  {site.label || site.name || 'Propiedad'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

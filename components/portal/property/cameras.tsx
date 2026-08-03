import { Camera, MapPin, Trees } from 'lucide-react'
import { CameraSnapshot } from '@/components/camera-snapshot'
import { PortalSectionHeading, PortalStatusBadge } from '@/components/portal/portal-ui'
import { formatPortalDate, getPortalDeviceLabel, getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientPropertyView } from '@/lib/client-portal/property-view'
import { HUILO_HUILO_DEMO_CAMERAS, getHuiloHuiloDemoCamera, isHuiloHuiloSite } from '@/lib/huilo-huilo-demo'
import type { PortalDevice } from '@/types/client-portal'

interface PropertyCamerasProps {
  model: ClientPropertyView
}

const SYNTHETIC_CAMERAS: PortalDevice[] = HUILO_HUILO_DEMO_CAMERAS.map((camera) => ({
  name: camera.name,
  location: camera.location,
  status: 'demo',
  statusLabel: 'Vista demo',
}))

export function PropertyCameras({ model }: PropertyCamerasProps) {
  const isHuiloHuilo = isHuiloHuiloSite(
    model.site.name,
    model.site.label,
    model.site.organizationName,
  )
  const isSyntheticDemo = isHuiloHuilo && model.cameras.length === 0
  const cameras = isSyntheticDemo ? SYNTHETIC_CAMERAS : model.cameras

  if (cameras.length === 0) return null

  return (
    <section id="camaras" className="space-y-5">
      <PortalSectionHeading
        eyebrow={isHuiloHuilo ? 'Territorio conectado' : 'Cámaras'}
        title={isHuiloHuilo ? 'Huilo Huilo en una sola vista' : 'Vistas disponibles'}
        description={
          isHuiloHuilo
            ? 'Una lectura visual del lodge, sus accesos, senderos, miradores y áreas operativas. Las vistas demo quedarán reemplazadas automáticamente al conectar los feeds en vivo.'
            : 'Revisa las cámaras asociadas a esta propiedad.'
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cameras.map((device, index) => {
          const deviceId = device.id ? String(device.id) : null
          const demo = getHuiloHuiloDemoCamera(index)
          const label = isHuiloHuilo ? demo.name : getPortalDeviceLabel(device)
          const fallbackSrc = isHuiloHuilo ? demo.image : model.site.imageUrl || undefined
          const isFeatureCard = isHuiloHuilo && (index === 0 || index === cameras.length - 1)

          return (
            <article
              key={deviceId || `${label}-${index}`}
              className={`group overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.045] shadow-xl shadow-black/10 transition duration-500 hover:-translate-y-1 hover:border-emerald-200/25 hover:shadow-2xl hover:shadow-emerald-950/20 ${
                isFeatureCard ? 'md:col-span-2 xl:col-span-2' : ''
              }`}
            >
              <div className={`relative overflow-hidden bg-[#071524] ${isFeatureCard ? 'h-72 lg:h-80' : 'h-56'}`}>
                <CameraSnapshot deviceId={deviceId} alt={label} fallbackSrc={fallbackSrc} />
                {!deviceId && !fallbackSrc ? (
                  <div className="flex h-full items-center justify-center text-sm text-white/35">
                    Vista no disponible
                  </div>
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#03110d] via-black/5 to-black/25" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(167,243,208,0.12),transparent_32%)]" />

                <PortalStatusBadge
                  className="absolute left-4 top-4"
                  tone={isSyntheticDemo ? 'neutral' : getPortalTone(device.estado || device.status)}
                >
                  {isSyntheticDemo
                    ? 'Vista demo'
                    : device.statusLabel || device.estado || device.status || 'Disponible'}
                </PortalStatusBadge>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-medium tracking-tight text-white drop-shadow-lg">
                      {label}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
                      <MapPin className="h-3.5 w-3.5 text-emerald-200" />
                      {isHuiloHuilo ? demo.location : device.location || device.ubicacion || 'Propiedad'}
                    </p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-black/35 text-emerald-100 backdrop-blur-md">
                    {isHuiloHuilo ? <Trees className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 p-4">
                <p className="max-w-xl text-xs leading-relaxed text-white/45">
                  {isSyntheticDemo
                    ? demo.description
                    : `Actualizado: ${formatPortalDate(device.updatedAt || device.lastSeenAt)}`}
                </p>
                {isSyntheticDemo ? (
                  <span className="shrink-0 rounded-full border border-amber-200/15 bg-amber-100/[0.06] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.16em] text-amber-100/65">
                    Sin feed en vivo
                  </span>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

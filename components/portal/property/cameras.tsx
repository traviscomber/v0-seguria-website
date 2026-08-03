import { MapPin } from 'lucide-react'
import { CameraSnapshot } from '@/components/camera-snapshot'
import { PortalSectionHeading, PortalStatusBadge } from '@/components/portal/portal-ui'
import { formatPortalDate, getPortalDeviceLabel, getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientPropertyView } from '@/lib/client-portal/property-view'
import type { PortalDevice } from '@/types/client-portal'

interface PropertyCamerasProps {
  model: ClientPropertyView
}

const HUILO_HUILO_DEMO_CAMERAS: PortalDevice[] = [
  { name: 'Recepción principal', location: 'Hotel Huilo Huilo', status: 'demo', statusLabel: 'Vista demo' },
  { name: 'Estacionamiento principal', location: 'Acceso al lodge', status: 'demo', statusLabel: 'Vista demo' },
  { name: 'Sendero bosque húmedo', location: 'Reserva biológica', status: 'demo', statusLabel: 'Vista demo' },
  { name: 'Cruce de río', location: 'Sendero turístico', status: 'demo', statusLabel: 'Vista demo' },
  { name: 'Área de servicio', location: 'Operaciones internas', status: 'demo', statusLabel: 'Vista demo' },
  { name: 'Mirador del lago', location: 'Circuito de miradores', status: 'demo', statusLabel: 'Vista demo' },
]

const HUILO_HUILO_DEMO_IMAGES = [
  '/demo/huilo-huilo/reception.jpg',
  '/demo/huilo-huilo/parking.jpg',
]

export function PropertyCameras({ model }: PropertyCamerasProps) {
  const siteName = `${model.site.name || ''} ${model.site.label || ''} ${model.site.organizationName || ''}`.toLowerCase()
  const isHuiloHuilo = siteName.includes('huilo huilo')
  const isSyntheticDemo = isHuiloHuilo && model.cameras.length === 0
  const cameras = isSyntheticDemo ? HUILO_HUILO_DEMO_CAMERAS : model.cameras

  if (cameras.length === 0) return null

  return (
    <section id="camaras" className="space-y-4">
      <PortalSectionHeading
        eyebrow="Cámaras"
        title="Vistas disponibles"
        description={
          isHuiloHuilo
            ? 'Las cámaras sin señal activa utilizan imágenes demostrativas claramente identificadas.'
            : 'Revisa las cámaras asociadas a esta propiedad.'
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cameras.map((device, index) => {
          const deviceId = device.id ? String(device.id) : null
          const label = getPortalDeviceLabel(device)
          const fallbackSrc = isHuiloHuilo
            ? HUILO_HUILO_DEMO_IMAGES[index % HUILO_HUILO_DEMO_IMAGES.length]
            : model.site.imageUrl || undefined

          return (
            <div
              key={deviceId || `${label}-${index}`}
              className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04]"
            >
              <div className="relative h-52 overflow-hidden bg-[#071524]">
                <CameraSnapshot deviceId={deviceId} alt={label} fallbackSrc={fallbackSrc} />
                {!deviceId && !fallbackSrc ? (
                  <div className="flex h-full items-center justify-center text-sm text-white/35">
                    Vista no disponible
                  </div>
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071524] via-transparent to-transparent" />
                <PortalStatusBadge
                  className="absolute left-3 top-3"
                  tone={isSyntheticDemo ? 'neutral' : getPortalTone(device.estado || device.status)}
                >
                  {isSyntheticDemo
                    ? 'Vista demo'
                    : device.statusLabel || device.estado || device.status || 'Disponible'}
                </PortalStatusBadge>
                {isSyntheticDemo ? (
                  <span className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-[#071524]/75 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/65 backdrop-blur">
                    Sin feed en vivo
                  </span>
                ) : null}
              </div>

              <div className="p-4">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-white/45">
                  <MapPin className="h-3 w-3" />
                  {device.location || device.ubicacion || 'Propiedad'}
                </p>
                <p className="mt-2 text-xs text-white/35">
                  {isSyntheticDemo
                    ? 'Referencia visual para la demostración operativa'
                    : `Actualizado: ${formatPortalDate(device.updatedAt || device.lastSeenAt)}`}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

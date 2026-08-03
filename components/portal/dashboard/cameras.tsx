import Link from 'next/link'
import { Camera, MapPin, Trees, Wheat } from 'lucide-react'
import { CameraSnapshot } from '@/components/camera-snapshot'
import { PortalEmptyState, PortalSectionHeading } from '@/components/portal/portal-ui'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'
import { getPortalDeviceLabel } from '@/lib/client-portal/presentation'
import type { ClientTheme } from '@/lib/client-theme'
import { getHuiloHuiloDemoCamera } from '@/lib/huilo-huilo-demo'

interface DashboardCamerasProps {
  cameras: ClientDashboardView['cameras']
  theme: ClientTheme
}

export function DashboardCameras({ cameras, theme }: DashboardCamerasProps) {
  const CameraIcon = theme.key === 'huilo-huilo' ? Trees : theme.key === 'santa-elena' ? Wheat : Camera
  const isHuiloHuilo = theme.key === 'huilo-huilo'
  const title = isHuiloHuilo
    ? 'Vistas del territorio'
    : theme.key === 'santa-elena'
      ? 'Monitoreo de predios'
      : 'Vistas recientes'
  const description = isHuiloHuilo
    ? 'Imágenes demostrativas de hoteles, senderos y zonas protegidas mientras se conectan los feeds en vivo.'
    : theme.key === 'santa-elena'
      ? 'Revisa accesos, corrales, maquinaria y zonas operativas desde un solo lugar.'
      : `Acceso rápido a las cámaras disponibles en tus ${theme.vocabulary.properties}.`

  return (
    <section id="camaras" className="space-y-4">
      <PortalSectionHeading eyebrow="Vigilancia" title={title} description={description} />

      {cameras.length === 0 ? (
        <PortalEmptyState
          title="Sin cámaras disponibles"
          detail={`Cuando existan cámaras asociadas a tus ${theme.vocabulary.properties}, sus vistas aparecerán aquí.`}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cameras.map(({ site, device }, index) => {
            const deviceId = device.id ? String(device.id) : null
            const demo = getHuiloHuiloDemoCamera(index)
            const sourceLabel = getPortalDeviceLabel(device)
            const label = isHuiloHuilo ? demo.name : sourceLabel || 'Cámara'
            const location = site.label || site.name || theme.vocabulary.properties
            const fallbackSrc = isHuiloHuilo ? demo.image : site.imageUrl || undefined

            return (
              <Link
                key={deviceId || `${site.propertyId}-${index}`}
                href={`/app/properties/${site.propertyId}`}
                className={`group overflow-hidden rounded-[22px] border border-white/10 ${theme.cardClass} shadow-lg shadow-black/10 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20`}
              >
                <div className="relative h-44 overflow-hidden bg-black/25">
                  <CameraSnapshot deviceId={deviceId} alt={label} fallbackSrc={fallbackSrc} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/20" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] text-white/75 backdrop-blur-md">
                    <span className={`h-2 w-2 rounded-full ${isHuiloHuilo ? 'bg-amber-300' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]'}`} />
                    {isHuiloHuilo ? 'Vista demo' : 'Disponible'}
                  </span>
                  {isHuiloHuilo ? (
                    <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-white/60 backdrop-blur-md">
                      Sin feed en vivo
                    </span>
                  ) : null}
                  <span className={`absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/60 p-2 backdrop-blur-md ${theme.accentTextClass}`}>
                    <CameraIcon className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                </div>
                <div className="p-4">
                  <p className="truncate text-sm font-medium text-white">{label}</p>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-white/45">
                    <MapPin className={`h-3 w-3 shrink-0 ${theme.accentTextClass}`} />
                    {location}
                  </p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-white/30 transition group-hover:text-white/55">
                    Abrir {theme.key === 'santa-elena' ? 'predio' : isHuiloHuilo ? 'espacio' : 'propiedad'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

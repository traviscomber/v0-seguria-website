import Link from 'next/link'
import { ArrowUpRight, Camera, Headphones, MapPin, Trees, Wheat } from 'lucide-react'
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

const mosaicClasses = [
  'md:col-span-2 md:row-span-2 min-h-[360px]',
  'min-h-[220px]',
  'min-h-[220px]',
  'md:col-span-2 min-h-[260px]',
  'min-h-[220px]',
  'min-h-[220px]',
  'md:col-span-2 min-h-[260px]',
  'min-h-[220px]',
]

function supportHref(params: Record<string, string | null | undefined>) {
  const query = new URLSearchParams({ from: 'vigilancia', topic: 'vigilancia', kind: 'camera', returnTo: '/app#camaras' })
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value)
  })
  return `/contacto/huilo-huilo?${query.toString()}`
}

export function DashboardCameras({ cameras, theme }: DashboardCamerasProps) {
  const CameraIcon = theme.key === 'huilo-huilo' ? Trees : theme.key === 'santa-elena' ? Wheat : Camera
  const isHuiloHuilo = theme.key === 'huilo-huilo'
  const title = isHuiloHuilo ? 'Evidencia visual' : theme.key === 'santa-elena' ? 'Monitoreo de predios' : 'Vistas recientes'
  const description = isHuiloHuilo
    ? 'Una lectura visual de los puntos más relevantes de la reserva.'
    : theme.key === 'santa-elena'
      ? 'Revisa accesos, corrales, maquinaria y zonas operativas.'
      : `Acceso rápido a las cámaras disponibles en tus ${theme.vocabulary.properties}.`

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PortalSectionHeading eyebrow="Vigilancia" title={title} description={description} />
        <p className="text-sm text-white/40">{cameras.length} {cameras.length === 1 ? 'vista' : 'vistas'}</p>
      </div>

      {cameras.length === 0 ? (
        <PortalEmptyState title="Sin cámaras disponibles" detail="Las vistas aparecerán aquí cuando existan cámaras asociadas." />
      ) : (
        <div className="grid auto-rows-[minmax(220px,auto)] gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cameras.map(({ site, device }, index) => {
            const deviceId = device.id ? String(device.id) : null
            const demo = getHuiloHuiloDemoCamera(index)
            const sourceLabel = getPortalDeviceLabel(device)
            const label = isHuiloHuilo ? demo.name : sourceLabel || 'Cámara'
            const location = site.label || site.name || theme.vocabulary.properties
            const fallbackSrc = isHuiloHuilo ? demo.image : site.imageUrl || undefined
            const layoutClass = isHuiloHuilo ? mosaicClasses[index % mosaicClasses.length] : 'min-h-[240px]'

            return (
              <article key={deviceId || `${site.propertyId}-${index}`} className={`group relative overflow-hidden rounded-[20px] bg-black/25 ${layoutClass}`}>
                <CameraSnapshot deviceId={deviceId} alt={label} fallbackSrc={fallbackSrc} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/20" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 transition group-hover:ring-white/25" />

                <Link href={`/app/properties/${site.propertyId}`} aria-label={`Abrir ${label}`} className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-200" />

                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/70 backdrop-blur-md">
                    <span className={`h-1.5 w-1.5 rounded-full ${isHuiloHuilo ? 'bg-amber-300' : 'bg-emerald-400'}`} />
                    {isHuiloHuilo ? 'Vista demo' : 'Disponible'}
                  </span>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-black/45 backdrop-blur-md ${theme.accentTextClass}`}><CameraIcon className="h-4 w-4" strokeWidth={1.7} /></span>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-4 sm:p-5">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white sm:text-lg">{label}</p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-white/55"><MapPin className={`h-3.5 w-3.5 shrink-0 ${theme.accentTextClass}`} />{location}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-white/30 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                </div>

                {isHuiloHuilo ? (
                  <Link
                    href={supportHref({ propertyId: site.propertyId, itemId: deviceId, item: label, property: location })}
                    aria-label={`Reportar problema con ${label}`}
                    className="absolute bottom-4 right-12 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white/65 backdrop-blur-md transition hover:bg-emerald-200 hover:text-[#052117] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                  >
                    <Headphones className="h-4 w-4" />
                  </Link>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

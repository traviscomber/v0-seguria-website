// @ts-nocheck
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowLeft,
  BellRing,
  Camera,
  CircleAlert,
  Clock3,
  FileText,
  Headphones,
  MapPin,
  Radio,
  ShieldCheck,
  Siren,
  Wifi,
} from 'lucide-react'
import { CameraSnapshot } from '@/components/camera-snapshot'
import {
  PortalEmptyState,
  PortalSectionHeading,
  PortalStatCard,
  PortalStatusBadge,
} from '@/components/portal/portal-ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentAuthSession } from '@/lib/auth-store'
import {
  getPortalActivityFeed,
  getPortalEvidenceGallery,
  getPortalSiteForUser,
  isOpenPortalIncident,
} from '@/lib/client-portal'
import {
  formatPortalDate,
  getPortalDeviceLabel,
  getPortalDeviceLocation,
  getPortalTone,
} from '@/lib/client-portal/presentation'
import type {
  PortalActivityItem,
  PortalDevice,
  PortalEvidenceItem,
  PortalIncident,
} from '@/types/client-portal'

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params
  const session = await getCurrentAuthSession()
  if (!session || session.user.role !== 'client') {
    redirect(`/login?next=/app/properties/${propertyId}`)
  }

  const site = await getPortalSiteForUser(session.user, propertyId)
  if (!site) notFound()

  const devices = (site.devices || []) as PortalDevice[]
  const activity = getPortalActivityFeed([site]).slice(0, 10) as PortalActivityItem[]
  const evidence = getPortalEvidenceGallery(site).slice(0, 8) as PortalEvidenceItem[]
  const incidents = ((site.incidents || []) as PortalIncident[])
    .filter(isOpenPortalIncident)
    .sort((left, right) => {
      const leftDate = new Date(left.createdAt || 0).getTime()
      const rightDate = new Date(right.createdAt || 0).getTime()
      return rightDate - leftDate
    })

  const cameras = devices.filter(
    (device) => device.tipo === 'camara_ip' || device.tipo === 'camara_analogica'
  )
  const activeDevices = devices.filter((device) =>
    ['activo', 'active', 'online', 'ok'].includes(
      String(device.estado || device.status || '').toLowerCase()
    )
  ).length
  const devicesWithAttention = Math.max(0, devices.length - activeDevices)
  const overallStatus = incidents.length > 0 || devicesWithAttention > 0 ? 'Atención requerida' : 'Operativo'

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" className="px-0 text-white/60 hover:bg-transparent hover:text-white">
          <Link href="/app#propiedades">
            <ArrowLeft className="h-4 w-4" />
            Volver a propiedades
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contacto">
            <Headphones className="h-4 w-4" />
            Solicitar ayuda
          </Link>
        </Button>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(77,163,217,0.22),transparent_36%),rgba(255,255,255,0.045)]">
        {site.imageUrl ? (
          <div className="relative h-52 overflow-hidden border-b border-white/10 sm:h-64">
            <img src={site.imageUrl} alt={site.imageAlt || site.label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081624] via-[#081624]/35 to-transparent" />
          </div>
        ) : null}

        <div className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <PortalStatusBadge tone={getPortalTone(site.status || overallStatus)}>
                  {site.statusLabel || overallStatus}
                </PortalStatusBadge>
                <span className="inline-flex items-center gap-1 text-xs text-white/45">
                  <MapPin className="h-3.5 w-3.5" />
                  {site.address || site.location || site.organizationName || 'Propiedad del cliente'}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-light tracking-tight text-white sm:text-4xl">
                {site.label || site.name || 'Propiedad'}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-white/60">
                {site.profile?.summary || 'Estado de seguridad, dispositivos, incidentes y actividad de esta propiedad.'}
              </p>
            </div>
            <p className="text-sm text-white/45">Última actualización: {formatPortalDate(site.lastUpdatedAt)}</p>
          </div>
        </div>
      </section>

      <section aria-label="Resumen de propiedad" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard icon={Wifi} label="Dispositivos" value={site.deviceCount || devices.length} detail={`${activeDevices} disponibles`} />
        <PortalStatCard icon={Camera} label="Cámaras" value={site.cameraCount || cameras.length} detail="Vistas asociadas a la propiedad" />
        <PortalStatCard icon={BellRing} label="Equipos con atención" value={devicesWithAttention} detail={devicesWithAttention > 0 ? 'Requieren revisión' : 'Todos disponibles'} />
        <PortalStatCard icon={Siren} label="Incidentes abiertos" value={incidents.length} detail={incidents.length > 0 ? 'Actualmente en seguimiento' : 'Sin incidentes pendientes'} />
      </section>

      <section id="incidentes" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-white/[0.04]">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <PortalSectionHeading eyebrow="Incidentes" title="Situaciones en seguimiento" />
            <Siren className="h-5 w-5 text-rose-200" strokeWidth={1.6} />
          </CardHeader>
          <CardContent>
            {incidents.length === 0 ? (
              <PortalEmptyState title="Sin incidentes abiertos" detail="No existen situaciones pendientes en esta propiedad." />
            ) : (
              <div className="space-y-3">
                {incidents.map((incident, index) => (
                  <div key={incident.id || index} className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-3">
                        <span className="mt-0.5 rounded-xl bg-rose-400/10 p-2 text-rose-200">
                          <CircleAlert className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white">{incident.title || incident.type || 'Incidente'}</p>
                          <p className="mt-1 text-xs text-white/45">{incident.description || formatPortalDate(incident.createdAt)}</p>
                          {incident.responsible || incident.assignee ? (
                            <p className="mt-2 text-xs text-white/55">Responsable: {incident.responsible || incident.assignee}</p>
                          ) : null}
                        </div>
                      </div>
                      <PortalStatusBadge tone={getPortalTone(incident.status)}>
                        {incident.statusLabel || incident.status || 'Abierto'}
                      </PortalStatusBadge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.04]">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <PortalSectionHeading eyebrow="Estado" title="Lectura rápida" />
            <ShieldCheck className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.6} />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/35">Estado general</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-lg font-light text-white">{overallStatus}</p>
                <PortalStatusBadge tone={getPortalTone(overallStatus)}>{overallStatus}</PortalStatusBadge>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/35">Acción recomendada</p>
              <p className="mt-3 text-sm leading-6 text-white/65">
                {incidents.length > 0
                  ? 'Revisar los incidentes abiertos y confirmar que exista un responsable asignado.'
                  : devicesWithAttention > 0
                    ? 'Revisar los equipos que requieren atención y solicitar soporte si el estado persiste.'
                    : 'No se requieren acciones. Mantener el seguimiento normal de la propiedad.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {cameras.length > 0 ? (
        <section id="camaras" className="space-y-4">
          <PortalSectionHeading
            eyebrow="Cámaras"
            title="Vistas disponibles"
            description="Revisa las cámaras asociadas a esta propiedad."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cameras.map((device, index) => (
              <div key={device.id || index} className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04]">
                <div className="relative h-52 overflow-hidden bg-[#071524]">
                  <CameraSnapshot deviceId={device.id} alt={getPortalDeviceLabel(device)} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071524] via-transparent to-transparent" />
                  <PortalStatusBadge
                    className="absolute left-3 top-3"
                    tone={getPortalTone(device.estado || device.status)}
                  >
                    {device.statusLabel || device.estado || device.status || 'Disponible'}
                  </PortalStatusBadge>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-white">{getPortalDeviceLabel(device)}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-white/45">
                    <MapPin className="h-3 w-3" />
                    {getPortalDeviceLocation(device)}
                  </p>
                  <p className="mt-2 text-xs text-white/35">Actualizado: {formatPortalDate(device.updatedAt || device.lastSeenAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section id="dispositivos" className="space-y-4">
        <PortalSectionHeading
          eyebrow="Dispositivos"
          title="Equipos de la propiedad"
          description="Nombre, ubicación, estado y última comunicación. Sin configuraciones técnicas innecesarias."
        />

        {devices.length === 0 ? (
          <PortalEmptyState title="Sin dispositivos registrados" detail="Los equipos asociados aparecerán aquí." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {devices.map((device, index) => (
              <div key={device.id || index} className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 rounded-xl bg-[#4DA3D9]/10 p-2 text-[#9DD2F2]">
                    {device.tipo?.includes('camara') ? <Camera className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{getPortalDeviceLabel(device)}</p>
                    <p className="mt-1 truncate text-xs text-white/45">{getPortalDeviceLocation(device)}</p>
                    <p className="mt-2 text-xs text-white/35">Última comunicación: {formatPortalDate(device.updatedAt || device.lastSeenAt)}</p>
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

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card id="evidencia" className="border-white/10 bg-white/[0.04]">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <PortalSectionHeading eyebrow="Evidencia" title="Registros recientes" />
            <FileText className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.6} />
          </CardHeader>
          <CardContent>
            {evidence.length === 0 ? (
              <PortalEmptyState title="Sin evidencia reciente" detail="Las fotos, documentos y registros relacionados aparecerán aquí." />
            ) : (
              <div className="space-y-3">
                {evidence.map((item, index) => (
                  <div key={item.id || index} className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                    <p className="text-sm font-medium text-white">{item.title || item.label || item.type || 'Registro'}</p>
                    <p className="mt-1 text-xs leading-5 text-white/45">{item.description || item.evidence || item.action || 'Evidencia disponible para revisión.'}</p>
                    <p className="mt-2 text-xs text-white/35">{formatPortalDate(item.createdAt || item.updatedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="actividad" className="border-white/10 bg-white/[0.04]">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <PortalSectionHeading eyebrow="Actividad" title="Últimos cambios" />
            <Clock3 className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.6} />
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <PortalEmptyState title="Sin actividad reciente" detail="Los nuevos eventos aparecerán aquí." />
            ) : (
              <div className="divide-y divide-white/10">
                {activity.map((item, index) => (
                  <div key={item.id || index} className="py-4 first:pt-0 last:pb-0">
                    <p className="text-sm text-white">{item.title || item.label || item.description || 'Actividad registrada'}</p>
                    <p className="mt-1 text-xs text-white/45">{item.detail || formatPortalDate(item.createdAt || item.updatedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-[24px] border border-[#4DA3D9]/25 bg-[#4DA3D9]/8 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Soporte SegurIA</p>
          <h2 className="mt-2 text-xl font-light text-white">¿Hay algo que necesites revisar?</h2>
          <p className="mt-2 text-sm text-white/55">Solicita asistencia sin navegar por configuraciones técnicas.</p>
        </div>
        <Button asChild className="mt-5 bg-[#4DA3D9] text-[#06111D] hover:bg-[#6BB6E5] sm:mt-0">
          <Link href="/contacto">
            <Headphones className="h-4 w-4" />
            Contactar soporte
          </Link>
        </Button>
      </section>
    </div>
  )
}

// @ts-nocheck
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  BellRing,
  Building2,
  Camera,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  Headphones,
  MapPin,
  ShieldCheck,
  Siren,
  Wifi,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CameraSnapshot } from '@/components/camera-snapshot'
import { getCurrentAuthSession } from '@/lib/auth-store'
import {
  getAccessiblePortalSites,
  getPortalActivityFeed,
  getPortalAlertDevices,
  getPortalDashboardTotals,
  isOpenPortalIncident,
} from '@/lib/client-portal'

function formatDate(value?: Date | string | null) {
  if (!value) return 'Sin actualización'

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin actualización'

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function statusTone(status?: string) {
  const normalized = String(status || '').toLowerCase()
  if (['operativo', 'online', 'ok', 'active', 'activo'].includes(normalized)) {
    return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
  }
  if (['revision', 'mantencion', 'degraded', 'warning', 'atencion'].includes(normalized)) {
    return 'border-amber-400/30 bg-amber-400/10 text-amber-100'
  }
  return 'border-rose-400/30 bg-rose-400/10 text-rose-100'
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  detail: string
}) {
  return (
    <Card className="border-white/10 bg-white/[0.045]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-3 text-3xl font-light text-white">{value}</p>
            <p className="mt-2 text-sm text-white/50">{detail}</p>
          </div>
          <div className="rounded-2xl bg-[#4DA3D9]/12 p-3 text-[#9DD2F2]">
            <Icon className="h-5 w-5" strokeWidth={1.7} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-5 py-8 text-center">
      <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-300" strokeWidth={1.6} />
      <p className="mt-3 text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-sm text-white/50">{detail}</p>
    </div>
  )
}

export default async function ClientAppPage() {
  const session = await getCurrentAuthSession()
  if (!session || session.user.role !== 'client') {
    redirect('/login?next=/app')
  }

  let sites: any[] = []
  try {
    sites = await getAccessiblePortalSites(session.user)
  } catch {
    sites = []
  }

  const totals = getPortalDashboardTotals(sites)
  const alerts = getPortalAlertDevices(sites)
  const activity = getPortalActivityFeed(sites).slice(0, 8)
  const incidents = sites
    .flatMap((site) =>
      (site.incidents || [])
        .filter(isOpenPortalIncident)
        .map((incident: any) => ({ site, incident }))
    )
    .sort((left, right) => {
      const leftDate = new Date(left.incident.createdAt || 0).getTime()
      const rightDate = new Date(right.incident.createdAt || 0).getTime()
      return rightDate - leftDate
    })
    .slice(0, 6)

  const cameras = sites
    .flatMap((site) =>
      (site.devices || [])
        .filter((device: any) => device.tipo === 'camara_ip' || device.tipo === 'camara_analogica')
        .map((device: any) => ({ site, device }))
    )
    .slice(0, 4)

  const attentionRequired = alerts.length + incidents.length
  const overallStatus = attentionRequired > 0 ? 'Atención requerida' : 'Todo operativo'

  return (
    <div className="space-y-8 pb-12">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(77,163,217,0.2),transparent_34%),rgba(255,255,255,0.045)] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={attentionRequired > 0 ? statusTone('revision') : statusTone('operativo')}>
                {overallStatus}
              </Badge>
              <span className="text-xs text-white/45">Actualizado ahora</span>
            </div>
            <h1 className="mt-5 text-3xl font-light tracking-tight text-white sm:text-4xl">
              Hola, {session.user.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/60">
              Aquí tienes el estado de tus propiedades, alertas e incidentes. Lo importante aparece primero para que puedas actuar sin revisar información técnica.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="#incidentes">
                <Siren className="h-4 w-4" />
                Ver incidentes
              </Link>
            </Button>
            <Button asChild className="bg-[#4DA3D9] text-[#06111D] hover:bg-[#6BB6E5]">
              <Link href="/contacto">
                <Headphones className="h-4 w-4" />
                Solicitar ayuda
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section aria-label="Estado general" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Building2} label="Propiedades" value={totals.sites || sites.length} detail="Sitios bajo seguimiento" />
        <StatCard icon={Wifi} label="Dispositivos" value={totals.devices || 0} detail="Equipos registrados" />
        <StatCard icon={BellRing} label="Alertas activas" value={alerts.length} detail={alerts.length > 0 ? 'Requieren revisión' : 'Sin alertas pendientes'} />
        <StatCard icon={Siren} label="Incidentes abiertos" value={incidents.length} detail={incidents.length > 0 ? 'Actualmente en seguimiento' : 'Sin incidentes abiertos'} />
      </section>

      <section id="propiedades" className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Mis propiedades</p>
            <h2 className="mt-2 text-2xl font-light text-white">Estado por ubicación</h2>
            <p className="mt-2 text-sm text-white/50">Entra a una propiedad para revisar sus cámaras, equipos e incidentes.</p>
          </div>
        </div>

        {sites.length === 0 ? (
          <EmptyState title="Todavía no hay propiedades disponibles" detail="Cuando tu cuenta sea asociada a una propiedad aparecerá aquí." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sites.map((site) => {
              const openSiteIncidents = (site.incidents || []).filter(isOpenPortalIncident)
              const status = site.statusLabel || (openSiteIncidents.length > 0 ? 'Atención requerida' : 'Operativo')

              return (
                <Link
                  key={site.propertyId}
                  href={`/app/properties/${site.propertyId}`}
                  className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] transition hover:-translate-y-0.5 hover:border-[#4DA3D9]/35 hover:bg-white/[0.06]"
                >
                  <div className="relative h-44 overflow-hidden bg-[#071524]">
                    {site.imageUrl ? (
                      <img src={site.imageUrl} alt={site.imageAlt || site.label} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/25">
                        <Building2 className="h-12 w-12" strokeWidth={1.3} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071524] via-[#071524]/30 to-transparent" />
                    <Badge className={`absolute left-4 top-4 ${statusTone(site.status)}`}>{status}</Badge>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-white/35">{site.organizationName || 'Mi empresa'}</p>
                        <h3 className="mt-1 text-xl font-light text-white">{site.label || site.name || 'Propiedad'}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">{site.profile?.summary || 'Resumen de seguridad y actividad de la propiedad.'}</p>
                      </div>
                      <ArrowRight className="mt-1 h-5 w-5 text-[#9DD2F2] transition group-hover:translate-x-1" />
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-[#0B1D30] p-3">
                        <p className="text-xs text-white/40">Cámaras</p>
                        <p className="mt-1 text-lg text-white">{site.cameraCount || 0}</p>
                      </div>
                      <div className="rounded-2xl bg-[#0B1D30] p-3">
                        <p className="text-xs text-white/40">Sensores</p>
                        <p className="mt-1 text-lg text-white">{site.sensorCount || 0}</p>
                      </div>
                      <div className="rounded-2xl bg-[#0B1D30] p-3">
                        <p className="text-xs text-white/40">Incidentes</p>
                        <p className="mt-1 text-lg text-white">{openSiteIncidents.length}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section id="incidentes" className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/10 bg-white/[0.04]">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Incidentes</p>
              <CardTitle className="mt-2 text-2xl font-light text-white">En seguimiento</CardTitle>
            </div>
            <Siren className="h-5 w-5 text-rose-200" strokeWidth={1.6} />
          </CardHeader>
          <CardContent>
            {incidents.length === 0 ? (
              <EmptyState title="Sin incidentes abiertos" detail="No hay situaciones pendientes en este momento." />
            ) : (
              <div className="space-y-3">
                {incidents.map(({ site, incident }) => (
                  <Link
                    key={`${site.propertyId}-${incident.id}`}
                    href={`/app/properties/${site.propertyId}`}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-[#0B1D30] p-4 transition hover:border-[#4DA3D9]/35"
                  >
                    <div className="flex min-w-0 gap-3">
                      <span className="mt-0.5 rounded-xl bg-rose-400/10 p-2 text-rose-200">
                        <CircleAlert className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{incident.title || incident.type || 'Incidente'}</p>
                        <p className="mt-1 truncate text-xs text-white/45">{site.label || site.name} · {formatDate(incident.createdAt)}</p>
                      </div>
                    </div>
                    <Badge className={statusTone(incident.status)}>{incident.statusLabel || incident.status || 'Abierto'}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.04]">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Alertas</p>
              <CardTitle className="mt-2 text-2xl font-light text-white">Revisión necesaria</CardTitle>
            </div>
            <BellRing className="h-5 w-5 text-amber-200" strokeWidth={1.6} />
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <EmptyState title="Sin alertas activas" detail="Los equipos no reportan problemas pendientes." />
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 6).map((item: any, index: number) => {
                  const device = item.device || item
                  const site = item.site
                  return (
                    <div key={device.id || index} className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">{device.name || device.nombre || 'Equipo con alerta'}</p>
                          <p className="mt-1 text-xs text-white/45">{site?.label || device.location || device.ubicacion || 'Ubicación disponible en la propiedad'}</p>
                        </div>
                        <Badge className={statusTone(device.status || device.estado)}>{device.statusLabel || device.status || device.estado || 'Revisar'}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {cameras.length > 0 && (
        <section id="camaras" className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Cámaras</p>
            <h2 className="mt-2 text-2xl font-light text-white">Vistas recientes</h2>
            <p className="mt-2 text-sm text-white/50">Acceso rápido a las cámaras disponibles en tus propiedades.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cameras.map(({ site, device }, index) => (
              <Link key={device.id || index} href={`/app/properties/${site.propertyId}`} className="group overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] transition hover:border-[#4DA3D9]/35">
                <div className="relative h-44 overflow-hidden bg-[#071524]">
                  <CameraSnapshot deviceId={device.id} alt={device.name || 'Cámara'} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071524] via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#071524]/80 px-3 py-1 text-[11px] text-white/70">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Disponible
                  </span>
                </div>
                <div className="p-4">
                  <p className="truncate text-sm font-medium text-white">{device.name || device.nombre || 'Cámara'}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-white/45">
                    <MapPin className="h-3 w-3" />
                    {site.label || site.name || 'Propiedad'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="actividad" className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/10 bg-white/[0.04]">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#9DD2F2]">Actividad reciente</p>
              <CardTitle className="mt-2 text-2xl font-light text-white">Últimos cambios</CardTitle>
            </div>
            <Clock3 className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.6} />
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <EmptyState title="Sin actividad reciente" detail="Los nuevos eventos aparecerán aquí." />
            ) : (
              <div className="divide-y divide-white/10">
                {activity.map((item: any, index: number) => (
                  <div key={item.id || index} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                    <span className="mt-0.5 rounded-xl bg-white/5 p-2 text-[#9DD2F2]">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white">{item.title || item.label || item.description || 'Actividad registrada'}</p>
                      <p className="mt-1 text-xs text-white/45">{item.detail || item.siteLabel || formatDate(item.createdAt || item.updatedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#4DA3D9]/25 bg-[#4DA3D9]/8">
          <CardHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
              <Headphones className="h-5 w-5" />
            </div>
            <CardTitle className="pt-3 text-2xl font-light text-white">¿Necesitas ayuda?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-white/55">Contacta al equipo de SegurIA para reportar un problema, solicitar una revisión o resolver una duda sobre tu servicio.</p>
            <Button asChild className="mt-5 w-full bg-[#4DA3D9] text-[#06111D] hover:bg-[#6BB6E5]">
              <Link href="/contacto">Contactar soporte</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldAlert,
  Signal,
  Sparkles,
  Wifi,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CameraStreamControl } from '@/components/camera-stream-control'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { getPortalActivityFeed, getPortalDeviceBuckets, getPortalSiteForUser } from '@/lib/client-portal'

function formatDate(value?: Date) {
  if (!value) return 'Sin actualizacion'
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function getStatusTone(status: string) {
  if (status === 'operativo') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
  if (status === 'revision') return 'border-amber-400/30 bg-amber-400/10 text-amber-100'
  return 'border-rose-400/30 bg-rose-400/10 text-rose-100'
}

function getGroupTone(group: string) {
  if (group === 'camera') return 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100'
  if (group === 'sensor') return 'border-sky-400/25 bg-sky-400/10 text-sky-100'
  if (group === 'alert') return 'border-rose-400/25 bg-rose-400/10 text-rose-100'
  if (group === 'access') return 'border-amber-400/25 bg-amber-400/10 text-amber-100'
  return 'border-white/10 bg-white/5 text-white/70'
}

function groupLabel(group: string) {
  if (group === 'camera') return 'Camaras'
  if (group === 'sensor') return 'Sensores'
  if (group === 'alert') return 'Alertas'
  if (group === 'access') return 'Accesos'
  return 'Otros'
}

function countDevices(devices: { tipo: string }[], target: string[]) {
  return devices.filter((device) => target.includes(device.tipo)).length
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params
  const session = await getCurrentAuthSession()
  if (!session || session.user.role !== 'client') {
    redirect('/admin')
  }

  const site = await getPortalSiteForUser(session.user, propertyId)
  if (!site) {
    notFound()
  }

  const activity = getPortalActivityFeed([site])
  const buckets = getPortalDeviceBuckets(site.devices)
  const cameraCount = countDevices(site.devices, ['camara_ip', 'camara_analogica'])
  const sensorCount = countDevices(site.devices, ['sensor_movimiento', 'sensor_temperatura', 'sensor_humedad', 'sensor_puerta'])
  const accessCount = countDevices(site.devices, ['control_acceso'])
  const activeCount = site.devices.filter((device) => device.estado === 'activo').length

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(77,163,217,0.18),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(77,163,217,0.06)_0%,transparent_42%,rgba(255,255,255,0.03)_100%)]" />
        <div className="relative space-y-6">
          <Button asChild variant="ghost" className="w-fit rounded-full px-0 text-white/60 hover:bg-transparent hover:text-white">
            <Link href="/app">
              <ArrowLeft className="h-4 w-4" />
              Volver al portal
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={getStatusTone(site.status)}>{site.statusLabel}</Badge>
                <Badge variant="outline" className="border-white/10 bg-white/5 text-white/60">
                  Sitio cliente
                </Badge>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-light text-white text-balance md:text-5xl">{site.label}</h1>
                <p className="max-w-3xl text-base leading-7 text-white/65 md:text-lg">
                  Vista premium para leer el sitio sin esfuerzo: que hay instalado, que esta activo y que conviene
                  revisar primero.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoTile label="Ubicacion" value={site.location} icon={MapPin} />
                <InfoTile label="Camaras" value={cameraCount.toString()} icon={Camera} />
                <InfoTile label="Sensores" value={sensorCount.toString()} icon={Signal} />
                <InfoTile label="Accesos" value={accessCount.toString()} icon={Wifi} />
              </div>
            </div>

            <Card className="border-white/10 bg-[#071524]/80 shadow-none backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.8} />
                  <CardTitle className="text-lg font-normal text-white">Resumen rapido</CardTitle>
                </div>
                <CardDescription className="text-white/55">Lectura ejecutiva de la operacion del sitio.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <MiniMetric label="Dispositivos" value={site.deviceCount} />
                <MiniMetric label="Activos" value={activeCount} />
                <MiniMetric label="Documentos" value={site.documentCount} />
                <MiniMetric label="Alertas" value={site.alertCount} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Equipos del sitio</CardTitle>
            <CardDescription className="text-white/55">
              Equipos agrupados por tipo para entender la operacion de un vistazo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {buckets.map((bucket) => (
              <div key={bucket.key} className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white">{groupLabel(bucket.key)}</p>
                    <p className="mt-1 text-sm text-white/45">
                      {bucket.count} {bucket.count === 1 ? 'equipo' : 'equipos'}
                    </p>
                  </div>
                  <Badge className={getGroupTone(bucket.key)}>{bucket.count}</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {bucket.devices.slice(0, 4).map((device) => (
                    <div key={device.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white">{device.displayName || device.marca || 'Equipo'}</p>
                          <p className="mt-1 text-xs text-white/45">{device.ubicacionDescripcion || 'Sin ubicacion'}</p>
                        </div>
                        <Badge
                          className={
                            device.estado === 'activo'
                              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                              : device.estado === 'mantencion'
                                ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
                                : 'border-rose-400/30 bg-rose-400/10 text-rose-100'
                          }
                        >
                          {device.estado === 'activo' ? 'Activo' : device.estado === 'mantencion' ? 'Revision' : 'Alerta'}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-white/60">{device.notas || 'Sin notas'}</p>
                      {bucket.key === 'camera' && <CameraStreamControl deviceId={device.id} />}
                    </div>
                  ))}
                  {bucket.count === 0 && <p className="text-sm text-white/45">Sin equipos cargados.</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-normal text-white">Evidencia y documentos</CardTitle>
              <CardDescription className="text-white/55">Capturas, reportes y material seguro del sitio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {site.documents.length === 0 ? (
                <p className="py-6 text-sm text-white/55">No hay evidencia publicada todavia.</p>
              ) : (
                site.documents.map((document) => (
                  <div key={document.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
                      <FileText className="h-4 w-4" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white">{document.titulo}</p>
                      <p className="mt-1 text-sm text-white/55">{document.archivoNombre || document.autor}</p>
                    </div>
                    <p className="whitespace-nowrap text-xs text-white/40">{formatDate(document.fechaActualizacion)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-normal text-white">Siguiente paso</CardTitle>
              <CardDescription className="text-white/55">Lo que conviene revisar primero.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {site.alertCount > 0 ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                  Hay equipos que requieren revision. Este sitio debe revisarse antes de cerrar el dia.
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                  El sitio esta estable y listo para monitoreo normal.
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  'Confirmar equipos visibles para el cliente.',
                  'Subir documentos y reportes del sitio.',
                  'Revisar alertas antes de la siguiente visita.',
                  'Compartir acceso al equipo correspondiente.',
                ].map((step) => (
                  <div key={step} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" strokeWidth={1.8} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Actividad reciente</CardTitle>
            <CardDescription className="text-white/55">Ultimos cambios visibles del sitio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <p className="py-6 text-sm text-white/55">Sin actividad reciente para este sitio.</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
                    {item.kind === 'event' ? (
                      <ShieldAlert className="h-4 w-4" strokeWidth={1.8} />
                    ) : item.kind === 'device' ? (
                      item.status === 'falla' ? (
                        <ShieldAlert className="h-4 w-4" strokeWidth={1.8} />
                      ) : (
                        <Wifi className="h-4 w-4" strokeWidth={1.8} />
                      )
                    ) : (
                      <FileText className="h-4 w-4" strokeWidth={1.8} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-white">{item.title}</p>
                      <Badge variant="outline" className="border-white/10 bg-white/5 text-white/60">
                        {item.kind === 'event' ? 'Evento' : item.kind === 'device' ? 'Equipo' : 'Documento'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-white/55">{item.detail}</p>
                  </div>
                  <p className="whitespace-nowrap text-xs text-white/40">{formatDate(item.at)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Lectura del sitio</CardTitle>
            <CardDescription className="text-white/55">
              Lo que el cliente entiende en segundos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              'Una vista limpia del sitio completo.',
              'Camaras, sensores y accesos agrupados.',
              'Alertas y documentos sin ruido.',
              'Soporte con contexto real del sitio.',
            ].map((text) => (
              <div key={text} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" strokeWidth={1.8} />
                <span>{text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function InfoTile({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof MapPin
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
          <p className="mt-1 text-sm text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 text-2xl font-light text-white">{value}</p>
    </div>
  )
}

import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Camera, CheckCircle2, FileText, MapPin, ShieldAlert, Signal, Wifi } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getAuthSessionFromToken } from '@/lib/auth-store'
import { getPortalActivityFeed, getPortalSiteForUser } from '@/lib/client-portal'

function formatDate(value?: Date) {
  if (!value) return 'Sin actualización'
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

function countDevices(devices: { tipo: string }[], target: string[]) {
  return devices.filter((device) => target.includes(device.tipo)).length
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('seguria_session')?.value || null

  if (!token) {
    redirect(`/login?next=/app/properties/${propertyId}`)
  }

  const session = await getAuthSessionFromToken(token)
  if (!session || session.user.role !== 'client') {
    redirect('/admin')
  }

  const site = getPortalSiteForUser(session.user, propertyId)
  if (!site) {
    notFound()
  }

  const activity = getPortalActivityFeed([site])
  const cameraCount = countDevices(site.devices, ['camara_ip', 'camara_analogica'])
  const sensorCount = countDevices(site.devices, ['sensor_movimiento', 'sensor_temperatura', 'sensor_humedad', 'sensor_puerta'])
  const accessCount = countDevices(site.devices, ['control_acceso'])
  const activeCount = site.devices.filter((device) => device.estado === 'activo').length

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <Button asChild variant="ghost" className="w-fit rounded-full px-0 text-white/60 hover:bg-transparent hover:text-white">
          <Link href="/app">
            <ArrowLeft className="h-4 w-4" />
            Volver al portal
          </Link>
        </Button>

        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={getStatusTone(site.status)}>{site.statusLabel}</Badge>
              <Badge variant="outline" className="border-white/10 bg-white/5 text-white/60">
                Sitio cliente
              </Badge>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-normal text-white">{site.label}</CardTitle>
              <CardDescription className="max-w-3xl text-base text-white/65">
                Vista simple para entender qué hay instalado, qué está activo y qué requiere atención.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoTile label="Ubicación" value={site.location} icon={MapPin} />
            <InfoTile label="Cámaras" value={cameraCount.toString()} icon={Camera} />
            <InfoTile label="Sensores" value={sensorCount.toString()} icon={Signal} />
            <InfoTile label="Accesos" value={accessCount.toString()} icon={Wifi} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Equipos del sitio</CardTitle>
            <CardDescription className="text-white/55">
              Estado general y tipo de cada equipo visible para el cliente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {site.devices.length === 0 ? (
              <p className="py-6 text-sm text-white/55">Todavía no hay equipos cargados para este sitio.</p>
            ) : (
              site.devices.map((device) => (
                <div key={device.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-white">{device.displayName || device.marca || 'Equipo'}</p>
                      <p className="mt-1 text-sm text-white/55">
                        {device.ubicacionDescripcion || 'Ubicación por definir'}
                      </p>
                    </div>
                    <Badge className={device.estado === 'activo' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : device.estado === 'mantencion' ? 'border-amber-400/30 bg-amber-400/10 text-amber-100' : 'border-rose-400/30 bg-rose-400/10 text-rose-100'}>
                      {device.estado === 'activo' ? 'Activo' : device.estado === 'mantencion' ? 'En revisión' : 'Con alerta'}
                    </Badge>
                  </div>
                  <Separator className="my-4 bg-white/10" />
                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <Row label="Tipo" value={device.tipo.replace(/_/g, ' ')} />
                    <Row label="Actualización" value={formatDate(device.lastSeenAt || device.fechaActualizacion)} />
                    <Row label="Notas" value={device.notas || 'Sin notas'} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-normal text-white">Resumen del sitio</CardTitle>
              <CardDescription className="text-white/55">Lo esencial para operación y soporte.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <MiniMetric label="Dispositivos" value={site.deviceCount} />
              <MiniMetric label="Activos" value={activeCount} />
              <MiniMetric label="Documentos" value={site.documentCount} />
              <MiniMetric label="Alertas" value={site.alertCount} />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-normal text-white">Documentos disponibles</CardTitle>
              <CardDescription className="text-white/55">Propuestas, reportes y material del sitio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {site.documents.length === 0 ? (
                <p className="py-6 text-sm text-white/55">No hay documentos publicados todavía.</p>
              ) : (
                site.documents.map((document) => (
                  <div key={document.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
                      <FileText className="h-4 w-4" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white">{document.titulo}</p>
                      <p className="mt-1 text-sm text-white/55">{document.autor}</p>
                    </div>
                    <p className="whitespace-nowrap text-xs text-white/40">{formatDate(document.fechaActualizacion)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Actividad reciente</CardTitle>
            <CardDescription className="text-white/55">Últimos cambios visibles del sitio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <p className="py-6 text-sm text-white/55">Sin actividad reciente para este sitio.</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
                    {item.kind === 'device' ? (
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
                        {item.kind === 'device' ? 'Equipo' : 'Documento'}
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
            <CardTitle className="text-lg font-normal text-white">Siguiente paso</CardTitle>
            <CardDescription className="text-white/55">Lo que conviene revisar primero.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {site.alertCount > 0 ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                Hay equipos que requieren revisión. Este sitio debe revisarse antes de cerrar el día.
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                El sitio está estable y listo para monitoreo normal.
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1 text-white/80">{value}</p>
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

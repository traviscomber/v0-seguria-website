import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  Building2,
  Camera,
  CheckCircle2,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wifi,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getAuthSessionFromToken } from '@/lib/auth-store'
import {
  getAccessiblePortalSites,
  getPortalActivityFeed,
  getPortalDashboardTotals,
  getPortalDeviceBuckets,
} from '@/lib/client-portal'

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

export default async function ClientAppPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('seguria_session')?.value || null

  if (!token) {
    redirect('/login?next=/app')
  }

  const session = await getAuthSessionFromToken(token)
  if (!session || session.user.role !== 'client') {
    redirect('/login?next=/app')
  }

  const user = session.user
  const sites = getAccessiblePortalSites(user)
  const totals = getPortalDashboardTotals(sites)
  const activity = getPortalActivityFeed(sites)
  const primarySite = sites[0]

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(77,163,217,0.2),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.26)] lg:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(77,163,217,0.06)_0%,transparent_40%,rgba(255,255,255,0.03)_100%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <Badge className="w-fit border-[#4DA3D9]/30 bg-[#4DA3D9]/15 text-[#9DD2F2] hover:bg-[#4DA3D9]/15">
              Portal de cliente
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-light text-white text-balance md:text-5xl">
                Una experiencia premium para ver y entender tu seguridad sin ruido.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/68 md:text-lg">
                SegurIA te muestra sitios, camaras, sensores, accesos y alertas en una sola vista clara. Tu equipo
                ve contexto, el cliente ve control.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="rounded-full bg-[#4DA3D9] text-white hover:bg-[#4DA3D9]/90">
                <Link href={primarySite ? `/app/properties/${primarySite.propertyId}` : '/contacto'}>
                  Abrir sitio principal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                <Link href="/contacto">Pedir soporte</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat label="Sitios" value={totals.sites} accent="bg-[#4DA3D9]/15" />
              <MiniStat label="Equipos" value={totals.devices} accent="bg-white/5" />
              <MiniStat label="Alertas" value={totals.alerts} accent="bg-rose-400/10" />
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-white/10 bg-[#071524]/80 shadow-none backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.8} />
                  <CardTitle className="text-lg font-normal text-white">Estado general</CardTitle>
                </div>
                <CardDescription className="text-white/55">
                  Una lectura rapida para saber si todo esta listo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
                      <Building2 className="h-5 w-5" strokeWidth={1.7} />
                    </div>
                    <div>
                      <p className="text-sm text-white/45">Sitio principal</p>
                      <p className="text-white">{primarySite?.label || 'Sin sitio asignado'}</p>
                    </div>
                  </div>
                  <Badge className={primarySite ? getStatusTone(primarySite.status) : 'border-white/10 bg-white/5 text-white/60'}>
                    {primarySite?.statusLabel || 'Pendiente'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MiniMetric label="Documentos" value={totals.documents} />
                  <MiniMetric label="Sensores" value={totals.sensors} />
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                  <p className="text-sm text-white/45">Ultima actualizacion</p>
                  <p className="mt-2 text-sm text-white">{formatDate(primarySite?.lastUpdatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              <MicroProof label="Portal simple" value="1" />
              <MicroProof label="Lectura clara" value="100%" />
            </div>
          </div>
        </div>
      </section>

      <section id="sitios" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/40">Sitios</p>
            <h2 className="mt-2 text-2xl font-normal text-white">Tus propiedades</h2>
          </div>
          <p className="text-sm text-white/45">Cada tarjeta resume equipos agrupados por tipo.</p>
        </div>

        {sites.length === 0 ? (
          <Card className="border-white/10 bg-white/5 shadow-none">
            <CardContent className="py-12 text-center text-white/60">
              Todavia no hay sitios asociados a esta cuenta.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sites.map((site) => {
              const buckets = getPortalDeviceBuckets(site.devices)
              return (
                <Card key={site.propertyId} className="border-white/10 bg-white/5 shadow-none">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl font-normal text-white">{site.label}</CardTitle>
                        <CardDescription className="mt-2 text-white/55">{site.location}</CardDescription>
                      </div>
                      <Badge className={getStatusTone(site.status)}>{site.statusLabel}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Metric label="Equipos" value={site.deviceCount} />
                      <Metric label="Camaras" value={site.cameraCount} />
                      <Metric label="Sensores" value={site.sensorCount} />
                      <Metric label="Alertas" value={site.alertCount} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {buckets.map((bucket) => (
                        <div key={bucket.key} className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-white/50">{groupLabel(bucket.key)}</p>
                            <Badge className={getGroupTone(bucket.key)}>{bucket.count}</Badge>
                          </div>
                          <div className="mt-3 space-y-2">
                            {bucket.devices.slice(0, 3).map((device) => (
                              <div key={device.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                <p className="text-sm text-white">{device.displayName || device.marca || 'Equipo'}</p>
                                <p className="text-xs text-white/45">{device.ubicacionDescripcion || 'Sin ubicacion'}</p>
                              </div>
                            ))}
                            {bucket.count === 0 && <p className="text-sm text-white/40">Sin equipos cargados</p>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1D30] px-4 py-3 text-sm">
                      <div className="text-white/55">
                        <p>Documentos</p>
                        <p className="mt-1 text-white">{site.documentCount} disponibles</p>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="rounded-full text-white hover:bg-white/10">
                        <Link href={`/app/properties/${site.propertyId}`}>Abrir</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Actividad reciente</CardTitle>
            <CardDescription className="text-white/55">Ultimos cambios detectados en equipos y documentos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <p className="py-6 text-sm text-white/55">Aun no hay actividad para mostrar.</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
                    {item.kind === 'device' ? (
                      item.status === 'falla' ? (
                        <ShieldAlert className="h-4 w-4" strokeWidth={1.8} />
                      ) : item.status === 'mantencion' ? (
                        <Wifi className="h-4 w-4" strokeWidth={1.8} />
                      ) : (
                        <Camera className="h-4 w-4" strokeWidth={1.8} />
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
            <CardTitle className="text-lg font-normal text-white">Que puede hacer el cliente</CardTitle>
            <CardDescription className="text-white/55">
              Este portal deja listo el acceso a informacion clave sin complicarlo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              'Entrar con su cuenta y ver solo sus sitios.',
              'Revisar camaras, sensores y estado general.',
              'Abrir documentos y reportes cuando los necesite.',
              'Pedir soporte sin perder contexto operativo.',
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 text-2xl font-light text-white">{value}</p>
    </div>
  )
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <div className={`rounded-2xl border border-white/10 ${accent} p-4`}>
      <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-light text-white">{value}</p>
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

function MicroProof({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4DA3D9]/15 text-[#9DD2F2]">
          <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
          <p className="mt-1 text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

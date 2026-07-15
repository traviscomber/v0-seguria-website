import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ArrowRight, Building2, Camera, CheckCircle2, FileText, ShieldAlert, Wifi } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getAuthSessionFromToken } from '@/lib/auth-store'
import {
  getAccessiblePortalSites,
  getPortalActivityFeed,
  getPortalDashboardTotals,
} from '@/lib/client-portal'

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
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader className="space-y-4">
            <Badge className="w-fit border-[#4DA3D9]/30 bg-[#4DA3D9]/15 text-[#9DD2F2] hover:bg-[#4DA3D9]/15">
              Portal de cliente
            </Badge>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-normal text-white">
                Todo lo que necesita tu operación, en un solo lugar.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base text-white/65">
                Revisa tus sitios, equipos, documentos y alertas desde una vista simple. El portal está pensado para
                que cualquier cliente lo entienda en pocos segundos.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/45">Sitios</p>
                <p className="mt-2 text-3xl font-light text-white">{totals.sites}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/45">Dispositivos</p>
                <p className="mt-2 text-3xl font-light text-white">{totals.devices}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/45">Cámaras</p>
                <p className="mt-2 text-3xl font-light text-white">{totals.cameras}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/45">Alertas</p>
                <p className="mt-2 text-3xl font-light text-white">{totals.alerts}</p>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="rounded-full bg-[#4DA3D9] text-white hover:bg-[#4DA3D9]/90">
                <Link href={primarySite ? `/app/properties/${primarySite.propertyId}` : '/contacto'}>
                  Ver sitio principal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                <Link href="/contacto">Pedir soporte</Link>
              </Button>
              <p className="text-sm text-white/45">Usuario: {user.name}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Resumen rápido</CardTitle>
            <CardDescription className="text-white/55">Lo más importante del estado actual.</CardDescription>
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
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/45">Documentos</p>
                <p className="mt-2 text-2xl font-light text-white">{totals.documents}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/45">Sensores</p>
                <p className="mt-2 text-2xl font-light text-white">{totals.sensors}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0B1D30] p-4">
              <p className="text-sm text-white/45">Última actualización</p>
              <p className="mt-2 text-sm text-white">{formatDate(primarySite?.lastUpdatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="sitios" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/40">Sitios</p>
            <h2 className="mt-2 text-2xl font-normal text-white">Tus propiedades</h2>
          </div>
          <p className="text-sm text-white/45">Cada tarjeta muestra el estado general de ese sitio.</p>
        </div>

        {sites.length === 0 ? (
          <Card className="border-white/10 bg-white/5 shadow-none">
            <CardContent className="py-12 text-center text-white/60">
              Todavía no hay sitios asociados a esta cuenta.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sites.map((site) => (
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
                    <StatMini label="Equipos" value={site.deviceCount} />
                    <StatMini label="Cámaras" value={site.cameraCount} />
                    <StatMini label="Sensores" value={site.sensorCount} />
                    <StatMini label="Alertas" value={site.alertCount} />
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
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="border-white/10 bg-white/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-white">Actividad reciente</CardTitle>
            <CardDescription className="text-white/55">
              Últimos cambios detectados en equipos y documentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <p className="py-6 text-sm text-white/55">Aún no hay actividad para mostrar.</p>
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
            <CardTitle className="text-lg font-normal text-white">Qué puede hacer el cliente</CardTitle>
            <CardDescription className="text-white/55">
              Este portal deja listo el acceso a información clave sin complicarlo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              'Entrar con su cuenta y ver solo sus sitios.',
              'Revisar cámaras, sensores y estado general.',
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

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 text-2xl font-light text-white">{value}</p>
    </div>
  )
}

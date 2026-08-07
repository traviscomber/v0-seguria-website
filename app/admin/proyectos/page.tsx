import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, Building2, Camera, Eye, FolderKanban, PawPrint, RadioTower, ShieldCheck, Trees } from 'lucide-react'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type PropertyRow = {
  id: string
  organization_id: string
  name: string
  address: string | null
  status: string | null
  created_at: string
  updated_at: string
}

type OrganizationRow = {
  id: string
  name: string
  status: string | null
}

type DeviceRow = {
  id: string
  property_id: string
  kind: string | null
  status: string | null
  last_seen_at: string | null
}

type IncidentRow = {
  id: string
  property_id: string
  status: string | null
  severity: string | null
}

type GatewayRow = {
  id: string
  property_id: string
  status: string | null
  last_seen_at: string | null
}

type WildlifeCameraRow = {
  id: string
  organization_id: string | null
  name: string
  zone_label: string | null
  active: boolean
  is_demo: boolean
}

type WildlifeJobRow = {
  id: string
  organization_id: string | null
  camera_id: string | null
  status: string
  review_status: string
  zone_label: string | null
  captured_at: string | null
  created_at: string
  is_demo: boolean
}

function formatDate(value: string | null) {
  if (!value) return 'Sin actividad'
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function isOpenIncident(status: string | null) {
  return !status || !['resolved', 'closed'].includes(status)
}

function getSiteState(property: PropertyRow, devices: DeviceRow[], incidents: IncidentRow[], gateways: GatewayRow[]) {
  const openIncidents = incidents.filter((incident) => isOpenIncident(incident.status))
  const onlineGateways = gateways.filter((gateway) => gateway.status === 'online').length
  const activeDevices = devices.filter((device) => device.status === 'active' || device.status === 'online').length

  if (openIncidents.some((incident) => incident.severity === 'critical' || incident.severity === 'high')) {
    return { label: 'Atencion alta', className: 'bg-red-500/15 text-red-200 border-red-400/30' }
  }

  if (openIncidents.length > 0 || devices.some((device) => device.status === 'fault' || device.status === 'falla')) {
    return { label: 'Requiere revision', className: 'bg-amber-500/15 text-amber-200 border-amber-400/30' }
  }

  if (property.status !== 'active' || onlineGateways === 0 || activeDevices === 0) {
    return { label: 'En conexion', className: 'bg-sky-500/15 text-sky-200 border-sky-400/30' }
  }

  return { label: 'Operativo', className: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30' }
}

function isHuiloHuilo(value: string) {
  return value.toLowerCase().includes('huilo huilo') || value.toLowerCase().includes('huilo-huilo')
}

export default async function ProjectsPage() {
  const auth = await getCurrentAuthSession()
  if (!auth) redirect('/login?next=/admin/proyectos')
  if (auth.user.role === 'client') redirect('/app')

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return (
      <div className="glass-card p-8">
        <h1 className="text-3xl font-light text-white">Sitios protegidos</h1>
        <p className="mt-3 text-white/60">Falta configurar la conexion segura de datos para leer los proyectos reales.</p>
      </div>
    )
  }

  let propertiesQuery = supabase.from('properties').select('id,organization_id,name,address,status,created_at,updated_at').order('updated_at', { ascending: false })
  let organizationsQuery = supabase.from('organizations').select('id,name,status')
  let devicesQuery = supabase.from('devices').select('id,property_id,kind,status,last_seen_at')
  let incidentsQuery = supabase.from('incidents').select('id,property_id,status,severity')
  let gatewaysQuery = supabase.from('gateways').select('id,property_id,status,last_seen_at')
  let wildlifeCamerasQuery = supabase.from('wildlife_cameras').select('id,organization_id,name,zone_label,active,is_demo')
  let wildlifeJobsQuery = supabase.from('wildlife_inference_jobs').select('id,organization_id,camera_id,status,review_status,zone_label,captured_at,created_at,is_demo').order('created_at', { ascending: false }).limit(1000)

  if (auth.user.role !== 'admin') {
    if (auth.user.organizationIds.length === 0 || auth.user.propertyIds.length === 0) {
      const emptyId = '00000000-0000-0000-0000-000000000000'
      propertiesQuery = propertiesQuery.eq('id', emptyId)
      organizationsQuery = organizationsQuery.eq('id', emptyId)
      devicesQuery = devicesQuery.eq('property_id', emptyId)
      incidentsQuery = incidentsQuery.eq('property_id', emptyId)
      gatewaysQuery = gatewaysQuery.eq('property_id', emptyId)
      wildlifeCamerasQuery = wildlifeCamerasQuery.eq('organization_id', emptyId)
      wildlifeJobsQuery = wildlifeJobsQuery.eq('organization_id', emptyId)
    } else {
      propertiesQuery = propertiesQuery.in('id', auth.user.propertyIds)
      organizationsQuery = organizationsQuery.in('id', auth.user.organizationIds)
      devicesQuery = devicesQuery.in('property_id', auth.user.propertyIds)
      incidentsQuery = incidentsQuery.in('property_id', auth.user.propertyIds)
      gatewaysQuery = gatewaysQuery.in('property_id', auth.user.propertyIds)
      wildlifeCamerasQuery = wildlifeCamerasQuery.in('organization_id', auth.user.organizationIds)
      wildlifeJobsQuery = wildlifeJobsQuery.in('organization_id', auth.user.organizationIds)
    }
  }

  const [propertiesResult, organizationsResult, devicesResult, incidentsResult, gatewaysResult, wildlifeCamerasResult, wildlifeJobsResult] = await Promise.all([
    propertiesQuery,
    organizationsQuery,
    devicesQuery,
    incidentsQuery,
    gatewaysQuery,
    wildlifeCamerasQuery,
    wildlifeJobsQuery,
  ])

  const queryError = propertiesResult.error || organizationsResult.error || devicesResult.error || incidentsResult.error || gatewaysResult.error || wildlifeCamerasResult.error || wildlifeJobsResult.error
  if (queryError) {
    return (
      <div className="glass-card p-8">
        <h1 className="text-3xl font-light text-white">Sitios protegidos</h1>
        <p className="mt-3 text-red-200">No se pudo leer la operacion: {queryError.message}</p>
      </div>
    )
  }

  const scopedProperties = (propertiesResult.data || []) as PropertyRow[]
  const organizationById = new Map(((organizationsResult.data || []) as OrganizationRow[]).map((organization) => [organization.id, organization]))
  const devices = (devicesResult.data || []) as DeviceRow[]
  const incidents = (incidentsResult.data || []) as IncidentRow[]
  const gateways = (gatewaysResult.data || []) as GatewayRow[]
  const wildlifeCameras = (wildlifeCamerasResult.data || []) as WildlifeCameraRow[]
  const wildlifeJobs = (wildlifeJobsResult.data || []) as WildlifeJobRow[]

  const openIncidents = incidents.filter((incident) => isOpenIncident(incident.status)).length
  const cameraCount = devices.filter((device) => device.kind === 'camera').length
  const onlineGateways = gateways.filter((gateway) => gateway.status === 'online').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#4DA3D9]">Operacion real</p>
          <h1 className="text-3xl font-light text-white">Sitios protegidos</h1>
          <p className="mt-1 text-white/60">Cada tarjeta nace de propiedades, equipos, enlaces e incidentes activos en la base.</p>
        </div>
        <Link href="/admin/integraciones" className="btn-primary inline-flex w-fit items-center gap-2 px-4 py-2.5 text-[15px]">
          <RadioTower className="h-4 w-4" strokeWidth={1.5} />
          Conectar sitio
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Building2} label="Sitios" value={scopedProperties.length.toString()} />
        <MetricCard icon={Camera} label="Camaras" value={cameraCount.toString()} />
        <MetricCard icon={ShieldCheck} label="Enlaces online" value={onlineGateways.toString()} />
        <MetricCard icon={AlertTriangle} label="Incidentes abiertos" value={openIncidents.toString()} tone={openIncidents > 0 ? 'text-amber-200' : 'text-white'} />
      </div>

      {scopedProperties.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FolderKanban className="mx-auto mb-4 h-12 w-12 text-white/30" strokeWidth={1} />
          <p className="text-white/70">Aun no hay sitios operativos para este usuario.</p>
          <p className="mt-2 text-sm text-white/45">Cuando se cree una empresa y se conecte su instalacion, aparecera aqui.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {scopedProperties.map((property) => {
            const propertyDevices = devices.filter((device) => device.property_id === property.id)
            const propertyIncidents = incidents.filter((incident) => incident.property_id === property.id)
            const propertyGateways = gateways.filter((gateway) => gateway.property_id === property.id)
            const state = getSiteState(property, propertyDevices, propertyIncidents, propertyGateways)
            const lastSeen = propertyDevices
              .map((device) => device.last_seen_at)
              .filter(Boolean)
              .sort()
              .at(-1) || property.updated_at
            const organization = organizationById.get(property.organization_id)
            const showPreservation = isHuiloHuilo(organization?.name || '') || isHuiloHuilo(property.name)
            const orgWildlifeCameras = wildlifeCameras.filter((camera) => camera.organization_id === property.organization_id)
            const orgWildlifeJobs = wildlifeJobs.filter((job) => job.organization_id === property.organization_id)
            const activeWildlifeCameras = orgWildlifeCameras.filter((camera) => camera.active).length
            const analyzedDetections = orgWildlifeJobs.filter((job) => ['completed', 'succeeded', 'success'].includes(job.status)).length
            const pendingReview = orgWildlifeJobs.filter((job) => ['pending', 'in_review'].includes(job.review_status)).length
            const lastWildlifeCapture = orgWildlifeJobs
              .map((job) => job.captured_at || job.created_at)
              .filter(Boolean)
              .sort()
              .at(-1) || null

            return (
              <article key={property.id} className="glass-card p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-white/45">{organization?.name || 'Empresa sin nombre'}</p>
                    <h2 className="mt-1 text-xl font-light text-white">{property.name}</h2>
                    <p className="mt-1 text-sm text-white/50">{property.address || 'Direccion pendiente'}</p>
                  </div>
                  <span className={`w-fit rounded-[5px] border px-2.5 py-1 text-xs ${state.className}`}>{state.label}</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <InlineStat label="Equipos" value={propertyDevices.length.toString()} />
                  <InlineStat label="Camaras" value={propertyDevices.filter((device) => device.kind === 'camera').length.toString()} />
                  <InlineStat label="Enlaces" value={propertyGateways.length.toString()} />
                  <InlineStat label="Alertas" value={propertyIncidents.filter((incident) => isOpenIncident(incident.status)).length.toString()} />
                </div>

                {showPreservation && (
                  <section className="mt-6 rounded-[8px] border border-emerald-300/15 bg-emerald-300/[0.045] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-emerald-300/10">
                          <Trees className="h-5 w-5 text-emerald-200" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-emerald-200/70">Preservacion · SegurIA Vision</p>
                          <h3 className="mt-1 text-base font-light text-white">Monitoreo de fauna con camaras de animales</h3>
                          <p className="mt-1 max-w-xl text-sm leading-6 text-white/50">
                            Seguimiento no invasivo de fauna mediante camaras dedicadas, analisis visual y revision humana para apoyar observacion y preservacion del entorno.
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/admin/vision?organizationId=${encodeURIComponent(property.organization_id)}`}
                        className="inline-flex w-fit items-center gap-2 rounded-[5px] bg-emerald-300/10 px-3 py-2 text-sm text-emerald-100 transition hover:bg-emerald-300/15"
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                        Abrir Vision
                      </Link>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                      <WildlifeStat icon={Camera} label="Camaras fauna" value={`${activeWildlifeCameras}/${orgWildlifeCameras.length}`} />
                      <WildlifeStat icon={PawPrint} label="Detecciones analizadas" value={analyzedDetections.toString()} />
                      <WildlifeStat icon={Eye} label="Revision pendiente" value={pendingReview.toString()} />
                      <WildlifeStat icon={Trees} label="Ultima captura" value={lastWildlifeCapture ? formatDate(lastWildlifeCapture) : 'Sin registros'} compact />
                    </div>

                    {orgWildlifeCameras.length === 0 && (
                      <div className="mt-4 rounded-[6px] bg-black/15 px-3 py-3 text-sm leading-6 text-white/50">
                        El modulo de preservacion esta habilitado para Huilo Huilo, pero aun no hay camaras de fauna registradas en la plataforma. Los indicadores permaneceran en cero hasta conectar evidencia real.
                      </div>
                    )}
                  </section>
                )}

                <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
                  <span>Ultima senal: {formatDate(lastSeen)}</span>
                  <div className="flex gap-2">
                    <Link href="/admin/dispositivos" className="rounded-[5px] bg-white/5 px-3 py-2 text-white/70 hover:bg-white/10">Equipos</Link>
                    <Link href="/admin/incidentes" className="rounded-[5px] bg-white/5 px-3 py-2 text-white/70 hover:bg-white/10">Incidentes</Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, tone = 'text-white' }: {
  icon: typeof Building2
  label: string
  value: string
  tone?: string
}) {
  return (
    <div className="glass-card p-4">
      <Icon className="mb-3 h-5 w-5 text-[#4DA3D9]" strokeWidth={1.5} />
      <p className="text-sm text-white/50">{label}</p>
      <p className={`mt-1 text-2xl font-light ${tone}`}>{value}</p>
    </div>
  )
}

function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[5px] bg-white/5 p-3">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-lg font-light text-white">{value}</p>
    </div>
  )
}

function WildlifeStat({ icon: Icon, label, value, compact = false }: {
  icon: typeof Camera
  label: string
  value: string
  compact?: boolean
}) {
  return (
    <div className="rounded-[6px] bg-black/15 p-3">
      <Icon className="h-4 w-4 text-emerald-200/80" strokeWidth={1.5} />
      <p className="mt-2 text-xs text-white/40">{label}</p>
      <p className={`mt-1 font-light text-white ${compact ? 'text-sm' : 'text-lg'}`}>{value}</p>
    </div>
  )
}
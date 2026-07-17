import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Camera, Database, FileText, HardDrive, ImageIcon, ShieldCheck } from 'lucide-react'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type SnapshotRow = {
  id: string
  property_id: string
  device_id: string
  object_path: string
  mime_type: string | null
  size_bytes: number | null
  captured_at: string
  created_at: string
}

type PropertyRow = {
  id: string
  name: string
  address: string | null
}

type DeviceRow = {
  id: string
  name: string
  kind: string | null
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatSize(value: number | null) {
  if (!value) return 'Sin peso'
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

function getSafeFileName(objectPath: string) {
  const name = objectPath.split('/').filter(Boolean).at(-1)
  return name || 'evidencia-capturada'
}

export default async function DocumentsPage() {
  const auth = await getCurrentAuthSession()
  if (!auth) redirect('/login?next=/admin/documentos')
  if (auth.user.role === 'client') redirect('/app')

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return (
      <div className="glass-card p-8">
        <h1 className="text-3xl font-light text-white">Documentos y evidencia</h1>
        <p className="mt-3 text-white/60">Falta configurar la conexion segura de datos para leer evidencia real.</p>
      </div>
    )
  }

  let snapshotsQuery = supabase
    .from('camera_snapshots')
    .select('id,property_id,device_id,object_path,mime_type,size_bytes,captured_at,created_at')
    .order('captured_at', { ascending: false })
    .limit(200)
  let propertiesQuery = supabase.from('properties').select('id,name,address')
  let devicesQuery = supabase.from('devices').select('id,name,kind,property_id')

  if (auth.user.role !== 'admin') {
    if (auth.user.propertyIds.length === 0) {
      snapshotsQuery = snapshotsQuery.eq('property_id', '00000000-0000-0000-0000-000000000000')
      propertiesQuery = propertiesQuery.eq('id', '00000000-0000-0000-0000-000000000000')
      devicesQuery = devicesQuery.eq('property_id', '00000000-0000-0000-0000-000000000000')
    } else {
      snapshotsQuery = snapshotsQuery.in('property_id', auth.user.propertyIds)
      propertiesQuery = propertiesQuery.in('id', auth.user.propertyIds)
      devicesQuery = devicesQuery.in('property_id', auth.user.propertyIds)
    }
  }

  const [snapshotsResult, propertiesResult, devicesResult] = await Promise.all([
    snapshotsQuery,
    propertiesQuery,
    devicesQuery,
  ])

  const queryError = snapshotsResult.error || propertiesResult.error || devicesResult.error
  if (queryError) {
    return (
      <div className="glass-card p-8">
        <h1 className="text-3xl font-light text-white">Documentos y evidencia</h1>
        <p className="mt-3 text-red-200">No se pudo leer evidencia: {queryError.message}</p>
      </div>
    )
  }

  const snapshots = (snapshotsResult.data || []) as SnapshotRow[]
  const propertiesById = new Map(((propertiesResult.data || []) as PropertyRow[]).map((property) => [property.id, property]))
  const devicesById = new Map(((devicesResult.data || []) as DeviceRow[]).map((device) => [device.id, device]))
  const totalBytes = snapshots.reduce((total, snapshot) => total + (snapshot.size_bytes || 0), 0)
  const cameraSnapshots = snapshots.filter((snapshot) => devicesById.get(snapshot.device_id)?.kind === 'camera').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#4DA3D9]">Archivo seguro</p>
          <h1 className="text-3xl font-light text-white">Documentos y evidencia</h1>
          <p className="mt-1 text-white/60">Capturas y registros operativos guardados en storage privado para auditoria interna.</p>
        </div>
        <Link href="/admin/dispositivos" className="btn-primary inline-flex w-fit items-center gap-2 px-4 py-2.5 text-[15px]">
          Ver dispositivos
          <Camera className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FileText} label="Evidencias" value={snapshots.length.toString()} />
        <MetricCard icon={ImageIcon} label="Capturas de camara" value={cameraSnapshots.toString()} />
        <MetricCard icon={HardDrive} label="Volumen" value={formatSize(totalBytes)} />
        <MetricCard icon={ShieldCheck} label="Storage" value="Privado" tone="text-emerald-200" />
      </div>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-light text-white">Evidencia reciente</h2>
          <p className="mt-1 text-sm text-white/50">Se muestran metadatos seguros; la entrega de archivos debe pasar por URLs firmadas del backend.</p>
        </div>

        {snapshots.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="mx-auto mb-4 h-12 w-12 text-white/30" strokeWidth={1} />
            <p className="text-white/70">Aun no hay evidencia capturada.</p>
            <p className="mt-2 text-sm text-white/45">Cuando un gateway envie capturas, quedaran disponibles en este registro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-sm text-white/50">
                  <th className="p-4 font-normal">Archivo</th>
                  <th className="p-4 font-normal">Sitio</th>
                  <th className="p-4 font-normal">Equipo</th>
                  <th className="p-4 font-normal">Tipo</th>
                  <th className="p-4 font-normal">Peso</th>
                  <th className="p-4 font-normal">Captura</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snapshot) => {
                  const property = propertiesById.get(snapshot.property_id)
                  const device = devicesById.get(snapshot.device_id)

                  return (
                    <tr key={snapshot.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[5px] bg-[#4DA3D9]/15">
                            <FileText className="h-5 w-5 text-[#4DA3D9]" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-[15px] text-white">{getSafeFileName(snapshot.object_path)}</p>
                            <p className="text-[12px] text-white/35">ID {snapshot.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-white/70">{property?.name || 'Sitio no encontrado'}</p>
                        <p className="text-xs text-white/35">{property?.address || 'Direccion pendiente'}</p>
                      </td>
                      <td className="p-4 text-sm text-white/60">{device?.name || 'Equipo sin nombre'}</td>
                      <td className="p-4 text-sm text-white/55">{snapshot.mime_type || 'application/octet-stream'}</td>
                      <td className="p-4 text-sm text-white/55">{formatSize(snapshot.size_bytes)}</td>
                      <td className="p-4 text-sm text-white/50">{formatDate(snapshot.captured_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, tone = 'text-white' }: {
  icon: typeof FileText
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

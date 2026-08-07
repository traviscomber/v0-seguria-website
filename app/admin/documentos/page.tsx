import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Camera,
  Database,
  FileText,
  FolderOpen,
  HardDrive,
  ImageIcon,
  Send,
  ShieldCheck,
} from 'lucide-react'
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

type SentDocumentRow = {
  id: string
  organization_id: string
  property_id: string | null
  folder: string
  title: string
  filename: string
  object_path: string
  mime_type: string
  size_bytes: number | null
  status: string
  sent_at: string
  source_ref: string | null
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
        <p className="mt-3 text-white/60">Falta configurar la conexion segura de datos para leer documentos.</p>
      </div>
    )
  }

  let snapshotsQuery = supabase
    .from('camera_snapshots')
    .select('id,property_id,device_id,object_path,mime_type,size_bytes,captured_at,created_at')
    .order('captured_at', { ascending: false })
    .limit(200)
  let sentDocumentsQuery = supabase
    .from('sent_documents')
    .select('id,organization_id,property_id,folder,title,filename,object_path,mime_type,size_bytes,status,sent_at,source_ref')
    .order('sent_at', { ascending: false })
    .limit(200)
  let propertiesQuery = supabase.from('properties').select('id,name,address')
  let devicesQuery = supabase.from('devices').select('id,name,kind,property_id')

  if (auth.user.role !== 'admin') {
    if (auth.user.propertyIds.length === 0) {
      const noProperty = '00000000-0000-0000-0000-000000000000'
      snapshotsQuery = snapshotsQuery.eq('property_id', noProperty)
      sentDocumentsQuery = sentDocumentsQuery.eq('property_id', noProperty)
      propertiesQuery = propertiesQuery.eq('id', noProperty)
      devicesQuery = devicesQuery.eq('property_id', noProperty)
    } else {
      snapshotsQuery = snapshotsQuery.in('property_id', auth.user.propertyIds)
      sentDocumentsQuery = sentDocumentsQuery.in('property_id', auth.user.propertyIds)
      propertiesQuery = propertiesQuery.in('id', auth.user.propertyIds)
      devicesQuery = devicesQuery.in('property_id', auth.user.propertyIds)
    }
  }

  const [snapshotsResult, sentDocumentsResult, propertiesResult, devicesResult] = await Promise.all([
    snapshotsQuery,
    sentDocumentsQuery,
    propertiesQuery,
    devicesQuery,
  ])

  const queryError =
    snapshotsResult.error || sentDocumentsResult.error || propertiesResult.error || devicesResult.error
  if (queryError) {
    return (
      <div className="glass-card p-8">
        <h1 className="text-3xl font-light text-white">Documentos y evidencia</h1>
        <p className="mt-3 text-red-200">No se pudo leer el archivo: {queryError.message}</p>
      </div>
    )
  }

  const snapshots = (snapshotsResult.data || []) as SnapshotRow[]
  const sentDocuments = (sentDocumentsResult.data || []) as SentDocumentRow[]
  const propertiesById = new Map(
    ((propertiesResult.data || []) as PropertyRow[]).map((property) => [property.id, property]),
  )
  const devicesById = new Map(
    ((devicesResult.data || []) as DeviceRow[]).map((device) => [device.id, device]),
  )
  const totalBytes = snapshots.reduce((total, snapshot) => total + (snapshot.size_bytes || 0), 0)
  const cameraSnapshots = snapshots.filter((snapshot) => devicesById.get(snapshot.device_id)?.kind === 'camera').length

  const sentByFolder = new Map<string, SentDocumentRow[]>()
  for (const document of sentDocuments) {
    const folder = document.folder?.trim() || 'General'
    const current = sentByFolder.get(folder) || []
    current.push(document)
    sentByFolder.set(folder, current)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#4DA3D9]">Archivo seguro</p>
          <h1 className="text-3xl font-light text-white">Documentos y evidencia</h1>
          <p className="mt-1 text-white/60">
            Documentos comerciales enviados y evidencia operativa organizados por cliente y sitio.
          </p>
        </div>
        <Link href="/admin/dispositivos" className="btn-primary inline-flex w-fit items-center gap-2 px-4 py-2.5 text-[15px]">
          Ver dispositivos
          <Camera className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Send} label="Enviados" value={sentDocuments.length.toString()} tone="text-[#65C7F7]" />
        <MetricCard icon={FileText} label="Evidencias" value={snapshots.length.toString()} />
        <MetricCard icon={ImageIcon} label="Capturas de camara" value={cameraSnapshots.toString()} />
        <MetricCard icon={HardDrive} label="Volumen evidencia" value={formatSize(totalBytes)} />
        <MetricCard icon={ShieldCheck} label="Storage" value="Privado" tone="text-emerald-200" />
      </div>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-light text-white">Documentos enviados</h2>
          <p className="mt-1 text-sm text-white/50">
            Propuestas y documentos comerciales archivados en su carpeta de cliente.
          </p>
        </div>

        {sentDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="mx-auto mb-4 h-12 w-12 text-white/25" strokeWidth={1} />
            <p className="text-white/70">Aun no hay documentos enviados registrados.</p>
          </div>
        ) : (
          <div className="space-y-5 p-5">
            {[...sentByFolder.entries()].map(([folder, documents]) => (
              <div key={folder} className="overflow-hidden rounded-[8px] border border-white/10 bg-black/10">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.035] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-[#4DA3D9]" strokeWidth={1.5} />
                    <div>
                      <p className="text-[15px] font-medium text-white">{folder}</p>
                      <p className="text-xs text-white/40">
                        {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-white/5">
                  {documents.map((document) => {
                    const property = document.property_id ? propertiesById.get(document.property_id) : null
                    return (
                      <div key={document.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] bg-[#4DA3D9]/15">
                            <FileText className="h-5 w-5 text-[#4DA3D9]" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[15px] text-white">{document.title}</p>
                              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-emerald-200">
                                Enviado
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs text-white/35">{document.filename}</p>
                            <p className="mt-2 text-xs text-white/45">
                              {property?.name || 'Cliente'}{property?.address ? ` · ${property.address}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-sm text-white/60">{formatSize(document.size_bytes)}</p>
                          <p className="mt-1 text-xs text-white/35">Enviado {formatDate(document.sent_at)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-light text-white">Evidencia reciente</h2>
          <p className="mt-1 text-sm text-white/50">
            Se muestran metadatos seguros; la entrega de archivos debe pasar por URLs firmadas del backend.
          </p>
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

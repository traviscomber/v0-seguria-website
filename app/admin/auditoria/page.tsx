import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Activity,
  AlertTriangle,
  Bot,
  Camera,
  CheckCircle2,
  Clock3,
  KeyRound,
  RadioTower,
  ScrollText,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type AuditRow = {
  id: number
  organization_id: string
  property_id: string | null
  actor_user_id: string | null
  actor_gateway_id: string | null
  actor_label: string | null
  action: string
  target_type: string
  target_id: string | null
  payload: Record<string, unknown> | null
  created_at: string
}

type OrganizationRow = {
  id: string
  name: string
}

type PropertyRow = {
  id: string
  organization_id: string
  name: string
  address: string | null
}

type GatewayRow = {
  id: string
  name: string
  public_id: string
}

const actionLabels: Record<string, string> = {
  'automation.created': 'Automatizacion creada',
  'automation.deployment_applied': 'Automatizacion aplicada',
  'automation.deployment_failed': 'Automatizacion fallida',
  'automation.deployment_requested': 'Despliegue solicitado',
  'automation.rollback_manual': 'Rollback manual',
  'automation.rollback_timeout': 'Rollback automatico',
  'automation.simulated': 'Simulacion ejecutada',
  'camera_stream.hls_manifest_uploaded': 'Manifest de video recibido',
  'camera_stream.hls_segment_uploaded': 'Segmento de video recibido',
  'camera_stream.requested': 'Stream solicitado',
  'camera_stream.started': 'Stream iniciado',
  'camera_stream.stopped': 'Stream detenido',
  'device.space_assigned': 'Equipo asignado a espacio',
  'gateway.config.delivered': 'Configuracion entregada',
  'gateway.provisioned': 'Conector creado',
  'integration_credential.stored': 'Cuenta operativa guardada',
  'notification.escalated': 'Notificacion escalada',
  'notification.generated': 'Notificacion generada',
}

const providerAliasPatterns = [
  { pattern: new RegExp(['t', 'uya'].join(''), 'gi'), replacement: 'cuenta cliente' },
  { pattern: new RegExp(['home', '[_ -]?', 'assistant'].join(''), 'gi'), replacement: 'capa local' },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

function getActionLabel(action: string) {
  return actionLabels[action] || action.replace(/\./g, ' ')
}

function getActionTone(action: string) {
  if (action.includes('failed') || action.includes('rollback') || action.includes('escalated')) {
    return 'bg-red-500/15 text-red-200 border-red-400/30'
  }
  if (action.includes('requested') || action.includes('simulated') || action.includes('delivered')) {
    return 'bg-amber-500/15 text-amber-200 border-amber-400/30'
  }
  return 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
}

function getActionIcon(action: string) {
  if (action.startsWith('camera_stream')) return Camera
  if (action.startsWith('automation')) return Bot
  if (action.startsWith('gateway')) return RadioTower
  if (action.startsWith('integration_credential')) return KeyRound
  if (action.startsWith('notification')) return AlertTriangle
  return Activity
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
        const lower = key.toLowerCase()
        if (
          lower.includes('secret') ||
          lower.includes('token') ||
          lower.includes('password') ||
          lower.includes('cipher') ||
          lower.includes('credential')
        ) {
          return [key, '[redactado]']
        }
        return [key, sanitizeValue(entry)]
      })
    )
  }
  if (typeof value === 'string') {
    return providerAliasPatterns.reduce(
      (current, entry) => current.replace(entry.pattern, entry.replacement),
      value
    )
  }
  return value
}

function stringifyPayload(payload: Record<string, unknown> | null) {
  if (!payload || Object.keys(payload).length === 0) return ''
  return JSON.stringify(sanitizeValue(payload), null, 2)
}

export default async function AuditPage() {
  const auth = await getCurrentAuthSession()
  if (!auth) redirect('/login?next=/admin/auditoria')
  if (auth.user.role === 'client') redirect('/app')

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return (
      <div className="glass-card p-8">
        <h1 className="text-3xl font-light text-white">Auditoria</h1>
        <p className="mt-3 text-white/60">Falta configurar la conexion segura de datos para leer trazabilidad.</p>
      </div>
    )
  }

  let auditQuery = supabase
    .from('audit_log')
    .select('id,organization_id,property_id,actor_user_id,actor_gateway_id,actor_label,action,target_type,target_id,payload,created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (auth.user.role === 'technician') {
    if (auth.user.propertyIds.length === 0) auditQuery = auditQuery.eq('property_id', '00000000-0000-0000-0000-000000000000')
    else auditQuery = auditQuery.in('property_id', auth.user.propertyIds)
  }

  const [auditResult, organizationsResult, propertiesResult, gatewaysResult] = await Promise.all([
    auditQuery,
    supabase.from('organizations').select('id,name'),
    supabase.from('properties').select('id,organization_id,name,address'),
    supabase.from('gateways').select('id,name,public_id'),
  ])

  const queryError = auditResult.error || organizationsResult.error || propertiesResult.error || gatewaysResult.error
  if (queryError) {
    return (
      <div className="glass-card p-8">
        <h1 className="text-3xl font-light text-white">Auditoria</h1>
        <p className="mt-3 text-red-200">No se pudo leer trazabilidad: {queryError.message}</p>
      </div>
    )
  }

  const auditRows = (auditResult.data || []) as AuditRow[]
  const organizationById = new Map(((organizationsResult.data || []) as OrganizationRow[]).map((organization) => [organization.id, organization]))
  const propertyById = new Map(((propertiesResult.data || []) as PropertyRow[]).map((property) => [property.id, property]))
  const gatewayById = new Map(((gatewaysResult.data || []) as GatewayRow[]).map((gateway) => [gateway.id, gateway]))
  const failures = auditRows.filter((row) => row.action.includes('failed') || row.action.includes('rollback') || row.action.includes('escalated'))
  const connectorActions = auditRows.filter((row) => row.action.startsWith('gateway') || row.action.startsWith('integration_credential'))
  const automationActions = auditRows.filter((row) => row.action.startsWith('automation'))
  const cameraActions = auditRows.filter((row) => row.action.startsWith('camera_stream'))

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Trazabilidad operativa</p>
          <h1 className="mt-2 text-3xl font-light text-white">Auditoria</h1>
          <p className="mt-2 max-w-3xl text-white/55">
            Registro interno de acciones relevantes: conectores, cuentas operativas, video, automatizaciones, alertas y cambios de soporte.
          </p>
        </div>
        <Link href="/admin/clientes" className="btn-primary inline-flex w-fit items-center gap-2 px-4 py-2.5 text-[15px]">
          <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
          Revisar clientes
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={ScrollText} label="Eventos auditados" value={auditRows.length.toString()} />
        <MetricCard icon={RadioTower} label="Conectores" value={connectorActions.length.toString()} />
        <MetricCard icon={Bot} label="Automatizaciones" value={automationActions.length.toString()} />
        <MetricCard icon={Camera} label="Video" value={cameraActions.length.toString()} />
        <MetricCard icon={AlertTriangle} label="Atencion" value={failures.length.toString()} tone={failures.length > 0 ? 'text-amber-200' : 'text-white'} />
      </div>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-light text-white">Linea de tiempo</h2>
          <p className="mt-1 text-sm text-white/50">
            Payloads sanitizados: secretos, tokens y credenciales no se muestran en pantalla.
          </p>
        </div>

        {auditRows.length === 0 ? (
          <div className="p-12 text-center">
            <ScrollText className="mx-auto mb-4 h-12 w-12 text-white/30" strokeWidth={1} />
            <p className="text-white/70">Aun no hay actividad auditada.</p>
            <p className="mt-2 text-sm text-white/45">Cuando se creen conectores, cuentas, streams o reglas, apareceran aqui.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/8">
            {auditRows.map((row) => {
              const property = row.property_id ? propertyById.get(row.property_id) : null
              const organization = organizationById.get(row.organization_id)
              const gateway = row.actor_gateway_id ? gatewayById.get(row.actor_gateway_id) : null
              const Icon = getActionIcon(row.action)
              const payload = stringifyPayload(row.payload)

              return (
                <article key={row.id} className="p-5">
                  <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[5px] bg-[#4DA3D9]/15 text-[#9DD2F2]">
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-lg font-light text-white">{getActionLabel(row.action)}</h3>
                          <span className={`w-fit rounded-[5px] border px-2.5 py-1 text-xs ${getActionTone(row.action)}`}>
                            {row.action}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-white/50 md:grid-cols-2">
                          <InfoLine label="Empresa" value={organization?.name || 'Empresa no encontrada'} />
                          <InfoLine label="Sitio" value={property ? `${property.name}${property.address ? ` | ${property.address}` : ''}` : 'Sin sitio asociado'} />
                          <InfoLine label="Actor" value={row.actor_label || gateway?.name || 'Sistema operativo'} />
                          <InfoLine label="Objetivo" value={`${row.target_type}${row.target_id ? ` / ${row.target_id.slice(0, 12)}` : ''}`} />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[5px] bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-white/55">
                          {row.actor_gateway_id ? (
                            <RadioTower className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.5} />
                          ) : (
                            <UserRound className="h-4 w-4 text-[#9DD2F2]" strokeWidth={1.5} />
                          )}
                          {row.actor_gateway_id ? 'Conector' : 'Usuario'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <Clock3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {formatDate(row.created_at)}
                        </div>
                      </div>

                      {payload ? (
                        <pre className="mt-3 max-h-44 overflow-auto rounded-[5px] bg-[#071625] p-3 text-xs leading-5 text-white/65">
                          {payload}
                        </pre>
                      ) : (
                        <p className="mt-3 rounded-[5px] bg-[#071625] p-3 text-sm text-white/40">Sin payload adicional.</p>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Callout icon={CheckCircle2} title="Evidencia de cambios" text="Cada accion sensible debe quedar asociada a usuario, conector o sistema." />
        <Callout icon={KeyRound} title="Secretos protegidos" text="La vista oculta claves, tokens y credenciales antes de renderizar payloads." />
        <Callout icon={Activity} title="Operacion repetible" text="Soporte puede revisar que paso, cuando paso y que sitio fue afectado." />
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, tone = 'text-white' }: {
  icon: typeof ScrollText
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

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="min-w-0">
      <span className="text-white/35">{label}: </span>
      <span className="break-words text-white/65">{value}</span>
    </p>
  )
}

function Callout({ icon: Icon, title, text }: { icon: typeof CheckCircle2; title: string; text: string }) {
  return (
    <div className="glass-card p-5">
      <Icon className="mb-4 h-5 w-5 text-[#9DD2F2]" strokeWidth={1.5} />
      <h3 className="text-base font-light text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/52">{text}</p>
    </div>
  )
}

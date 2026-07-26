import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, CheckCircle2, Clock3, FileCheck, Plus, Send, Sparkles, TrendingUp } from 'lucide-react'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { PROPOSAL_BRANDBOOK } from '@/lib/proposals/brandbook'

export const dynamic = 'force-dynamic'

type LeadRow = {
  id: string
  name: string
  email: string
  phone: string | null
  property_type: string | null
  message: string | null
  source: string | null
  status: string | null
  created_at: string
  updated_at: string
}

const statusLabels: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Calificado',
  proposal_sent: 'Propuesta enviada',
  won: 'Ganado',
  lost: 'Perdido',
}

const statusClasses: Record<string, string> = {
  new: 'bg-sky-500/15 text-sky-200 border-sky-400/30',
  contacted: 'bg-white/10 text-white/65 border-white/15',
  qualified: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  proposal_sent: 'bg-[#4DA3D9]/15 text-[#9fd4f4] border-[#4DA3D9]/30',
  won: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
  lost: 'bg-red-500/15 text-red-200 border-red-400/30',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function normalizeStatus(status: string | null) {
  if (!status) return 'new'
  const normalized: Record<string, string> = {
    nuevo: 'new',
    contactado: 'contacted',
    diagnostico: 'qualified',
    propuesta: 'proposal_sent',
    ganado: 'won',
    perdido: 'lost',
  }
  return normalized[status] || status
}

export default async function ProposalsPage() {
  const auth = await getCurrentAuthSession()
  if (!auth) redirect('/login?next=/admin/propuestas')
  if (auth.user.role === 'client') redirect('/app')
  if (auth.user.role !== 'admin') redirect('/admin')

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return (
      <div className="space-y-6">
        <ProposalBuilderIntro />
        <div className="glass-card p-8">
          <h1 className="text-3xl font-light text-white">Pipeline comercial</h1>
          <p className="mt-3 text-white/60">Falta configurar la conexion segura de datos para leer oportunidades reales.</p>
        </div>
      </div>
    )
  }

  const { data, error } = await supabase
    .from('leads')
    .select('id,name,email,phone,property_type,message,source,status,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <div className="space-y-6">
        <ProposalBuilderIntro />
        <div className="glass-card p-8">
          <h1 className="text-3xl font-light text-white">Pipeline comercial</h1>
          <p className="mt-3 text-red-200">No se pudo leer oportunidades: {error.message}</p>
        </div>
      </div>
    )
  }

  const leads = ((data || []) as LeadRow[]).map((lead) => ({
    ...lead,
    normalizedStatus: normalizeStatus(lead.status),
  }))

  const readyForProposal = leads.filter((lead) => ['qualified', 'proposal_sent'].includes(lead.normalizedStatus))
  const won = leads.filter((lead) => lead.normalizedStatus === 'won')
  const active = leads.filter((lead) => !['won', 'lost'].includes(lead.normalizedStatus))

  return (
    <div className="space-y-6">
      <ProposalBuilderIntro />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#4DA3D9]">Venta consultiva</p>
          <h1 className="text-3xl font-light text-white">Pipeline comercial</h1>
          <p className="mt-1 text-white/60">Vista real de oportunidades capturadas desde formularios y contacto comercial.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/propuestas/nueva" className="btn-primary inline-flex w-fit items-center gap-2 px-4 py-2.5 text-[15px]">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Crear propuesta
          </Link>
          <Link href="/admin/leads" className="inline-flex w-fit items-center gap-2 rounded-[6px] border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[15px] text-white transition hover:bg-white/10">
            Gestionar leads
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FileCheck} label="Oportunidades" value={leads.length.toString()} />
        <MetricCard icon={Clock3} label="Activas" value={active.length.toString()} />
        <MetricCard icon={Send} label="Listas para propuesta" value={readyForProposal.length.toString()} tone="text-amber-200" />
        <MetricCard icon={CheckCircle2} label="Cerradas ganadas" value={won.length.toString()} tone="text-emerald-200" />
      </div>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-light text-white">Oportunidades reales</h2>
          <p className="mt-1 text-sm text-white/50">Selecciona una oportunidad y prepara su documento en el nuevo constructor profesional.</p>
        </div>

        {leads.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="mx-auto mb-4 h-12 w-12 text-white/30" strokeWidth={1} />
            <p className="text-white/70">Aun no hay oportunidades registradas.</p>
            <p className="mt-2 text-sm text-white/45">Puedes crear una propuesta desde cero mientras llegan nuevos contactos.</p>
            <Link href="/admin/propuestas/nueva" className="btn-primary mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm">
              <Plus className="h-4 w-4" /> Crear propuesta
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-sm text-white/50">
                  <th className="p-4 font-normal">Cliente</th>
                  <th className="p-4 font-normal">Necesidad</th>
                  <th className="p-4 font-normal">Origen</th>
                  <th className="p-4 font-normal">Estado</th>
                  <th className="p-4 font-normal">Ingreso</th>
                  <th className="p-4 font-normal">Acción</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <p className="text-[15px] text-white">{lead.name}</p>
                      <p className="text-[13px] text-white/45">{lead.email}</p>
                      {lead.phone && <p className="text-[13px] text-white/35">{lead.phone}</p>}
                    </td>
                    <td className="max-w-md p-4">
                      <p className="text-sm text-white/70">{lead.property_type || 'Tipo pendiente'}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-white/45">{lead.message || 'Sin detalle ingresado'}</p>
                    </td>
                    <td className="p-4 text-sm text-white/55">{lead.source || 'Sitio web'}</td>
                    <td className="p-4">
                      <span className={`rounded-[5px] border px-2.5 py-1 text-xs ${statusClasses[lead.normalizedStatus] || statusClasses.new}`}>
                        {statusLabels[lead.normalizedStatus] || lead.normalizedStatus}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-white/50">{formatDate(lead.created_at)}</td>
                    <td className="p-4">
                      <Link href={`/admin/propuestas/nueva?lead=${lead.id}`} className="inline-flex items-center gap-1.5 text-sm text-[#9DD2F2] hover:text-white">
                        Preparar <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function ProposalBuilderIntro() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#4DA3D9]/20 bg-[radial-gradient(circle_at_10%_0%,rgba(77,163,217,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-6">
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#9DD2F2]"><Sparkles className="h-4 w-4" /> Nuevo constructor</p>
          <h2 className="mt-3 text-2xl font-medium text-white">Propuestas diagramadas automáticamente</h2>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Sube fotografías, escribe títulos y organiza secciones con vista previa inmediata. El editor bloquea colores, tipografías, layouts y tono según el brandbook {PROPOSAL_BRANDBOOK.version}.
          </p>
        </div>
        <Link href="/admin/propuestas/nueva" className="btn-primary inline-flex shrink-0 items-center gap-2 px-5 py-3 text-[15px]">
          <Plus className="h-4 w-4" /> Nueva propuesta
        </Link>
      </div>
    </section>
  )
}

function MetricCard({ icon: Icon, label, value, tone = 'text-white' }: {
  icon: typeof FileCheck
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

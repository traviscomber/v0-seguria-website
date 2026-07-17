import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, CheckCircle2, Clock3, FileCheck, Send, TrendingUp } from 'lucide-react'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

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
      <div className="glass-card p-8">
        <h1 className="text-3xl font-light text-white">Pipeline comercial</h1>
        <p className="mt-3 text-white/60">Falta configurar la conexion segura de datos para leer oportunidades reales.</p>
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
      <div className="glass-card p-8">
        <h1 className="text-3xl font-light text-white">Pipeline comercial</h1>
        <p className="mt-3 text-red-200">No se pudo leer oportunidades: {error.message}</p>
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#4DA3D9]">Venta consultiva</p>
          <h1 className="text-3xl font-light text-white">Pipeline comercial</h1>
          <p className="mt-1 text-white/60">Vista real de oportunidades capturadas desde formularios y contacto comercial.</p>
        </div>
        <Link href="/admin/leads" className="btn-primary inline-flex w-fit items-center gap-2 px-4 py-2.5 text-[15px]">
          Gestionar leads
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
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
          <p className="mt-1 text-sm text-white/50">Esta vista no inventa montos ni PDFs; prepara el trabajo comercial desde datos persistidos.</p>
        </div>

        {leads.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="mx-auto mb-4 h-12 w-12 text-white/30" strokeWidth={1} />
            <p className="text-white/70">Aun no hay oportunidades registradas.</p>
            <p className="mt-2 text-sm text-white/45">Cuando llegue un formulario o contacto, el pipeline se llenara automaticamente.</p>
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

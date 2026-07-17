import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, ArrowRight, Building2, Cpu, MapPin, Radio, ShieldCheck } from 'lucide-react'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { ClientProvisionForm } from '@/components/client-provision-form'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const auth = await getCurrentAuthSession()
  if (!auth) redirect('/login?next=/admin')
  if (auth.user.role === 'client') redirect('/app')

  const supabase = createSupabaseAdminClient()
  const empty = { count: 0 }
  const hasScopedAccess = auth.user.role === 'admin' || (auth.user.clientIds.length > 0 && auth.user.propertyIds.length > 0)
  const [organizations, properties, devices, incidents, overdueNotifications, leadsResult, gatewaysResult] = supabase && hasScopedAccess
    ? await Promise.all([
        auth.user.role === 'admin'
          ? supabase.from('organizations').select('id', { count: 'exact', head: true })
          : supabase.from('organizations').select('id', { count: 'exact', head: true }).in('id', auth.user.clientIds),
        auth.user.role === 'admin'
          ? supabase.from('properties').select('id', { count: 'exact', head: true })
          : supabase.from('properties').select('id', { count: 'exact', head: true }).in('id', auth.user.propertyIds),
        auth.user.role === 'admin'
          ? supabase.from('devices').select('id', { count: 'exact', head: true })
          : supabase.from('devices').select('id', { count: 'exact', head: true }).in('property_id', auth.user.propertyIds),
        auth.user.role === 'admin'
          ? supabase.from('incidents').select('id', { count: 'exact', head: true }).in('status', ['new', 'validating', 'confirmed', 'responding'])
          : supabase.from('incidents').select('id', { count: 'exact', head: true }).in('status', ['new', 'validating', 'confirmed', 'responding']).in('property_id', auth.user.propertyIds),
        auth.user.role === 'admin'
          ? supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('status', 'escalated')
          : supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('status', 'escalated').in('property_id', auth.user.propertyIds),
        auth.user.role === 'admin'
          ? supabase.from('leads').select('id,name,email,property_type,status,created_at').order('created_at', { ascending: false }).limit(5)
          : Promise.resolve({ data: [] }),
        auth.user.role === 'admin'
          ? supabase.from('gateways').select('id,name,status,last_seen_at').order('updated_at', { ascending: false }).limit(6)
          : supabase.from('gateways').select('id,name,status,last_seen_at').in('property_id', auth.user.propertyIds).order('updated_at', { ascending: false }).limit(6),
      ])
    : [empty, empty, empty, empty, empty, { data: [] }, { data: [] }]

  const leads = leadsResult.data || []
  const gateways = gatewaysResult.data || []
  const stats = [
    { label: 'Empresas', value: organizations.count || 0, note: 'clientes configurados', icon: Building2, href: '/admin/clientes' },
    { label: 'Sitios', value: properties.count || 0, note: 'espacios protegidos', icon: MapPin, href: '/admin/dispositivos' },
    { label: 'Equipos', value: devices.count || 0, note: 'inventario conectado', icon: Cpu, href: '/admin/dispositivos' },
    { label: 'Incidentes abiertos', value: incidents.count || 0, note: overdueNotifications.count ? `${overdueNotifications.count} confirmaciones vencidas` : 'sin confirmaciones vencidas', icon: AlertTriangle, href: '/admin/incidentes' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Centro de operacion</p>
        <h1 className="mt-2 text-3xl font-light text-white">Estado general</h1>
        <p className="mt-2 text-white/55">Datos reales de clientes, sitios y seguridad en una sola vista.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon, href }) => (
          <Link key={label} href={href} className="glass-card p-6 transition-colors hover:bg-white/8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm text-white/55">{label}</p><p className="mt-2 text-3xl font-light text-white">{value}</p><p className="mt-2 text-xs text-[#9DD2F2]">{note}</p></div>
              <div className="rounded-2xl bg-[#4DA3D9]/15 p-3 text-[#9DD2F2]"><Icon className="h-5 w-5" strokeWidth={1.5} /></div>
            </div>
          </Link>
        ))}
      </div>

      {auth.user.role === 'admin' ? <ClientProvisionForm /> : <AdminOnlyNotice />}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-card p-6">
          <div className="flex items-center justify-between"><h2 className="text-lg font-light text-white">Contactos recientes</h2><Link href="/admin/leads" className="flex items-center gap-1 text-sm text-[#9DD2F2]">Ver todos <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-5 divide-y divide-white/8">
            {leads.length === 0 ? <EmptyState text="Todavia no hay solicitudes comerciales." /> : leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between gap-4 py-4">
                <div><p className="text-sm text-white">{lead.name}</p><p className="mt-1 text-xs text-white/45">{lead.email}</p></div>
                <span className="rounded-full bg-[#4DA3D9]/12 px-3 py-1 text-xs text-[#9DD2F2]">{lead.status === 'new' ? 'Nuevo' : 'En seguimiento'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-6">
          <div className="flex items-center justify-between"><h2 className="text-lg font-light text-white">Conectividad de sitios</h2><Radio className="h-5 w-5 text-[#9DD2F2]" strokeWidth={1.5} /></div>
          <div className="mt-5 divide-y divide-white/8">
            {gateways.length === 0 ? <EmptyState text="No hay gateways configurados. Crea un cliente para iniciar." /> : gateways.map((gateway) => (
              <div key={gateway.id} className="flex items-center justify-between gap-4 py-4">
                <div><p className="text-sm text-white">{gateway.name}</p><p className="mt-1 text-xs text-white/45">Ultima senal: {gateway.last_seen_at ? new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(gateway.last_seen_at)) : 'sin datos'}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs ${gateway.status === 'online' ? 'bg-emerald-500/12 text-emerald-300' : 'bg-amber-500/12 text-amber-200'}`}>{gateway.status === 'online' ? 'En linea' : 'Pendiente'}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-white/45">{text}</p>
}

function AdminOnlyNotice() {
  return (
    <div className="glass-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#4DA3D9]/15 p-3 text-[#9DD2F2]">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-lg font-light text-white">Alta de clientes protegida</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/50">
            Los tecnicos pueden revisar sitios, equipos e incidentes. La creacion de empresas y usuarios queda reservada para administradores.
          </p>
        </div>
      </div>
      <Link href="/admin/clientes" className="inline-flex items-center gap-2 text-sm text-[#9DD2F2]">
        Ver clientes
        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
      </Link>
    </div>
  )
}

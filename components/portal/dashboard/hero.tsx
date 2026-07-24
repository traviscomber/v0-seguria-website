import Link from 'next/link'
import { Headphones, Siren } from 'lucide-react'
import { PortalStatusBadge } from '@/components/portal/portal-ui'
import { Button } from '@/components/ui/button'
import { getPortalTone } from '@/lib/client-portal/presentation'
import type { ClientDashboardView } from '@/lib/client-portal/dashboard-view'

interface DashboardHeroProps {
  userName: string
  attentionRequired: ClientDashboardView['attentionRequired']
  overallStatus: ClientDashboardView['overallStatus']
}

export function DashboardHero({ userName, attentionRequired, overallStatus }: DashboardHeroProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(77,163,217,0.2),transparent_34%),rgba(255,255,255,0.045)] p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <PortalStatusBadge tone={getPortalTone(attentionRequired > 0 ? 'revision' : 'operativo')}>
              {overallStatus}
            </PortalStatusBadge>
            <span className="text-xs text-white/45">Actualizado ahora</span>
          </div>
          <h1 className="mt-5 text-3xl font-light tracking-tight text-white sm:text-4xl">Hola, {userName}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/60">
            Aquí tienes el estado de tus propiedades, alertas e incidentes. Lo importante aparece primero para que puedas actuar sin revisar información técnica.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="#incidentes"><Siren className="h-4 w-4" />Ver incidentes</Link>
          </Button>
          <Button asChild className="bg-[#4DA3D9] text-[#06111D] hover:bg-[#6BB6E5]">
            <Link href="/contacto"><Headphones className="h-4 w-4" />Solicitar ayuda</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

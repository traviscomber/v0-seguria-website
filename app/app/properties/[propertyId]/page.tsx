import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import {
  PropertyActivity,
  PropertyCameras,
  PropertyDevices,
  PropertyEvidence,
  PropertyHeader,
  PropertyIncidents,
  PropertyStats,
  PropertySupport,
} from '@/components/portal/property'
import { DemoJourney } from '@/components/portal/demo-journey'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { buildClientPropertyView } from '@/lib/client-portal/property-view'
import { getClientTheme } from '@/lib/client-theme'

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params
  const session = await getCurrentAuthSession()

  if (!session || session.user.role !== 'client') {
    redirect(`/login?next=/app/properties/${propertyId}`)
  }

  const model = await buildClientPropertyView(session.user, propertyId)

  if (!model) {
    notFound()
  }

  const theme = getClientTheme(
    ...session.user.clientIds,
    model.site.organizationName,
    model.site.name,
    model.site.label,
    model.site.propertyId,
  )

  return (
    <div
      className="relative -mx-4 min-h-screen overflow-hidden px-4 pb-12 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ backgroundColor: theme.pageBackground }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-fixed bg-center opacity-[0.05]"
        style={{ backgroundImage: `url('${theme.backgroundImage}')` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/35" />

      <div className="relative z-10 space-y-8 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/app#propiedades"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/65 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a espacios
          </Link>
          <p className={`text-[10px] uppercase tracking-[0.22em] ${theme.accentTextClass}`}>
            Ficha operativa del espacio
          </p>
        </div>

        <DemoJourney theme={theme} compact />

        <section id="detalle" className="scroll-mt-24">
          <PropertyHeader model={model} />
        </section>
        <PropertyStats model={model} />
        <section id="prioridades" className="scroll-mt-24">
          <PropertyIncidents model={model} />
        </section>
        <section id="vigilancia" className="scroll-mt-24">
          <PropertyCameras model={model} />
        </section>
        <section id="equipos" className="scroll-mt-24">
          <PropertyDevices model={model} />
        </section>
        <section id="evidencia" className="scroll-mt-24 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <PropertyEvidence model={model} />
          <PropertyActivity model={model} />
        </section>
        <PropertySupport />
      </div>
    </div>
  )
}

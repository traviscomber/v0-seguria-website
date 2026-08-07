import Link from 'next/link'
import { Camera, Leaf, PawPrint } from 'lucide-react'
import { WildlifeMediaReviewCenter } from '@/components/wildlife-media-review-center'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ organizationId?: string }>
}

export default async function WildlifeVisionReviewPage({ searchParams }: PageProps) {
  const { organizationId } = await searchParams
  const supabase = createSupabaseAdminClient()

  let organizationName: string | null = null
  let cameraCount = 0
  let detectionCount = 0

  if (organizationId && supabase) {
    const [organizationResult, camerasResult, detectionsResult] = await Promise.all([
      supabase.from('organizations').select('name').eq('id', organizationId).maybeSingle(),
      supabase.from('wildlife_cameras').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
      supabase.from('wildlife_inference_jobs').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
    ])

    organizationName = organizationResult.data?.name || null
    cameraCount = camerasResult.count || 0
    detectionCount = detectionsResult.count || 0
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[8px] border border-emerald-300/15 bg-emerald-300/[0.045] p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[7px] bg-emerald-300/10">
              <Leaf className="h-6 w-6 text-emerald-200" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/70">Preservacion y biodiversidad</p>
              <h1 className="mt-1 text-2xl font-light text-white">
                {organizationName ? `Vision de fauna · ${organizationName}` : 'Vision de fauna'}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
                Modulo para consolidar camaras de animales, evidencia visual, identificacion asistida por IA y revision humana sin presentar inferencias como observaciones confirmadas.
              </p>
            </div>
          </div>

          {organizationId && (
            <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
              <div className="rounded-[6px] bg-black/15 p-3">
                <Camera className="h-4 w-4 text-emerald-200/80" strokeWidth={1.5} />
                <p className="mt-2 text-xs text-white/40">Camaras fauna</p>
                <p className="mt-1 text-xl font-light text-white">{cameraCount}</p>
              </div>
              <div className="rounded-[6px] bg-black/15 p-3">
                <PawPrint className="h-4 w-4 text-emerald-200/80" strokeWidth={1.5} />
                <p className="mt-2 text-xs text-white/40">Registros procesados</p>
                <p className="mt-1 text-xl font-light text-white">{detectionCount}</p>
              </div>
            </div>
          )}
        </div>

        {organizationId && cameraCount === 0 && (
          <div className="mt-4 flex flex-col gap-3 rounded-[6px] bg-black/15 px-4 py-3 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <span>Aun no hay camaras de fauna conectadas para esta organizacion. La vista permanece preparada para incorporar evidencia real.</span>
            <Link href="/admin/proyectos" className="shrink-0 text-emerald-200 hover:text-emerald-100">Volver al proyecto</Link>
          </div>
        )}
      </section>

      <WildlifeMediaReviewCenter />
    </div>
  )
}

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Eye, MapPin } from 'lucide-react'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CameraRegistry } from './camera-registry'
import { ImageMetadataActivity } from './image-metadata-activity'
import { PilotEvaluation } from './pilot-evaluation'
import { TerritorialActivity } from './territorial-activity'
import { VisionConsole } from './vision-console'
import { VisionJobHistory } from './vision-job-history'
import { VisionMetrics } from './vision-metrics'

export default async function WildlifeVisionPage() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) redirect('/login')

  const { data } = await supabase.auth.getUser()
  if (!data.user) redirect('/login')

  return (
    <main className="min-h-screen bg-[#071522] px-6 py-10 text-white lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm text-[#9DD2F2]">
              <Eye className="h-4 w-4" />
              Wildlife Intelligence
            </div>
            <h1 className="mt-3 text-4xl font-light tracking-tight">SegurIA Vision</h1>
            <p className="mt-3 max-w-2xl text-white/60">
              Analisis asistido de camaras trampa, procesamiento por lote y validacion humana trazable.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#territorial-map"
              className="inline-flex items-center gap-2 rounded-lg border border-[#68b4e3]/25 bg-[#68b4e3]/[0.06] px-4 py-3 text-sm text-[#9bd3f3] hover:bg-[#68b4e3]/[0.1]"
            >
              <MapPin className="h-4 w-4" />
              Ver mapa territorial
            </a>
            <Link
              href="/wildlife/review"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm text-white/75 hover:bg-white/[0.05]"
            >
              <ArrowLeft className="h-4 w-4" />
              Cola de revision de dataset
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <VisionMetrics />
          <CameraRegistry />
          <TerritorialActivity />
          <VisionConsole />
          <ImageMetadataActivity />
          <VisionJobHistory />
          <PilotEvaluation />
        </div>
      </div>
    </main>
  )
}

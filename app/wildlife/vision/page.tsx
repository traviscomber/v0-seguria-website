import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Eye } from 'lucide-react'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { VisionConsole } from './vision-console'
import { VisionJobHistory } from './vision-job-history'

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
              Análisis asistido de cámaras trampa, procesamiento por lote y validación humana trazable.
            </p>
          </div>
          <Link
            href="/wildlife/review"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm text-white/75 hover:bg-white/[0.05]"
          >
            <ArrowLeft className="h-4 w-4" />
            Cola de revisión de dataset
          </Link>
        </div>

        <div className="mt-8 space-y-8">
          <VisionConsole />
          <VisionJobHistory />
        </div>
      </div>
    </main>
  )
}

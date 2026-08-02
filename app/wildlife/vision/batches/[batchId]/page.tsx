import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PilotBatchReview } from './pilot-batch-review'

export default async function PilotBatchDetailPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params
  const supabase = await createSupabaseServerClient()
  if (!supabase) redirect(`/login?next=/wildlife/vision/batches/${batchId}`)

  const { data } = await supabase.auth.getUser()
  if (!data.user) redirect(`/login?next=/wildlife/vision/batches/${batchId}`)

  return <main className="min-h-screen bg-[#071522] px-6 py-10 text-white lg:px-10">
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]"><ClipboardCheck className="h-4 w-4" /> SegurIA Vision</p>
          <h1 className="mt-3 text-4xl font-normal tracking-tight">Revision del lote</h1>
          <p className="mt-3 max-w-2xl text-white/55">Evidencia, decisiones humanas y criterios de cierre en una sola vista.</p>
        </div>
        <Link href="/wildlife/vision/batches" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm text-white/70 hover:bg-white/[0.05]"><ArrowLeft className="h-4 w-4" /> Todos los lotes</Link>
      </header>
      <PilotBatchReview batchId={batchId} />
    </div>
  </main>
}

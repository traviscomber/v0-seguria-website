import { redirect } from 'next/navigation'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { reviewWildlifeObservation } from './actions'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default async function WildlifeReviewPage() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) redirect('/login')

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: observations, error } = await supabase
    .from('wildlife_observations')
    .select(`
      id,
      site_id,
      organization_id,
      title,
      source,
      status,
      created_at,
      wildlife_ai_analyses (
        analysis_json,
        analyzed_at
      )
    `)
    .eq('status', 'review_required')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(`Unable to load Wildlife review queue: ${error.message}`)
  }

  return (
    <main className="min-h-screen bg-[#071523] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#9DD2F2]">Wildlife Intelligence</p>
            <h1 className="mt-3 text-3xl font-light md:text-4xl">Cola de revisión</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
              Detecciones que requieren confirmación humana antes de convertirse en una decisión operacional.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/70">
            Pendientes: {observations?.length ?? 0}
          </div>
        </header>

        {!observations?.length ? (
          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <p className="text-lg font-light">No hay observaciones pendientes.</p>
            <p className="mt-2 text-sm text-white/50">Las nuevas detecciones aparecerán aquí cuando requieran revisión.</p>
          </section>
        ) : (
          <section className="space-y-5">
            {observations.map((observation) => {
              const analyses = Array.isArray(observation.wildlife_ai_analyses)
                ? observation.wildlife_ai_analyses
                : []
              const latest = analyses[0]
              const analysis = latest?.analysis_json as Record<string, unknown> | undefined
              const species = typeof analysis?.primary_species === 'string' ? analysis.primary_species : 'Sin clasificar'
              const confidence = typeof analysis?.maximum_confidence === 'number'
                ? `${Math.round(analysis.maximum_confidence * 100)}%`
                : '—'
              const risk = typeof analysis?.risk_level === 'string' ? analysis.risk_level : '—'

              return (
                <article key={observation.id} className="rounded-xl border border-white/10 bg-[#0A1B2E] p-5 shadow-xl shadow-black/10">
                  <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em]">
                        <span className="rounded-full bg-[#4DA3D9]/15 px-3 py-1 text-[#9DD2F2]">{observation.source}</span>
                        <span className="rounded-full bg-amber-400/10 px-3 py-1 text-amber-200">{risk}</span>
                      </div>
                      <h2 className="mt-4 text-xl font-light">{observation.title || 'Detección Wildlife'}</h2>
                      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg bg-white/[0.04] p-3">
                          <dt className="text-white/40">Especie</dt>
                          <dd className="mt-1 text-white/85">{species}</dd>
                        </div>
                        <div className="rounded-lg bg-white/[0.04] p-3">
                          <dt className="text-white/40">Confianza</dt>
                          <dd className="mt-1 text-white/85">{confidence}</dd>
                        </div>
                        <div className="col-span-2 rounded-lg bg-white/[0.04] p-3">
                          <dt className="text-white/40">Detectado</dt>
                          <dd className="mt-1 text-white/85">{formatDate(observation.created_at)}</dd>
                        </div>
                      </dl>
                    </div>

                    <form action={reviewWildlifeObservation} className="rounded-lg border border-white/8 bg-black/10 p-4">
                      <input type="hidden" name="observation_id" value={observation.id} />
                      <input type="hidden" name="site_id" value={observation.site_id} />

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm text-white/65">
                          Nombre común corregido
                          <input
                            name="corrected_common_name"
                            className="mt-2 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-white outline-none focus:border-[#4DA3D9]"
                          />
                        </label>
                        <label className="text-sm text-white/65">
                          Nombre científico
                          <input
                            name="corrected_scientific_name"
                            className="mt-2 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-white outline-none focus:border-[#4DA3D9]"
                          />
                        </label>
                      </div>

                      <label className="mt-4 block text-sm text-white/65">
                        Notas de revisión
                        <textarea
                          name="notes"
                          rows={3}
                          className="mt-2 w-full rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-white outline-none focus:border-[#4DA3D9]"
                        />
                      </label>

                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        <button name="decision" value="validated" className="rounded-md bg-emerald-500/15 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/25">
                          Validar
                        </button>
                        <button name="decision" value="corrected" className="rounded-md bg-[#4DA3D9]/15 px-4 py-2 text-sm text-[#9DD2F2] hover:bg-[#4DA3D9]/25">
                          Corregir
                        </button>
                        <button name="decision" value="rejected" className="rounded-md bg-red-500/15 px-4 py-2 text-sm text-red-200 hover:bg-red-500/25">
                          Rechazar
                        </button>
                      </div>
                    </form>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}

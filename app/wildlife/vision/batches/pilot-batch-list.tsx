'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, Clock3, RefreshCw } from 'lucide-react'

type Batch = {
  id: string
  name: string
  description?: string | null
  zone_label?: string | null
  target_image_count: number
  status: 'draft' | 'processing' | 'completed' | 'cancelled'
  created_at: string
  summary: {
    total: number
    completed: number
    failed: number
    processing: number
    pendingReview: number
    reviewed: number
  }
}

const statusLabels: Record<Batch['status'], string> = {
  draft: 'Borrador',
  processing: 'En proceso',
  completed: 'Terminado',
  cancelled: 'Cancelado',
}

export function PilotBatchList() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/vision/batches', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar los lotes.')
      setBatches(payload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar los lotes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-medium text-white">Lotes disponibles</h2>
        <p className="mt-1 text-sm text-white/50">Abre un lote para revisar evidencia y completar el piloto.</p>
      </div>
      <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 disabled:opacity-40">
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
      </button>
    </div>

    {error && <p className="rounded-xl border border-red-300/20 bg-red-300/[0.05] p-3 text-sm text-red-100">{error}</p>}
    {!loading && !batches.length && <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-white/45">Todavia no existen lotes piloto.</div>}

    <div className="grid gap-4 lg:grid-cols-2">
      {batches.map((batch) => {
        const progress = batch.target_image_count > 0 ? Math.min(100, Math.round((batch.summary.total / batch.target_image_count) * 100)) : 0
        return <article key={batch.id} className="rounded-2xl border border-white/10 bg-[#0b1d2c] p-5 shadow-xl shadow-black/15">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-white/55">{statusLabels[batch.status]}</span>
                {batch.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Clock3 className="h-4 w-4 text-[#8fc8ea]" />}
              </div>
              <h3 className="mt-3 text-lg font-medium text-white">{batch.name}</h3>
              {batch.zone_label && <p className="mt-1 text-sm text-[#9DD2F2]/70">{batch.zone_label}</p>}
            </div>
            <Link href={`/wildlife/vision/batches/${batch.id}`} className="inline-flex items-center gap-2 rounded-lg bg-[#58a9db] px-3 py-2 text-xs font-semibold text-[#06131d] hover:bg-[#76bce7]">
              Revisar <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {batch.description && <p className="mt-4 text-sm leading-6 text-white/50">{batch.description}</p>}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Analisis" value={`${batch.summary.total}/${batch.target_image_count}`} />
            <Metric label="Pendientes" value={String(batch.summary.pendingReview)} />
            <Metric label="Revisados" value={String(batch.summary.reviewed)} />
            <Metric label="Fallidos" value={String(batch.summary.failed)} />
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[#58a9db]" style={{ width: `${progress}%` }} /></div>
          <p className="mt-2 text-xs text-white/35">Creado {new Date(batch.created_at).toLocaleString('es-CL')}</p>
        </article>
      })}
    </div>
  </section>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-black/20 p-3"><p className="text-[11px] uppercase tracking-[0.1em] text-white/35">{label}</p><p className="mt-1 text-lg font-medium text-white">{value}</p></div>
}

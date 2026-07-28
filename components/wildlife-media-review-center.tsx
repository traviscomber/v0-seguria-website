'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

type ReviewStatus = 'pending' | 'in_review' | 'approved' | 'rejected'
type TaxonMatch = 'confirmed' | 'uncertain' | 'incorrect'
type LicenseDecision = 'approved' | 'rejected' | 'needs_legal_review'
type VisualQuality = 'high' | 'medium' | 'low' | 'unusable'

type Taxon = {
  id: string
  scientific_name: string
  common_name_es: string | null
  common_name_en: string | null
  animal_class: string
}

type Occurrence = {
  id: string
  source_name: string
  source_occurrence_id: string
  occurrence_status: string
  observed_at: string | null
  locality: string | null
  country_code: string | null
  occurrence_reference_url: string | null
  human_verified: boolean
  wildlife_taxa: Taxon
  wildlife_regions: { id: string; name: string; slug: string }
}

type Media = {
  id: string
  identifier_url: string
  reference_url: string | null
  creator: string | null
  rights_holder: string | null
  license_url: string | null
  license_code: string | null
  commercial_use_allowed: boolean
  derivatives_allowed: boolean
  license_verified: boolean
  width_pixels: number | null
  height_pixels: number | null
  rejection_reason: string | null
  wildlife_occurrences: Occurrence
}

type Review = {
  id: string
  organization_id: string
  media_id: string
  status: ReviewStatus
  priority: number
  reviewer_user_id: string | null
  taxon_match: TaxonMatch | null
  license_decision: LicenseDecision | null
  visual_quality: VisualQuality | null
  benchmark_eligible: boolean
  training_eligible: boolean
  rejection_reason: string | null
  notes: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  wildlife_occurrence_media: Media
  wildlife_benchmark_items: Array<{ dataset_version: string; item_status: string; split: string }>
}

type Summary = { pending: number; in_review: number; approved: number; rejected: number; total: number }

const statusLabels: Record<string, string> = {
  pending: 'Pendientes',
  in_review: 'En revisión',
  approved: 'Aprobadas',
  rejected: 'Rechazadas',
  all: 'Todas',
}

const qualityLabels: Record<VisualQuality, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
  unusable: 'No utilizable',
}

function formatDate(value?: string | null) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function unwrap<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value
}

export function WildlifeMediaReviewCenter() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<Summary>({ pending: 0, in_review: 0, approved: 0, rejected: 0, total: 0 })
  const [selected, setSelected] = useState<Review | null>(null)
  const [status, setStatus] = useState('pending')
  const [search, setSearch] = useState('')
  const [taxonMatch, setTaxonMatch] = useState<TaxonMatch>('confirmed')
  const [licenseDecision, setLicenseDecision] = useState<LicenseDecision>('approved')
  const [visualQuality, setVisualQuality] = useState<VisualQuality>('high')
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  async function load(nextStatus = status) {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/wildlife-media-reviews?status=${encodeURIComponent(nextStatus)}`, { cache: 'no-store' })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible cargar la cola.')
      const nextReviews = (result.data.reviews || []).map((review: Review) => ({
        ...review,
        wildlife_occurrence_media: unwrap(review.wildlife_occurrence_media),
      }))
      setReviews(nextReviews)
      setSummary(result.data.summary)
      setSelected((current) => current ? nextReviews.find((item: Review) => item.id === current.id) || nextReviews[0] || null : nextReviews[0] || null)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No fue posible cargar la cola.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(status)
  }, [status])

  useEffect(() => {
    if (!selected) return
    setTaxonMatch(selected.taxon_match || 'confirmed')
    setLicenseDecision(selected.license_decision || 'approved')
    setVisualQuality(selected.visual_quality || 'high')
    setNotes(selected.notes || '')
    setRejectionReason(selected.rejection_reason || '')
  }, [selected?.id])

  const visible = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return reviews
    return reviews.filter((review) => {
      const occurrence = review.wildlife_occurrence_media.wildlife_occurrences
      const taxon = occurrence.wildlife_taxa
      return [taxon.scientific_name, taxon.common_name_es, taxon.common_name_en, occurrence.source_occurrence_id, review.wildlife_occurrence_media.license_code]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    })
  }, [reviews, search])

  async function submit(decision: 'approved' | 'rejected') {
    if (!selected) return
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/wildlife-media-reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: selected.id,
          decision,
          taxonMatch,
          licenseDecision,
          visualQuality,
          notes: notes || null,
          rejectionReason: decision === 'rejected' ? rejectionReason : null,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible registrar la revisión.')
      setMessage(result.message)
      await load(status)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No fue posible registrar la revisión.')
    } finally {
      setBusy(false)
    }
  }

  const media = selected?.wildlife_occurrence_media
  const occurrence = media?.wildlife_occurrences
  const taxon = occurrence?.wildlife_taxa
  const canApprove = taxonMatch === 'confirmed' && licenseDecision === 'approved' && ['high', 'medium'].includes(visualQuality)

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">SegurIA Vision</p>
          <h1 className="mt-2 text-3xl font-light text-white">Revisión de imágenes</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Valida taxonomía, licencia y calidad visual antes de incorporar evidencia al benchmark.</p>
        </div>
        <button onClick={() => load()} disabled={loading} className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['pending', summary.pending],
          ['in_review', summary.in_review],
          ['approved', summary.approved],
          ['rejected', summary.rejected],
          ['all', summary.total],
        ].map(([value, count]) => (
          <button key={String(value)} onClick={() => setStatus(String(value))} className={`rounded-2xl border p-4 text-left transition ${status === value ? 'border-[#4DA3D9]/60 bg-[#4DA3D9]/10' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">{statusLabels[String(value)]}</p>
            <p className="mt-2 text-2xl font-light text-white">{count}</p>
          </button>
        ))}
      </section>

      {message && <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/75">{message}</div>}

      <div className="grid gap-6 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-3">
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 text-white/40" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar especie, ID o licencia" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35" />
          </label>

          <div className="max-h-[760px] space-y-3 overflow-y-auto pr-1">
            {loading ? <EmptyState text="Cargando imágenes..." /> : visible.length === 0 ? <EmptyState text="No hay imágenes en esta vista." /> : visible.map((review) => {
              const itemMedia = review.wildlife_occurrence_media
              const itemOccurrence = itemMedia.wildlife_occurrences
              const itemTaxon = itemOccurrence.wildlife_taxa
              return (
                <button key={review.id} onClick={() => setSelected(review)} className={`w-full overflow-hidden rounded-2xl border text-left transition ${selected?.id === review.id ? 'border-[#4DA3D9]/60 bg-[#4DA3D9]/10' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}>
                  <div className="grid grid-cols-[112px_1fr]">
                    <div className="aspect-square bg-black/25">
                      <img src={itemMedia.identifier_url} alt={itemTaxon.scientific_name} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="min-w-0 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white">{itemTaxon.common_name_es || itemTaxon.scientific_name}</p>
                          <p className="mt-1 truncate text-xs italic text-white/45">{itemTaxon.scientific_name}</p>
                        </div>
                        <span className="rounded-full bg-white/8 px-2.5 py-1 text-[11px] text-white/55">P{review.priority}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-[#9DD2F2]">{itemMedia.license_code || 'Sin licencia'}</span>
                        <span className="text-white/35">{statusLabels[review.status]}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="glass-card min-h-[680px] overflow-hidden">
          {!selected || !media || !occurrence || !taxon ? (
            <EmptyState text="Selecciona una imagen para revisarla." />
          ) : (
            <div className="grid min-h-[680px] xl:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)]">
              <div className="relative flex min-h-[520px] items-center justify-center bg-black/35 p-4">
                <img src={media.identifier_url} alt={taxon.scientific_name} className="max-h-[760px] w-full rounded-xl object-contain" />
                <div className="absolute left-6 top-6 flex gap-2">
                  <StatusPill status={selected.status} />
                  <span className="rounded-full bg-black/65 px-3 py-1.5 text-xs text-white/75 backdrop-blur">{media.license_code}</span>
                </div>
              </div>

              <div className="space-y-6 border-l border-white/10 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">{occurrence.wildlife_regions.name}</p>
                  <h2 className="mt-2 text-2xl font-light text-white">{taxon.common_name_es || taxon.scientific_name}</h2>
                  <p className="mt-1 text-sm italic text-[#9DD2F2]">{taxon.scientific_name}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard icon={ShieldCheck} label="Licencia" value={media.license_code || 'Sin datos'} />
                  <InfoCard icon={ImageIcon} label="Resolución" value={media.width_pixels && media.height_pixels ? `${media.width_pixels} × ${media.height_pixels}` : 'No informada'} />
                  <InfoCard icon={Scale} label="Uso comercial" value={media.commercial_use_allowed ? 'Permitido' : 'No permitido'} positive={media.commercial_use_allowed} />
                  <InfoCard icon={BadgeCheck} label="Derivados" value={media.derivatives_allowed ? 'Permitidos' : 'No permitidos'} positive={media.derivatives_allowed} />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-white/60">
                  <dl className="grid gap-3">
                    <Meta label="Fuente" value={`${occurrence.source_name} · ${occurrence.source_occurrence_id}`} />
                    <Meta label="Observación" value={formatDate(occurrence.observed_at)} />
                    <Meta label="Localidad" value={occurrence.locality || 'Sin localidad'} />
                    <Meta label="Autor" value={media.creator || media.rights_holder || 'No informado'} />
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {media.reference_url && <ExternalAnchor href={media.reference_url} label="Ver imagen original" />}
                    {occurrence.occurrence_reference_url && <ExternalAnchor href={occurrence.occurrence_reference_url} label="Ver registro GBIF" />}
                    {media.license_url && <ExternalAnchor href={media.license_url} label="Ver licencia" />}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Taxonomía">
                    <select value={taxonMatch} onChange={(event) => setTaxonMatch(event.target.value as TaxonMatch)} disabled={busy || selected.status !== 'pending'} className="field-control">
                      <option value="confirmed">Confirmada</option>
                      <option value="uncertain">Incierta</option>
                      <option value="incorrect">Incorrecta</option>
                    </select>
                  </Field>
                  <Field label="Licencia">
                    <select value={licenseDecision} onChange={(event) => setLicenseDecision(event.target.value as LicenseDecision)} disabled={busy || selected.status !== 'pending'} className="field-control">
                      <option value="approved">Aprobada</option>
                      <option value="needs_legal_review">Revisión legal</option>
                      <option value="rejected">Rechazada</option>
                    </select>
                  </Field>
                  <Field label="Calidad visual">
                    <select value={visualQuality} onChange={(event) => setVisualQuality(event.target.value as VisualQuality)} disabled={busy || selected.status !== 'pending'} className="field-control">
                      {Object.entries(qualityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Notas del revisor">
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} disabled={busy || selected.status !== 'pending'} rows={3} placeholder="Contexto taxonómico, visual o legal..." className="field-control resize-none" />
                </Field>

                <Field label="Motivo de rechazo">
                  <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} disabled={busy || selected.status !== 'pending'} rows={2} placeholder="Obligatorio al rechazar" className="field-control resize-none" />
                </Field>

                {selected.status === 'pending' ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button onClick={() => submit('rejected')} disabled={busy || !rejectionReason.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-5 py-3 text-sm text-red-100 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40">
                      <XCircle className="h-4 w-4" /> Rechazar
                    </button>
                    <button onClick={() => submit('approved')} disabled={busy || !canApprove} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4DA3D9] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#63B3E3] disabled:cursor-not-allowed disabled:opacity-40">
                      <CheckCircle2 className="h-4 w-4" /> Aprobar para benchmark
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
                    Revisión cerrada el {formatDate(selected.reviewed_at)}. {selected.benchmark_eligible ? 'La imagen forma parte del benchmark.' : 'La imagen fue excluida.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center text-sm text-white/40">{text}</div>
}

function StatusPill({ status }: { status: ReviewStatus }) {
  const styles = status === 'approved' ? 'bg-emerald-500/20 text-emerald-100' : status === 'rejected' ? 'bg-red-500/20 text-red-100' : 'bg-amber-500/20 text-amber-100'
  return <span className={`rounded-full px-3 py-1.5 text-xs backdrop-blur ${styles}`}>{statusLabels[status]}</span>
}

function InfoCard({ icon: Icon, label, value, positive }: { icon: typeof ShieldCheck; label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/4 p-4">
      <Icon className={`h-4 w-4 ${positive === false ? 'text-red-300' : 'text-[#9DD2F2]'}`} />
      <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className="mt-1 text-sm text-white/75">{value}</p>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-white/35">{label}</dt><dd className="text-right text-white/70">{value}</dd></div>
}

function ExternalAnchor({ href, label }: { href: string; label: string }) {
  return <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#9DD2F2] hover:text-white"><ExternalLink className="h-3.5 w-3.5" />{label}</a>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/40">{label}</span>{children}</label>
}

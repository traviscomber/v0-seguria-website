'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ExternalLink, FileText, ImageIcon, Loader2, MapPin, RefreshCw, Search, Video } from 'lucide-react'

type EvidenceFile = {
  name?: string
  type?: string
  size?: number
  bucket?: string
  path?: string
  signedUrl?: string | null
}

type SupportContext = {
  origin?: string
  section?: string
  kind?: string
  propertyId?: string
  itemId?: string
  itemLabel?: string
  returnPath?: string
}

type EvidenceRequest = {
  id: string
  name: string
  email: string
  phone: string | null
  status: string | null
  createdAt: string
  location: string
  subject: string
  message: string
  supportContext?: SupportContext
  evidence: EvidenceFile[]
}

type EvidenceUsage = {
  date: string
  usedBytes: number
  budgetBytes: number
  remainingBytes: number
  usagePercent: number
  level: 'normal' | 'warning' | 'critical' | 'blocked'
}

function formatBytes(bytes = 0) {
  if (bytes < 1024 * 1024) return `${Math.max(0, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function contextLabel(context?: SupportContext) {
  if (!context) return ''
  if (context.kind === 'camera') return 'Cámara'
  if (context.kind === 'incident') return 'Incidente'
  if (context.kind === 'alert') return 'Alerta'
  return context.section || context.origin || ''
}

const usageTone: Record<EvidenceUsage['level'], string> = {
  normal: 'border-emerald-300/20 bg-emerald-500/8 text-emerald-100',
  warning: 'border-amber-300/25 bg-amber-500/10 text-amber-100',
  critical: 'border-orange-300/25 bg-orange-500/10 text-orange-100',
  blocked: 'border-red-300/30 bg-red-500/12 text-red-100',
}

export default function EvidencePage() {
  const [items, setItems] = useState<EvidenceRequest[]>([])
  const [usage, setUsage] = useState<EvidenceUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/leads/evidence', { cache: 'no-store' })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) throw new Error(result?.error || 'No fue posible cargar la evidencia.')
      setItems(result.data as EvidenceRequest[])
      setUsage(result.usage as EvidenceUsage)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible cargar la evidencia.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return items
    return items.filter((item) => [
      item.name,
      item.email,
      item.location,
      item.subject,
      item.message,
      item.supportContext?.itemLabel || '',
      item.supportContext?.section || '',
      item.supportContext?.propertyId || '',
      item.supportContext?.itemId || '',
    ].some((value) => value.toLowerCase().includes(normalized)))
  }, [items, query])

  const fileCount = items.reduce((total, item) => total + item.evidence.length, 0)

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#9DD2F2]">Soporte Huilo Huilo</p>
          <h1 className="mt-2 text-3xl font-medium text-white">Evidencia recibida</h1>
          <p className="mt-2 max-w-3xl text-white/65">Archivos privados asociados a solicitudes de soporte. Los enlaces expiran automáticamente.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Solicitudes" value={String(items.length)} />
          <Metric label="Archivos" value={String(fileCount)} />
          <Metric label="Uso hoy" value={usage ? formatBytes(usage.usedBytes) : '—'} />
          <Metric label="Disponible" value={usage ? formatBytes(usage.remainingBytes) : '—'} />
        </div>
      </div>

      {usage ? (
        <section className={`rounded-[8px] border p-4 ${usageTone[usage.level]}`} aria-label="Presupuesto diario de evidencia">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              {usage.level !== 'normal' ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> : null}
              <div>
                <p className="text-sm font-medium">Presupuesto diario de almacenamiento</p>
                <p className="mt-1 text-xs opacity-75">{formatBytes(usage.usedBytes)} utilizados de {formatBytes(usage.budgetBytes)} · {usage.usagePercent}%</p>
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.14em] opacity-70">{usage.level === 'blocked' ? 'Carga bloqueada' : usage.level === 'critical' ? 'Consumo crítico' : usage.level === 'warning' ? 'Consumo elevado' : 'Operación normal'}</p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/20"><div className="h-full rounded-full bg-current transition-[width]" style={{ width: `${Math.max(usage.usagePercent, 1)}%` }} /></div>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por persona, cámara, alerta o ubicación..." className="w-full rounded-[5px] bg-white/10 py-3 pl-11 pr-4 text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#4DA3D9]" />
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-[5px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />Actualizar</button>
      </div>

      {error ? <p className="rounded-[5px] border border-red-300/25 bg-red-500/10 p-4 text-sm text-red-100" role="alert">{error}</p> : null}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center text-white/60"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Cargando evidencia...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center text-white/55">No hay solicitudes con evidencia para este filtro.</div>
      ) : (
        <div className="space-y-5">
          {filtered.map((item) => {
            const context = item.supportContext
            const sourceLabel = contextLabel(context)
            return (
              <article key={item.id} className="glass-card overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-white/10 p-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-white">{item.name}</h2>
                    <p className="mt-1 text-sm text-white/60">{item.email}{item.phone ? ` · ${item.phone}` : ''}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#9DD2F2]">{item.location || 'Huilo Huilo'} · {formatDate(item.createdAt)}</p>
                  </div>
                  <span className="self-start rounded-[5px] border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/65">{item.evidence.length} adjunto{item.evidence.length === 1 ? '' : 's'}</span>
                </div>

                <div className="grid gap-6 p-5 lg:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    {context && (context.itemLabel || context.section || context.propertyId) ? (
                      <div className="mb-5 rounded-[8px] border border-[#4DA3D9]/25 bg-[#4DA3D9]/8 p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9DD2F2]" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-[0.14em] text-[#9DD2F2]">Origen contextual{sourceLabel ? ` · ${sourceLabel}` : ''}</p>
                            <p className="mt-2 text-sm font-medium text-white/90">{context.itemLabel || context.section || 'Portal Huilo Huilo'}</p>
                            <p className="mt-1 break-all text-xs leading-5 text-white/50">{context.propertyId ? `Propiedad: ${context.propertyId}` : ''}{context.itemId ? `${context.propertyId ? ' · ' : ''}Elemento: ${context.itemId}` : ''}</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <p className="text-xs uppercase tracking-[0.14em] text-white/45">Solicitud</p>
                    <p className="mt-2 text-sm font-medium text-white/85">{item.subject || 'Soporte operativo'}</p>
                    <p className="mt-3 text-sm leading-7 text-white/65">{item.message || 'Sin mensaje adicional.'}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {item.evidence.map((file, index) => {
                      const isImage = file.type?.startsWith('image/')
                      const isVideo = file.type?.startsWith('video/')
                      const Icon = isVideo ? Video : isImage ? ImageIcon : FileText
                      return (
                        <a key={`${file.path}-${index}`} href={file.signedUrl || '#'} target="_blank" rel="noreferrer" aria-disabled={!file.signedUrl} className={`group overflow-hidden rounded-[8px] border border-white/10 bg-black/15 transition ${file.signedUrl ? 'hover:border-[#4DA3D9]/60 hover:bg-white/[0.06]' : 'pointer-events-none opacity-55'}`}>
                          <div className="relative flex h-36 items-center justify-center overflow-hidden bg-black/20">{isImage && file.signedUrl ? <img src={file.signedUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" /> : <Icon className="h-8 w-8 text-[#9DD2F2]" aria-hidden="true" />}</div>
                          <div className="flex items-center gap-3 p-3">
                            <Icon className="h-4 w-4 shrink-0 text-[#9DD2F2]" aria-hidden="true" />
                            <span className="min-w-0 flex-1"><span className="block truncate text-sm text-white/85">{file.name || 'Archivo'}</span><span className="block text-xs text-white/45">{formatBytes(file.size)}</span></span>
                            <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-white" aria-hidden="true" />
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[5px] border border-white/10 bg-white/5 px-4 py-3"><p className="text-xs uppercase tracking-[0.16em] text-white/45">{label}</p><p className="mt-1 text-xl text-white">{value}</p></div>
}

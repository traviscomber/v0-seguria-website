'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, Camera, Loader2, Sparkles, Upload } from 'lucide-react'

import {
  selectVisionProvider,
  visionProviderEndpoint,
  visionProviderLabel,
  type VisionProvider,
} from '@/lib/wildlife/vision-providers'

type Detection = {
  species: string
  confidence: number
  box: { x1: number; y1: number; x2: number; y2: number }
  description?: string
}

type VisionResponse = {
  ok?: boolean
  status?: string
  provider?: string
  model_version?: string
  job_id?: string | null
  detections_count?: number
  detections?: Detection[]
  scene_summary?: string
  operational_risks?: string[]
  limitations?: string[]
  error?: string
  message?: string
}

type ProviderResponse = {
  providers?: {
    openai?: { configured?: boolean; ready?: boolean; status?: string; model?: string }
  }
}

type BatchResult = {
  filename: string
  state: 'processing' | 'completed' | 'failed'
  result?: VisionResponse
}

const MAX_BATCH_SIZE = 20

export function VisionConsole() {
  const [health, setHealth] = useState<VisionResponse | null>(null)
  const [ready, setReady] = useState<VisionResponse | null>(null)
  const [providers, setProviders] = useState<ProviderResponse | null>(null)
  const [results, setResults] = useState<BatchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void Promise.all([
      fetch('/api/vision/health', { cache: 'no-store' }),
      fetch('/api/vision/ready', { cache: 'no-store' }),
      fetch('/api/vision/providers', { cache: 'no-store' }),
    ]).then(async ([healthResponse, readyResponse, providerResponse]) => {
      setHealth(await healthResponse.json())
      setReady(await readyResponse.json())
      setProviders(await providerResponse.json())
    })
  }, [])

  const isOnnxReady = ready?.ok === true
  const isOpenAiReady = providers?.providers?.openai?.ready === true
  const selectedProvider: VisionProvider = selectVisionProvider({
    onnxReady: isOnnxReady,
    openaiReady: isOpenAiReady,
    openaiModel: providers?.providers?.openai?.model,
  })
  const selectedEndpoint = visionProviderEndpoint(selectedProvider)
  const providerLabel = visionProviderLabel(selectedProvider, providers?.providers?.openai?.model)

  async function analyzeFile(file: File) {
    if (!selectedEndpoint) return
    setResults((current) => current.map((item) => item.filename === file.name ? { ...item, state: 'processing' } : item))

    try {
      const response = await fetch(selectedEndpoint, {
        method: 'POST',
        headers: {
          'X-Image-Content-Type': file.type,
          'X-Image-Filename': encodeURIComponent(file.name),
        },
        body: await file.arrayBuffer(),
      })
      const payload = await response.json() as VisionResponse
      setResults((current) => current.map((item) => item.filename === file.name
        ? { ...item, state: response.ok ? 'completed' : 'failed', result: payload }
        : item))
    } catch (error) {
      setResults((current) => current.map((item) => item.filename === file.name
        ? {
            ...item,
            state: 'failed',
            result: {
              error: 'vision_request_failed',
              message: error instanceof Error ? error.message : 'No fue posible ejecutar el análisis.',
            },
          }
        : item))
    }
  }

  async function submitImages(formData: FormData) {
    const files = formData.getAll('images').filter((item): item is File => item instanceof File && item.size > 0)
    if (!files.length || !selectedEndpoint) return

    const selectedFiles = files.slice(0, MAX_BATCH_SIZE)
    setLoading(true)
    setResults(selectedFiles.map((file) => ({ filename: file.name, state: 'processing' })))

    for (const file of selectedFiles) {
      await analyzeFile(file)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard icon={<Activity className="h-5 w-5 text-[#9DD2F2]" />} label="Servicio" value={health?.ok ? 'Activo' : 'Sin respuesta'} />
        <StatusCard icon={<Camera className={`h-5 w-5 ${isOnnxReady ? 'text-emerald-300' : 'text-white/30'}`} />} label="ONNX" value={isOnnxReady ? 'Listo' : 'No disponible'} />
        <StatusCard icon={<Sparkles className={`h-5 w-5 ${isOpenAiReady ? 'text-[#9DD2F2]' : 'text-white/30'}`} />} label="OpenAI" value={isOpenAiReady ? 'Listo' : 'Falta API key'} />
      </div>

      <div className={`flex gap-3 rounded-xl border p-4 text-sm leading-6 ${selectedProvider ? 'border-[#9DD2F2]/20 bg-[#9DD2F2]/[0.06] text-white/75' : 'border-amber-300/20 bg-amber-300/[0.06] text-amber-100/80'}`}>
        {selectedProvider ? <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#9DD2F2]" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />}
        <p>{selectedProvider ? `Proveedor activo: ${providerLabel}.` : 'No existe un proveedor de inferencia disponible.'}</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void submitImages(new FormData(event.currentTarget))
        }}
        className="rounded-xl border border-white/10 bg-white/[0.04] p-6"
      >
        <div className="flex items-center gap-3">
          <Upload className="h-5 w-5 text-[#9DD2F2]" />
          <div>
            <h2 className="text-xl font-light text-white">Carga por lote</h2>
            <p className="text-sm text-white/55">Hasta {MAX_BATCH_SIZE} imágenes JPEG, PNG o WebP. Máximo 12 MB cada una.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row">
          <input
            name="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            disabled={!selectedProvider || loading}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#081827] px-4 py-3 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#123A5A] file:px-4 file:py-2 file:text-white disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!selectedProvider || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4DA3D9] px-6 py-3 text-sm font-medium text-[#07131f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Procesando lote...' : 'Analizar imágenes'}
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-light text-white">Resultados del lote</h2>
          <div className="mt-5 space-y-4">
            {results.map((item) => (
              <article key={item.filename} className="rounded-xl bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-white">{item.filename}</p>
                  <span className="text-xs text-white/50">{item.state === 'processing' ? 'Procesando' : item.state === 'completed' ? 'Completado' : 'Falló'}</span>
                </div>
                {item.state === 'processing' && <Loader2 className="mt-4 h-5 w-5 animate-spin text-[#9DD2F2]" />}
                {item.result?.scene_summary && <p className="mt-4 text-sm leading-6 text-white/60">{item.result.scene_summary}</p>}
                {!!item.result?.detections?.length && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {item.result.detections.map((detection, index) => (
                      <div key={`${detection.species}-${index}`} className="rounded-lg bg-white/[0.04] px-3 py-2">
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="text-white">{detection.species}</span>
                          <span className="text-[#9DD2F2]">{Math.round(detection.confidence * 100)}%</span>
                        </div>
                        {detection.description && <p className="mt-1 text-xs text-white/40">{detection.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {item.result?.message && <p className="mt-4 text-sm text-red-100/75">{item.result.message}</p>}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatusCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm text-white/50">{label}</p>
          <p className="text-lg text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

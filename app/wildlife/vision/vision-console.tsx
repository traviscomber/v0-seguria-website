'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, Camera, Loader2, Sparkles, Upload } from 'lucide-react'

import {
  selectVisionProvider,
  visionProviderEndpoint,
  visionProviderLabel,
  type VisionProvider,
} from '@/lib/wildlife/vision-providers'

interface Detection {
  species: string
  confidence: number
  box: { x1: number; y1: number; x2: number; y2: number }
  description?: string
}

interface VisionResponse {
  ok?: boolean
  status?: string
  provider?: string
  model_version?: string
  detections_count?: number
  detections?: Detection[]
  scene_summary?: string
  operational_risks?: string[]
  limitations?: string[]
  detail?: unknown
  error?: string
  message?: string
}

interface ProviderResponse {
  providers?: {
    openai?: {
      configured?: boolean
      ready?: boolean
      status?: string
      model?: string
    }
  }
}

export function VisionConsole() {
  const [health, setHealth] = useState<VisionResponse | null>(null)
  const [ready, setReady] = useState<VisionResponse | null>(null)
  const [providers, setProviders] = useState<ProviderResponse | null>(null)
  const [result, setResult] = useState<VisionResponse | null>(null)
  const [loading, setLoading] = useState(false)

  async function refreshStatus() {
    const [healthResponse, readyResponse, providerResponse] = await Promise.all([
      fetch('/api/vision/health', { cache: 'no-store' }),
      fetch('/api/vision/ready', { cache: 'no-store' }),
      fetch('/api/vision/providers', { cache: 'no-store' }),
    ])
    setHealth(await healthResponse.json())
    setReady(await readyResponse.json())
    setProviders(await providerResponse.json())
  }

  useEffect(() => {
    void refreshStatus()
  }, [])

  const isOnnxReady = ready?.ok === true
  const isOpenAiReady = providers?.providers?.openai?.ready === true
  const selectedProvider: VisionProvider = selectVisionProvider({
    onnxReady: isOnnxReady,
    openaiReady: isOpenAiReady,
    openaiModel: providers?.providers?.openai?.model,
  })
  const selectedEndpoint = visionProviderEndpoint(selectedProvider)
  const providerLabel = visionProviderLabel(
    selectedProvider,
    providers?.providers?.openai?.model
  )

  async function submitImage(formData: FormData) {
    const file = formData.get('image')
    if (!(file instanceof File) || file.size === 0 || !selectedEndpoint) return

    setLoading(true)
    setResult(null)
    try {
      const response = await fetch(selectedEndpoint, {
        method: 'POST',
        headers: { 'X-Image-Content-Type': file.type },
        body: await file.arrayBuffer(),
      })
      setResult(await response.json())
    } catch (error) {
      setResult({
        error: 'vision_request_failed',
        message: error instanceof Error ? error.message : 'No fue posible ejecutar el análisis.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-[#9DD2F2]" />
            <div>
              <p className="text-sm text-white/50">Servicio</p>
              <p className="text-lg text-white">{health?.ok ? 'Activo' : 'Sin respuesta'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <Camera className={`h-5 w-5 ${isOnnxReady ? 'text-emerald-300' : 'text-white/30'}`} />
            <div>
              <p className="text-sm text-white/50">ONNX</p>
              <p className="text-lg text-white">{isOnnxReady ? 'Listo' : 'No disponible'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <Sparkles className={`h-5 w-5 ${isOpenAiReady ? 'text-[#9DD2F2]' : 'text-white/30'}`} />
            <div>
              <p className="text-sm text-white/50">OpenAI temporal</p>
              <p className="text-lg text-white">{isOpenAiReady ? 'Listo' : 'Falta API key'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex gap-3 rounded-xl border p-4 text-sm leading-6 ${selectedProvider ? 'border-[#9DD2F2]/20 bg-[#9DD2F2]/[0.06] text-white/75' : 'border-amber-300/20 bg-amber-300/[0.06] text-amber-100/80'}`}>
        {selectedProvider ? (
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#9DD2F2]" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        )}
        <p>
          {selectedProvider
            ? `Proveedor activo: ${providerLabel}.`
            : 'No existe un proveedor de inferencia disponible. Configure OPENAI_API_KEY o incorpore un modelo ONNX válido.'}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          void submitImage(formData)
        }}
        className="rounded-xl border border-white/10 bg-white/[0.04] p-6"
      >
        <div className="flex items-center gap-3">
          <Upload className="h-5 w-5 text-[#9DD2F2]" />
          <div>
            <h2 className="text-xl font-light text-white">Prueba de imagen</h2>
            <p className="text-sm text-white/55">JPEG, PNG o WebP. Máximo 12 MB.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row">
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            disabled={!selectedProvider}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#081827] px-4 py-3 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#123A5A] file:px-4 file:py-2 file:text-white disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!selectedProvider || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4DA3D9] px-6 py-3 text-sm font-medium text-[#07131f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Analizando...' : 'Analizar imagen'}
          </button>
        </div>
      </form>

      {result && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-light text-white">Resultado</h2>
            {result.provider && (
              <span className="rounded-full border border-[#9DD2F2]/20 bg-[#9DD2F2]/10 px-3 py-1 text-xs text-[#9DD2F2]">
                {result.provider} · {result.model_version}
              </span>
            )}
          </div>

          {result.scene_summary && (
            <p className="mt-4 text-sm leading-7 text-white/65">{result.scene_summary}</p>
          )}

          {result.detections?.length ? (
            <div className="mt-4 space-y-3">
              {result.detections.map((detection, index) => (
                <div key={`${detection.species}-${index}`} className="rounded-lg bg-black/20 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white">{detection.species}</span>
                    <span className="text-[#9DD2F2]">{Math.round(detection.confidence * 100)}%</span>
                  </div>
                  {detection.description && (
                    <p className="mt-2 text-sm text-white/50">{detection.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <pre className="mt-4 overflow-auto rounded-lg bg-black/25 p-4 text-xs text-white/70">{JSON.stringify(result, null, 2)}</pre>
          )}

          {!!result.operational_risks?.length && (
            <div className="mt-5 rounded-lg border border-amber-300/15 bg-amber-300/[0.05] p-4">
              <p className="text-sm font-medium text-amber-100">Riesgos observados</p>
              <ul className="mt-2 space-y-1 text-sm text-amber-100/65">
                {result.operational_risks.map((risk) => <li key={risk}>• {risk}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

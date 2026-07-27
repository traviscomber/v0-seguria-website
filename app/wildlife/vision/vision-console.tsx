'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, Camera, Loader2, Upload } from 'lucide-react'

interface Detection {
  species: string
  confidence: number
  box: { x1: number; y1: number; x2: number; y2: number }
}

interface VisionResponse {
  ok?: boolean
  status?: string
  model_version?: string
  detections_count?: number
  detections?: Detection[]
  detail?: unknown
  error?: string
}

export function VisionConsole() {
  const [health, setHealth] = useState<VisionResponse | null>(null)
  const [ready, setReady] = useState<VisionResponse | null>(null)
  const [result, setResult] = useState<VisionResponse | null>(null)
  const [loading, setLoading] = useState(false)

  async function refreshStatus() {
    const [healthResponse, readyResponse] = await Promise.all([
      fetch('/api/vision/health', { cache: 'no-store' }),
      fetch('/api/vision/ready', { cache: 'no-store' }),
    ])
    setHealth(await healthResponse.json())
    setReady(await readyResponse.json())
  }

  useEffect(() => {
    void refreshStatus()
  }, [])

  async function submitImage(formData: FormData) {
    const file = formData.get('image')
    if (!(file instanceof File) || file.size === 0) return

    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('/api/vision/infer', {
        method: 'POST',
        headers: { 'X-Image-Content-Type': file.type },
        body: await file.arrayBuffer(),
      })
      setResult(await response.json())
    } finally {
      setLoading(false)
    }
  }

  const isReady = ready?.ok === true

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
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
            {isReady ? (
              <Camera className="h-5 w-5 text-emerald-300" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-300" />
            )}
            <div>
              <p className="text-sm text-white/50">Modelo</p>
              <p className="text-lg text-white">{isReady ? 'Listo para inferencia' : 'No disponible'}</p>
            </div>
          </div>
        </div>
      </div>

      <form action={submitImage} className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
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
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#081827] px-4 py-3 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#123A5A] file:px-4 file:py-2 file:text-white"
          />
          <button
            type="submit"
            disabled={!isReady || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4DA3D9] px-6 py-3 text-sm font-medium text-[#07131f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Analizar imagen
          </button>
        </div>
      </form>

      {result && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-light text-white">Resultado</h2>
          {result.detections?.length ? (
            <div className="mt-4 space-y-3">
              {result.detections.map((detection, index) => (
                <div key={`${detection.species}-${index}`} className="flex items-center justify-between rounded-lg bg-black/20 px-4 py-3">
                  <span className="text-white">{detection.species}</span>
                  <span className="text-[#9DD2F2]">{Math.round(detection.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <pre className="mt-4 overflow-auto rounded-lg bg-black/25 p-4 text-xs text-white/70">{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  )
}

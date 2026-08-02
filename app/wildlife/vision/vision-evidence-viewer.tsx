'use client'

import { useState } from 'react'
import { Eye, Loader2, X } from 'lucide-react'

type Detection = {
  species: string
  confidence: number
  box?: { x1: number; y1: number; x2: number; y2: number }
}

export function VisionEvidenceViewer({ jobId, detections }: { jobId: string; detections: Detection[] }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function showEvidence() {
    setOpen(true)
    if (url) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/vision/jobs/${jobId}/evidence`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar la evidencia.')
      setUrl(payload.data.url)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar la evidencia.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button type="button" onClick={() => void showEvidence()} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/[0.05]">
        <Eye className="h-3.5 w-3.5" /> Ver evidencia
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-5xl rounded-xl border border-white/10 bg-[#071522] p-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg text-white">Evidencia privada</h3>
                <p className="text-xs text-white/45">URL temporal con vigencia de 5 minutos.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-white/10 p-2 text-white/70 hover:bg-white/[0.05]" aria-label="Cerrar visor">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex min-h-64 items-center justify-center rounded-lg bg-black/30 p-3">
              {loading && <Loader2 className="h-6 w-6 animate-spin text-[#9DD2F2]" />}
              {error && <p className="text-sm text-red-100/80">{error}</p>}
              {url && (
                <div className="relative inline-block max-h-[75vh] max-w-full overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Evidencia de cámara trampa" className="block max-h-[75vh] max-w-full object-contain" />
                  {detections.map((detection, index) => {
                    const box = detection.box
                    if (!box || box.x2 <= box.x1 || box.y2 <= box.y1) return null
                    return (
                      <div
                        key={`${detection.species}-${index}`}
                        className="pointer-events-none absolute border-2 border-[#9DD2F2]"
                        style={{
                          left: `${box.x1 * 100}%`,
                          top: `${box.y1 * 100}%`,
                          width: `${(box.x2 - box.x1) * 100}%`,
                          height: `${(box.y2 - box.y1) * 100}%`,
                        }}
                      >
                        <span className="absolute left-0 top-0 -translate-y-full bg-[#071522]/90 px-1.5 py-0.5 text-[10px] text-white">
                          {detection.species} · {Math.round(detection.confidence * 100)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

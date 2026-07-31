'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, Camera, CheckCircle2, ImageIcon, Loader2, MapPin, Sparkles, Upload } from 'lucide-react'

import { getConfidenceLevel, getSpeciesLocalization } from '@/lib/wildlife/species-localization'
import { SpeciesTaxonomyPanel } from './species-taxonomy-panel'
import {
  selectVisionProvider,
  visionProviderEndpoint,
  visionProviderLabel,
  type VisionProvider,
} from '@/lib/wildlife/vision-providers'

type Detection = {
  species: string
  confidence: number
  confidence_source?: 'model' | 'heuristic' | 'verification'
  model_confidence?: number | null
  box: { x1: number; y1: number; x2: number; y2: number }
  description?: string
}

type VisionResponse = {
  ok?: boolean
  status?: string
  provider?: string
  model_version?: string
  job_id?: string | null
  camera_id?: string | null
  zone_label?: string | null
  captured_at?: string | null
  evidence_stored?: boolean
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

type CameraRecord = {
  id: string
  code: string
  name: string
  zone_label?: string | null
  active: boolean
}

type BatchResult = {
  filename: string
  previewUrl: string
  state: 'processing' | 'completed' | 'failed'
  result?: VisionResponse
}

type CaptureMetadata = {
  cameraCode: string
  cameraName: string
  zoneLabel: string
  capturedAt: string
}

const MAX_BATCH_SIZE = 20
const MANUAL_CAMERA = '__manual__'

function confidenceSourceLabel(source: Detection['confidence_source']) {
  if (source === 'verification') return 'Verificacion visual'
  if (source === 'heuristic') return 'Estimacion del sistema'
  return 'Modelo de vision'
}

export function VisionConsole() {
  const [health, setHealth] = useState<VisionResponse | null>(null)
  const [ready, setReady] = useState<VisionResponse | null>(null)
  const [providers, setProviders] = useState<ProviderResponse | null>(null)
  const [cameras, setCameras] = useState<CameraRecord[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState('')
  const [results, setResults] = useState<BatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [cameraLoadError, setCameraLoadError] = useState<string | null>(null)

  useEffect(() => {
    void Promise.all([
      fetch('/api/vision/health', { cache: 'no-store' }),
      fetch('/api/vision/ready', { cache: 'no-store' }),
      fetch('/api/vision/providers', { cache: 'no-store' }),
      fetch('/api/vision/cameras', { cache: 'no-store' }),
    ]).then(async ([healthResponse, readyResponse, providerResponse, cameraResponse]) => {
      setHealth(await healthResponse.json())
      setReady(await readyResponse.json())
      setProviders(await providerResponse.json())
      const cameraPayload = await cameraResponse.json()
      if (cameraResponse.ok && cameraPayload.success) {
        const activeCameras = (cameraPayload.data as CameraRecord[]).filter((camera) => camera.active)
        setCameras(activeCameras)
        if (activeCameras.length === 1) setSelectedCameraId(activeCameras[0].id)
      } else {
        setCameraLoadError(cameraPayload.error || 'No fue posible cargar las camaras registradas.')
      }
    }).catch(() => setCameraLoadError('No fue posible cargar las camaras registradas.'))
  }, [])

  useEffect(() => () => {
    results.forEach((item) => URL.revokeObjectURL(item.previewUrl))
  }, [results])

  const selectedCamera = useMemo(
    () => cameras.find((camera) => camera.id === selectedCameraId) || null,
    [cameras, selectedCameraId],
  )
  const manualMode = selectedCameraId === MANUAL_CAMERA
  const isOnnxReady = ready?.ok === true
  const isOpenAiReady = providers?.providers?.openai?.ready === true
  const selectedProvider: VisionProvider = selectVisionProvider({
    onnxReady: isOnnxReady,
    openaiReady: isOpenAiReady,
    openaiModel: providers?.providers?.openai?.model,
  })
  const selectedEndpoint = visionProviderEndpoint(selectedProvider)
  const providerLabel = visionProviderLabel(selectedProvider, providers?.providers?.openai?.model)

  async function analyzeFile(file: File, metadata: CaptureMetadata) {
    if (!selectedEndpoint) return
    try {
      const headers: Record<string, string> = {
        'X-Image-Content-Type': file.type,
        'X-Image-Filename': encodeURIComponent(file.name),
      }
      if (metadata.cameraCode) headers['X-Camera-Code'] = encodeURIComponent(metadata.cameraCode)
      if (metadata.cameraName) headers['X-Camera-Name'] = encodeURIComponent(metadata.cameraName)
      if (metadata.zoneLabel) headers['X-Zone-Label'] = encodeURIComponent(metadata.zoneLabel)
      if (metadata.capturedAt) headers['X-Captured-At'] = new Date(metadata.capturedAt).toISOString()

      const response = await fetch(selectedEndpoint, { method: 'POST', headers, body: await file.arrayBuffer() })
      const payload = await response.json() as VisionResponse
      setResults((current) => current.map((item) => item.filename === file.name
        ? { ...item, state: response.ok && payload.job_id ? 'completed' : 'failed', result: payload }
        : item))
      if (response.ok && payload.job_id) window.dispatchEvent(new Event('wildlife-job-created'))
    } catch (error) {
      setResults((current) => current.map((item) => item.filename === file.name
        ? { ...item, state: 'failed', result: { error: 'vision_request_failed', message: error instanceof Error ? error.message : 'No fue posible ejecutar el analisis.' } }
        : item))
    }
  }

  async function submitImages(formData: FormData) {
    const files = formData.getAll('images').filter((item): item is File => item instanceof File && item.size > 0)
    if (!files.length || !selectedEndpoint) return
    const metadata: CaptureMetadata = selectedCamera
      ? { cameraCode: selectedCamera.code, cameraName: selectedCamera.name, zoneLabel: selectedCamera.zone_label || '', capturedAt: String(formData.get('capturedAt') || '').trim() }
      : { cameraCode: String(formData.get('cameraCode') || '').trim(), cameraName: String(formData.get('cameraName') || '').trim(), zoneLabel: String(formData.get('zoneLabel') || '').trim(), capturedAt: String(formData.get('capturedAt') || '').trim() }

    results.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    const selectedFiles = files.slice(0, MAX_BATCH_SIZE)
    setLoading(true)
    setResults(selectedFiles.map((file) => ({ filename: file.name, previewUrl: URL.createObjectURL(file), state: 'processing' })))
    for (const file of selectedFiles) await analyzeFile(file, metadata)
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatusCard icon={<Activity className="h-4 w-4" />} label="Servicio" value={health?.ok ? 'Operativo' : 'Sin respuesta'} active={Boolean(health?.ok)} />
        <StatusCard icon={<Camera className="h-4 w-4" />} label="Motor local" value={isOnnxReady ? 'Disponible' : 'No disponible'} active={isOnnxReady} />
        <StatusCard icon={<Sparkles className="h-4 w-4" />} label="Motor IA" value={isOpenAiReady ? providerLabel : 'No disponible'} active={isOpenAiReady} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1d2c] shadow-2xl shadow-black/20">
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">Nueva revision</p>
              <h2 className="mt-1 text-2xl font-light text-white">Analizar evidencia</h2>
              <p className="mt-1 text-sm text-white/50">Carga fotografias, asigna camara y conserva el resultado para validacion cientifica.</p>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${selectedProvider ? 'bg-emerald-400/10 text-emerald-200' : 'bg-amber-300/10 text-amber-100'}`}>
              {selectedProvider ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
              {selectedProvider ? 'Sistema listo' : 'Sin proveedor disponible'}
            </div>
          </div>
        </div>

        <form onSubmit={(event) => { event.preventDefault(); void submitImages(new FormData(event.currentTarget)) }} className="p-5 sm:p-6">
          {cameraLoadError && <p className="mb-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-3 text-sm text-amber-100/80">{cameraLoadError}</p>}

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <label className="block text-sm text-white/65">
                <span className="mb-2 block">Camara o punto de captura</span>
                <select value={selectedCameraId} onChange={(event) => setSelectedCameraId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#071622] px-4 py-3.5 text-white outline-none transition focus:border-[#68b4e3]/50">
                  <option value="">Sin camara asociada</option>
                  {cameras.map((camera) => <option key={camera.id} value={camera.id}>{camera.code} · {camera.name}{camera.zone_label ? ` · ${camera.zone_label}` : ''}</option>)}
                  <option value={MANUAL_CAMERA}>Ingresar camara manualmente</option>
                </select>
              </label>

              {selectedCamera && (
                <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-xl border border-[#68b4e3]/15 bg-[#68b4e3]/[0.05] px-4 py-3 text-sm text-white/65">
                  <span><strong className="font-medium text-white">{selectedCamera.code}</strong> · {selectedCamera.name}</span>
                  {selectedCamera.zone_label && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{selectedCamera.zone_label}</span>}
                </div>
              )}

              {manualMode && (
                <div className="grid gap-3 md:grid-cols-3">
                  <Field name="cameraCode" label="Codigo" placeholder="CAM-HH-001" required />
                  <Field name="cameraName" label="Nombre" placeholder="Sendero norte" required />
                  <Field name="zoneLabel" label="Zona" placeholder="Reserva norte" />
                </div>
              )}
            </div>

            <label className="block text-sm text-white/65">
              <span className="mb-2 block">Fecha y hora de captura</span>
              <input name="capturedAt" type="datetime-local" className="w-full rounded-xl border border-white/10 bg-[#071622] px-4 py-3.5 text-white outline-none transition focus:border-[#68b4e3]/50" />
            </label>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
            <label className="group flex min-h-28 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-5 text-center transition hover:border-[#68b4e3]/40 hover:bg-[#68b4e3]/[0.04]">
              <input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required disabled={!selectedProvider || loading} className="sr-only" />
              <span>
                <ImageIcon className="mx-auto h-7 w-7 text-[#8fc8ea]" />
                <span className="mt-2 block text-sm font-medium text-white">Seleccionar fotografias</span>
                <span className="mt-1 block text-xs text-white/40">JPG, PNG o WebP · maximo {MAX_BATCH_SIZE} archivos</span>
              </span>
            </label>
            <button type="submit" disabled={!selectedProvider || loading} className="inline-flex min-h-28 items-center justify-center gap-2 rounded-2xl bg-[#58a9db] px-8 text-sm font-semibold text-[#06131d] transition hover:bg-[#76bce7] disabled:cursor-not-allowed disabled:opacity-40">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              {loading ? 'Analizando...' : 'Analizar y guardar'}
            </button>
          </div>
        </form>
      </section>

      {results.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">Resultado reciente</p>
              <h2 className="mt-1 text-xl font-light text-white">Evidencia procesada</h2>
            </div>
            <span className="text-xs text-white/35">{results.length} archivo{results.length === 1 ? '' : 's'}</span>
          </div>

          <div className="space-y-4">
            {results.map((item) => (
              <article key={item.filename} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1d2c]">
                <div className="grid lg:grid-cols-[320px_1fr]">
                  <div className="relative min-h-64 bg-black/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.previewUrl} alt={item.filename} className="h-full min-h-64 w-full object-contain" />
                    <div className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs text-white/80 backdrop-blur">{item.filename}</div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-white/35">Estado</p>
                        <p className={`mt-1 text-sm font-medium ${item.state === 'completed' ? 'text-emerald-200' : item.state === 'failed' ? 'text-red-200' : 'text-[#8fc8ea]'}`}>
                          {item.state === 'processing' ? 'Procesando evidencia' : item.state === 'completed' ? 'Guardado y listo para revision' : 'No fue posible completar el analisis'}
                        </p>
                      </div>
                      {item.result?.job_id && <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-white/45">ID {item.result.job_id.slice(0, 8)}</span>}
                    </div>

                    {item.state === 'processing' && <Loader2 className="mt-8 h-6 w-6 animate-spin text-[#8fc8ea]" />}
                    {item.result?.scene_summary && <p className="mt-5 text-base leading-7 text-white/72">{item.result.scene_summary}</p>}

                    {!!item.result?.detections?.length && (
                      <div className="mt-5 space-y-4">
                        {item.result.detections.map((detection, index) => {
                          const species = getSpeciesLocalization(detection.species)
                          const confidencePercent = Math.round(detection.confidence * 100)
                          return (
                            <div key={`${detection.species}-${index}`} className="overflow-hidden rounded-2xl border border-[#68b4e3]/20 bg-[#071622]">
                              <div className="flex flex-col gap-4 border-b border-white/8 p-5 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8fc8ea]">Ficha de identificacion</p>
                                  <h3 className="mt-2 text-2xl font-light text-white">{species.label}</h3>
                                  {species.scientificName && <p className="mt-1 text-sm italic text-white/50">{species.scientificName}</p>}
                                </div>
                                <div className="rounded-xl border border-[#68b4e3]/20 bg-[#68b4e3]/[0.07] px-4 py-3 text-right">
                                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">Confianza</p>
                                  <p className="mt-1 text-2xl font-light text-[#9bd3f3]">{confidencePercent}%</p>
                                  <p className="mt-0.5 text-xs text-white/40">{getConfidenceLevel(detection.confidence)}</p>
                                </div>
                              </div>

                              <div className="grid gap-px bg-white/8 sm:grid-cols-3">
                                <div className="bg-[#071622] p-4">
                                  <p className="text-[11px] uppercase tracking-[0.13em] text-white/30">Nombre comun</p>
                                  <p className="mt-1 text-sm text-white/80">{species.label}</p>
                                </div>
                                <div className="bg-[#071622] p-4">
                                  <p className="text-[11px] uppercase tracking-[0.13em] text-white/30">Nombre cientifico</p>
                                  <p className="mt-1 text-sm italic text-white/80">{species.scientificName || 'No disponible'}</p>
                                </div>
                                <div className="bg-[#071622] p-4">
                                  <p className="text-[11px] uppercase tracking-[0.13em] text-white/30">Origen del score</p>
                                  <p className="mt-1 text-sm text-white/80">{confidenceSourceLabel(detection.confidence_source)}</p>
                                </div>
                              </div>

                              <div className="p-5">
                                <p className="text-[11px] uppercase tracking-[0.13em] text-white/30">Rasgos observados</p>
                                <p className="mt-2 text-sm leading-6 text-white/60">{detection.description || 'Sin descripcion morfologica disponible.'}</p>
                              </div>

                              <SpeciesTaxonomyPanel species={species} />
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {(item.result?.zone_label || item.result?.captured_at) && <p className="mt-5 text-xs text-white/35">{[item.result.zone_label, item.result.captured_at ? new Date(item.result.captured_at).toLocaleString('es-CL') : null].filter(Boolean).join(' · ')}</p>}
                    {item.result?.message && <p className="mt-5 rounded-xl border border-red-300/15 bg-red-300/[0.04] p-3 text-sm text-red-100/80">{item.result.message}</p>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Field({ name, label, placeholder, required = false }: { name: string; label: string; placeholder: string; required?: boolean }) {
  return <label className="block text-sm text-white/60"><span className="mb-1.5 block">{label}</span><input name={name} placeholder={placeholder} required={required} className="w-full rounded-xl border border-white/10 bg-[#071622] px-3 py-3 text-white outline-none focus:border-[#68b4e3]/50" /></label>
}

function StatusCard({ icon, label, value, active }: { icon: React.ReactNode; label: string; value: string; active: boolean }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={active ? 'text-[#8fc8ea]' : 'text-white/25'}>{icon}</span>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">{label}</p>
          <p className="truncate text-sm text-white/75">{value}</p>
        </div>
      </div>
    </div>
  )
}

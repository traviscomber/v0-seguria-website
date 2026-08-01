'use client'

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react'
import { AlertTriangle, Camera, Clock3, Layers3, MapPin, Minus, Plus, RefreshCw, RotateCcw, Scan, ShieldAlert, X } from 'lucide-react'

import { getSpeciesLocalization } from '@/lib/wildlife/species-localization'

type LayerId = 'osm' | 'topo' | 'satellite'
type Period = '1' | '7' | '30' | '90' | 'all'
type Visibility = { cameras: boolean; landmarks: boolean; conservation: boolean }
type CameraRecord = { id: string; code: string; name: string; zone_label?: string | null; latitude?: number | null; longitude?: number | null; active: boolean }
type JobRecord = { id: string; camera_id?: string | null; zone_label?: string | null; captured_at?: string | null; created_at: string; result_json?: { detections?: Array<{ species?: string; confidence?: number }> } | null; wildlife_cameras?: { zone_label?: string | null } | null }
type Sighting = { id: string; speciesCode: string; speciesLabel: string; confidence?: number; zone: string; date: Date; camera?: CameraRecord }
type DragState = { pointerId: number; x: number; y: number; originX: number; originY: number }

const CENTER = { latitude: -39.905, longitude: -71.913 }
const VIEWPORT = { width: 960, height: 560 }
const MAX_PAN = 900
const CONSERVATION_CENTER = { latitude: -39.9378, longitude: -71.9037 }
const LANDMARKS = [
  { name: 'Hotel Nothofagus', latitude: -39.86924, longitude: -71.91447 },
  { name: 'Montana Magica', latitude: -39.86939, longitude: -71.91515 },
  { name: 'Museo de los Volcanes', latitude: -39.86139, longitude: -71.90568 },
  { name: 'Salto Huilo Huilo', latitude: -39.85332, longitude: -71.95414 },
  { name: 'Pampa Pilmaiquen', latitude: -39.93692, longitude: -71.90272 },
]
const CONSERVATION_POLYGON = [
  [-39.9265, -71.9195], [-39.9208, -71.909], [-39.9248, -71.8945], [-39.9368, -71.8858],
  [-39.9498, -71.8908], [-39.9555, -71.9045], [-39.9472, -71.9185], [-39.9365, -71.922],
] as const
const LAYERS = {
  osm: { label: 'Mapa', attribution: 'OpenStreetMap contributors', tileUrl: (z: number, x: number, y: number) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png` },
  topo: { label: 'Terreno', attribution: 'OpenTopoMap contributors', tileUrl: (z: number, x: number, y: number) => `https://a.tile.opentopomap.org/${z}/${x}/${y}.png` },
  satellite: { label: 'Satelite', attribution: 'Esri World Imagery', tileUrl: (z: number, x: number, y: number) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}` },
} satisfies Record<LayerId, { label: string; attribution: string; tileUrl: (z: number, x: number, y: number) => string }>

function worldX(longitude: number, zoom: number) { return ((longitude + 180) / 360) * 256 * 2 ** zoom }
function worldY(latitude: number, zoom: number) { const r = latitude * Math.PI / 180; return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 256 * 2 ** zoom }
function clamp(value: number) { return Math.max(-MAX_PAN, Math.min(MAX_PAN, value)) }
function isControl(target: EventTarget | null) { return target instanceof Element && Boolean(target.closest('button,select,input,label,a')) }

export function OperationalTerritorialMap() {
  const [layerId, setLayerId] = useState<LayerId>('satellite')
  const [period, setPeriod] = useState<Period>('30')
  const [visibility, setVisibility] = useState<Visibility>({ cameras: true, landmarks: true, conservation: true })
  const [zoom, setZoom] = useState(12)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
  const [cameras, setCameras] = useState<CameraRecord[]>([])
  const [jobs, setJobs] = useState<JobRecord[]>([])
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const layer = LAYERS[layerId]

  async function loadData() {
    setLoading(true); setError(null)
    try {
      const [cameraResponse, jobsResponse] = await Promise.all([
        fetch('/api/vision/cameras', { cache: 'no-store' }),
        fetch('/api/vision/jobs?limit=100&status=completed', { cache: 'no-store' }),
      ])
      const cameraPayload = await cameraResponse.json(); const jobsPayload = await jobsResponse.json()
      if (!cameraResponse.ok || !cameraPayload.success) throw new Error(cameraPayload.error || 'No fue posible cargar las camaras.')
      if (!jobsResponse.ok || !jobsPayload.success) throw new Error(jobsPayload.error || 'No fue posible cargar los avistamientos.')
      setCameras(cameraPayload.data || []); setJobs(jobsPayload.data || [])
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar la cartografia operativa.') }
    finally { setLoading(false) }
  }

  useEffect(() => { void loadData(); const handler = () => void loadData(); window.addEventListener('wildlife-job-created', handler); return () => window.removeEventListener('wildlife-job-created', handler) }, [])

  useEffect(() => {
    const handler = (event: Event) => {
      const cameraId = (event as CustomEvent<{ cameraId?: string }>).detail?.cameraId
      if (!cameraId) return
      const camera = cameras.find((item) => item.id === cameraId)
      if (!camera || typeof camera.latitude !== 'number' || typeof camera.longitude !== 'number') return
      const nextZoom = Math.max(zoom, 13)
      const centerX = worldX(CENTER.longitude, nextZoom)
      const centerY = worldY(CENTER.latitude, nextZoom)
      setSelectedCameraId(camera.id)
      setVisibility((current) => ({ ...current, cameras: true }))
      setZoom(nextZoom)
      setPan({
        x: clamp(centerX - worldX(camera.longitude, nextZoom)),
        y: clamp(centerY - worldY(camera.latitude, nextZoom)),
      })
    }

    window.addEventListener('seguria-map-focus', handler)
    return () => window.removeEventListener('seguria-map-focus', handler)
  }, [cameras, zoom])

  const sightings = useMemo<Sighting[]>(() => jobs.map((job) => {
    const detection = job.result_json?.detections?.[0]; const speciesCode = detection?.species || 'unknown_animal'; const camera = cameras.find((item) => item.id === job.camera_id)
    return { id: job.id, speciesCode, speciesLabel: getSpeciesLocalization(speciesCode).label, confidence: detection?.confidence, zone: job.zone_label || camera?.zone_label || job.wildlife_cameras?.zone_label || 'Sin sector', date: new Date(job.captured_at || job.created_at), camera }
  }), [jobs, cameras])

  const speciesOptions = useMemo(() => Array.from(new Set(sightings.map((item) => item.speciesCode))).sort(), [sightings])
  const zoneOptions = useMemo(() => Array.from(new Set(sightings.map((item) => item.zone))).sort(), [sightings])
  const filtered = useMemo(() => sightings.filter((item) => {
    const cutoff = period === 'all' ? null : new Date(Date.now() - Number(period) * 86400000)
    return (!cutoff || item.date >= cutoff) && (speciesFilter === 'all' || item.speciesCode === speciesFilter) && (zoneFilter === 'all' || item.zone === zoneFilter)
  }), [sightings, period, speciesFilter, zoneFilter])
  const mappedCameras = cameras.filter((camera) => typeof camera.latitude === 'number' && typeof camera.longitude === 'number')
  const visibleCameraIds = new Set(filtered.map((item) => item.camera?.id).filter(Boolean))
  const pending = filtered.filter((item) => !item.camera || typeof item.camera.latitude !== 'number' || typeof item.camera.longitude !== 'number')
  const selectedCamera = cameras.find((camera) => camera.id === selectedCameraId) || null
  const selectedSightings = selectedCamera ? filtered.filter((item) => item.camera?.id === selectedCamera.id) : []

  const projection = useMemo(() => {
    const centerX = worldX(CENTER.longitude, zoom); const centerY = worldY(CENTER.latitude, zoom)
    const leftWorld = centerX - VIEWPORT.width / 2 - pan.x; const topWorld = centerY - VIEWPORT.height / 2 - pan.y
    return { leftWorld, topWorld, point: (latitude: number, longitude: number) => ({ x: worldX(longitude, zoom) - leftWorld, y: worldY(latitude, zoom) - topWorld }) }
  }, [zoom, pan])
  const tiles = useMemo(() => {
    const result: Array<{ x: number; y: number; left: number; top: number }> = []
    for (let x = Math.floor(projection.leftWorld / 256); x <= Math.floor((projection.leftWorld + VIEWPORT.width) / 256); x += 1) for (let y = Math.floor(projection.topWorld / 256); y <= Math.floor((projection.topWorld + VIEWPORT.height) / 256); y += 1) result.push({ x, y, left: x * 256 - projection.leftWorld, top: y * 256 - projection.topWorld })
    return result
  }, [projection.leftWorld, projection.topWorld])
  const polygonPoints = CONSERVATION_POLYGON.map(([latitude, longitude]) => { const p = projection.point(latitude, longitude); return `${p.x},${p.y}` }).join(' ')
  const conservationPosition = projection.point(CONSERVATION_CENTER.latitude, CONSERVATION_CENTER.longitude)

  function centerOn(latitude: number, longitude: number, nextZoom = Math.max(zoom, 13)) {
    const centerX = worldX(CENTER.longitude, nextZoom); const centerY = worldY(CENTER.latitude, nextZoom)
    setZoom(nextZoom); setPan({ x: clamp(centerX - worldX(longitude, nextZoom)), y: clamp(centerY - worldY(latitude, nextZoom)) })
  }
  function focusCamera(camera: CameraRecord) { if (typeof camera.latitude !== 'number' || typeof camera.longitude !== 'number') return; setSelectedCameraId(camera.id); centerOn(camera.latitude, camera.longitude) }
  function fitResults() {
    const locations = filtered.map((item) => item.camera).filter((camera): camera is CameraRecord => Boolean(camera && typeof camera.latitude === 'number' && typeof camera.longitude === 'number'))
    if (!locations.length) return resetView()
    const latitude = locations.reduce((sum, camera) => sum + Number(camera.latitude), 0) / locations.length
    const longitude = locations.reduce((sum, camera) => sum + Number(camera.longitude), 0) / locations.length
    setSelectedCameraId(null); centerOn(latitude, longitude, locations.length === 1 ? 14 : 12)
  }
  function resetView() { setSelectedCameraId(null); setZoom(12); setPan({ x: 0, y: 0 }) }
  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) { if (isControl(event.target)) return; event.currentTarget.setPointerCapture(event.pointerId); dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, originX: pan.x, originY: pan.y }; setDragging(true) }
  function pointerMove(event: ReactPointerEvent<HTMLDivElement>) { const drag = dragRef.current; if (!drag || drag.pointerId !== event.pointerId) return; setPan({ x: clamp(drag.originX + event.clientX - drag.x), y: clamp(drag.originY + event.clientY - drag.y) }) }
  function finishDrag(event: ReactPointerEvent<HTMLDivElement>) { if (dragRef.current?.pointerId !== event.pointerId) return; dragRef.current = null; setDragging(false); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }
  function wheel(event: ReactWheelEvent<HTMLDivElement>) { if (isControl(event.target)) return; event.preventDefault(); setZoom((value) => Math.max(10, Math.min(15, value + (event.deltaY < 0 ? 1 : -1)))) }

  return <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1d2c]">
    <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">Centro de operaciones territorial</p><h2 className="mt-1 text-2xl font-medium text-white">Mapa operativo de Huilo Huilo</h2><p className="mt-1 text-sm text-white/60">Capas, periodo, camaras y evidencia conectados en una sola vista.</p></div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={fitResults} className="inline-flex items-center gap-2 rounded-xl border border-[#68b4e3]/25 bg-[#68b4e3]/[0.07] px-4 py-2.5 text-sm text-[#a9dcf7]"><Scan className="h-4 w-4" />Ajustar a resultados</button><button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm text-white/80 disabled:opacity-40"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Actualizar</button></div>
    </div>

    <div className="grid gap-3 border-b border-white/10 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
      <label className="text-sm text-white/65"><span className="mb-2 flex items-center gap-2"><Clock3 className="h-4 w-4" />Periodo</span><select value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="w-full rounded-xl border border-white/12 bg-[#071622] px-4 py-3 text-white outline-none"><option value="1">Ultimas 24 horas</option><option value="7">Ultimos 7 dias</option><option value="30">Ultimos 30 dias</option><option value="90">Ultimos 90 dias</option><option value="all">Todo el historial</option></select></label>
      <label className="text-sm text-white/65"><span className="mb-2 block">Especie</span><select value={speciesFilter} onChange={(event) => setSpeciesFilter(event.target.value)} className="w-full rounded-xl border border-white/12 bg-[#071622] px-4 py-3 text-white outline-none"><option value="all">Todas las especies</option>{speciesOptions.map((code) => <option key={code} value={code}>{getSpeciesLocalization(code).label}</option>)}</select></label>
      <label className="text-sm text-white/65"><span className="mb-2 block">Sector</span><select value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)} className="w-full rounded-xl border border-white/12 bg-[#071622] px-4 py-3 text-white outline-none"><option value="all">Todos los sectores</option>{zoneOptions.map((zone) => <option key={zone} value={zone}>{zone}</option>)}</select></label>
      <div className="text-sm text-white/65"><span className="mb-2 flex items-center gap-2"><Layers3 className="h-4 w-4" />Capas operativas</span><div className="grid grid-cols-3 gap-1.5">{([['cameras','Camaras'],['landmarks','Referencias'],['conservation','Conservacion']] as const).map(([key,label]) => <button key={key} type="button" aria-pressed={visibility[key]} onClick={() => setVisibility((current) => ({ ...current, [key]: !current[key] }))} className={`rounded-lg border px-2 py-3 text-[11px] ${visibility[key] ? 'border-[#68b4e3]/35 bg-[#68b4e3]/10 text-[#a9dcf7]' : 'border-white/10 text-white/40'}`}>{label}</button>)}</div></div>
    </div>

    {error && <p className="m-5 rounded-xl border border-red-300/15 bg-red-300/[0.04] p-4 text-sm text-red-100/85">{error}</p>}

    <div className="relative min-h-[650px] overflow-hidden bg-[#071622] sm:min-h-[590px]">
      <div role="application" aria-label="Mapa interactivo" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={finishDrag} onPointerCancel={finishDrag} onWheel={wheel} className={`absolute left-1/2 top-1/2 h-[560px] w-[960px] -translate-x-1/2 -translate-y-1/2 touch-none overflow-hidden select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
        {tiles.map((tile) => <img key={`${layerId}-${zoom}-${tile.x}-${tile.y}`} src={layer.tileUrl(zoom,tile.x,tile.y)} alt="" draggable={false} className="pointer-events-none absolute h-64 w-64" style={{ left: tile.left, top: tile.top }} />)}
        {visibility.conservation && <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${VIEWPORT.width} ${VIEWPORT.height}`} preserveAspectRatio="none"><polygon points={polygonPoints} fill="rgba(245,158,11,.18)" stroke="rgba(251,191,36,.98)" strokeWidth="3" strokeDasharray="9 6" /></svg>}
        {visibility.conservation && <div className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: conservationPosition.x, top: conservationPosition.y }}><button type="button" aria-label="Centro de Conservacion" className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-300 bg-[#071622]/95 text-amber-200"><ShieldAlert className="h-4 w-4" /></button><div className="pointer-events-none absolute bottom-12 left-1/2 z-40 hidden w-64 -translate-x-1/2 rounded-xl border border-amber-300/25 bg-[#071622]/98 p-3 text-xs group-hover:block"><p className="font-medium text-amber-100">Centro de Conservacion del Huemul del Sur</p><p className="mt-1 text-white/70">Zona sensible referencial.</p></div></div>}
        {visibility.landmarks && LANDMARKS.map((landmark) => { const position = projection.point(landmark.latitude, landmark.longitude); return <div key={landmark.name} className="group absolute -translate-x-1/2 -translate-y-full" style={{ left: position.x, top: position.y }}><div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-[#0b1d2c]"><MapPin className="h-3.5 w-3.5 text-white/85" /></div><div className="pointer-events-none absolute left-1/2 top-9 z-30 hidden w-max -translate-x-1/2 rounded-lg bg-[#071622] px-3 py-2 text-xs text-white/85 group-hover:block">{landmark.name}</div></div> })}
        {visibility.cameras && mappedCameras.map((camera) => { const position = projection.point(camera.latitude as number, camera.longitude as number); const count = filtered.filter((item) => item.camera?.id === camera.id).length; const selected = selectedCameraId === camera.id; const dimmed = filtered.length > 0 && !visibleCameraIds.has(camera.id); return <button key={camera.id} type="button" aria-label={`Enfocar camara ${camera.code}`} aria-pressed={selected} onClick={() => focusCamera(camera)} className={`absolute -translate-x-1/2 -translate-y-1/2 transition ${dimmed ? 'opacity-30' : ''} ${selected ? 'z-40 scale-110' : ''}`} style={{ left: position.x, top: position.y }}><span className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-[#071622] ${selected ? 'border-white ring-4 ring-[#68b4e3]/30' : 'border-[#9bd3f3]'}`}><Camera className="h-4 w-4 text-[#9bd3f3]" /></span>{count > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-300 px-1 text-[10px] font-semibold text-[#06131d]">{count}</span>}</button> })}
      </div>

      <div className="absolute left-3 top-3 flex gap-1.5 rounded-xl border border-white/12 bg-[#071622]/94 p-1.5">{(Object.keys(LAYERS) as LayerId[]).map((id) => <button key={id} type="button" onClick={() => setLayerId(id)} className={`rounded-lg px-3 py-2 text-xs font-medium ${layerId === id ? 'bg-[#8cccef] text-[#04131d]' : 'text-white/75'}`}>{LAYERS[id].label}</button>)}</div>
      <div className="absolute bottom-24 right-3 flex flex-col overflow-hidden rounded-xl border border-white/12 bg-[#071622]/94 sm:bottom-8 sm:right-4"><button type="button" aria-label="Acercar" onClick={() => setZoom((value) => Math.min(15,value+1))} className="p-3 text-white/80"><Plus className="h-4 w-4" /></button><button type="button" aria-label="Alejar" onClick={() => setZoom((value) => Math.max(10,value-1))} className="border-t border-white/12 p-3 text-white/80"><Minus className="h-4 w-4" /></button><button type="button" aria-label="Recentrar" onClick={resetView} className="border-t border-white/12 p-3 text-white/80"><RotateCcw className="h-4 w-4" /></button></div>

      <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/12 bg-[#071622]/96 p-3 shadow-xl sm:bottom-4 sm:left-4 sm:right-auto sm:w-[350px]">
        <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-white">Estado operativo</p><span className="text-[11px] text-white/60">{filtered.length} avistamientos</span></div>
        {selectedCamera ? <div className="mt-3 border-t border-white/10 pt-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-white">{selectedCamera.code} · {selectedCamera.name}</p><p className="mt-1 text-xs text-white/60">{selectedCamera.zone_label || 'Sin sector'} · {selectedSightings.length} registros</p></div><button type="button" onClick={() => setSelectedCameraId(null)} className="text-white/55"><X className="h-4 w-4" /></button></div><div className="mt-2 max-h-24 space-y-1 overflow-y-auto">{selectedSightings.slice(0,4).map((item) => <p key={item.id} className="rounded-md bg-white/[0.04] px-2 py-1.5 text-[11px] text-white/75">{item.speciesLabel}{typeof item.confidence === 'number' ? ` · ${Math.round(item.confidence*100)}%` : ''}</p>)}</div></div> : <div className="mt-2 grid gap-1.5 text-[11px] text-white/75"><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#9bd3f3]" />{mappedCameras.length} camaras georreferenciadas</p><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-amber-400/80" />Zona sensible referencial</p>{pending.length > 0 && <p className="text-amber-100"><AlertTriangle className="mr-1 inline h-3.5 w-3.5" />{pending.length} ubicaciones pendientes</p>}</div>}
      </div>
      <div className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 rounded bg-black/70 px-2 py-1 text-[10px] text-white/75 sm:block">{layer.attribution}</div>
    </div>
  </section>
}

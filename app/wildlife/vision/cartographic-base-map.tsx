'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Camera, MapPin, Minus, Plus, RefreshCw } from 'lucide-react'

import { getSpeciesLocalization } from '@/lib/wildlife/species-localization'

type LayerId = 'osm' | 'topo' | 'satellite'
type Layer = { label: string; attribution: string; tileUrl: (zoom: number, x: number, y: number) => string }
type CameraRecord = { id: string; code: string; name: string; zone_label?: string | null; latitude?: number | null; longitude?: number | null; active: boolean }
type Detection = { species?: string; confidence?: number }
type JobRecord = {
  id: string
  review_status: string
  camera_id?: string | null
  zone_label?: string | null
  captured_at?: string | null
  created_at: string
  result_json?: { detections?: Detection[] } | null
  wildlife_cameras?: { code?: string | null; name?: string | null; zone_label?: string | null } | null
}

type MapSighting = {
  id: string
  speciesCode: string
  speciesLabel: string
  confidence?: number
  zone: string
  date: Date
  camera?: CameraRecord
}

const CENTER = { latitude: -39.905, longitude: -71.913 }
const VIEWPORT = { width: 960, height: 560 }

const LANDMARKS = [
  { name: 'Hotel Nothofagus', latitude: -39.86924, longitude: -71.91447 },
  { name: 'Montana Magica', latitude: -39.86939, longitude: -71.91515 },
  { name: 'Museo de los Volcanes', latitude: -39.86139, longitude: -71.90568 },
  { name: 'Salto Huilo Huilo', latitude: -39.85332, longitude: -71.95414 },
  { name: 'Pampa Pilmaiquen', latitude: -39.93692, longitude: -71.90272 },
]

const CONSERVATION_POLYGON = [
  { latitude: -39.9265, longitude: -71.9195 },
  { latitude: -39.9208, longitude: -71.909 },
  { latitude: -39.9248, longitude: -71.8945 },
  { latitude: -39.9368, longitude: -71.8858 },
  { latitude: -39.9498, longitude: -71.8908 },
  { latitude: -39.9555, longitude: -71.9045 },
  { latitude: -39.9472, longitude: -71.9185 },
  { latitude: -39.9365, longitude: -71.922 },
]

const LAYERS: Record<LayerId, Layer> = {
  osm: { label: 'Mapa', attribution: 'OpenStreetMap contributors', tileUrl: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png` },
  topo: { label: 'Terreno', attribution: 'OpenTopoMap contributors', tileUrl: (z, x, y) => `https://a.tile.opentopomap.org/${z}/${x}/${y}.png` },
  satellite: { label: 'Satelite', attribution: 'Esri World Imagery', tileUrl: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}` },
}

function longitudeToWorldX(longitude: number, zoom: number) { return ((longitude + 180) / 360) * 256 * 2 ** zoom }
function latitudeToWorldY(latitude: number, zoom: number) {
  const radians = latitude * Math.PI / 180
  return (1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2 * 256 * 2 ** zoom
}

export function CartographicBaseMap() {
  const [layerId, setLayerId] = useState<LayerId>('osm')
  const [zoom, setZoom] = useState(12)
  const [cameras, setCameras] = useState<CameraRecord[]>([])
  const [jobs, setJobs] = useState<JobRecord[]>([])
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const layer = LAYERS[layerId]

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [cameraResponse, jobsResponse] = await Promise.all([
        fetch('/api/vision/cameras', { cache: 'no-store' }),
        fetch('/api/vision/jobs?limit=100&status=completed', { cache: 'no-store' }),
      ])
      const cameraPayload = await cameraResponse.json()
      const jobsPayload = await jobsResponse.json()
      if (!cameraResponse.ok || !cameraPayload.success) throw new Error(cameraPayload.error || 'No fue posible cargar las camaras.')
      if (!jobsResponse.ok || !jobsPayload.success) throw new Error(jobsPayload.error || 'No fue posible cargar los avistamientos.')
      setCameras(cameraPayload.data || [])
      setJobs(jobsPayload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar la cartografia operativa.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    const handler = () => void loadData()
    window.addEventListener('wildlife-job-created', handler)
    return () => window.removeEventListener('wildlife-job-created', handler)
  }, [])

  const sightings = useMemo<MapSighting[]>(() => jobs.map((job) => {
    const detection = job.result_json?.detections?.[0]
    const speciesCode = detection?.species || 'unknown_animal'
    const camera = cameras.find((item) => item.id === job.camera_id)
    return {
      id: job.id,
      speciesCode,
      speciesLabel: getSpeciesLocalization(speciesCode).label,
      confidence: detection?.confidence,
      zone: job.zone_label || camera?.zone_label || job.wildlife_cameras?.zone_label || 'Sin sector',
      date: new Date(job.captured_at || job.created_at),
      camera,
    }
  }), [jobs, cameras])

  const speciesOptions = useMemo(() => Array.from(new Set(sightings.map((item) => item.speciesCode))).sort(), [sightings])
  const zoneOptions = useMemo(() => Array.from(new Set(sightings.map((item) => item.zone))).sort(), [sightings])
  const filteredSightings = useMemo(() => sightings.filter((item) =>
    (speciesFilter === 'all' || item.speciesCode === speciesFilter)
    && (zoneFilter === 'all' || item.zone === zoneFilter)
  ), [sightings, speciesFilter, zoneFilter])
  const mappedCameras = cameras.filter((camera) => typeof camera.latitude === 'number' && typeof camera.longitude === 'number')
  const visibleCameraIds = new Set(filteredSightings.map((item) => item.camera?.id).filter(Boolean))
  const pendingSightings = filteredSightings.filter((item) => !item.camera || typeof item.camera.latitude !== 'number' || typeof item.camera.longitude !== 'number')

  const projection = useMemo(() => {
    const centerX = longitudeToWorldX(CENTER.longitude, zoom)
    const centerY = latitudeToWorldY(CENTER.latitude, zoom)
    const leftWorld = centerX - VIEWPORT.width / 2
    const topWorld = centerY - VIEWPORT.height / 2
    return {
      leftWorld,
      topWorld,
      point: (latitude: number, longitude: number) => ({
        x: longitudeToWorldX(longitude, zoom) - leftWorld,
        y: latitudeToWorldY(latitude, zoom) - topWorld,
      }),
    }
  }, [zoom])

  const tiles = useMemo(() => {
    const startX = Math.floor(projection.leftWorld / 256)
    const startY = Math.floor(projection.topWorld / 256)
    const endX = Math.floor((projection.leftWorld + VIEWPORT.width) / 256)
    const endY = Math.floor((projection.topWorld + VIEWPORT.height) / 256)
    const result: Array<{ x: number; y: number; left: number; top: number }> = []
    for (let x = startX; x <= endX; x += 1) for (let y = startY; y <= endY; y += 1) result.push({ x, y, left: x * 256 - projection.leftWorld, top: y * 256 - projection.topWorld })
    return result
  }, [projection.leftWorld, projection.topWorld])

  const polygonPoints = CONSERVATION_POLYGON.map((point) => {
    const position = projection.point(point.latitude, point.longitude)
    return `${position.x},${position.y}`
  }).join(' ')

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1d2c]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">Cartografia territorial</p>
          <h2 className="mt-1 text-2xl font-medium text-white">Mapa operativo de Huilo Huilo</h2>
          <p className="mt-1 text-sm text-white/45">Camaras, avistamientos y zona referencial del Centro de Conservacion del Huemul del Sur.</p>
        </div>
        <button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.04] disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Actualizar
        </button>
      </div>

      <div className="grid gap-3 border-b border-white/10 p-5 sm:grid-cols-2 sm:p-6">
        <label className="text-sm text-white/50"><span className="mb-2 block">Especie</span><select value={speciesFilter} onChange={(event) => setSpeciesFilter(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#071622] px-4 py-3 text-white outline-none"><option value="all">Todas las especies</option>{speciesOptions.map((code) => <option key={code} value={code}>{getSpeciesLocalization(code).label}</option>)}</select></label>
        <label className="text-sm text-white/50"><span className="mb-2 block">Sector</span><select value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#071622] px-4 py-3 text-white outline-none"><option value="all">Todos los sectores</option>{zoneOptions.map((zone) => <option key={zone} value={zone}>{zone}</option>)}</select></label>
      </div>

      {error && <p className="m-5 rounded-xl border border-red-300/15 bg-red-300/[0.04] p-4 text-sm text-red-100/80 sm:m-6">{error}</p>}

      <div className="relative min-h-[560px] overflow-hidden bg-[#071622]">
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[960px] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
          {tiles.map((tile) => <img key={`${layerId}-${zoom}-${tile.x}-${tile.y}`} src={layer.tileUrl(zoom, tile.x, tile.y)} alt="" draggable={false} className="absolute h-64 w-64 select-none" style={{ left: tile.left, top: tile.top }} />)}

          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${VIEWPORT.width} ${VIEWPORT.height}`} preserveAspectRatio="none">
            <polygon points={polygonPoints} fill="rgba(245,158,11,.18)" stroke="rgba(251,191,36,.98)" strokeWidth="3" strokeDasharray="9 6" />
          </svg>

          {LANDMARKS.map((landmark) => {
            const position = projection.point(landmark.latitude, landmark.longitude)
            return <div key={landmark.name} className="group absolute -translate-x-1/2 -translate-y-full" style={{ left: position.x, top: position.y }}><div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-[#0b1d2c] shadow-lg"><MapPin className="h-3.5 w-3.5 text-white/80" /></div><div className="pointer-events-none absolute left-1/2 top-9 z-30 hidden w-max max-w-52 -translate-x-1/2 rounded-lg border border-white/10 bg-[#071622] px-3 py-2 text-xs text-white/75 shadow-2xl group-hover:block">{landmark.name}</div></div>
          })}

          {mappedCameras.map((camera) => {
            const position = projection.point(camera.latitude as number, camera.longitude as number)
            const cameraSightings = filteredSightings.filter((item) => item.camera?.id === camera.id)
            const dimmed = filteredSightings.length > 0 && !visibleCameraIds.has(camera.id)
            return <div key={camera.id} className={`group absolute -translate-x-1/2 -translate-y-1/2 ${dimmed ? 'opacity-30' : ''}`} style={{ left: position.x, top: position.y }}><div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#9bd3f3] bg-[#071622] shadow-xl"><Camera className="h-4 w-4 text-[#9bd3f3]" /></div>{cameraSightings.length > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-300 px-1 text-[10px] font-semibold text-[#06131d]">{cameraSightings.length}</span>}<div className="pointer-events-none absolute left-1/2 top-12 z-30 hidden w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-[#071622] p-3 text-xs shadow-2xl group-hover:block"><p className="font-medium text-white">{camera.code} · {camera.name}</p><p className="mt-1 text-white/45">{camera.zone_label || 'Sin sector'}</p><p className="mt-2 text-[#9bd3f3]">{cameraSightings.length} avistamientos filtrados</p>{cameraSightings.slice(0, 3).map((item) => <p key={item.id} className="mt-1 text-white/55">{item.speciesLabel}{typeof item.confidence === 'number' ? ` · ${Math.round(item.confidence * 100)}%` : ''}</p>)}</div></div>
          })}
        </div>

        <div className="absolute left-4 top-4 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-[#071622]/92 p-2 shadow-xl backdrop-blur">{(Object.keys(LAYERS) as LayerId[]).map((id) => <button key={id} type="button" onClick={() => setLayerId(id)} className={`rounded-lg px-3 py-2 text-xs transition ${layerId === id ? 'bg-[#68b4e3] text-[#06131d]' : 'text-white/65 hover:bg-white/[0.06]'}`}>{LAYERS[id].label}</button>)}</div>

        <div className="absolute bottom-8 right-4 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#071622]/92 shadow-xl backdrop-blur"><button type="button" aria-label="Acercar mapa" onClick={() => setZoom((value) => Math.min(15, value + 1))} className="p-3 text-white/70 hover:bg-white/[0.06]"><Plus className="h-4 w-4" /></button><button type="button" aria-label="Alejar mapa" onClick={() => setZoom((value) => Math.max(10, value - 1))} className="border-t border-white/10 p-3 text-white/70 hover:bg-white/[0.06]"><Minus className="h-4 w-4" /></button></div>

        <div className="absolute right-4 top-4 max-w-72 rounded-xl border border-amber-300/20 bg-[#071622]/92 px-3 py-2 text-xs text-amber-100 backdrop-blur"><p className="font-medium">Centro de Conservacion del Huemul del Sur</p><p className="mt-1 text-[11px] text-white/45">Zona referencial. No representa limite legal ni recinto exacto.</p></div>

        <div className="absolute bottom-4 left-4 w-[min(320px,calc(100%-6rem))] rounded-xl border border-white/10 bg-[#071622]/94 p-3 shadow-xl backdrop-blur"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-white">Leyenda y estado</p><span className="text-[11px] text-white/40">{filteredSightings.length} avistamientos</span></div><div className="mt-2 grid gap-1.5 text-[11px] text-white/55"><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#9bd3f3]" />Camara georreferenciada</p><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-amber-400/70" />Zona sensible referencial</p><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-300" />Avistamientos vinculados</p></div>{pendingSightings.length > 0 && <div className="mt-3 border-t border-white/10 pt-2"><div className="flex items-center gap-1.5 text-[11px] text-amber-100"><AlertTriangle className="h-3.5 w-3.5" />{pendingSightings.length} ubicaciones pendientes</div><p className="mt-1 line-clamp-2 text-[10px] text-white/38">{pendingSightings.slice(0, 3).map((item) => item.speciesLabel).join(' · ')}</p></div>}</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/65 px-2 py-1 text-[10px] text-white/65">{layer.attribution}</div>
      </div>
    </section>
  )
}

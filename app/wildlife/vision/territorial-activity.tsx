'use client'

import { useEffect, useMemo, useState } from 'react'
import { Camera, Clock3, Filter, MapPin, RefreshCw } from 'lucide-react'

import { getConfidenceLevel, getSpeciesLocalization } from '@/lib/wildlife/species-localization'

type Detection = {
  species?: string
  confidence?: number
  description?: string
}

type Job = {
  id: string
  original_filename: string
  status: string
  review_status: string
  result_json?: {
    detections?: Detection[]
    scene_summary?: string
  } | null
  camera_id?: string | null
  zone_label?: string | null
  captured_at?: string | null
  created_at: string
  wildlife_cameras?: {
    code?: string | null
    name?: string | null
    zone_label?: string | null
  } | null
}

type CameraRecord = {
  id: string
  code: string
  name: string
  zone_label?: string | null
  latitude?: number | null
  longitude?: number | null
  active: boolean
}

type Period = '1' | '7' | '30' | '90'

function reviewLabel(value: string) {
  if (value === 'confirmed') return 'Confirmado'
  if (value === 'corrected') return 'Corregido'
  if (value === 'rejected') return 'Rechazado'
  if (value === 'unidentifiable') return 'No identificable'
  return 'Pendiente'
}

function relativePosition(value: number, min: number, max: number) {
  if (max <= min) return 50
  return 8 + ((value - min) / (max - min)) * 84
}

export function TerritorialActivity() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [cameras, setCameras] = useState<CameraRecord[]>([])
  const [period, setPeriod] = useState<Period>('30')
  const [speciesFilter, setSpeciesFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [jobsResponse, camerasResponse] = await Promise.all([
        fetch('/api/vision/jobs?limit=100&status=completed', { cache: 'no-store' }),
        fetch('/api/vision/cameras', { cache: 'no-store' }),
      ])
      const jobsPayload = await jobsResponse.json()
      const camerasPayload = await camerasResponse.json()
      if (!jobsResponse.ok || !jobsPayload.success) throw new Error(jobsPayload.error || 'No fue posible cargar los avistamientos.')
      if (!camerasResponse.ok || !camerasPayload.success) throw new Error(camerasPayload.error || 'No fue posible cargar las camaras.')
      setJobs(jobsPayload.data || [])
      setCameras(camerasPayload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar la actividad territorial.')
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

  const sightings = useMemo(() => jobs.map((job) => {
    const primary = job.result_json?.detections?.[0]
    const species = getSpeciesLocalization(primary?.species || 'unknown_animal')
    const camera = cameras.find((item) => item.id === job.camera_id)
    return {
      job,
      primary,
      species,
      camera,
      date: new Date(job.captured_at || job.created_at),
      zone: job.zone_label || camera?.zone_label || job.wildlife_cameras?.zone_label || 'Sin sector',
    }
  }).filter((item) => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - Number(period))
    const speciesMatch = speciesFilter === 'all' || item.primary?.species === speciesFilter
    const zoneMatch = zoneFilter === 'all' || item.zone === zoneFilter
    return item.date >= cutoff && speciesMatch && zoneMatch
  }), [jobs, cameras, period, speciesFilter, zoneFilter])

  const speciesOptions = useMemo(() => Array.from(new Set(jobs.map((job) => job.result_json?.detections?.[0]?.species).filter(Boolean) as string[])).sort(), [jobs])
  const zoneOptions = useMemo(() => Array.from(new Set(jobs.map((job) => job.zone_label || job.wildlife_cameras?.zone_label).filter(Boolean) as string[])).sort(), [jobs])
  const mappedCameras = cameras.filter((camera) => typeof camera.latitude === 'number' && typeof camera.longitude === 'number')
  const latitudes = mappedCameras.map((camera) => camera.latitude as number)
  const longitudes = mappedCameras.map((camera) => camera.longitude as number)
  const minLat = latitudes.length ? Math.min(...latitudes) : -39.95
  const maxLat = latitudes.length ? Math.max(...latitudes) : -39.75
  const minLng = longitudes.length ? Math.min(...longitudes) : -72.25
  const maxLng = longitudes.length ? Math.max(...longitudes) : -71.95

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1d2c]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">Actividad territorial</p>
          <h2 className="mt-1 text-2xl font-light text-white">Avistamientos y camaras en Huilo Huilo</h2>
          <p className="mt-1 text-sm text-white/45">Actividad reciente vinculada a camaras, sectores y evidencia procesada.</p>
        </div>
        <button onClick={() => void loadData()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.04] disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm text-white/50">
            <span className="mb-2 flex items-center gap-2"><Clock3 className="h-4 w-4" />Periodo</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="w-full rounded-xl border border-white/10 bg-[#071622] px-4 py-3 text-white outline-none">
              <option value="1">Ultimas 24 horas</option>
              <option value="7">Ultimos 7 dias</option>
              <option value="30">Ultimos 30 dias</option>
              <option value="90">Ultimos 90 dias</option>
            </select>
          </label>
          <label className="text-sm text-white/50">
            <span className="mb-2 flex items-center gap-2"><Filter className="h-4 w-4" />Especie</span>
            <select value={speciesFilter} onChange={(event) => setSpeciesFilter(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#071622] px-4 py-3 text-white outline-none">
              <option value="all">Todas las especies</option>
              {speciesOptions.map((code) => <option key={code} value={code}>{getSpeciesLocalization(code).label}</option>)}
            </select>
          </label>
          <label className="text-sm text-white/50">
            <span className="mb-2 flex items-center gap-2"><MapPin className="h-4 w-4" />Sector</span>
            <select value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#071622] px-4 py-3 text-white outline-none">
              <option value="all">Todos los sectores</option>
              {zoneOptions.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
            </select>
          </label>
        </div>
      </div>

      {error && <p className="m-5 rounded-xl border border-red-300/15 bg-red-300/[0.04] p-4 text-sm text-red-100/80 sm:m-6">{error}</p>}

      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-white/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium text-white">Ultimos avistamientos</h3>
              <p className="mt-1 text-xs text-white/35">{sightings.length} registros en el periodo seleccionado</p>
            </div>
          </div>
          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {!loading && sightings.length === 0 && <p className="rounded-xl border border-white/8 bg-white/[0.02] p-5 text-sm text-white/40">No existen avistamientos para estos filtros.</p>}
            {sightings.slice(0, 20).map(({ job, primary, species, camera, date, zone }) => (
              <article key={job.id} className="rounded-xl border border-white/8 bg-[#071622] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{species.label}</p>
                    {species.scientificName && <p className="mt-0.5 text-xs italic text-white/40">{species.scientificName}</p>}
                  </div>
                  <span className="rounded-full bg-[#68b4e3]/10 px-2.5 py-1 text-xs text-[#9bd3f3]">{typeof primary?.confidence === 'number' ? `${Math.round(primary.confidence * 100)}%` : 'Sin score'}</span>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-white/45 sm:grid-cols-2">
                  <span className="inline-flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" />{camera?.code || job.wildlife_cameras?.code || 'Sin camara'}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{zone}</span>
                  <span>{date.toLocaleString('es-CL')}</span>
                  <span>{reviewLabel(job.review_status)}</span>
                </div>
                {primary?.description && <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/38">{primary.description}</p>}
                {typeof primary?.confidence === 'number' && <p className="mt-2 text-[11px] text-white/30">{getConfidenceLevel(primary.confidence)}</p>}
              </article>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium text-white">Mapa operativo</h3>
              <p className="mt-1 text-xs text-white/35">Vista relativa de camaras con coordenadas registradas</p>
            </div>
            <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-white/45">{mappedCameras.length} camaras ubicadas</span>
          </div>

          <div className="relative min-h-[440px] overflow-hidden rounded-2xl border border-white/10 bg-[#071622]">
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(104,180,227,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(104,180,227,.08) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#123047]/60 to-transparent" />
            <div className="absolute left-5 top-5 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/45 backdrop-blur">Sector Huilo Huilo</div>

            {mappedCameras.map((camera) => {
              const cameraSightings = sightings.filter((item) => item.camera?.id === camera.id)
              const latest = cameraSightings[0]
              const x = relativePosition(camera.longitude as number, minLng, maxLng)
              const y = 100 - relativePosition(camera.latitude as number, minLat, maxLat)
              return (
                <div key={camera.id} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#9bd3f3] bg-[#0b1d2c] shadow-lg shadow-black/50">
                    <Camera className="h-4 w-4 text-[#9bd3f3]" />
                  </div>
                  {cameraSightings.length > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-300 px-1 text-[10px] font-semibold text-[#06131d]">{cameraSightings.length}</span>}
                  <div className="pointer-events-none absolute left-1/2 top-12 z-10 hidden w-56 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0b1d2c] p-3 text-xs shadow-2xl group-hover:block">
                    <p className="font-medium text-white">{camera.code} · {camera.name}</p>
                    <p className="mt-1 text-white/40">{camera.zone_label || 'Sin sector'}</p>
                    <p className="mt-2 text-[#9bd3f3]">{cameraSightings.length} avistamientos filtrados</p>
                    {latest && <p className="mt-1 text-white/45">Ultimo: {latest.species.label}</p>}
                  </div>
                </div>
              )
            })}

            {mappedCameras.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                <div>
                  <MapPin className="mx-auto h-8 w-8 text-white/20" />
                  <p className="mt-3 text-sm text-white/50">No hay camaras con coordenadas registradas.</p>
                  <p className="mt-1 text-xs text-white/30">Agrega latitud y longitud en el registro de camaras para activar el mapa.</p>
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-white/30">La prueba usa una proyeccion relativa y no publica coordenadas exactas en pantalla. Los avistamientos se vinculan a la ubicacion de la camara asociada.</p>
        </div>
      </div>
    </section>
  )
}

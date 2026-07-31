'use client'

import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'

type LayerId = 'osm' | 'topo' | 'satellite'

type Layer = {
  label: string
  attribution: string
  tileUrl: (zoom: number, x: number, y: number) => string
}

const CENTER = { latitude: -40.0301, longitude: -71.9528 }
const VIEWPORT = { width: 960, height: 520 }

const LAYERS: Record<LayerId, Layer> = {
  osm: {
    label: 'Mapa',
    attribution: 'OpenStreetMap contributors',
    tileUrl: (zoom, x, y) => `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
  },
  topo: {
    label: 'Terreno',
    attribution: 'OpenTopoMap contributors',
    tileUrl: (zoom, x, y) => `https://a.tile.opentopomap.org/${zoom}/${x}/${y}.png`,
  },
  satellite: {
    label: 'Satelite',
    attribution: 'Esri World Imagery',
    tileUrl: (zoom, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`,
  },
}

function longitudeToWorldX(longitude: number, zoom: number) {
  return ((longitude + 180) / 360) * 256 * 2 ** zoom
}

function latitudeToWorldY(latitude: number, zoom: number) {
  const radians = latitude * Math.PI / 180
  return (1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2 * 256 * 2 ** zoom
}

export function CartographicBaseMap() {
  const [layerId, setLayerId] = useState<LayerId>('osm')
  const [zoom, setZoom] = useState(10)
  const layer = LAYERS[layerId]

  const tiles = useMemo(() => {
    const centerX = longitudeToWorldX(CENTER.longitude, zoom)
    const centerY = latitudeToWorldY(CENTER.latitude, zoom)
    const startX = Math.floor((centerX - VIEWPORT.width / 2) / 256)
    const startY = Math.floor((centerY - VIEWPORT.height / 2) / 256)
    const endX = Math.floor((centerX + VIEWPORT.width / 2) / 256)
    const endY = Math.floor((centerY + VIEWPORT.height / 2) / 256)
    const result: Array<{ x: number; y: number; left: number; top: number }> = []

    for (let x = startX; x <= endX; x += 1) {
      for (let y = startY; y <= endY; y += 1) {
        result.push({
          x,
          y,
          left: x * 256 - (centerX - VIEWPORT.width / 2),
          top: y * 256 - (centerY - VIEWPORT.height / 2),
        })
      }
    }

    return result
  }, [zoom])

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1d2c]">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8fc8ea]">Cartografia territorial</p>
        <h2 className="mt-1 text-2xl font-medium text-white">Mapa real de Huilo Huilo</h2>
        <p className="mt-1 text-sm text-white/45">Capas cartograficas base centradas en la reserva.</p>
      </div>

      <div className="relative min-h-[520px] overflow-hidden bg-[#071622]">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[960px] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
          {tiles.map((tile) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${layerId}-${zoom}-${tile.x}-${tile.y}`}
              src={layer.tileUrl(zoom, tile.x, tile.y)}
              alt=""
              draggable={false}
              className="absolute h-64 w-64 select-none"
              style={{ left: tile.left, top: tile.top }}
            />
          ))}
        </div>

        <div className="absolute left-4 top-4 flex gap-2 rounded-xl border border-white/10 bg-[#071622]/90 p-2 shadow-xl backdrop-blur">
          {(Object.keys(LAYERS) as LayerId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setLayerId(id)}
              className={`rounded-lg px-3 py-2 text-xs transition ${layerId === id ? 'bg-[#68b4e3] text-[#06131d]' : 'text-white/65 hover:bg-white/[0.06]'}`}
            >
              {LAYERS[id].label}
            </button>
          ))}
        </div>

        <div className="absolute bottom-8 right-4 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#071622]/90 shadow-xl backdrop-blur">
          <button type="button" aria-label="Acercar mapa" onClick={() => setZoom((value) => Math.min(15, value + 1))} className="p-3 text-white/70 hover:bg-white/[0.06]"><Plus className="h-4 w-4" /></button>
          <button type="button" aria-label="Alejar mapa" onClick={() => setZoom((value) => Math.max(7, value - 1))} className="border-t border-white/10 p-3 text-white/70 hover:bg-white/[0.06]"><Minus className="h-4 w-4" /></button>
        </div>

        <div className="absolute bottom-2 left-3 rounded bg-black/65 px-2 py-1 text-[10px] text-white/65">{layer.attribution}</div>
        <div className="absolute right-4 top-4 rounded-xl border border-white/10 bg-[#071622]/90 px-3 py-2 text-xs text-white/60 backdrop-blur">Centro referencial Huilo Huilo</div>
      </div>
    </section>
  )
}

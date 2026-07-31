'use client'

import { useCallback, useEffect, useState } from 'react'
import { Camera, MapPin, Pencil, Plus, RefreshCw } from 'lucide-react'

type CameraRow = {
  id: string
  code: string
  name: string
  zone_label: string | null
  latitude: number | null
  longitude: number | null
  active: boolean
}

type Draft = {
  id?: string
  code: string
  name: string
  zoneLabel: string
  latitude: string
  longitude: string
  active: boolean
}

const emptyDraft: Draft = {
  code: '',
  name: '',
  zoneLabel: '',
  latitude: '',
  longitude: '',
  active: true,
}

export function CameraRegistry() {
  const [cameras, setCameras] = useState<CameraRow[]>([])
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/vision/cameras', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible cargar las cámaras.')
      setCameras(payload.data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar las cámaras.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/vision/cameras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draft.id,
          code: draft.code,
          name: draft.name,
          zoneLabel: draft.zoneLabel || null,
          latitude: draft.latitude ? Number(draft.latitude) : null,
          longitude: draft.longitude ? Number(draft.longitude) : null,
          active: draft.active,
        }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'No fue posible guardar la cámara.')
      setDraft(emptyDraft)
      await load()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No fue posible guardar la cámara.')
    } finally {
      setSaving(false)
    }
  }

  function edit(camera: CameraRow) {
    setDraft({
      id: camera.id,
      code: camera.code,
      name: camera.name,
      zoneLabel: camera.zone_label || '',
      latitude: camera.latitude?.toString() || '',
      longitude: camera.longitude?.toString() || '',
      active: camera.active,
    })
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[#9DD2F2]"><Camera className="h-4 w-4" /> Registro operativo</div>
          <h2 className="mt-2 text-xl font-light text-white">Cámaras trampa</h2>
          <p className="mt-1 text-sm text-white/50">Alta, edición, zona, coordenadas y estado operativo.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 disabled:opacity-40">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-300/20 bg-red-300/[0.05] p-3 text-sm text-red-100">{error}</p>}

      <div className="mt-5 grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-xl border border-white/8 bg-black/20 p-4">
          <div className="grid gap-3">
            <input value={draft.code} onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))} placeholder="Código de cámara" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-3 text-sm text-white" />
            <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Nombre" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-3 text-sm text-white" />
            <input value={draft.zoneLabel} onChange={(event) => setDraft((current) => ({ ...current, zoneLabel: event.target.value }))} placeholder="Zona" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-3 text-sm text-white" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" step="any" value={draft.latitude} onChange={(event) => setDraft((current) => ({ ...current, latitude: event.target.value }))} placeholder="Latitud" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-3 text-sm text-white" />
              <input type="number" step="any" value={draft.longitude} onChange={(event) => setDraft((current) => ({ ...current, longitude: event.target.value }))} placeholder="Longitud" className="rounded-lg border border-white/10 bg-[#081827] px-3 py-3 text-sm text-white" />
            </div>
            <label className="flex items-center gap-2 text-sm text-white/65">
              <input type="checkbox" checked={draft.active} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} />
              Cámara activa
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => void save()} disabled={saving || !draft.code.trim() || !draft.name.trim()} className="inline-flex items-center gap-2 rounded-lg bg-[#4DA3D9] px-4 py-3 text-sm font-medium text-[#07131f] disabled:opacity-40">
                <Plus className="h-4 w-4" /> {draft.id ? 'Guardar cambios' : 'Agregar cámara'}
              </button>
              {draft.id && <button type="button" onClick={() => setDraft(emptyDraft)} className="rounded-lg bg-white/10 px-4 py-3 text-sm text-white/70">Cancelar</button>}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {!loading && cameras.length === 0 && <p className="rounded-lg bg-black/20 p-4 text-sm text-white/50">No existen cámaras registradas.</p>}
          {cameras.map((camera) => (
            <article key={camera.id} className="rounded-xl border border-white/8 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{camera.code} · {camera.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${camera.active ? 'bg-emerald-300/15 text-emerald-100' : 'bg-white/10 text-white/50'}`}>{camera.active ? 'Activa' : 'Inactiva'}</span>
                  </div>
                  {(camera.zone_label || camera.latitude !== null || camera.longitude !== null) && (
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/45">
                      <MapPin className="h-3.5 w-3.5" />
                      {camera.zone_label || 'Sin zona'}
                      {camera.latitude !== null && camera.longitude !== null ? ` · ${camera.latitude}, ${camera.longitude}` : ''}
                    </p>
                  )}
                </div>
                <button type="button" onClick={() => edit(camera)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

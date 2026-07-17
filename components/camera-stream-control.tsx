'use client'

import { useEffect, useState } from 'react'
import { Loader2, Play, ShieldCheck } from 'lucide-react'

type StreamStatus = 'requested' | 'active' | 'ended' | 'expired' | 'failed'

type StreamSession = {
  id: string
  status: StreamStatus
  expires_at?: string
  expiresAt?: string
  created_at?: string
  createdAt?: string
  reused?: boolean
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

function getStatusLabel(session: StreamSession | null, state: LoadState) {
  if (state === 'loading') return 'Preparando vista'
  if (state === 'error') return 'No disponible'
  if (!session) return 'Ver camara'
  if (session.status === 'active') return 'Vista activa'
  if (session.status === 'requested') return 'Preparando vista'
  if (session.status === 'failed') return 'Reintentar vista'
  return 'Ver camara'
}

function getDetail(session: StreamSession | null, error: string) {
  if (error) return error
  if (!session) return 'Solicita una vista temporal y segura.'
  if (session.status === 'active') return 'Conexion temporal lista para supervision.'
  if (session.status === 'requested') return 'Estamos preparando la imagen en vivo.'
  if (session.status === 'failed') return 'No se pudo abrir la vista.'
  return 'La vista anterior ya termino.'
}

export function CameraStreamControl({ deviceId }: { deviceId: string }) {
  const [session, setSession] = useState<StreamSession | null>(null)
  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const response = await fetch(`/api/cameras/${encodeURIComponent(deviceId)}/stream`, { cache: 'no-store' })
        const payload = response.ok ? await response.json() : null
        if (active) setSession(payload?.data || null)
      } catch {
        if (active) setSession(null)
      }
    }

    loadSession()
    const timer = window.setInterval(loadSession, 15000)

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [deviceId])

  async function requestStream() {
    setState('loading')
    setError('')

    try {
      const response = await fetch(`/api/cameras/${encodeURIComponent(deviceId)}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload?.success) {
        setError(payload?.error || 'No fue posible preparar la vista.')
        setState('error')
        return
      }

      setSession(payload.data)
      setState('ready')
    } catch {
      setError('No fue posible preparar la vista.')
      setState('error')
    }
  }

  const label = getStatusLabel(session, state)
  const busy = state === 'loading'
  const active = session?.status === 'active' || session?.status === 'requested'

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-white">{label}</p>
          <p className="mt-1 truncate text-[11px] text-white/55">{getDetail(session, error)}</p>
        </div>
        <button
          type="button"
          disabled={busy || active}
          onClick={requestStream}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#4DA3D9]/30 bg-[#4DA3D9]/15 px-3 py-2 text-[11px] font-medium text-[#9DD2F2] transition hover:bg-[#4DA3D9]/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : active ? <ShieldCheck className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {active ? 'Activa' : 'Abrir'}
        </button>
      </div>
    </div>
  )
}

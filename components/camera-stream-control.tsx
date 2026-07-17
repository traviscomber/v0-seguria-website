'use client'

import { useEffect, useState } from 'react'
import { ImageIcon, Loader2, Play, ShieldCheck } from 'lucide-react'
import { SecureHlsPlayer } from '@/components/secure-hls-player'

type StreamStatus = 'requested' | 'active' | 'ended' | 'expired' | 'failed'

type StreamSession = {
  id: string
  status: StreamStatus
  expires_at?: string
  expiresAt?: string
  created_at?: string
  createdAt?: string
  mediaUrl?: string
  hlsManifestUrl?: string
  signaling?: {
    preferredTransport: 'hls' | 'webrtc'
    signalingState: 'hls_ready' | 'offer_pending' | 'answer_ready' | 'failed'
  }
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
  const [frameRevision, setFrameRevision] = useState(0)
  const [frameReady, setFrameReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoUnavailable, setVideoUnavailable] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const response = await fetch(`/api/cameras/${encodeURIComponent(deviceId)}/stream`, { cache: 'no-store' })
        const payload = response.ok ? await response.json() : null
        if (active) {
          setSession(payload?.data || null)
          if (payload?.data?.mediaUrl) setError('')
        }
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

  useEffect(() => {
    if (!session?.mediaUrl || (session.status !== 'requested' && session.status !== 'active')) return

    const timer = window.setInterval(() => {
      setFrameRevision((current) => current + 1)
    }, 8000)

    return () => window.clearInterval(timer)
  }, [session?.mediaUrl, session?.status])

  async function requestStream() {
    setState('loading')
    setError('')

    try {
      const response = await fetch(`/api/cameras/${encodeURIComponent(deviceId)}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredTransport: 'hls' }),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload?.success) {
        setError(payload?.error || 'No fue posible preparar la vista.')
        setState('error')
        return
      }

      setSession(payload.data)
      setFrameReady(false)
      setVideoReady(false)
      setVideoUnavailable(false)
      setState('ready')
    } catch {
      setError('No fue posible preparar la vista.')
      setState('error')
    }
  }

  const label = getStatusLabel(session, state)
  const busy = state === 'loading'
  const active = session?.status === 'active' || session?.status === 'requested'
  const frameUrl = session?.mediaUrl
    ? `${session.mediaUrl}${session.mediaUrl.includes('?') ? '&' : '?'}t=${frameRevision}`
    : ''
  const showVideo = Boolean(session?.hlsManifestUrl && active)
  const showFrameFallback = Boolean(session?.mediaUrl && active && (!showVideo || videoUnavailable))

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
      {showVideo && !videoUnavailable && (
        <SecureHlsPlayer
          src={session?.hlsManifestUrl || ''}
          onReadyChange={setVideoReady}
          onUnavailableChange={setVideoUnavailable}
        />
      )}
      {showFrameFallback && (
        <div className={`relative mt-3 min-h-[120px] overflow-hidden rounded-xl border border-white/10 bg-[#071524] ${videoReady ? 'hidden' : 'block'}`}>
          {!frameReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-[11px] text-white/45">
              <ImageIcon className="h-5 w-5 text-[#9DD2F2]" />
              <span>Esperando imagen segura</span>
            </div>
          )}
          <img
            src={frameUrl}
            alt="Vista segura de camara"
            className={`h-full min-h-[120px] w-full object-cover transition-opacity ${frameReady ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => {
              setFrameReady(true)
              setError('')
            }}
            onError={() => setFrameReady(false)}
          />
          <div className="pointer-events-none absolute left-2 top-2 rounded-full border border-white/10 bg-slate-950/75 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-100">
            Vista SegurIA
          </div>
        </div>
      )}
    </div>
  )
}

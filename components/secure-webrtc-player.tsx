'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Radio, VideoOff } from 'lucide-react'

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
    gatewayAnswer?: string
    gatewayIceCandidates?: RTCIceCandidateInit[]
    gatewayError?: string
  }
}

type SecureWebRtcPlayerProps = {
  deviceId: string
  requestKey: number
  onSession: (session: StreamSession) => void
  onReadyChange: (ready: boolean) => void
  onUnavailable: (message: string) => void
}

type WebRtcState = 'connecting' | 'ready' | 'unavailable'

const SIGNALING_TIMEOUT_MS = 12000
const ICE_GATHERING_TIMEOUT_MS = 1400

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function waitForIceGathering(peer: RTCPeerConnection) {
  if (peer.iceGatheringState === 'complete') return

  await Promise.race([
    new Promise<void>((resolve) => {
      const handleStateChange = () => {
        if (peer.iceGatheringState === 'complete') {
          peer.removeEventListener('icegatheringstatechange', handleStateChange)
          resolve()
        }
      }
      peer.addEventListener('icegatheringstatechange', handleStateChange)
    }),
    wait(ICE_GATHERING_TIMEOUT_MS),
  ])
}

export function SecureWebRtcPlayer({
  deviceId,
  requestKey,
  onSession,
  onReadyChange,
  onUnavailable,
}: SecureWebRtcPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const callbacksRef = useRef({ onSession, onReadyChange, onUnavailable })
  const [state, setState] = useState<WebRtcState>('connecting')

  useEffect(() => {
    callbacksRef.current = { onSession, onReadyChange, onUnavailable }
  }, [onReadyChange, onSession, onUnavailable])

  useEffect(() => {
    if (requestKey <= 0) return

    let cancelled = false
    let peer: RTCPeerConnection | null = null
    setState('connecting')
    callbacksRef.current.onReadyChange(false)

    async function fail(message: string) {
      if (cancelled) return
      setState('unavailable')
      callbacksRef.current.onReadyChange(false)
      callbacksRef.current.onUnavailable(message)
    }

    async function pollForAnswer(session: StreamSession) {
      if (!peer) return
      const startedAt = Date.now()
      while (!cancelled && Date.now() - startedAt < SIGNALING_TIMEOUT_MS) {
        const response = await fetch(`/api/cameras/${encodeURIComponent(deviceId)}/stream`, { cache: 'no-store' })
        const payload = response.ok ? await response.json().catch(() => null) : null
        const nextSession = payload?.data as StreamSession | null
        if (nextSession) callbacksRef.current.onSession(nextSession)

        const signaling = nextSession?.signaling
        if (signaling?.signalingState === 'failed') {
          await fail(signaling.gatewayError || 'La vista de baja latencia no esta disponible.')
          return
        }

        if (signaling?.gatewayAnswer) {
          await peer.setRemoteDescription({ type: 'answer', sdp: signaling.gatewayAnswer })
          for (const candidate of signaling.gatewayIceCandidates || []) {
            await peer.addIceCandidate(candidate)
          }
          return
        }

        await wait(1500)
      }

      await fail('La vista de baja latencia no respondio a tiempo.')
    }

    async function start() {
      if (!('RTCPeerConnection' in window)) {
        await fail('Este navegador no soporta baja latencia.')
        return
      }

      const activePeer = new RTCPeerConnection()
      peer = activePeer
      peerRef.current = activePeer
      const localCandidates: RTCIceCandidateInit[] = []
      activePeer.addTransceiver('video', { direction: 'recvonly' })
      activePeer.addTransceiver('audio', { direction: 'recvonly' })
      activePeer.addEventListener('icecandidate', (event) => {
        if (event.candidate) localCandidates.push(event.candidate.toJSON())
      })
      activePeer.addEventListener('track', (event) => {
        const video = videoRef.current
        if (!video || !event.streams[0]) return
        video.srcObject = event.streams[0]
        setState('ready')
        callbacksRef.current.onReadyChange(true)
      })
      activePeer.addEventListener('connectionstatechange', () => {
        if (activePeer.connectionState === 'failed' || activePeer.connectionState === 'closed') {
          void fail('La vista de baja latencia se desconecto.')
        }
      })

      const offer = await activePeer.createOffer()
      await activePeer.setLocalDescription(offer)
      await waitForIceGathering(activePeer)

      const response = await fetch(`/api/cameras/${encodeURIComponent(deviceId)}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredTransport: 'webrtc',
          clientOffer: activePeer.localDescription?.sdp || offer.sdp,
          clientIceCandidates: localCandidates,
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.success || !payload.data) {
        await fail(payload?.error || 'No fue posible preparar baja latencia.')
        return
      }

      const session = payload.data as StreamSession
      callbacksRef.current.onSession(session)
      await pollForAnswer(session)
    }

    start().catch((error) => {
      void fail(error instanceof Error ? error.message : 'No fue posible abrir baja latencia.')
    })

    return () => {
      cancelled = true
      callbacksRef.current.onReadyChange(false)
      peer?.close()
      peerRef.current = null
      const video = videoRef.current
      if (video?.srcObject instanceof MediaStream) {
        for (const track of video.srcObject.getTracks()) track.stop()
      }
      if (video) video.srcObject = null
    }
  }, [deviceId, requestKey])

  return (
    <div className="relative mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#071524]">
      <video
        ref={videoRef}
        className={`h-full min-h-[160px] w-full object-cover transition-opacity ${state === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        autoPlay
        controls
        muted
        playsInline
      />
      {state !== 'ready' && (
        <div className="absolute inset-0 flex min-h-[160px] flex-col items-center justify-center gap-2 text-center text-[11px] text-white/50">
          {state === 'unavailable' ? (
            <VideoOff className="h-5 w-5 text-amber-200" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-[#9DD2F2]" />
          )}
          <span>{state === 'unavailable' ? 'Baja latencia no disponible' : 'Negociando baja latencia segura'}</span>
        </div>
      )}
      <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/75 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-100">
        <Radio className="h-3 w-3" />
        Baja latencia
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, ShieldCheck, VideoOff } from 'lucide-react'

type PlayerState = 'loading' | 'ready' | 'unavailable'

type SecureHlsPlayerProps = {
  src: string
  onReadyChange?: (ready: boolean) => void
  onUnavailableChange?: (unavailable: boolean) => void
}

function getPlayerLabel(state: PlayerState) {
  if (state === 'ready') return 'Video seguro activo'
  if (state === 'unavailable') return 'Video no disponible'
  return 'Preparando video seguro'
}

export function SecureHlsPlayer({
  src,
  onReadyChange,
  onUnavailableChange,
}: SecureHlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<PlayerState>('loading')

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    let cancelled = false
    let cleanupHls: (() => void) | null = null

    function markReady() {
      if (cancelled) return
      setState('ready')
      onReadyChange?.(true)
      onUnavailableChange?.(false)
    }

    function markUnavailable() {
      if (cancelled) return
      setState('unavailable')
      onReadyChange?.(false)
      onUnavailableChange?.(true)
    }

    async function setupPlayer(video: HTMLVideoElement) {
      setState('loading')
      onReadyChange?.(false)
      onUnavailableChange?.(false)

      video.removeAttribute('src')
      video.load()

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src
        video.addEventListener('loadeddata', markReady, { once: true })
        video.addEventListener('error', markUnavailable, { once: true })
        cleanupHls = () => {
          video.removeEventListener('loadeddata', markReady)
          video.removeEventListener('error', markUnavailable)
          video.removeAttribute('src')
          video.load()
        }
        return
      }

      const { default: Hls } = await import('hls.js')
      if (cancelled) return

      if (!Hls.isSupported()) {
        markUnavailable()
        return
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      })

      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, markReady)
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) markUnavailable()
      })

      cleanupHls = () => {
        hls.destroy()
        video.removeAttribute('src')
        video.load()
      }
    }

    setupPlayer(videoElement).catch(markUnavailable)

    return () => {
      cancelled = true
      cleanupHls?.()
      onReadyChange?.(false)
      onUnavailableChange?.(false)
    }
  }, [src, onReadyChange, onUnavailableChange])

  return (
    <div className="relative mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#071524]">
      <video
        ref={videoRef}
        className={`h-full min-h-[160px] w-full object-cover transition-opacity ${state === 'ready' ? 'opacity-100' : 'opacity-0'}`}
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
          <span>{getPlayerLabel(state)}</span>
        </div>
      )}
      <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/75 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-100">
        <ShieldCheck className="h-3 w-3" />
        Video SegurIA
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'

export function CameraSnapshot({ deviceId, alt }: { deviceId: string; alt: string }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    let active = true
    fetch(`/api/cameras/${encodeURIComponent(deviceId)}/snapshot`, { cache: 'no-store' })
      .then(async (response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (active && payload?.data?.url) setUrl(payload.data.url)
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [deviceId])

  if (!url) return null
  return <img src={url} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
}

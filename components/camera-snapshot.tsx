'use client'

import { useState } from 'react'

export function CameraSnapshot({ deviceId, alt }: { deviceId: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    <img
      src={`/api/cameras/${encodeURIComponent(deviceId)}/snapshot`}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}

'use client'

import { useState } from 'react'

interface CameraSnapshotProps {
  deviceId?: string | null
  alt: string
  fallbackSrc?: string
  fallbackPosition?: string
}

export function CameraSnapshot({
  deviceId,
  alt,
  fallbackSrc,
  fallbackPosition = 'center',
}: CameraSnapshotProps) {
  const [failed, setFailed] = useState(!deviceId)

  if (failed) {
    if (!fallbackSrc) return null

    return (
      <img
        src={fallbackSrc}
        alt={`${alt} — imagen demostrativa`}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: fallbackPosition }}
      />
    )
  }

  return (
    <img
      src={`/api/cameras/${encodeURIComponent(deviceId!)}/snapshot`}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}

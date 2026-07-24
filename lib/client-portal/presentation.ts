import type { PortalTone } from '@/components/portal/portal-ui'

const okStatuses = new Set(['operativo', 'online', 'activo', 'active', 'ok', 'resuelto', 'closed'])
const warningStatuses = new Set(['revision', 'mantencion', 'warning', 'degraded', 'pendiente', 'open', 'atencion'])

type PortalDeviceLike = {
  name?: unknown
  nombre?: unknown
  label?: unknown
  location?: unknown
  ubicacion?: unknown
  zone?: unknown
  zona?: unknown
}

export function formatPortalDate(value?: Date | string | null) {
  if (!value) return 'Sin actualización'

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin actualización'

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function getPortalTone(status?: string | null): PortalTone {
  const normalized = String(status || '').trim().toLowerCase()
  if (!normalized) return 'neutral'
  if (okStatuses.has(normalized)) return 'ok'
  if (warningStatuses.has(normalized)) return 'warning'
  return 'critical'
}

export function getPortalDeviceLabel(device: PortalDeviceLike) {
  return String(device.name || device.nombre || device.label || 'Dispositivo')
}

export function getPortalDeviceLocation(device: PortalDeviceLike) {
  return String(device.location || device.ubicacion || device.zone || device.zona || 'Ubicación no indicada')
}

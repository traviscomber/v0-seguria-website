export type CameraRole = 'security' | 'wildlife' | 'mixed'

const CAMERA_ROLES = new Set<CameraRole>(['security', 'wildlife', 'mixed'])

export function getCameraRole(metadata: unknown): CameraRole {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return 'security'
  const role = (metadata as Record<string, unknown>).camera_role
  return typeof role === 'string' && CAMERA_ROLES.has(role as CameraRole)
    ? (role as CameraRole)
    : 'security'
}

export function routesToWildlife(role: CameraRole) {
  return role === 'wildlife' || role === 'mixed'
}

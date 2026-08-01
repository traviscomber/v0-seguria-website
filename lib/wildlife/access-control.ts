export const WILDLIFE_OPERATION_ROLES = [
  'owner',
  'admin',
  'operator',
  'technician',
  'reviewer',
  'viewer',
] as const

export type WildlifeOperationRole = typeof WILDLIFE_OPERATION_ROLES[number]
export type CoordinatePrecision = 'exact' | 'generalized' | 'hidden'

export type WildlifeCapabilities = {
  coordinatePrecision: CoordinatePrecision
  manageMembers: boolean
  viewAudit: boolean
  manageCameras: boolean
  processEvidence: boolean
  reviewEvidence: boolean
  viewEvidence: boolean
}

const ROLE_CAPABILITIES: Record<WildlifeOperationRole, WildlifeCapabilities> = {
  owner: {
    coordinatePrecision: 'exact',
    manageMembers: true,
    viewAudit: true,
    manageCameras: true,
    processEvidence: true,
    reviewEvidence: true,
    viewEvidence: true,
  },
  admin: {
    coordinatePrecision: 'exact',
    manageMembers: true,
    viewAudit: true,
    manageCameras: true,
    processEvidence: true,
    reviewEvidence: true,
    viewEvidence: true,
  },
  operator: {
    coordinatePrecision: 'exact',
    manageMembers: false,
    viewAudit: false,
    manageCameras: true,
    processEvidence: true,
    reviewEvidence: true,
    viewEvidence: true,
  },
  technician: {
    coordinatePrecision: 'exact',
    manageMembers: false,
    viewAudit: false,
    manageCameras: true,
    processEvidence: false,
    reviewEvidence: false,
    viewEvidence: true,
  },
  reviewer: {
    coordinatePrecision: 'generalized',
    manageMembers: false,
    viewAudit: false,
    manageCameras: false,
    processEvidence: false,
    reviewEvidence: true,
    viewEvidence: true,
  },
  viewer: {
    coordinatePrecision: 'generalized',
    manageMembers: false,
    viewAudit: false,
    manageCameras: false,
    processEvidence: false,
    reviewEvidence: false,
    viewEvidence: true,
  },
}

export function normalizeWildlifeRole(value: unknown): WildlifeOperationRole {
  return WILDLIFE_OPERATION_ROLES.includes(value as WildlifeOperationRole)
    ? value as WildlifeOperationRole
    : 'viewer'
}

export function getWildlifeCapabilities(role: WildlifeOperationRole): WildlifeCapabilities {
  return ROLE_CAPABILITIES[role]
}

export function generalizeCoordinate(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null
  return Math.round(numeric * 100) / 100
}

export function protectCoordinates(
  latitude: number | string | null | undefined,
  longitude: number | string | null | undefined,
  precision: CoordinatePrecision,
) {
  if (precision === 'hidden') return { latitude: null, longitude: null }
  if (precision === 'generalized') {
    return {
      latitude: generalizeCoordinate(latitude),
      longitude: generalizeCoordinate(longitude),
    }
  }
  return {
    latitude: latitude === null || latitude === undefined || latitude === '' ? null : Number(latitude),
    longitude: longitude === null || longitude === undefined || longitude === '' ? null : Number(longitude),
  }
}

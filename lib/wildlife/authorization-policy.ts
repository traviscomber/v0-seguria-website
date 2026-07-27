export const WILDLIFE_ROLES = [
  'owner',
  'admin',
  'operator',
  'technician',
  'viewer',
] as const

export type WildlifeRole = (typeof WILDLIFE_ROLES)[number]

export const WILDLIFE_CAPABILITIES = [
  'observation:create',
  'observation:read',
  'evidence:read-original',
  'review:write',
  'tenancy:manage',
] as const

export type WildlifeCapability = (typeof WILDLIFE_CAPABILITIES)[number]

const ROLE_CAPABILITIES: Record<WildlifeRole, readonly WildlifeCapability[]> = {
  owner: WILDLIFE_CAPABILITIES,
  admin: WILDLIFE_CAPABILITIES,
  operator: [
    'observation:create',
    'observation:read',
    'evidence:read-original',
    'review:write',
  ],
  technician: [
    'observation:create',
    'observation:read',
    'evidence:read-original',
  ],
  viewer: ['observation:read'],
}

export function isWildlifeRole(value: unknown): value is WildlifeRole {
  return typeof value === 'string' && WILDLIFE_ROLES.includes(value as WildlifeRole)
}

export function roleHasWildlifeCapability(
  role: WildlifeRole,
  capability: WildlifeCapability
): boolean {
  return ROLE_CAPABILITIES[role].includes(capability)
}

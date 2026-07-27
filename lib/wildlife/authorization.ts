import 'server-only'

import type { SupabaseClient, User } from '@supabase/supabase-js'

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

export interface WildlifeAuthorizationContext {
  userId: string
  organizationId: string
  siteId: string
  role: WildlifeRole
}

export type WildlifeAuthorizationFailureCode =
  | 'unauthenticated'
  | 'site-not-found'
  | 'membership-not-found'
  | 'invalid-role'
  | 'forbidden'
  | 'authorization-query-failed'

export class WildlifeAuthorizationError extends Error {
  readonly code: WildlifeAuthorizationFailureCode
  readonly cause?: unknown

  constructor(
    code: WildlifeAuthorizationFailureCode,
    message: string,
    options?: { cause?: unknown }
  ) {
    super(message)
    this.name = 'WildlifeAuthorizationError'
    this.code = code
    this.cause = options?.cause
  }
}

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

interface SiteRow {
  id: string
  organization_id: string
}

interface MembershipRow {
  organization_id: string
  user_id: string
  role: string
}

async function resolveUser(client: SupabaseClient): Promise<User> {
  const { data, error } = await client.auth.getUser()

  if (error) {
    throw new WildlifeAuthorizationError(
      'authorization-query-failed',
      'Unable to verify the authenticated Wildlife actor.',
      { cause: error }
    )
  }

  if (!data.user) {
    throw new WildlifeAuthorizationError(
      'unauthenticated',
      'An authenticated user is required for Wildlife access.'
    )
  }

  return data.user
}

export async function resolveWildlifeAuthorizationContext(
  client: SupabaseClient,
  input: {
    siteId: string
    capability: WildlifeCapability
  }
): Promise<WildlifeAuthorizationContext> {
  const user = await resolveUser(client)

  const { data: siteData, error: siteError } = await client
    .from('properties')
    .select('id, organization_id')
    .eq('id', input.siteId)
    .maybeSingle()

  if (siteError) {
    throw new WildlifeAuthorizationError(
      'authorization-query-failed',
      'Unable to resolve the Wildlife site.',
      { cause: siteError }
    )
  }

  const site = siteData as SiteRow | null
  if (!site) {
    throw new WildlifeAuthorizationError(
      'site-not-found',
      'The selected Wildlife site does not exist or is not visible to this user.'
    )
  }

  const { data: membershipData, error: membershipError } = await client
    .from('memberships')
    .select('organization_id, user_id, role')
    .eq('organization_id', site.organization_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (membershipError) {
    throw new WildlifeAuthorizationError(
      'authorization-query-failed',
      'Unable to verify Wildlife organization membership.',
      { cause: membershipError }
    )
  }

  const membership = membershipData as MembershipRow | null
  if (!membership) {
    throw new WildlifeAuthorizationError(
      'membership-not-found',
      'The authenticated user is not a member of the organization that owns this site.'
    )
  }

  if (!isWildlifeRole(membership.role)) {
    throw new WildlifeAuthorizationError(
      'invalid-role',
      'The organization membership role is not recognized by Wildlife Intelligence.'
    )
  }

  if (!roleHasWildlifeCapability(membership.role, input.capability)) {
    throw new WildlifeAuthorizationError(
      'forbidden',
      `The ${membership.role} role cannot perform ${input.capability}.`
    )
  }

  return {
    userId: user.id,
    organizationId: site.organization_id,
    siteId: site.id,
    role: membership.role,
  }
}

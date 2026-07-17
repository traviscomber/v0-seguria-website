import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { AuthUser } from '@/lib/auth-store'
import type { IntegrationConnection, IntegrationEvent, IntegrationProvider } from '@/lib/types'

function getAdminClient() {
  const supabase = createSupabaseAdminClient()
  if (!supabase) throw new Error('Integration data service is not configured.')
  return supabase
}

function hasScopedProperties(user?: AuthUser) {
  return !user || user.role === 'admin' || user.propertyIds.length > 0
}

export async function getIntegrationConnections(user?: AuthUser): Promise<IntegrationConnection[]> {
  if (!hasScopedProperties(user)) return []
  const supabase = getAdminClient()
  let integrationsQuery = supabase
    .from('integrations')
    .select('id, provider, display_name, status, endpoint, external_account_ref, last_sync_at, metadata, property_id')

  let devicesQuery = supabase.from('devices').select('integration_id, property_id')

  if (user?.role !== 'admin' && user?.propertyIds.length) {
    integrationsQuery = integrationsQuery.in('property_id', user.propertyIds)
    devicesQuery = devicesQuery.in('property_id', user.propertyIds)
  }

  const [integrationsResult, devicesResult] = await Promise.all([
    integrationsQuery,
    devicesQuery,
  ])

  const queryError = integrationsResult.error || devicesResult.error
  if (queryError) throw new Error(`Integration query failed: ${queryError.message}`)

  const deviceCounts = new Map<string, number>()
  for (const device of devicesResult.data || []) {
    if (device.integration_id) {
      deviceCounts.set(device.integration_id, (deviceCounts.get(device.integration_id) || 0) + 1)
    }
  }

  return (integrationsResult.data || []).map((integration) => ({
    provider: integration.provider as IntegrationProvider,
    name: integration.display_name,
    description: 'Conexion operativa administrada por SegurIA.',
    status: integration.status,
    endpoint: integration.endpoint || '',
    accountName: integration.external_account_ref || undefined,
    accountScope: 'internal',
    lastSyncAt: integration.last_sync_at ? new Date(integration.last_sync_at) : undefined,
    totalEvents: 0,
    totalDevices: deviceCounts.get(integration.id) || 0,
    notes: Array.isArray(integration.metadata?.notes) ? integration.metadata.notes.map(String) : [],
  }))
}

export async function getIntegrationConnectionByProvider(provider: IntegrationProvider, user?: AuthUser) {
  return (await getIntegrationConnections(user)).find((connection) => connection.provider === provider)
}

export async function getIntegrationEvents(limit = 25, user?: AuthUser): Promise<IntegrationEvent[]> {
  if (!hasScopedProperties(user)) return []
  const supabase = getAdminClient()
  let query = supabase
    .from('events')
    .select('id, source, event_type, severity, state, entity_id, device_id, property_id, payload, received_at')
    .order('received_at', { ascending: false })
    .limit(limit)

  if (user?.role !== 'admin' && user?.propertyIds.length) {
    query = query.in('property_id', user.propertyIds)
  }

  const { data, error } = await query

  if (error) throw new Error(`Integration events query failed: ${error.message}`)

  return (data || []).map((event) => ({
    id: event.id,
    provider: event.source as IntegrationProvider,
    eventType: event.event_type,
    title: event.severity === 'critical' ? 'Alerta critica recibida' : 'Actualizacion de seguridad recibida',
    status: event.severity === 'critical' ? 'warning' : 'success',
    entityId: event.entity_id || undefined,
    externalId: event.device_id || undefined,
    projectId: event.property_id,
    payload: { ...(event.payload as Record<string, unknown>), state: event.state },
    receivedAt: new Date(event.received_at),
  }))
}

export async function getIntegrationSummary(user?: AuthUser) {
  const [connections, recentEvents] = await Promise.all([
    getIntegrationConnections(user),
    getIntegrationEvents(10, user),
  ])
  return {
    totalConnections: connections.length,
    connectedConnections: connections.filter((connection) => connection.status === 'connected').length,
    pendingConnections: connections.filter((connection) => connection.status === 'pending').length,
    recentEvents,
  }
}

export async function getIntegrationActivitySummary(limit = 10, user?: AuthUser) {
  const recentEvents = await getIntegrationEvents(limit, user)
  return {
    recentEvents,
    connectedEvents: recentEvents.filter((event) => event.eventType === 'account.connected').length,
    syncEvents: recentEvents.filter((event) => event.eventType.includes('sync') || event.eventType.includes('heartbeat')).length,
    alertEvents: recentEvents.filter((event) => event.status === 'warning' || event.status === 'error').length,
  }
}

export async function getIntegrationPropertyOptions(user: AuthUser) {
  const supabase = getAdminClient()
  let query = supabase
    .from('properties')
    .select('id, organization_id, name, address')
    .order('created_at', { ascending: false })
    .limit(250)

  if (user.role === 'technician') {
    if (user.propertyIds.length === 0) return []
    query = query.in('id', user.propertyIds)
  }

  const { data, error } = await query
  if (error) throw new Error(`Integration properties query failed: ${error.message}`)

  const organizationIds = Array.from(new Set((data || []).map((property) => property.organization_id as string)))
  const { data: organizations, error: organizationsError } = organizationIds.length
    ? await supabase.from('organizations').select('id, name').in('id', organizationIds)
    : { data: [], error: null }
  if (organizationsError) throw new Error(`Integration organizations query failed: ${organizationsError.message}`)

  const organizationNames = new Map((organizations || []).map((organization) => [
    organization.id as string,
    organization.name as string,
  ]))

  return (data || []).map((property) => ({
    id: property.id as string,
    name: property.name as string,
    location: (property.address as string | null) || 'Ubicacion por definir',
    organizationName: organizationNames.get(property.organization_id as string) || 'Cliente',
  }))
}

export async function getIntegrationCredentialSummaries(user: AuthUser) {
  const supabase = getAdminClient()
  let query = supabase
    .from('integration_credentials')
    .select('id, property_id, provider, label, account_identifier, credential_kind, secret_hint, status, rotation_due_at, last_validated_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100)

  if (user.role === 'technician') {
    if (user.propertyIds.length === 0) return []
    query = query.in('property_id', user.propertyIds)
  }

  const { data, error } = await query
  if (error) throw new Error(`Integration credentials query failed: ${error.message}`)

  return (data || []).map((credential) => ({
    id: credential.id as string,
    propertyId: credential.property_id as string,
    provider: credential.provider as IntegrationProvider,
    label: credential.label as string,
    accountIdentifier: credential.account_identifier as string | null,
    credentialKind: credential.credential_kind as string,
    secretHint: credential.secret_hint as string | null,
    status: credential.status as string,
    rotationDueAt: credential.rotation_due_at as string | null,
    lastValidatedAt: credential.last_validated_at as string | null,
    updatedAt: credential.updated_at as string,
  }))
}

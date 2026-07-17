import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { IntegrationConnection, IntegrationEvent, IntegrationProvider } from '@/lib/types'

function getAdminClient() {
  const supabase = createSupabaseAdminClient()
  if (!supabase) throw new Error('Integration data service is not configured.')
  return supabase
}

export async function getIntegrationConnections(): Promise<IntegrationConnection[]> {
  const supabase = getAdminClient()
  const [integrationsResult, devicesResult] = await Promise.all([
    supabase
      .from('integrations')
      .select('id, provider, display_name, status, endpoint, external_account_ref, last_sync_at, metadata'),
    supabase.from('devices').select('integration_id'),
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

export async function getIntegrationConnectionByProvider(provider: IntegrationProvider) {
  return (await getIntegrationConnections()).find((connection) => connection.provider === provider)
}

export async function getIntegrationEvents(limit = 25): Promise<IntegrationEvent[]> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('events')
    .select('id, source, event_type, severity, state, entity_id, device_id, property_id, payload, received_at')
    .order('received_at', { ascending: false })
    .limit(limit)

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

export async function getIntegrationSummary() {
  const [connections, recentEvents] = await Promise.all([
    getIntegrationConnections(),
    getIntegrationEvents(10),
  ])
  return {
    totalConnections: connections.length,
    connectedConnections: connections.filter((connection) => connection.status === 'connected').length,
    pendingConnections: connections.filter((connection) => connection.status === 'pending').length,
    recentEvents,
  }
}

export async function getIntegrationActivitySummary(limit = 10) {
  const recentEvents = await getIntegrationEvents(limit)
  return {
    recentEvents,
    connectedEvents: recentEvents.filter((event) => event.eventType === 'account.connected').length,
    syncEvents: recentEvents.filter((event) => event.eventType.includes('sync') || event.eventType.includes('heartbeat')).length,
    alertEvents: recentEvents.filter((event) => event.status === 'warning' || event.status === 'error').length,
  }
}

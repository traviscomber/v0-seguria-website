import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type SecurityDeviceKind =
  | 'camera'
  | 'motion'
  | 'entry'
  | 'smoke'
  | 'gas'
  | 'water'
  | 'environment'
  | 'alarm'
  | 'siren'
  | 'access'
  | 'gateway'
  | 'other'

export type SecuritySeverity = 'info' | 'warning' | 'critical'

export type SecurityIngestionInput = {
  gatewayPublicId: string
  provider: 'home_assistant' | 'tuya'
  externalEventId: string
  externalDeviceId: string
  externalEntityId: string
  deviceName: string
  deviceKind: SecurityDeviceKind
  entityName: string
  entityDomain: string
  entityDeviceClass?: string
  entityState: string
  eventType: string
  severity: SecuritySeverity
  occurredAt: string
  payload?: Record<string, unknown>
  attributes?: Record<string, unknown>
}

export async function ingestSecurityEvent(input: SecurityIngestionInput) {
  const supabase = createSupabaseAdminClient()
  if (!supabase) throw new Error('Security ingestion is not configured.')

  const { data, error } = await supabase.rpc('ingest_security_event', {
    gateway_public_id: input.gatewayPublicId,
    integration_provider: input.provider,
    external_event_id: input.externalEventId,
    external_device_id: input.externalDeviceId,
    external_entity_id: input.externalEntityId,
    device_name: input.deviceName,
    device_kind: input.deviceKind,
    entity_name: input.entityName,
    entity_domain: input.entityDomain,
    entity_device_class: input.entityDeviceClass || null,
    entity_state: input.entityState,
    event_type: input.eventType,
    event_severity: input.severity,
    event_occurred_at: input.occurredAt,
    event_payload: input.payload || {},
    state_attributes: input.attributes || {},
  })

  if (error) throw new Error(`Security ingestion failed: ${error.message}`)
  return data
}

export function inferSecurityDeviceKind(entityId: string, deviceClass?: string): SecurityDeviceKind {
  const domain = entityId.split('.')[0]
  const normalizedClass = deviceClass?.toLowerCase() || ''

  if (domain === 'camera') return 'camera'
  if (domain === 'alarm_control_panel') return 'alarm'
  if (domain === 'siren') return 'siren'
  if (domain === 'lock' || normalizedClass === 'lock') return 'access'
  if (['door', 'garage_door', 'opening', 'window'].includes(normalizedClass)) return 'entry'
  if (['motion', 'occupancy', 'presence'].includes(normalizedClass)) return 'motion'
  if (['smoke', 'carbon_monoxide'].includes(normalizedClass)) return 'smoke'
  if (normalizedClass === 'gas') return 'gas'
  if (normalizedClass === 'moisture') return 'water'
  if (['temperature', 'humidity'].includes(normalizedClass)) return 'environment'
  return 'other'
}

export function inferSecuritySeverity(state: string, deviceClass?: string): SecuritySeverity {
  const normalized = state.toLowerCase()
  const safetyClass = ['smoke', 'carbon_monoxide', 'gas', 'moisture'].includes(deviceClass || '')
  if (['unavailable', 'offline'].includes(normalized)) return 'warning'
  if (safetyClass && ['on', 'alarm', 'detected'].includes(normalized)) return 'critical'
  if (['triggered', 'alarm', 'tamper'].includes(normalized)) return 'critical'
  return 'info'
}

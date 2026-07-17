import fs from 'node:fs'
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

function readEnvFile(path) {
  if (!fs.existsSync(path)) return {}
  return Object.fromEntries(
    fs.readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, '')]
      })
  )
}

function createSupabaseClient() {
  const env = { ...readEnvFile('.env.local'), ...process.env }
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEY.')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function hashGatewaySecret(secret) {
  return crypto.createHash('sha256').update(secret, 'utf8').digest('hex')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function countRows(supabase, table, column, value) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq(column, value)
  if (error) throw error
  return count || 0
}

async function deleteWhere(supabase, table, column, value) {
  if (!value) return
  const { error } = await supabase.from(table).delete().eq(column, value)
  if (error) throw error
}

async function main() {
  const supabase = createSupabaseClient()
  const runId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
  const email = `smoke-${runId}@seguria.local`
  const operatorEmail = `smoke-operator-${runId}@seguria.local`
  const gatewayPublicId = `gw_${crypto.randomBytes(18).toString('base64url')}`
  const gatewaySecret = crypto.randomBytes(32).toString('base64url')
  let userId
  let operatorId
  let organizationId
  let propertyId
  let gatewayId

  async function cleanup() {
    if (propertyId) {
      await deleteWhere(supabase, 'camera_stream_sessions', 'property_id', propertyId)
      await deleteWhere(supabase, 'camera_snapshots', 'property_id', propertyId)
      await deleteWhere(supabase, 'automation_runs', 'property_id', propertyId)
      await deleteWhere(supabase, 'property_automations', 'property_id', propertyId)
      await deleteWhere(supabase, 'incident_events', 'property_id', propertyId)
      await deleteWhere(supabase, 'incident_actions', 'property_id', propertyId)
      await deleteWhere(supabase, 'notifications', 'property_id', propertyId)
      await deleteWhere(supabase, 'incidents', 'property_id', propertyId)
      await deleteWhere(supabase, 'events', 'property_id', propertyId)
      await deleteWhere(supabase, 'entity_states', 'property_id', propertyId)
      await deleteWhere(supabase, 'entities', 'property_id', propertyId)
      await deleteWhere(supabase, 'devices', 'property_id', propertyId)
      await deleteWhere(supabase, 'integrations', 'property_id', propertyId)
      await deleteWhere(supabase, 'gateways', 'property_id', propertyId)
      await deleteWhere(supabase, 'spaces', 'property_id', propertyId)
      await deleteWhere(supabase, 'audit_log', 'property_id', propertyId)
      await deleteWhere(supabase, 'properties', 'id', propertyId)
    }
    if (organizationId) {
      await deleteWhere(supabase, 'audit_log', 'organization_id', organizationId)
      await deleteWhere(supabase, 'automation_templates', 'organization_id', organizationId)
      await deleteWhere(supabase, 'memberships', 'organization_id', organizationId)
      await deleteWhere(supabase, 'organizations', 'id', organizationId)
    }
    if (userId) await supabase.auth.admin.deleteUser(userId)
    if (operatorId) await supabase.auth.admin.deleteUser(operatorId)
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password: `Seguria-${runId}!7`,
      email_confirm: true,
      app_metadata: { platform_role: 'client' },
      user_metadata: { full_name: 'Smoke SegurIA' },
    })
    if (userError || !userData.user) throw userError || new Error('User creation failed.')
    userId = userData.user.id

    const { data: operatorData, error: operatorError } = await supabase.auth.admin.createUser({
      email: operatorEmail,
      password: `Seguria-operator-${runId}!7`,
      email_confirm: true,
      app_metadata: { platform_role: 'admin' },
      user_metadata: { full_name: 'Smoke Operator' },
    })
    if (operatorError || !operatorData.user) throw operatorError || new Error('Operator creation failed.')
    operatorId = operatorData.user.id

    const { data: provisioned, error: provisionError } = await supabase.rpc('provision_client_account', {
      target_user_id: userId,
      organization_name: 'Smoke SegurIA',
      organization_slug: `smoke-seguria-${runId}`,
      property_name: 'Sitio Smoke',
      property_address: 'Santiago',
    })
    if (provisionError) throw provisionError
    organizationId = provisioned.organization_id
    propertyId = provisioned.property_id
    assert(organizationId && propertyId, 'Provision RPC did not return organization/property.')

    const { data: gateway, error: gatewayError } = await supabase
      .from('gateways')
      .insert({
        organization_id: organizationId,
        property_id: propertyId,
        public_id: gatewayPublicId,
        name: 'Conector smoke',
        secret_hash: hashGatewaySecret(gatewaySecret),
      })
      .select('id')
      .single()
    if (gatewayError || !gateway) throw gatewayError || new Error('Gateway creation failed.')
    gatewayId = gateway.id

    const occurredAt = new Date().toISOString()
    const { data: ingestResult, error: ingestError } = await supabase.rpc('ingest_security_event', {
      gateway_public_id: gatewayPublicId,
      integration_provider: 'home_assistant',
      external_event_id: `smoke-critical-${runId}`,
      external_device_id: `camera-smoke-${runId}`,
      external_entity_id: `binary_sensor.smoke_${runId}`,
      device_name: 'Camara acceso smoke',
      device_kind: 'camera',
      entity_name: 'Deteccion smoke',
      entity_domain: 'binary_sensor',
      entity_device_class: 'motion',
      entity_state: 'alert',
      event_type: 'camera.motion_detected',
      event_severity: 'critical',
      event_occurred_at: occurredAt,
      state_attributes: { smoke: true },
      event_payload: { title: 'Movimiento critico smoke', runId },
    })
    if (ingestError) throw ingestError
    assert(ingestResult?.incident_id, 'Critical event did not create an incident.')

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, device_id, entity_id')
      .eq('id', ingestResult.event_id)
      .single()
    if (eventError || !event) throw eventError || new Error('Event readback failed.')

    const tokenHash = crypto.createHash('sha256').update(`stream-${runId}`).digest('hex')
    const { data: streamSession, error: streamError } = await supabase
      .from('camera_stream_sessions')
      .insert({
        organization_id: organizationId,
        property_id: propertyId,
        device_id: event.device_id,
        gateway_id: gatewayId,
        requested_by: userId,
        session_token_hash: tokenHash,
        expires_at: new Date(Date.now() + 120000).toISOString(),
        metadata: {
          preferredTransport: 'webrtc',
          signalingState: 'offer_pending',
          clientOffer: 'v=0\r\ns=seguria-smoke\r\n',
          clientIceCandidates: [],
        },
      })
      .select('id')
      .single()
    if (streamError || !streamSession) throw streamError || new Error('Stream session creation failed.')

    const { data: updatedSession, error: updateStreamError } = await supabase
      .from('camera_stream_sessions')
      .update({
        status: 'active',
        metadata: {
          preferredTransport: 'webrtc',
          signalingState: 'answer_ready',
          clientOffer: 'v=0\r\ns=seguria-smoke\r\n',
          gatewayAnswer: 'v=0\r\ns=seguria-smoke-answer\r\n',
          gatewayIceCandidates: [],
        },
      })
      .eq('id', streamSession.id)
      .select('metadata')
      .single()
    if (updateStreamError || !updatedSession) throw updateStreamError || new Error('Stream session update failed.')
    assert(updatedSession.metadata?.signalingState === 'answer_ready', 'WebRTC signaling state was not persisted.')

    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .select('id, status')
      .eq('id', ingestResult.incident_id)
      .single()
    if (incidentError || !incident) throw incidentError || new Error('Incident readback failed.')

    const { data: managedIncident, error: manageError } = await supabase.rpc('manage_incident', {
      target_incident_id: incident.id,
      actor_user_id: operatorId,
      requested_status: 'validating',
      requested_assignee: null,
      note: 'Smoke test validation note.',
    })
    if (manageError) throw manageError
    assert(managedIncident?.status === 'validating', 'Incident management did not update status.')

    const organizationBeforeCleanup = organizationId
    const summary = {
      ok: true,
      organizationId,
      propertyId,
      gatewayId,
      counts: {
        memberships: await countRows(supabase, 'memberships', 'organization_id', organizationId),
        spaces: await countRows(supabase, 'spaces', 'property_id', propertyId),
        devices: await countRows(supabase, 'devices', 'property_id', propertyId),
        events: await countRows(supabase, 'events', 'property_id', propertyId),
        incidents: await countRows(supabase, 'incidents', 'property_id', propertyId),
        incidentActions: await countRows(supabase, 'incident_actions', 'property_id', propertyId),
        streamSessions: await countRows(supabase, 'camera_stream_sessions', 'property_id', propertyId),
      },
    }

    await cleanup()
    const remainingOrganizations = await countRows(supabase, 'organizations', 'id', organizationBeforeCleanup)
    summary.cleanupVerified = remainingOrganizations === 0
    assert(summary.cleanupVerified, 'Smoke cleanup did not remove the temporary organization.')

    console.log(JSON.stringify(summary, null, 2))
  } finally {
    await cleanup()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

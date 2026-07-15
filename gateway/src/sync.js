import { fetchHomeAssistantEntities } from './home-assistant.js'
import { sendEvents, sendHeartbeat } from './seguria-api.js'

export async function syncGateway(config, buffer, mqttAdapter) {
  const heartbeat = await sendHeartbeat(config)
  const entities = await fetchHomeAssistantEntities(config).catch(() => [])
  const pendingEvents = await buffer.drain()

  if (mqttAdapter) {
    await mqttAdapter.connect()
    await mqttAdapter.publish(`seguria/${config.propertyId}/gateway/status`, {
      gatewayId: config.gatewayId,
      status: 'online',
      entities: Array.isArray(entities) ? entities.length : 0,
    })
  }

  const syncResult =
    pendingEvents.length > 0
      ? await sendEvents(config, pendingEvents)
      : { sent: 0, acceptedAt: new Date().toISOString() }

  return {
    heartbeat,
    syncResult,
    bufferedEvents: pendingEvents.length,
    entityCount: Array.isArray(entities) ? entities.length : 0,
  }
}

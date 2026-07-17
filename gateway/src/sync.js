import {
  applyOperationalConfig,
  fetchHomeAssistantEntities,
  mapEntitiesToInventoryDevices,
} from './home-assistant.js'
import { fetchGatewayConfig, sendEvents, sendHeartbeat, sendInventory } from './seguria-api.js'

export async function syncGateway(config, buffer, mqttAdapter) {
  const gatewayConfig = await fetchGatewayConfig(config).catch((error) => ({
    error: error.message,
    connections: [],
  }))
  const effectiveConfig = applyOperationalConfig(config, gatewayConfig)
  const heartbeat = await sendHeartbeat(effectiveConfig)
  const entities = await fetchHomeAssistantEntities(effectiveConfig).catch(() => [])
  const inventoryDevices = mapEntitiesToInventoryDevices(entities)
  const inventoryResult = await sendInventory(effectiveConfig, inventoryDevices).catch((error) => ({
    error: error.message,
    importedDevices: 0,
    importedEntities: 0,
  }))
  const pendingEvents = await buffer.drain()

  if (mqttAdapter && effectiveConfig.mqttUrl) {
    await mqttAdapter.connect()
    await mqttAdapter.publish(`seguria/${effectiveConfig.propertyId}/gateway/status`, {
      gatewayId: effectiveConfig.gatewayId,
      status: 'online',
      entities: Array.isArray(entities) ? entities.length : 0,
    })
  }

  const syncResult =
    pendingEvents.length > 0
      ? await sendEvents(effectiveConfig, pendingEvents)
      : { sent: 0, acceptedAt: new Date().toISOString() }

  return {
    gatewayConfig: {
      delivered: !gatewayConfig.error,
      connectionCount: gatewayConfig.connections?.length || 0,
      error: gatewayConfig.error,
    },
    heartbeat,
    inventoryResult,
    syncResult,
    bufferedEvents: pendingEvents.length,
    entityCount: Array.isArray(entities) ? entities.length : 0,
  }
}

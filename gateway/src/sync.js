import {
  applyOperationalConfig,
  fetchHomeAssistantEntities,
  mapEntitiesToInventoryDevices,
} from './home-assistant.js'
import { fetchGatewayConfig, sendEvents, sendHeartbeat, sendInventory } from './seguria-api.js'

async function dispatchQueuedOperation(config, item) {
  if (item.type === 'heartbeat') return sendHeartbeat(config, item.payload)
  if (item.type === 'inventory') return sendInventory(config, item.payload.devices, { synchronizedAt: item.payload.synchronizedAt })
  if (item.type === 'events') return sendEvents(config, item.payload.events)
  throw new Error(`Unsupported queued operation: ${item.type}`)
}

async function processOperationQueue(config, operationQueue) {
  if (!operationQueue) return { attempted: 0, delivered: 0, failed: 0 }

  const due = operationQueue.due()
  let delivered = 0
  let failed = 0

  for (const item of due) {
    try {
      await dispatchQueuedOperation(config, item)
      await operationQueue.complete(item.id)
      delivered += 1
    } catch (error) {
      await operationQueue.fail(item.id, error)
      failed += 1
    }
  }

  return { attempted: due.length, delivered, failed }
}

async function sendOrQueue(operationQueue, type, payload, sender) {
  try {
    return { queued: false, result: await sender() }
  } catch (error) {
    if (!operationQueue) throw error
    await operationQueue.enqueue(type, payload, { lastError: error.message })
    return { queued: true, error: error.message }
  }
}

export async function syncGateway(config, buffer, mqttAdapter, operationQueue) {
  const gatewayConfig = await fetchGatewayConfig(config).catch((error) => ({
    error: error.message,
    connections: [],
  }))
  const effectiveConfig = applyOperationalConfig(config, gatewayConfig)
  const queueResult = await processOperationQueue(effectiveConfig, operationQueue)
  const heartbeatPayload = {
    gatewayId: effectiveConfig.gatewayId,
    propertyId: effectiveConfig.propertyId,
    status: 'online',
    localTime: new Date().toISOString(),
    version: '0.1.0',
  }
  const heartbeat = await sendOrQueue(operationQueue, 'heartbeat', heartbeatPayload, () =>
    sendHeartbeat(effectiveConfig, heartbeatPayload)
  )
  const entities = await fetchHomeAssistantEntities(effectiveConfig).catch(() => [])
  const inventoryDevices = mapEntitiesToInventoryDevices(entities)
  const inventoryPayload = {
    synchronizedAt: new Date().toISOString(),
    devices: inventoryDevices,
  }
  const inventoryResult = inventoryDevices.length > 0
    ? await sendOrQueue(operationQueue, 'inventory', inventoryPayload, () =>
        sendInventory(effectiveConfig, inventoryDevices, { synchronizedAt: inventoryPayload.synchronizedAt })
      )
    : { queued: false, result: { importedDevices: 0, importedEntities: 0 } }
  const pendingEvents = await buffer.drain()

  if (mqttAdapter && effectiveConfig.mqttUrl) {
    await mqttAdapter.connect()
    await mqttAdapter.publish(`seguria/${effectiveConfig.propertyId}/gateway/status`, {
      gatewayId: effectiveConfig.gatewayId,
      status: 'online',
      entities: Array.isArray(entities) ? entities.length : 0,
    })
  }

  const syncResult = pendingEvents.length > 0
    ? await sendOrQueue(operationQueue, 'events', { events: pendingEvents }, () => sendEvents(effectiveConfig, pendingEvents))
    : { queued: false, result: { sent: 0, acceptedAt: new Date().toISOString() } }

  return {
    gatewayConfig: {
      delivered: !gatewayConfig.error,
      connectionCount: gatewayConfig.connections?.length || 0,
      error: gatewayConfig.error,
    },
    queueResult,
    heartbeat,
    inventoryResult,
    syncResult,
    bufferedEvents: pendingEvents.length,
    queuedOperations: operationQueue?.size?.() || 0,
    entityCount: Array.isArray(entities) ? entities.length : 0,
  }
}

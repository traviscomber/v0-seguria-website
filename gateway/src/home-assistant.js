export async function fetchHomeAssistantEntities(config) {
  if (!config.homeAssistantUrl || !config.homeAssistantToken) {
    return []
  }

  const response = await fetch(`${config.homeAssistantUrl}/api/states`, {
    headers: {
      Authorization: `Bearer ${config.homeAssistantToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Home Assistant state fetch failed: ${response.status}`)
  }

  return response.json()
}

export async function fetchHomeAssistantServices(config) {
  if (!config.homeAssistantUrl || !config.homeAssistantToken) {
    return []
  }

  const response = await fetch(`${config.homeAssistantUrl}/api/services`, {
    headers: {
      Authorization: `Bearer ${config.homeAssistantToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Home Assistant services fetch failed: ${response.status}`)
  }

  return response.json()
}

export function applyOperationalConfig(config, gatewayConfig) {
  const localBridge = gatewayConfig?.connections?.find((connection) => connection.provider === 'local_bridge')
  const propertyId = gatewayConfig?.gateway?.propertyId || config.propertyId
  if (!localBridge) return { ...config, propertyId }

  return {
    ...config,
    propertyId,
    homeAssistantUrl: config.homeAssistantUrl || localBridge.endpoint || '',
    homeAssistantToken: config.homeAssistantToken || localBridge.secret || '',
  }
}

function getDeviceId(entity) {
  const attributes = entity.attributes || {}
  return attributes.device_id || attributes.unique_id || entity.entity_id
}

function getDeviceName(entity) {
  const attributes = entity.attributes || {}
  return attributes.device_name || attributes.friendly_name || entity.entity_id
}

export function mapEntitiesToInventoryDevices(entities) {
  if (!Array.isArray(entities)) return []

  const devices = new Map()
  for (const entity of entities) {
    if (!entity?.entity_id) continue

    const attributes = entity.attributes || {}
    const deviceId = String(getDeviceId(entity))
    const device = devices.get(deviceId) || {
      deviceId,
      name: String(getDeviceName(entity)),
      manufacturer: typeof attributes.manufacturer === 'string' ? attributes.manufacturer : undefined,
      model: typeof attributes.model === 'string' ? attributes.model : undefined,
      area: typeof attributes.area === 'string' ? attributes.area : undefined,
      entities: [],
    }

    device.entities.push({
      entityId: entity.entity_id,
      name: String(attributes.friendly_name || entity.entity_id),
      state: String(entity.state || 'unknown'),
      deviceClass: typeof attributes.device_class === 'string' ? attributes.device_class : undefined,
      attributes,
    })
    devices.set(deviceId, device)
  }

  return Array.from(devices.values())
}

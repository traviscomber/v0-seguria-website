export async function sendHeartbeat(config) {
  const response = await fetch(`${config.apiBaseUrl}/api/gateway/heartbeat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-seguria-gateway-secret': config.gatewaySecret,
    },
    body: JSON.stringify({
      gatewayId: config.gatewayId,
      propertyId: config.propertyId,
      status: 'online',
      localTime: new Date().toISOString(),
      version: '0.1.0',
    }),
  })

  if (!response.ok) {
    throw new Error(`Heartbeat failed: ${response.status}`)
  }

  return response.json()
}

export async function fetchGatewayConfig(config) {
  const response = await fetch(`${config.apiBaseUrl}/api/gateway/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-seguria-gateway-secret': config.gatewaySecret,
    },
    body: JSON.stringify({
      gatewayId: config.gatewayId,
    }),
  })

  if (!response.ok) {
    throw new Error(`Gateway config fetch failed: ${response.status}`)
  }

  const payload = await response.json()
  if (!payload.success) {
    throw new Error(payload.error || 'Gateway config fetch failed')
  }

  return payload.data
}

export async function sendEvents(config, events) {
  const response = await fetch(`${config.apiBaseUrl}/api/gateway/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-seguria-gateway-secret': config.gatewaySecret,
    },
    body: JSON.stringify({
      gatewayId: config.gatewayId,
      propertyId: config.propertyId,
      events,
    }),
  })

  if (!response.ok) {
    throw new Error(`Event sync failed: ${response.status}`)
  }

  return response.json()
}

export async function sendInventory(config, devices) {
  if (!Array.isArray(devices) || devices.length === 0) {
    return { importedDevices: 0, importedEntities: 0 }
  }

  const response = await fetch(`${config.apiBaseUrl}/api/gateway/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-seguria-gateway-secret': config.gatewaySecret,
    },
    body: JSON.stringify({
      gatewayId: config.gatewayId,
      synchronizedAt: new Date().toISOString(),
      devices,
    }),
  })

  if (!response.ok) {
    throw new Error(`Inventory sync failed: ${response.status}`)
  }

  return response.json()
}

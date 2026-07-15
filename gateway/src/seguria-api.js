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

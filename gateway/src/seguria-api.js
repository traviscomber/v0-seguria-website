export async function sendHeartbeat(config, payload = {}) {
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
      ...payload,
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

export async function sendInventory(config, devices, options = {}) {
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
      synchronizedAt: options.synchronizedAt || new Date().toISOString(),
      devices,
    }),
  })

  if (!response.ok) {
    throw new Error(`Inventory sync failed: ${response.status}`)
  }

  return response.json()
}

export async function fetchCameraStreamSessions(config) {
  const response = await fetch(`${config.apiBaseUrl}/api/gateway/cameras/stream-sessions`, {
    headers: {
      'x-seguria-gateway-id': config.gatewayId,
      'x-seguria-gateway-secret': config.gatewaySecret,
    },
  })

  if (!response.ok) {
    throw new Error(`Camera stream session fetch failed: ${response.status}`)
  }

  const payload = await response.json()
  if (!payload.success) {
    throw new Error(payload.error || 'Camera stream session fetch failed')
  }

  return payload.data
}

export async function reportCameraStreamSession(config, sessionId, status, options = {}) {
  const response = await fetch(`${config.apiBaseUrl}/api/gateway/cameras/stream-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-seguria-gateway-id': config.gatewayId,
      'x-seguria-gateway-secret': config.gatewaySecret,
    },
    body: JSON.stringify({
      sessionId,
      status,
      transport: options.transport,
      gatewayStreamRef: options.gatewayStreamRef,
      gatewayAnswer: options.gatewayAnswer,
      gatewayIceCandidates: options.gatewayIceCandidates,
      error: options.error,
    }),
  })

  if (!response.ok) {
    throw new Error(`Camera stream session report failed: ${response.status}`)
  }

  return response.json()
}

export async function uploadCameraStreamHlsFile(config, sessionId, kind, name, bytes, contentType) {
  const form = new FormData()
  form.set('sessionId', sessionId)
  form.set('kind', kind)
  form.set('name', name)
  form.set('file', new Blob([bytes], { type: contentType }), name)

  const response = await fetch(`${config.apiBaseUrl}/api/gateway/cameras/stream-sessions/hls`, {
    method: 'POST',
    headers: {
      'x-seguria-gateway-id': config.gatewayId,
      'x-seguria-gateway-secret': config.gatewaySecret,
    },
    body: form,
  })

  if (!response.ok) {
    throw new Error(`Camera stream HLS upload failed: ${response.status}`)
  }

  return response.json()
}

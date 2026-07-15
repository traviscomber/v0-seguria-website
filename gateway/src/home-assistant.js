export async function fetchHomeAssistantEntities(config) {
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

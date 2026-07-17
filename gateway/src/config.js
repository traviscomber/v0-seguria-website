export function loadConfig(env = process.env) {
  const required = (value, name) => {
    if (!value) {
      throw new Error(`Missing required env var: ${name}`)
    }
    return value
  }

  return {
    gatewayId: required(env.SEGURIA_GATEWAY_ID, 'SEGURIA_GATEWAY_ID'),
    propertyId: env.SEGURIA_PROPERTY_ID || '',
    apiBaseUrl: env.SEGURIA_API_BASE_URL || 'https://seguria.tech',
    gatewaySecret: required(env.SEGURIA_GATEWAY_SECRET, 'SEGURIA_GATEWAY_SECRET'),
    homeAssistantUrl: env.HOME_ASSISTANT_URL || '',
    homeAssistantToken: env.HOME_ASSISTANT_TOKEN || '',
    mqttUrl: env.MQTT_URL || '',
    mqttUsername: env.MQTT_USERNAME || '',
    mqttPassword: env.MQTT_PASSWORD || '',
    heartbeatIntervalSeconds: Number(env.HEARTBEAT_INTERVAL_SECONDS || 60),
    syncIntervalSeconds: Number(env.SYNC_INTERVAL_SECONDS || 30),
    eventBufferFile: env.EVENT_BUFFER_FILE || './data/events.json',
  }
}

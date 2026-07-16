export function createMqttAdapter() {
  return {
    async connect() {
      return true
    },
    async publish(topic, payload) {
      return { topic, payload }
    },
    async close() {
      return true
    },
  }
}

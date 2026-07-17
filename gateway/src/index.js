import { EventBuffer } from './event-buffer.js'
import { loadConfig } from './config.js'
import { createMqttAdapter } from './mqtt.js'
import { OperationQueue } from './operation-queue.js'
import { syncGateway } from './sync.js'

async function main() {
  const config = loadConfig()
  const buffer = new EventBuffer(config.eventBufferFile)
  const operationQueue = new OperationQueue(config.operationQueueFile)
  const mqttAdapter = createMqttAdapter()

  await buffer.load()
  await operationQueue.load()
  const result = await syncGateway(config, buffer, mqttAdapter, operationQueue)

  console.log(`SegurIA gateway initialized for property ${config.propertyId}`)
  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => {
  console.error('SegurIA gateway failed to start:', error)
  process.exit(1)
})

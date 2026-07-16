import fs from 'node:fs/promises'
import path from 'node:path'

export class EventBuffer {
  constructor(filePath) {
    this.filePath = filePath
    this.queue = []
  }

  async load() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw)
      this.queue = Array.isArray(parsed) ? parsed : []
    } catch (error) {
      this.queue = []
      if (error?.code !== 'ENOENT') {
        throw error
      }
    }
  }

  async save() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true })
    await fs.writeFile(this.filePath, JSON.stringify(this.queue, null, 2), 'utf8')
  }

  async enqueue(event) {
    this.queue.push(event)
    await this.save()
  }

  async drain() {
    const snapshot = [...this.queue]
    this.queue = []
    await this.save()
    return snapshot
  }

  size() {
    return this.queue.length
  }
}

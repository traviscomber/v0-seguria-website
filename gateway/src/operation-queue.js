import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const DEFAULT_RETRY_SECONDS = 30
const MAX_RETRY_SECONDS = 15 * 60

function nowIso() {
  return new Date().toISOString()
}

function backoffSeconds(attempts) {
  return Math.min(DEFAULT_RETRY_SECONDS * Math.max(1, 2 ** Math.max(0, attempts - 1)), MAX_RETRY_SECONDS)
}

export class OperationQueue {
  constructor(filePath, options = {}) {
    this.filePath = filePath
    this.maxItems = options.maxItems || 500
    this.items = []
  }

  async load() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw)
      this.items = Array.isArray(parsed) ? parsed : []
    } catch (error) {
      this.items = []
      if (error?.code !== 'ENOENT') throw error
    }
  }

  async save() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true })
    await fs.writeFile(this.filePath, JSON.stringify(this.items, null, 2), 'utf8')
  }

  async enqueue(type, payload, metadata = {}) {
    const item = {
      id: metadata.id || crypto.randomUUID(),
      type,
      payload,
      attempts: metadata.attempts || 0,
      createdAt: metadata.createdAt || nowIso(),
      nextAttemptAt: metadata.nextAttemptAt || nowIso(),
      lastError: metadata.lastError || null,
    }

    this.items.push(item)
    if (this.items.length > this.maxItems) {
      this.items = this.items.slice(this.items.length - this.maxItems)
    }
    await this.save()
    return item
  }

  due(referenceTime = new Date()) {
    return this.items.filter((item) => new Date(item.nextAttemptAt).getTime() <= referenceTime.getTime())
  }

  async complete(id) {
    this.items = this.items.filter((item) => item.id !== id)
    await this.save()
  }

  async fail(id, error) {
    this.items = this.items.map((item) => {
      if (item.id !== id) return item
      const attempts = item.attempts + 1
      return {
        ...item,
        attempts,
        lastError: error?.message || String(error || 'Unknown error'),
        nextAttemptAt: new Date(Date.now() + backoffSeconds(attempts) * 1000).toISOString(),
      }
    })
    await this.save()
  }

  size() {
    return this.items.length
  }
}

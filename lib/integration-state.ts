import 'server-only'

import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { IntegrationConnection, IntegrationEvent, IntegrationProvider } from './types'

type IntegrationState = {
  connections: IntegrationConnection[]
  events: IntegrationEvent[]
}

const INTEGRATION_FILE = process.env.SEGURIA_INTEGRATION_FILE || path.join(os.homedir(), '.seguria', 'integration-state.json')

function createId() {
  return crypto.randomBytes(12).toString('hex')
}

function now() {
  return new Date()
}

function seedState(): IntegrationState {
  return {
    connections: [
      {
        provider: 'tuya',
        name: 'Conectores de dispositivos',
        description: 'Sincronizacion de dispositivos via capa operativa o API dedicada.',
        status: 'pending',
        endpoint: '/api/integrations/tuya',
        accountName: undefined,
        accountScope: undefined,
        secretName: 'TUYA_SYNC_SECRET',
        lastSyncAt: undefined,
        totalEvents: 0,
        totalDevices: 0,
        notes: [
          'Registro de dispositivos, estado y telemetria',
          'Compatibilidad para switches, sensores y acceso',
        ],
      },
      {
        provider: 'home_assistant',
        name: 'Capa operativa local',
        description: 'Control plane para automatizaciones, escenas y telemetria local.',
        status: 'pending',
        endpoint: '/api/integrations/home-assistant',
        accountName: undefined,
        accountScope: undefined,
        secretName: 'HOME_ASSISTANT_WEBHOOK_SECRET',
        lastSyncAt: undefined,
        totalEvents: 0,
        totalDevices: 0,
        notes: [
          'Webhook de eventos para entidades y alertas',
          'Sincronizacion de estado con dispositivos del sitio',
        ],
      },
      {
        provider: 'github',
        name: 'GitHub',
        description: 'Versionado de configuraciones, reglas y automatizaciones del proyecto.',
        status: 'connected',
        endpoint: 'https://github.com/traviscomber/v0-seguria-website',
        accountName: 'traviscomber/v0-seguria-website',
        accountScope: 'internal',
        secretName: 'GITHUB_TOKEN',
        lastSyncAt: now(),
        totalEvents: 0,
        totalDevices: 0,
        notes: [
          'Fuente de verdad para cambios de configuracion',
          'Tracking de versiones para automatizaciones',
        ],
      },
    ],
    events: [
      {
        id: 'integration-seed-0',
        provider: 'tuya',
        eventType: 'sync',
        title: 'Cuenta del cliente conectada y lista para mostrar estado',
        status: 'success',
        payload: {
          source: 'tuya',
          scope: 'devices',
        },
        receivedAt: now(),
      },
      {
        id: 'integration-seed-1',
        provider: 'home_assistant',
        eventType: 'bootstrap',
        title: 'Capa operativa lista para recibir eventos',
        status: 'info',
        payload: {
          mode: 'webhook',
          scope: 'security-suite',
        },
        receivedAt: now(),
      },
    ],
  }
}

function ensureFile() {
  if (!fs.existsSync(INTEGRATION_FILE)) {
    fs.mkdirSync(path.dirname(INTEGRATION_FILE), { recursive: true })
    fs.writeFileSync(INTEGRATION_FILE, JSON.stringify(seedState(), null, 2), 'utf8')
  }
}

function reviveEvent(event: IntegrationEvent): IntegrationEvent {
  return {
    ...event,
    receivedAt: new Date(event.receivedAt),
  }
}

function reviveConnection(connection: IntegrationConnection): IntegrationConnection {
  return {
    ...connection,
    lastSyncAt: connection.lastSyncAt ? new Date(connection.lastSyncAt) : undefined,
  }
}

function readState(): IntegrationState {
  ensureFile()
  const raw = fs.readFileSync(INTEGRATION_FILE, 'utf8')
  const parsed = JSON.parse(raw) as IntegrationState
  return {
    connections: parsed.connections.map(reviveConnection),
    events: parsed.events.map(reviveEvent),
  }
}

function writeState(state: IntegrationState) {
  fs.mkdirSync(path.dirname(INTEGRATION_FILE), { recursive: true })
  fs.writeFileSync(INTEGRATION_FILE, JSON.stringify(state, null, 2), 'utf8')
}

function appendEvent(event: Omit<IntegrationEvent, 'id' | 'receivedAt'>) {
  const state = readState()
  const entry: IntegrationEvent = {
    ...event,
    id: createId(),
    receivedAt: now(),
  }
  state.events = [entry, ...state.events].slice(0, 100)
  const index = state.connections.findIndex((connection) => connection.provider === event.provider)
  if (index >= 0) {
    const current = state.connections[index]
    state.connections[index] = {
      ...current,
      status: event.status === 'error' ? 'degraded' : 'connected',
      lastSyncAt: entry.receivedAt,
      totalEvents: current.totalEvents + 1,
    }
  }
  writeState(state)
  return entry
}

export function getIntegrationConnections(): IntegrationConnection[] {
  return readState().connections
}

export function getIntegrationConnectionByProvider(provider: IntegrationProvider): IntegrationConnection | undefined {
  return readState().connections.find((connection) => connection.provider === provider)
}

export function getIntegrationEvents(limit = 25): IntegrationEvent[] {
  return readState().events.slice(0, limit)
}

export function getIntegrationSummary() {
  const connections = getIntegrationConnections()
  const recentEvents = getIntegrationEvents(10)
  return {
    totalConnections: connections.length,
    connectedConnections: connections.filter((connection) => connection.status === 'connected').length,
    pendingConnections: connections.filter((connection) => connection.status === 'pending').length,
    recentEvents,
  }
}

export function recordIntegrationConnectionEvent(event: Omit<IntegrationEvent, 'id' | 'receivedAt'>) {
  return appendEvent(event)
}

export function connectTuyaIntegrationAccount(input: { accountName: string; accountScope?: string; siteName?: string }) {
  const state = readState()
  const event: IntegrationEvent = {
    id: createId(),
    provider: 'tuya',
    eventType: 'account.connected',
    title: `Cuenta del cliente conectada: ${input.accountName}`,
    status: 'success',
    payload: {
      accountName: input.accountName,
      accountScope: input.accountScope || input.siteName || 'Sitio principal',
    },
    receivedAt: now(),
  }

  state.events = [event, ...state.events].slice(0, 100)
  const index = state.connections.findIndex((connection) => connection.provider === 'tuya')
  if (index >= 0) {
    const current = state.connections[index]
    state.connections[index] = {
      ...current,
      status: 'connected',
      accountName: input.accountName,
      accountScope: input.accountScope || input.siteName || 'Sitio principal',
      lastSyncAt: event.receivedAt,
      totalEvents: current.totalEvents + 1,
      notes: [
        `Cuenta: ${input.accountName}`,
        input.siteName ? `Sitio: ${input.siteName}` : 'Cuenta lista para importar equipos',
      ],
    }
  }
  writeState(state)
  return event
}

import { upsertDeviceFromIntegration } from '@/lib/store'
import { recordIntegrationConnectionEvent } from '@/lib/integration-state'

type TuyaAccountInput = {
  accountName: string
  siteName?: string
  accountScope?: string
}

type TuyaDeviceSeed = {
  externalId: string
  deviceName: string
  displayName: string
  category: string
  state: string
  room: string
  notes: string
  portalGroup: 'camera' | 'sensor' | 'alert' | 'access' | 'other'
  protocol?: 'wifi' | 'mqtt' | 'rtsp' | 'onvif' | 'ethernet'
  ipUrl?: string
  battery?: number
  signal?: number
}

function buildSeeds(input: TuyaAccountInput): TuyaDeviceSeed[] {
  const scope = input.accountScope || input.siteName || 'Sitio principal'
  const base = `${input.accountName}-${scope}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return [
    {
      externalId: `${base}-front-camera`,
      deviceName: 'Cámara frontal',
      displayName: 'Cámara frontal',
      category: 'camera',
      state: 'online',
      room: 'Acceso principal',
      notes: 'Vista principal del acceso y perimetro',
      portalGroup: 'camera',
      protocol: 'rtsp',
      ipUrl: 'rtsp://stream/front',
    },
    {
      externalId: `${base}-yard-camera`,
      deviceName: 'Cámara patio',
      displayName: 'Cámara patio',
      category: 'camera',
      state: 'online',
      room: 'Patio lateral',
      notes: 'Control visual de zonas laterales',
      portalGroup: 'camera',
      protocol: 'rtsp',
      ipUrl: 'rtsp://stream/yard',
    },
    {
      externalId: `${base}-motion-sensor`,
      deviceName: 'Sensor de movimiento',
      displayName: 'Sensor de movimiento',
      category: 'pir',
      state: 'online',
      room: 'Perímetro',
      notes: 'Dispara alerta de movimiento fuera de horario',
      portalGroup: 'sensor',
      protocol: 'wifi',
      battery: 87,
      signal: 91,
    },
    {
      externalId: `${base}-door-sensor`,
      deviceName: 'Sensor de puerta',
      displayName: 'Sensor de puerta',
      category: 'mcs',
      state: 'online',
      room: 'Portón peatonal',
      notes: 'Apertura y cierre de acceso',
      portalGroup: 'sensor',
      protocol: 'wifi',
      battery: 78,
      signal: 84,
    },
    {
      externalId: `${base}-water-sensor`,
      deviceName: 'Sensor de agua',
      displayName: 'Sensor de agua',
      category: 'water',
      state: 'online',
      room: 'Sala técnica',
      notes: 'Detecta fugas y humedad anormal',
      portalGroup: 'alert',
      protocol: 'wifi',
      battery: 92,
      signal: 80,
    },
    {
      externalId: `${base}-smoke-sensor`,
      deviceName: 'Sensor de humo',
      displayName: 'Sensor de humo',
      category: 'smoke',
      state: 'online',
      room: 'Centro de control',
      notes: 'Alerta temprana de humo',
      portalGroup: 'alert',
      protocol: 'wifi',
      battery: 95,
      signal: 88,
    },
    {
      externalId: `${base}-smart-lock`,
      deviceName: 'Cerradura inteligente',
      displayName: 'Cerradura principal',
      category: 'lock',
      state: 'warning',
      room: 'Acceso principal',
      notes: 'Revisar batería y respuesta',
      portalGroup: 'access',
      protocol: 'wifi',
      battery: 42,
      signal: 76,
    },
    {
      externalId: `${base}-smart-switch`,
      deviceName: 'Switch inteligente',
      displayName: 'Switch general',
      category: 'switch',
      state: 'online',
      room: 'Sala eléctrica',
      notes: 'Salida remota para automatización',
      portalGroup: 'other',
      protocol: 'wifi',
    },
  ]
}

export function importTuyaAccountPortfolio(input: TuyaAccountInput) {
  const projectId = '1'
  const seeds = buildSeeds(input)
  const importedDevices = seeds.map((seed) =>
    upsertDeviceFromIntegration({
      provider: 'tuya',
      externalId: seed.externalId,
      deviceName: seed.deviceName,
      displayName: seed.displayName,
      projectId,
      category: seed.category,
      state: seed.state,
      protocolo: seed.protocol || 'wifi',
      ipUrl: seed.ipUrl,
      notes: seed.notes,
      metadata: {
        room: seed.room,
        portalGroup: seed.portalGroup,
        battery: seed.battery,
        signal: seed.signal,
        accountName: input.accountName,
        accountScope: input.accountScope || input.siteName || 'Sitio principal',
      },
    })
  )

  const event = recordIntegrationConnectionEvent({
    provider: 'tuya',
    eventType: 'account.imported',
    title: `Se importaron ${importedDevices.length} equipos para ${input.accountName}`,
    status: 'success',
    projectId,
    externalId: input.accountName,
    payload: {
      accountName: input.accountName,
      accountScope: input.accountScope || input.siteName || 'Sitio principal',
      imported: importedDevices.length,
      kinds: importedDevices.map((device) => device.tipo),
    },
  })

  return { importedDevices, event }
}

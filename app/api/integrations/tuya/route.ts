import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { recordIntegrationConnectionEvent } from '@/lib/integration-state'
import { upsertDeviceFromIntegration } from '@/lib/store'

const tuyaSchema = z.object({
  device_id: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  state: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  room: z.string().trim().max(120).optional(),
  product_name: z.string().trim().max(120).optional(),
  webhook_secret: z.string().trim().max(256).optional(),
  protocol: z.string().trim().max(40).optional(),
  feed_type: z.string().trim().max(80).optional(),
  device_type: z.string().trim().max(80).optional(),
  stream_url: z.string().trim().max(500).optional(),
  snapshot_url: z.string().trim().max(500).optional(),
  event_kind: z.string().trim().max(80).optional(),
  unit: z.string().trim().max(32).optional(),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  battery: z.union([z.string(), z.number(), z.boolean()]).optional(),
  signal: z.union([z.string(), z.number(), z.boolean()]).optional(),
  metadata: z.record(z.unknown()).optional(),
})

function isAuthorized(requestSecret: string | undefined, expectedSecret: string | undefined) {
  if (!expectedSecret) return true
  return requestSecret === expectedSecret
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const parsed = tuyaSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Payload invalido para la cuenta del cliente.' }, { status: 400 })
    }

    const expectedSecret = process.env.TUYA_SYNC_SECRET
    if (!isAuthorized(parsed.data.webhook_secret, expectedSecret)) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
    }

    const feedType = parsed.data.feed_type || parsed.data.event_kind || 'device.sync'
    const category = parsed.data.category || parsed.data.device_type || parsed.data.feed_type
    const mediaUrl = parsed.data.snapshot_url || parsed.data.stream_url
    const notes = [
      parsed.data.room ? `Habitacion: ${parsed.data.room}` : 'Sin ubicacion declarada',
      feedType.includes('camera') ? 'Feed de camara listo' : 'Feed de sensor listo',
    ]

    const device = upsertDeviceFromIntegration({
      provider: 'tuya',
      externalId: parsed.data.device_id,
      deviceName: parsed.data.name,
      displayName: parsed.data.name,
      projectId: 'integration',
      category,
      state: parsed.data.state,
      protocolo:
        parsed.data.protocol === 'mqtt'
          ? 'mqtt'
          : parsed.data.protocol === 'zigbee'
            ? 'zigbee'
            : parsed.data.protocol === 'rtsp'
              ? 'rtsp'
              : parsed.data.protocol === 'onvif'
                ? 'onvif'
                : 'wifi',
      notes: notes.join(' | '),
      metadata: {
        room: parsed.data.room,
        productName: parsed.data.product_name,
        category: parsed.data.category,
        feedType,
        deviceType: parsed.data.device_type,
        streamUrl: parsed.data.stream_url,
        snapshotUrl: parsed.data.snapshot_url,
        unit: parsed.data.unit,
        value: parsed.data.value,
        battery: parsed.data.battery,
        signal: parsed.data.signal,
        metadata: parsed.data.metadata || {},
      },
      ipUrl: mediaUrl,
    })

    const normalizedState = parsed.data.state?.toLowerCase().trim()
    const eventStatus =
      normalizedState && ['offline', 'unavailable', 'error', 'fault', 'warning'].includes(normalizedState)
        ? 'warning'
        : 'success'

    const event = recordIntegrationConnectionEvent({
      provider: 'tuya',
      eventType: feedType,
      title: `Se recibio ${parsed.data.name}`,
      status: eventStatus,
      externalId: parsed.data.device_id,
      deviceName: parsed.data.name,
      payload: {
        feedType,
        deviceType: parsed.data.device_type,
        protocol: parsed.data.protocol,
        streamUrl: parsed.data.stream_url,
        snapshotUrl: parsed.data.snapshot_url,
        state: parsed.data.state,
        category: parsed.data.category,
        room: parsed.data.room,
        productName: parsed.data.product_name,
        unit: parsed.data.unit,
        value: parsed.data.value,
        battery: parsed.data.battery,
        signal: parsed.data.signal,
        metadata: parsed.data.metadata || {},
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        event,
        device,
      },
      message: 'Dispositivo del cliente sincronizado.',
    })
  } catch (error) {
    console.error('Error receiving client event:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

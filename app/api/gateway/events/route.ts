import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { recordIntegrationConnectionEvent } from '@/lib/integration-state'

const eventSchema = z.object({
  gatewayId: z.string().trim().min(1).max(120),
  propertyId: z.string().trim().min(1).max(120),
  deviceId: z.string().trim().max(120).optional(),
  eventType: z.string().trim().min(1).max(80),
  severity: z.enum(['info', 'warning', 'critical']),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).optional(),
  snapshotUrl: z.string().trim().max(500).optional(),
  rawPayload: z.record(z.unknown()).optional(),
})

function isAuthorized(request: NextRequest) {
  const expected = process.env.SEGURIA_GATEWAY_SECRET
  if (!expected) return true
  return request.headers.get('x-seguria-gateway-secret') === expected
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
    }

    const payload = await request.json()
    const parsed = eventSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Payload invalido.' }, { status: 400 })
    }

    const event = recordIntegrationConnectionEvent({
      provider: 'home_assistant',
      eventType: parsed.data.eventType,
      title: parsed.data.title,
      status: parsed.data.severity === 'critical' ? 'warning' : 'success',
      projectId: parsed.data.propertyId,
      deviceName: parsed.data.deviceId,
      externalId: parsed.data.deviceId,
      payload: {
        gatewayId: parsed.data.gatewayId,
        description: parsed.data.description,
        snapshotUrl: parsed.data.snapshotUrl,
        rawPayload: parsed.data.rawPayload || {},
      },
    })

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Evento recibido.',
    })
  } catch (error) {
    console.error('Error receiving gateway event:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { recordIntegrationConnectionEvent } from '@/lib/integration-state'

const heartbeatSchema = z.object({
  gatewayId: z.string().trim().min(1).max(120),
  propertyId: z.string().trim().min(1).max(120),
  status: z.enum(['online', 'offline', 'warning']),
  localTime: z.string().trim().min(1).max(64),
  version: z.string().trim().min(1).max(64),
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
    const parsed = heartbeatSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Payload invalido.' }, { status: 400 })
    }

    const event = recordIntegrationConnectionEvent({
      provider: 'home_assistant',
      eventType: 'gateway.heartbeat',
      title: `Heartbeat de gateway ${parsed.data.gatewayId}`,
      status: parsed.data.status === 'offline' ? 'warning' : 'success',
      projectId: parsed.data.propertyId,
      externalId: parsed.data.gatewayId,
      payload: {
        localTime: parsed.data.localTime,
        version: parsed.data.version,
        status: parsed.data.status,
      },
    })

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Heartbeat recibido.',
    })
  } catch (error) {
    console.error('Error receiving gateway heartbeat:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { recordIntegrationConnectionEvent } from '@/lib/integration-state'
import { upsertDeviceFromIntegration } from '@/lib/store'

const homeAssistantSchema = z.object({
  event_type: z.string().trim().min(1).max(80),
  entity_id: z.string().trim().min(1).max(120),
  state: z.string().trim().max(80).optional(),
  friendly_name: z.string().trim().max(120).optional(),
  site_id: z.string().trim().max(80).optional(),
  device_class: z.string().trim().max(80).optional(),
  attributes: z.record(z.unknown()).optional(),
  webhook_secret: z.string().trim().max(256).optional(),
})

function isAuthorized(requestSecret: string | undefined, expectedSecret: string | undefined) {
  if (!expectedSecret) return true
  return requestSecret === expectedSecret
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const parsed = homeAssistantSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Payload invalido para Home Assistant.' },
        { status: 400 }
      )
    }

    const expectedSecret = process.env.HOME_ASSISTANT_WEBHOOK_SECRET
    if (!isAuthorized(parsed.data.webhook_secret, expectedSecret)) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
    }

    const device = upsertDeviceFromIntegration({
      provider: 'home_assistant',
      externalId: parsed.data.entity_id,
      deviceName: parsed.data.friendly_name,
      displayName: parsed.data.friendly_name || parsed.data.entity_id,
      projectId: parsed.data.site_id || 'integration',
      entityId: parsed.data.entity_id,
      category: parsed.data.device_class,
      state: parsed.data.state,
      notes: 'Sincronizado desde Home Assistant',
      metadata: {
        eventType: parsed.data.event_type,
        attributes: parsed.data.attributes || {},
      },
    })

    const event = recordIntegrationConnectionEvent({
      provider: 'home_assistant',
      eventType: parsed.data.event_type,
      title: `Home Assistant reporto ${parsed.data.event_type}`,
      status: parsed.data.state === 'unavailable' ? 'warning' : 'success',
      entityId: parsed.data.entity_id,
      deviceName: parsed.data.friendly_name,
      projectId: parsed.data.site_id,
      externalId: parsed.data.entity_id,
      payload: parsed.data.attributes || {},
    })

    return NextResponse.json({
      success: true,
      data: {
        event,
        device,
      },
      message: 'Evento de Home Assistant recibido.',
    })
  } catch (error) {
    console.error('Error receiving Home Assistant event:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

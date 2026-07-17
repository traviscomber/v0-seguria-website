import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  inferSecurityDeviceKind,
  inferSecuritySeverity,
  ingestSecurityEvent,
} from '@/lib/security-repository'
import { verifyGatewayCredential } from '@/lib/secret-auth'

const eventSchema = z.object({
  event_id: z.string().trim().min(1).max(160).optional(),
  event_type: z.string().trim().min(1).max(80),
  entity_id: z.string().trim().min(1).max(160),
  device_id: z.string().trim().min(1).max(160).optional(),
  state: z.string().trim().max(80).default('unknown'),
  friendly_name: z.string().trim().max(120).optional(),
  device_class: z.string().trim().max(80).optional(),
  occurred_at: z.string().datetime().optional(),
  attributes: z.record(z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const gatewayPublicId = request.headers.get('x-seguria-gateway-id')
    if (!gatewayPublicId) {
      return NextResponse.json({ success: false, error: 'Gateway requerido.' }, { status: 400 })
    }

    if (!(await verifyGatewayCredential(gatewayPublicId, request.headers.get('x-seguria-gateway-secret')))) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
    }

    const parsed = eventSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Payload invalido.' }, { status: 400 })
    }

    const occurredAt = parsed.data.occurred_at || new Date().toISOString()
    const result = await ingestSecurityEvent({
      gatewayPublicId,
      provider: 'home_assistant',
      externalEventId: parsed.data.event_id || crypto.randomUUID(),
      externalDeviceId: parsed.data.device_id || parsed.data.entity_id,
      externalEntityId: parsed.data.entity_id,
      deviceName: parsed.data.friendly_name || parsed.data.entity_id,
      deviceKind: inferSecurityDeviceKind(parsed.data.entity_id, parsed.data.device_class),
      entityName: parsed.data.friendly_name || parsed.data.entity_id,
      entityDomain: parsed.data.entity_id.split('.')[0] || 'unknown',
      entityDeviceClass: parsed.data.device_class,
      entityState: parsed.data.state,
      eventType: parsed.data.event_type,
      severity: inferSecuritySeverity(parsed.data.state, parsed.data.device_class),
      occurredAt,
      attributes: parsed.data.attributes,
      payload: parsed.data,
    })

    return NextResponse.json({ success: true, data: result, message: 'Evento recibido.' })
  } catch (error) {
    console.error('Security event ingestion error:', error)
    const unavailable = error instanceof Error && error.message.includes('not configured')
    return NextResponse.json(
      { success: false, error: unavailable ? 'Servicio no configurado.' : 'No fue posible registrar el evento.' },
      { status: unavailable ? 503 : 500 }
    )
  }
}

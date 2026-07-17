import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { inferSecurityDeviceKind, inferSecuritySeverity, ingestSecurityEvent } from '@/lib/security-repository'
import { verifyGatewayCredential } from '@/lib/secret-auth'

const fallbackSchema = z.object({
  event_id: z.string().trim().min(1).max(160).optional(),
  device_id: z.string().trim().min(1).max(120),
  entity_id: z.string().trim().min(1).max(160).optional(),
  name: z.string().trim().min(1).max(120),
  state: z.string().trim().max(80).default('unknown'),
  category: z.string().trim().max(80).optional(),
  event_kind: z.string().trim().max(80).default('device.state_changed'),
  occurred_at: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const gatewayPublicId = request.headers.get('x-seguria-gateway-id')
    if (!gatewayPublicId) return NextResponse.json({ success: false, error: 'Gateway requerido.' }, { status: 400 })

    if (!(await verifyGatewayCredential(gatewayPublicId, request.headers.get('x-seguria-gateway-secret')))) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
    }

    const parsed = fallbackSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Payload invalido.' }, { status: 400 })

    const entityId = parsed.data.entity_id || `sensor.${parsed.data.device_id}`
    const result = await ingestSecurityEvent({
      gatewayPublicId,
      provider: 'tuya',
      externalEventId: parsed.data.event_id || crypto.randomUUID(),
      externalDeviceId: parsed.data.device_id,
      externalEntityId: entityId,
      deviceName: parsed.data.name,
      deviceKind: inferSecurityDeviceKind(entityId, parsed.data.category),
      entityName: parsed.data.name,
      entityDomain: entityId.split('.')[0] || 'sensor',
      entityDeviceClass: parsed.data.category,
      entityState: parsed.data.state,
      eventType: parsed.data.event_kind,
      severity: inferSecuritySeverity(parsed.data.state, parsed.data.category),
      occurredAt: parsed.data.occurred_at || new Date().toISOString(),
      attributes: parsed.data.metadata,
      payload: parsed.data,
    })

    return NextResponse.json({ success: true, data: result, message: 'Evento recibido.' })
  } catch (error) {
    console.error('Fallback event ingestion error:', error)
    return NextResponse.json({ success: false, error: 'No fue posible registrar el evento.' }, { status: 500 })
  }
}

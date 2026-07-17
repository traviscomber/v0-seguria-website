import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { inferSecurityDeviceKind, ingestSecurityEvent } from '@/lib/security-repository'
import { verifyGatewayCredential } from '@/lib/secret-auth'

const deviceStateSchema = z.object({
  eventId: z.string().trim().min(1).max(160),
  gatewayId: z.string().trim().min(1).max(120),
  deviceId: z.string().trim().min(1).max(120),
  entityId: z.string().trim().min(1).max(160),
  deviceName: z.string().trim().min(1).max(160),
  deviceClass: z.string().trim().max(80).optional(),
  status: z.enum(['online', 'offline', 'unknown', 'alert']),
  state: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime(),
})

export async function POST(request: NextRequest) {
  try {
    const guard = getOperationalGuardResponse({ operation: 'gateway.device_state' })
    if (guard) return guard

    const parsed = deviceStateSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Payload invalido.' }, { status: 400 })

    if (!(await verifyGatewayCredential(parsed.data.gatewayId, request.headers.get('x-seguria-gateway-secret')))) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
    }

    const result = await ingestSecurityEvent({
      gatewayPublicId: parsed.data.gatewayId,
      provider: 'home_assistant',
      externalEventId: parsed.data.eventId,
      externalDeviceId: parsed.data.deviceId,
      externalEntityId: parsed.data.entityId,
      deviceName: parsed.data.deviceName,
      deviceKind: inferSecurityDeviceKind(parsed.data.entityId, parsed.data.deviceClass),
      entityName: parsed.data.deviceName,
      entityDomain: parsed.data.entityId.split('.')[0] || 'sensor',
      entityDeviceClass: parsed.data.deviceClass,
      entityState: parsed.data.status,
      eventType: 'device.state_changed',
      severity: parsed.data.status === 'alert' ? 'critical' : parsed.data.status === 'offline' ? 'warning' : 'info',
      occurredAt: parsed.data.timestamp,
      attributes: parsed.data.state,
      payload: { status: parsed.data.status },
    })

    return NextResponse.json({ success: true, data: result, message: 'Estado recibido.' })
  } catch (error) {
    console.error('Device state ingestion error:', error)
    return NextResponse.json({ success: false, error: 'No fue posible registrar el estado.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { ingestSecurityEvent } from '@/lib/security-repository'
import { verifyGatewayCredential } from '@/lib/secret-auth'

const heartbeatSchema = z.object({
  gatewayId: z.string().trim().min(1).max(120),
  status: z.enum(['online', 'offline', 'warning']),
  localTime: z.string().datetime(),
  version: z.string().trim().min(1).max(64),
})

export async function POST(request: NextRequest) {
  try {
    const guard = getOperationalGuardResponse({ operation: 'gateway.heartbeat' })
    if (guard) return guard

    const parsed = heartbeatSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Payload invalido.' }, { status: 400 })

    if (!(await verifyGatewayCredential(parsed.data.gatewayId, request.headers.get('x-seguria-gateway-secret')))) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
    }

    const result = await ingestSecurityEvent({
      gatewayPublicId: parsed.data.gatewayId,
      provider: 'home_assistant',
      externalEventId: `${parsed.data.gatewayId}:${parsed.data.localTime}:heartbeat`,
      externalDeviceId: parsed.data.gatewayId,
      externalEntityId: `binary_sensor.${parsed.data.gatewayId}_connectivity`,
      deviceName: 'Gateway de seguridad',
      deviceKind: 'gateway',
      entityName: 'Conectividad del sitio',
      entityDomain: 'binary_sensor',
      entityDeviceClass: 'connectivity',
      entityState: parsed.data.status,
      eventType: 'gateway.heartbeat',
      severity: parsed.data.status === 'online' ? 'info' : 'warning',
      occurredAt: parsed.data.localTime,
      payload: { version: parsed.data.version },
    })

    return NextResponse.json({ success: true, data: result, message: 'Heartbeat recibido.' })
  } catch (error) {
    console.error('Gateway heartbeat ingestion error:', error)
    return NextResponse.json({ success: false, error: 'No fue posible registrar el heartbeat.' }, { status: 500 })
  }
}

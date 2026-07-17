import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ingestSecurityEvent, type SecurityDeviceKind } from '@/lib/security-repository'
import { verifyGatewayCredential } from '@/lib/secret-auth'

const eventSchema = z.object({
  eventId: z.string().trim().min(1).max(160).optional(),
  gatewayId: z.string().trim().min(1).max(120),
  deviceId: z.string().trim().max(120).optional(),
  entityId: z.string().trim().max(160).optional(),
  deviceKind: z.enum(['camera', 'motion', 'entry', 'smoke', 'gas', 'water', 'environment', 'alarm', 'siren', 'access', 'gateway', 'other']).optional(),
  eventType: z.string().trim().min(1).max(80),
  severity: z.enum(['info', 'warning', 'critical']),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).optional(),
  occurredAt: z.string().datetime().optional(),
  snapshotUrl: z.string().trim().max(500).optional(),
  rawPayload: z.record(z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const parsed = eventSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Payload invalido.' }, { status: 400 })

    if (!(await verifyGatewayCredential(parsed.data.gatewayId, request.headers.get('x-seguria-gateway-secret')))) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
    }

    const externalDeviceId = parsed.data.deviceId || parsed.data.gatewayId
    const result = await ingestSecurityEvent({
      gatewayPublicId: parsed.data.gatewayId,
      provider: 'home_assistant',
      externalEventId: parsed.data.eventId || crypto.randomUUID(),
      externalDeviceId,
      externalEntityId: parsed.data.entityId || `event.${externalDeviceId}`,
      deviceName: parsed.data.title,
      deviceKind: (parsed.data.deviceKind || 'other') as SecurityDeviceKind,
      entityName: parsed.data.title,
      entityDomain: parsed.data.entityId?.split('.')[0] || 'event',
      entityState: parsed.data.severity === 'critical' ? 'alert' : 'active',
      eventType: parsed.data.eventType,
      severity: parsed.data.severity,
      occurredAt: parsed.data.occurredAt || new Date().toISOString(),
      payload: {
        description: parsed.data.description,
        snapshotUrl: parsed.data.snapshotUrl,
        rawPayload: parsed.data.rawPayload || {},
      },
    })

    return NextResponse.json({ success: true, data: result, message: 'Evento recibido.' })
  } catch (error) {
    console.error('Gateway event ingestion error:', error)
    return NextResponse.json({ success: false, error: 'No fue posible registrar el evento.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import {
  inferSecurityDeviceKind,
  inferSecuritySeverity,
  ingestSecurityEvent,
} from '@/lib/security-repository'
import { verifyGatewayCredential } from '@/lib/secret-auth'

const inventorySchema = z.object({
  gatewayId: z.string().trim().min(1).max(120),
  synchronizedAt: z.string().datetime(),
  devices: z.array(z.object({
    deviceId: z.string().trim().min(1).max(160),
    name: z.string().trim().min(1).max(160),
    manufacturer: z.string().trim().max(120).optional(),
    model: z.string().trim().max(120).optional(),
    area: z.string().trim().max(120).optional(),
    entities: z.array(z.object({
      entityId: z.string().trim().min(1).max(160),
      name: z.string().trim().min(1).max(160),
      state: z.string().trim().max(120).default('unknown'),
      deviceClass: z.string().trim().max(80).optional(),
      attributes: z.record(z.unknown()).optional(),
    })).min(1).max(80),
  })).min(1).max(500),
}).superRefine((value, context) => {
  const entityCount = value.devices.reduce((total, device) => total + device.entities.length, 0)
  if (entityCount > 1000) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Maximo 1000 entidades por solicitud.' })
  }
})

export async function POST(request: NextRequest) {
  try {
    const guard = getOperationalGuardResponse({ operation: 'gateway.inventory_sync' })
    if (guard) return guard

    const parsed = inventorySchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Inventario invalido.' }, { status: 400 })

    if (!(await verifyGatewayCredential(parsed.data.gatewayId, request.headers.get('x-seguria-gateway-secret')))) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
    }

    const jobs = parsed.data.devices.flatMap((device) =>
      device.entities.map((entity) => () => ingestSecurityEvent({
          gatewayPublicId: parsed.data.gatewayId,
          provider: 'home_assistant',
          externalEventId: `${device.deviceId}:${entity.entityId}:inventory`,
          externalDeviceId: device.deviceId,
          externalEntityId: entity.entityId,
          deviceName: device.name,
          deviceKind: inferSecurityDeviceKind(entity.entityId, entity.deviceClass),
          entityName: entity.name,
          entityDomain: entity.entityId.split('.')[0] || 'unknown',
          entityDeviceClass: entity.deviceClass,
          entityState: entity.state,
          eventType: 'inventory.synchronized',
          severity: inferSecuritySeverity(entity.state, entity.deviceClass),
          occurredAt: parsed.data.synchronizedAt,
          attributes: entity.attributes,
          payload: {
            area: device.area,
            manufacturer: device.manufacturer,
            model: device.model,
          },
        }))
    )

    // Bound concurrency to avoid exhausting database connections during a large first import.
    for (let index = 0; index < jobs.length; index += 10) {
      await Promise.all(jobs.slice(index, index + 10).map((job) => job()))
      }

    return NextResponse.json({
      success: true,
      data: { importedDevices: parsed.data.devices.length, importedEntities: jobs.length },
      message: 'Inventario sincronizado.',
    })
  } catch (error) {
    console.error('Gateway inventory synchronization failed', error)
    return NextResponse.json({ success: false, error: 'No fue posible sincronizar el inventario.' }, { status: 500 })
  }
}

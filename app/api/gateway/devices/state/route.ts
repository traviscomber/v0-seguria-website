import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDeviceById, updateDevice } from '@/lib/store'

const deviceStateSchema = z.object({
  gatewayId: z.string().trim().min(1).max(120),
  propertyId: z.string().trim().min(1).max(120),
  deviceId: z.string().trim().min(1).max(120),
  status: z.enum(['online', 'offline', 'unknown', 'alert']),
  state: z.record(z.unknown()).optional(),
  timestamp: z.string().trim().min(1).max(64),
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
    const parsed = deviceStateSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Payload invalido.' }, { status: 400 })
    }

    const device = getDeviceById(parsed.data.deviceId)

    if (!device) {
      return NextResponse.json({ success: false, error: 'Dispositivo no encontrado.' }, { status: 404 })
    }

    updateDevice(device.id, {
      estado: parsed.data.status === 'alert' ? 'falla' : parsed.data.status === 'offline' ? 'inactivo' : 'activo',
      lastSeenAt: new Date(parsed.data.timestamp),
      metadata: {
        ...(device.metadata || {}),
        gatewayId: parsed.data.gatewayId,
        propertyId: parsed.data.propertyId,
        syncState: parsed.data.state || {},
        syncStatus: parsed.data.status,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        gatewayId: parsed.data.gatewayId,
        propertyId: parsed.data.propertyId,
        deviceId: parsed.data.deviceId,
        status: parsed.data.status,
      },
      message: 'Estado de dispositivo recibido.',
    })
  } catch (error) {
    console.error('Error receiving device state:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

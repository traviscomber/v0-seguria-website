import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getGatewayCameraStreamSignaling,
  mergeCameraStreamGatewayMetadata,
} from '@/lib/camera-stream'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { verifyGatewayCredential } from '@/lib/secret-auth'

const updateSchema = z.object({
  sessionId: z.string().uuid(),
  status: z.enum(['active', 'ended', 'failed']),
  transport: z.enum(['hls', 'webrtc']).optional(),
  gatewayStreamRef: z.string().trim().max(240).optional(),
  gatewayAnswer: z.string().trim().max(20000).optional(),
  gatewayIceCandidates: z.array(z.object({
    candidate: z.string().trim().min(1).max(2000),
    sdpMid: z.string().trim().max(120).optional(),
    sdpMLineIndex: z.number().int().min(0).max(20).optional(),
  })).max(20).optional(),
  error: z.string().trim().max(500).optional(),
})

async function getAuthorizedGateway(request: NextRequest) {
  const gatewayPublicId = request.headers.get('x-seguria-gateway-id')
  if (!(await verifyGatewayCredential(gatewayPublicId, request.headers.get('x-seguria-gateway-secret')))) {
    return { status: 401 as const, error: 'No autorizado.' }
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return { status: 503 as const, error: 'Servicio no configurado.' }

  const { data: gateway, error } = await supabase
    .from('gateways')
    .select('id, organization_id, property_id, public_id, status')
    .eq('public_id', gatewayPublicId!)
    .maybeSingle()

  if (error || !gateway || gateway.status === 'revoked') {
    return { status: 404 as const, error: 'Gateway no encontrado.' }
  }

  return { supabase, gateway }
}

export async function GET(request: NextRequest) {
  const authorized = await getAuthorizedGateway(request)
  if ('error' in authorized) return NextResponse.json({ success: false, error: authorized.error }, { status: authorized.status })

  const now = new Date().toISOString()
  await authorized.supabase
    .from('camera_stream_sessions')
    .update({ status: 'expired', ended_at: now })
    .eq('gateway_id', authorized.gateway.id)
    .in('status', ['requested', 'active'])
    .lte('expires_at', now)

  const { data: sessions, error } = await authorized.supabase
    .from('camera_stream_sessions')
    .select('id, device_id, status, expires_at, created_at, metadata')
    .eq('gateway_id', authorized.gateway.id)
    .in('status', ['requested', 'active'])
    .gt('expires_at', now)
    .order('created_at', { ascending: true })
    .limit(10)

  if (error) return NextResponse.json({ success: false, error: 'No fue posible cargar sesiones.' }, { status: 500 })

  const deviceIds = Array.from(new Set((sessions || []).map((session) => session.device_id as string)))
  const { data: devices } = deviceIds.length
    ? await authorized.supabase
        .from('devices')
        .select('id, external_id, name')
        .in('id', deviceIds)
    : { data: [] }
  const deviceMap = new Map((devices || []).map((device) => [device.id as string, device]))

  return NextResponse.json({
    success: true,
    data: (sessions || []).map((session) => ({
      id: session.id,
      deviceId: session.device_id,
      externalDeviceId: deviceMap.get(session.device_id)?.external_id || null,
      deviceName: deviceMap.get(session.device_id)?.name || null,
      status: session.status,
      expiresAt: session.expires_at,
      createdAt: session.created_at,
      signaling: getGatewayCameraStreamSignaling(session.metadata),
    })),
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'gateway.camera_stream_session_update' })
  if (guard) return guard

  const authorized = await getAuthorizedGateway(request)
  if ('error' in authorized) return NextResponse.json({ success: false, error: authorized.error }, { status: authorized.status })

  const parsed = updateSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Payload invalido.' }, { status: 400 })

  const { data: existingSession, error: existingError } = await authorized.supabase
    .from('camera_stream_sessions')
    .select('id, organization_id, property_id, device_id, metadata')
    .eq('id', parsed.data.sessionId)
    .eq('gateway_id', authorized.gateway.id)
    .single()

  if (existingError || !existingSession) {
    return NextResponse.json({ success: false, error: 'Sesion no encontrada.' }, { status: 404 })
  }

  const now = new Date().toISOString()
  const update = {
    status: parsed.data.status,
    gateway_stream_ref: parsed.data.gatewayStreamRef || null,
    ...(parsed.data.status === 'active' ? { started_at: now } : {}),
    ...(parsed.data.status === 'ended' || parsed.data.status === 'failed' ? { ended_at: now } : {}),
    last_heartbeat_at: now,
    metadata: mergeCameraStreamGatewayMetadata(existingSession.metadata, {
      status: parsed.data.status,
      transport: parsed.data.transport,
      gatewayAnswer: parsed.data.gatewayAnswer,
      gatewayIceCandidates: parsed.data.gatewayIceCandidates,
      error: parsed.data.error,
    }),
  }

  const { data: session, error } = await authorized.supabase
    .from('camera_stream_sessions')
    .update(update)
    .eq('id', parsed.data.sessionId)
    .eq('gateway_id', authorized.gateway.id)
    .select('id, organization_id, property_id, device_id, status')
    .single()

  if (error || !session) {
    return NextResponse.json({ success: false, error: 'Sesion no encontrada.' }, { status: 404 })
  }

  await authorized.supabase.from('audit_log').insert({
    organization_id: session.organization_id,
    property_id: session.property_id,
    actor_gateway_id: authorized.gateway.id,
    action: `camera_stream.${parsed.data.status}`,
    target_type: 'camera_stream_session',
    target_id: session.id,
    payload: {
      deviceId: session.device_id,
      hasGatewayStreamRef: Boolean(parsed.data.gatewayStreamRef),
      transport: parsed.data.transport || null,
      hasGatewayAnswer: Boolean(parsed.data.gatewayAnswer),
      error: parsed.data.error || null,
    },
  })

  return NextResponse.json({ success: true, data: { id: session.id, status: session.status } })
}

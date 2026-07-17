import { NextRequest, NextResponse } from 'next/server'
import { canAccessProperty, getCurrentAuthSession } from '@/lib/auth-store'
import {
  CAMERA_STREAM_MAX_ACTIVE_PER_DEVICE,
  CAMERA_STREAM_MAX_ACTIVE_PER_PROPERTY,
  generateCameraStreamToken,
  getCameraStreamExpiry,
  hashCameraStreamToken,
} from '@/lib/camera-stream'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function getStreamMediaUrl(deviceId: string, sessionId: string) {
  return `/api/cameras/${encodeURIComponent(deviceId)}/stream/frame?sessionId=${encodeURIComponent(sessionId)}`
}

function getStreamHlsUrl(deviceId: string, sessionId: string) {
  return `/api/cameras/${encodeURIComponent(deviceId)}/stream/hls/manifest?sessionId=${encodeURIComponent(sessionId)}`
}

async function getAuthorizedCamera(deviceId: string) {
  const auth = await getCurrentAuthSession()
  if (!auth) return { status: 401 as const, error: 'No autorizado.' }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return { status: 503 as const, error: 'Servicio no configurado.' }

  const { data: device, error } = await supabase
    .from('devices')
    .select('id, organization_id, property_id, gateway_id, name, status')
    .eq('id', deviceId)
    .eq('kind', 'camera')
    .maybeSingle()

  if (error || !device) return { status: 404 as const, error: 'Camara no encontrada.' }
  if (!canAccessProperty(auth.user, device.property_id)) return { status: 403 as const, error: 'No autorizado.' }

  return { auth, supabase, device }
}

export async function GET(_request: NextRequest, context: { params: Promise<{ deviceId: string }> }) {
  const { deviceId } = await context.params
  const authorized = await getAuthorizedCamera(deviceId)
  if ('error' in authorized) return NextResponse.json({ success: false, error: authorized.error }, { status: authorized.status })

  const { data: session, error } = await authorized.supabase
    .from('camera_stream_sessions')
    .select('id, status, expires_at, started_at, ended_at, last_heartbeat_at, metadata, created_at')
    .eq('device_id', authorized.device.id)
    .in('status', ['requested', 'active'])
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ success: false, error: 'No fue posible cargar la sesion.' }, { status: 500 })
  return NextResponse.json({
    success: true,
    data: session
      ? {
          ...session,
          mediaUrl: getStreamMediaUrl(authorized.device.id, session.id),
          hlsManifestUrl: getStreamHlsUrl(authorized.device.id, session.id),
        }
      : null,
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(_request: NextRequest, context: { params: Promise<{ deviceId: string }> }) {
  const { deviceId } = await context.params
  const authorized = await getAuthorizedCamera(deviceId)
  if ('error' in authorized) return NextResponse.json({ success: false, error: authorized.error }, { status: authorized.status })

  if (!authorized.device.gateway_id) {
    return NextResponse.json({ success: false, error: 'Camara sin gateway operativo.' }, { status: 409 })
  }

  const now = new Date().toISOString()
  await authorized.supabase
    .from('camera_stream_sessions')
    .update({ status: 'expired', ended_at: now })
    .eq('property_id', authorized.device.property_id)
    .in('status', ['requested', 'active'])
    .lte('expires_at', now)

  const { data: activeSessions, error: activeError } = await authorized.supabase
    .from('camera_stream_sessions')
    .select('id, device_id, requested_by, status, expires_at, created_at')
    .eq('property_id', authorized.device.property_id)
    .in('status', ['requested', 'active'])
    .gt('expires_at', now)

  if (activeError) {
    return NextResponse.json({ success: false, error: 'No fue posible validar disponibilidad.' }, { status: 500 })
  }

  const existingOwnSession = (activeSessions || []).find(
    (session) => session.device_id === authorized.device.id && session.requested_by === authorized.auth.user.id
  )
  if (existingOwnSession) {
    return NextResponse.json({
      success: true,
      data: {
        id: existingOwnSession.id,
        status: existingOwnSession.status,
        expires_at: existingOwnSession.expires_at,
        created_at: existingOwnSession.created_at,
        mediaUrl: getStreamMediaUrl(authorized.device.id, existingOwnSession.id),
        hlsManifestUrl: getStreamHlsUrl(authorized.device.id, existingOwnSession.id),
        reused: true,
      },
      message: 'Vista ya solicitada.',
    })
  }

  const activeForDevice = (activeSessions || []).filter((session) => session.device_id === authorized.device.id).length
  if (activeForDevice >= CAMERA_STREAM_MAX_ACTIVE_PER_DEVICE) {
    return NextResponse.json({ success: false, error: 'Camara en uso. Intenta nuevamente en unos minutos.' }, { status: 429 })
  }

  if ((activeSessions || []).length >= CAMERA_STREAM_MAX_ACTIVE_PER_PROPERTY) {
    return NextResponse.json({ success: false, error: 'Sitio con demasiadas vistas activas.' }, { status: 429 })
  }

  const token = generateCameraStreamToken()
  const expiresAt = getCameraStreamExpiry()
  const { data: session, error } = await authorized.supabase
    .from('camera_stream_sessions')
    .insert({
      organization_id: authorized.device.organization_id,
      property_id: authorized.device.property_id,
      device_id: authorized.device.id,
      gateway_id: authorized.device.gateway_id,
      requested_by: authorized.auth.user.id,
      session_token_hash: hashCameraStreamToken(token),
      expires_at: expiresAt,
      metadata: {
        requestedByRole: authorized.auth.user.role,
        deviceName: authorized.device.name,
      },
    })
    .select('id, status, expires_at, created_at')
    .single()

  if (error || !session) {
    console.error('Camera stream session creation failed:', error?.message)
    return NextResponse.json({ success: false, error: 'No fue posible iniciar la sesion.' }, { status: 500 })
  }

  await authorized.supabase.from('audit_log').insert({
    organization_id: authorized.device.organization_id,
    property_id: authorized.device.property_id,
    actor_user_id: authorized.auth.user.id,
    action: 'camera_stream.requested',
    target_type: 'camera_stream_session',
    target_id: session.id,
    payload: {
      deviceId: authorized.device.id,
      expiresAt,
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      ...session,
      expiresAt,
      mediaUrl: getStreamMediaUrl(authorized.device.id, session.id),
      hlsManifestUrl: getStreamHlsUrl(authorized.device.id, session.id),
    },
    message: 'Sesion solicitada.',
  })
}

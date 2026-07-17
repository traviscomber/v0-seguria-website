import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  CAMERA_STREAM_HLS_MANIFEST,
  getCameraStreamHlsObjectPath,
  isSafeHlsFileName,
} from '@/lib/camera-stream'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { verifyGatewayCredential } from '@/lib/secret-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const MAX_MANIFEST_BYTES = 256 * 1024
const MAX_SEGMENT_BYTES = 10 * 1024 * 1024

const uploadSchema = z.object({
  sessionId: z.string().uuid(),
  kind: z.enum(['manifest', 'segment']),
  name: z.string().trim().min(1).max(120),
})

const contentTypes: Record<string, string[]> = {
  manifest: ['application/vnd.apple.mpegurl', 'application/x-mpegURL', 'text/plain', 'application/octet-stream'],
  segment: ['video/mp2t', 'application/octet-stream'],
}

async function authorizeGateway(request: NextRequest) {
  const gatewayPublicId = request.headers.get('x-seguria-gateway-id')
  if (!(await verifyGatewayCredential(gatewayPublicId, request.headers.get('x-seguria-gateway-secret')))) {
    return { status: 401 as const, error: 'No autorizado.' }
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase || !gatewayPublicId) return { status: 503 as const, error: 'Servicio no configurado.' }

  const { data: gateway, error } = await supabase
    .from('gateways')
    .select('id, organization_id, property_id, public_id, status')
    .eq('public_id', gatewayPublicId)
    .maybeSingle()

  if (error || !gateway || gateway.status === 'revoked') {
    return { status: 404 as const, error: 'Gateway no encontrado.' }
  }

  return { supabase, gateway }
}

function normalizeFileName(kind: 'manifest' | 'segment', name: string) {
  if (kind === 'manifest') return CAMERA_STREAM_HLS_MANIFEST
  return name
}

export async function POST(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'gateway.camera_hls_upload' })
  if (guard) return guard

  const authorized = await authorizeGateway(request)
  if ('error' in authorized) return NextResponse.json({ success: false, error: authorized.error }, { status: authorized.status })

  const form = await request.formData()
  const parsed = uploadSchema.safeParse({
    sessionId: form.get('sessionId'),
    kind: form.get('kind'),
    name: form.get('name') || CAMERA_STREAM_HLS_MANIFEST,
  })
  const file = form.get('file')
  if (!parsed.success || !(file instanceof File)) {
    return NextResponse.json({ success: false, error: 'Carga HLS invalida.' }, { status: 400 })
  }

  const fileName = normalizeFileName(parsed.data.kind, parsed.data.name)
  if (!isSafeHlsFileName(fileName)) {
    return NextResponse.json({ success: false, error: 'Nombre de archivo invalido.' }, { status: 400 })
  }

  const maxBytes = parsed.data.kind === 'manifest' ? MAX_MANIFEST_BYTES : MAX_SEGMENT_BYTES
  if (file.size <= 0 || file.size > maxBytes || !contentTypes[parsed.data.kind].includes(file.type || 'application/octet-stream')) {
    return NextResponse.json({ success: false, error: 'Archivo HLS invalido.' }, { status: 413 })
  }

  const now = new Date().toISOString()
  const { data: session, error: sessionError } = await authorized.supabase
    .from('camera_stream_sessions')
    .select('id, organization_id, property_id, device_id, status, expires_at')
    .eq('id', parsed.data.sessionId)
    .eq('gateway_id', authorized.gateway.id)
    .in('status', ['requested', 'active'])
    .gt('expires_at', now)
    .maybeSingle()

  if (sessionError || !session) {
    return NextResponse.json({ success: false, error: 'Sesion no disponible.' }, { status: 404 })
  }

  const objectPath = getCameraStreamHlsObjectPath(session.organization_id, session.property_id, session.id, fileName)
  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await authorized.supabase.storage
    .from('seguria-evidence')
    .upload(objectPath, bytes, {
      contentType: parsed.data.kind === 'manifest' ? 'application/vnd.apple.mpegurl' : 'video/mp2t',
      upsert: true,
    })

  if (uploadError) {
    console.error('HLS upload failed:', uploadError.message)
    return NextResponse.json({ success: false, error: 'No fue posible guardar HLS.' }, { status: 500 })
  }

  await authorized.supabase.from('audit_log').insert({
    organization_id: session.organization_id,
    property_id: session.property_id,
    actor_gateway_id: authorized.gateway.id,
    action: `camera_stream.hls_${parsed.data.kind}_uploaded`,
    target_type: 'camera_stream_session',
    target_id: session.id,
    payload: {
      deviceId: session.device_id,
      fileName,
      size: file.size,
    },
  })

  return NextResponse.json({ success: true, data: { sessionId: session.id, fileName }, message: 'HLS recibido.' })
}

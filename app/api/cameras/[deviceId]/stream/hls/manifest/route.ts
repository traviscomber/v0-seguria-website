import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { canAccessProperty, getCurrentAuthSession } from '@/lib/auth-store'
import {
  CAMERA_STREAM_HLS_MANIFEST,
  getCameraStreamHlsObjectPath,
  isSafeHlsFileName,
} from '@/lib/camera-stream'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  sessionId: z.string().uuid(),
})

async function authorizeStream(request: NextRequest, deviceId: string) {
  const auth = await getCurrentAuthSession()
  if (!auth) return { status: 401 as const, error: 'No autorizado.' }

  const parsed = querySchema.safeParse({ sessionId: request.nextUrl.searchParams.get('sessionId') })
  if (!parsed.success) return { status: 400 as const, error: 'Sesion invalida.' }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return { status: 503 as const, error: 'Servicio no configurado.' }

  const { data: device } = await supabase
    .from('devices')
    .select('id, organization_id, property_id, kind')
    .eq('id', deviceId)
    .eq('kind', 'camera')
    .maybeSingle()

  if (!device) return { status: 404 as const, error: 'Camara no encontrada.' }
  if (!canAccessProperty(auth.user, device.property_id)) return { status: 403 as const, error: 'No autorizado.' }

  const { data: session } = await supabase
    .from('camera_stream_sessions')
    .select('id, requested_by, status, expires_at')
    .eq('id', parsed.data.sessionId)
    .eq('device_id', device.id)
    .eq('property_id', device.property_id)
    .eq('organization_id', device.organization_id)
    .in('status', ['requested', 'active'])
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!session) return { status: 404 as const, error: 'Vista no disponible.' }
  const isStaff = auth.user.role === 'admin' || auth.user.role === 'technician'
  if (session.requested_by !== auth.user.id && !isStaff) return { status: 403 as const, error: 'No autorizado.' }

  return { supabase, device, session }
}

function rewriteManifest(manifest: string, deviceId: string, sessionId: string) {
  return manifest.split(/\r?\n/).map((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      if (/URI\s*=/.test(trimmed)) throw new Error('Manifest con URI externa no permitido.')
      return line
    }
    if (/^https?:\/\//i.test(trimmed) || trimmed.includes('/') || !isSafeHlsFileName(trimmed)) {
      throw new Error('Segmento HLS invalido.')
    }
    return `/api/cameras/${encodeURIComponent(deviceId)}/stream/hls/${encodeURIComponent(trimmed)}?sessionId=${encodeURIComponent(sessionId)}`
  }).join('\n')
}

export async function GET(request: NextRequest, context: { params: Promise<{ deviceId: string }> }) {
  const { deviceId } = await context.params
  const authorized = await authorizeStream(request, deviceId)
  if ('error' in authorized) return NextResponse.json({ success: false, error: authorized.error }, { status: authorized.status })

  const objectPath = getCameraStreamHlsObjectPath(
    authorized.device.organization_id,
    authorized.device.property_id,
    authorized.session.id,
    CAMERA_STREAM_HLS_MANIFEST
  )
  const { data, error } = await authorized.supabase.storage.from('seguria-evidence').download(objectPath)
  if (error || !data) return NextResponse.json({ success: false, error: 'Video no disponible.' }, { status: 404 })

  try {
    const manifest = rewriteManifest(await data.text(), deviceId, authorized.session.id)
    return new NextResponse(manifest, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
        'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8',
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Manifest invalido.' }, { status: 422 })
  }
}

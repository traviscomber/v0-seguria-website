import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { verifyGatewayCredential } from '@/lib/secret-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const MAX_SNAPSHOT_BYTES = 5 * 1024 * 1024
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

export async function POST(request: NextRequest) {
  try {
    const guard = getOperationalGuardResponse({ operation: 'gateway.camera_snapshot' })
    if (guard) return guard

    const gatewayPublicId = request.headers.get('x-seguria-gateway-id')
    if (!(await verifyGatewayCredential(gatewayPublicId, request.headers.get('x-seguria-gateway-secret')))) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
    }

    const form = await request.formData()
    const externalDeviceId = String(form.get('deviceId') || '').trim()
    const capturedAt = String(form.get('capturedAt') || '').trim()
    const file = form.get('file')
    const extension = file instanceof File ? MIME_EXTENSIONS[file.type] : undefined

    if (!externalDeviceId || !capturedAt || Number.isNaN(Date.parse(capturedAt)) || !(file instanceof File) || !extension) {
      return NextResponse.json({ success: false, error: 'Snapshot invalido.' }, { status: 400 })
    }
    if (file.size === 0 || file.size > MAX_SNAPSHOT_BYTES) {
      return NextResponse.json({ success: false, error: 'Tamano de snapshot invalido.' }, { status: 413 })
    }

    const supabase = createSupabaseAdminClient()
    if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })

    const { data: gateway } = await supabase
      .from('gateways')
      .select('id, organization_id, property_id')
      .eq('public_id', gatewayPublicId!)
      .single()
    if (!gateway) return NextResponse.json({ success: false, error: 'Gateway no encontrado.' }, { status: 404 })

    const { data: device } = await supabase
      .from('devices')
      .select('id')
      .eq('gateway_id', gateway.id)
      .eq('external_id', externalDeviceId)
      .eq('kind', 'camera')
      .maybeSingle()
    if (!device) return NextResponse.json({ success: false, error: 'Camara no encontrada.' }, { status: 404 })

    const objectPath = `${gateway.organization_id}/${gateway.property_id}/${device.id}/${crypto.randomUUID()}.${extension}`
    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('seguria-evidence')
      .upload(objectPath, bytes, { contentType: file.type, upsert: false })
    if (uploadError) throw uploadError

    const { data: snapshot, error: recordError } = await supabase
      .from('camera_snapshots')
      .insert({
        organization_id: gateway.organization_id,
        property_id: gateway.property_id,
        device_id: device.id,
        object_path: objectPath,
        mime_type: file.type,
        size_bytes: file.size,
        captured_at: new Date(capturedAt).toISOString(),
      })
      .select('id, captured_at')
      .single()

    if (recordError) {
      await supabase.storage.from('seguria-evidence').remove([objectPath])
      throw recordError
    }

    return NextResponse.json({ success: true, data: snapshot, message: 'Snapshot recibido.' })
  } catch (error) {
    console.error('Camera snapshot ingestion failed', error)
    return NextResponse.json({ success: false, error: 'No fue posible guardar el snapshot.' }, { status: 500 })
  }
}

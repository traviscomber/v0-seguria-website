import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { protectCoordinates } from '@/lib/wildlife/access-control'
import { resolveWildlifeAccess, writeTerritorialAudit } from '@/lib/wildlife/server-access'

const cameraSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(160),
  zoneLabel: z.string().trim().max(160).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  active: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const access = await resolveWildlifeAccess(auth, request.nextUrl.searchParams.get('operation_id'))
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  let query = supabase
    .from('wildlife_cameras')
    .select('id, code, name, zone_label, latitude, longitude, active, created_at, updated_at')
    .order('active', { ascending: false })
    .order('code', { ascending: true })

  query = access.operationId
    ? query.eq('operation_id', access.operationId)
    : query.eq('created_by_user_id', auth.user.id)

  const { data, error } = await query
  if (error) {
    console.error('Wildlife camera registry load failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar las camaras.' }, { status: 500 })
  }

  const precision = access.capabilities.coordinatePrecision
  const protectedData = (data || []).map((camera) => ({
    ...camera,
    ...protectCoordinates(camera.latitude, camera.longitude, precision),
    location_precision: precision,
  }))

  const geocodedCount = (data || []).filter((camera) => camera.latitude !== null && camera.longitude !== null).length
  if (geocodedCount > 0) {
    await writeTerritorialAudit({
      request,
      auth,
      access,
      action: 'territorial.coordinates_read',
      resourceType: 'wildlife_camera_collection',
      coordinatePrecision: precision,
      payload: { cameraCount: data?.length || 0, geocodedCount },
    })
  }

  return NextResponse.json({
    success: true,
    data: protectedData,
    access: {
      operationId: access.operationId,
      operationName: access.operationName,
      role: access.role,
      coordinatePrecision: precision,
      manageCameras: access.capabilities.manageCameras,
    },
  })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician', 'client'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const access = await resolveWildlifeAccess(auth)
  if (!access.capabilities.manageCameras) {
    return NextResponse.json({ success: false, error: 'Tu rol no permite administrar camaras.' }, { status: 403 })
  }

  const parsed = cameraSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Datos de camara invalidos.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const now = new Date().toISOString()
  const mutablePayload = {
    code: parsed.data.code,
    name: parsed.data.name,
    zone_label: parsed.data.zoneLabel || null,
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    active: parsed.data.active,
    updated_at: now,
  }

  let query
  if (parsed.data.id) {
    query = supabase.from('wildlife_cameras').update(mutablePayload).eq('id', parsed.data.id)
    query = access.operationId
      ? query.eq('operation_id', access.operationId)
      : query.eq('created_by_user_id', auth.user.id)
  } else {
    query = supabase.from('wildlife_cameras').insert({
      ...mutablePayload,
      operation_id: access.operationId,
      organization_id: null,
      created_by_user_id: auth.user.id,
    })
  }

  const { data, error } = await query
    .select('id, code, name, zone_label, latitude, longitude, active, created_at, updated_at')
    .single()

  if (error) {
    console.error('Wildlife camera registry save failed:', error.message)
    const duplicate = error.code === '23505'
    return NextResponse.json({ success: false, error: duplicate ? 'Ya existe una camara con ese codigo.' : 'No fue posible guardar la camara.' }, { status: duplicate ? 409 : 500 })
  }

  await writeTerritorialAudit({
    request,
    auth,
    access,
    action: parsed.data.id ? 'territorial.camera_updated' : 'territorial.camera_created',
    resourceType: 'wildlife_camera',
    resourceId: data.id,
    coordinatePrecision: 'exact',
    payload: { code: data.code, active: data.active, hasCoordinates: data.latitude !== null && data.longitude !== null },
  })

  return NextResponse.json({ success: true, data })
}

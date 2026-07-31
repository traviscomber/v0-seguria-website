import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

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

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const { data, error } = await supabase
    .from('wildlife_cameras')
    .select('id, code, name, zone_label, latitude, longitude, active, created_at, updated_at')
    .eq('created_by_user_id', auth.user.id)
    .order('active', { ascending: false })
    .order('code', { ascending: true })

  if (error) {
    console.error('Wildlife camera registry load failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar las cámaras.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsed = cameraSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Datos de cámara inválidos.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Base de datos no configurada.' }, { status: 503 })

  const now = new Date().toISOString()
  const payload = {
    organization_id: auth.user.clientIds[0] ?? null,
    created_by_user_id: auth.user.id,
    code: parsed.data.code,
    name: parsed.data.name,
    zone_label: parsed.data.zoneLabel || null,
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    active: parsed.data.active,
    updated_at: now,
  }

  const query = parsed.data.id
    ? supabase.from('wildlife_cameras').update(payload).eq('id', parsed.data.id).eq('created_by_user_id', auth.user.id)
    : supabase.from('wildlife_cameras').insert(payload)

  const { data, error } = await query
    .select('id, code, name, zone_label, latitude, longitude, active, created_at, updated_at')
    .single()

  if (error) {
    console.error('Wildlife camera registry save failed:', error.message)
    const duplicate = error.code === '23505'
    return NextResponse.json({ success: false, error: duplicate ? 'Ya existe una cámara con ese código.' : 'No fue posible guardar la cámara.' }, { status: duplicate ? 409 : 500 })
  }

  return NextResponse.json({ success: true, data })
}

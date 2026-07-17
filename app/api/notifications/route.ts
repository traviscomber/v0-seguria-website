import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const acknowledgeSchema = z.object({ notificationId: z.string().uuid() })

export async function GET() {
  const auth = await getCurrentAuthSession()
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  const supabase = await createSupabaseServerClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })
  const { data, error } = await supabase
    .from('notifications')
    .select('id,incident_id,severity,title,body,status,due_at,read_at,acknowledged_at,escalated_at,created_at,properties(name,address),incidents(status)')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ success: false, error: 'No fue posible cargar los avisos.' }, { status: 500 })
  return NextResponse.json({ success: true, data: data || [] })
}

export async function PATCH(request: NextRequest) {
  const auth = await getCurrentAuthSession()
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  const parsed = acknowledgeSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Aviso inválido.' }, { status: 400 })
  const supabase = await createSupabaseServerClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })
  const { data, error } = await supabase.rpc('acknowledge_notification', { target_notification_id: parsed.data.notificationId })
  if (error) return NextResponse.json({ success: false, error: 'No fue posible confirmar el aviso.' }, { status: 404 })
  return NextResponse.json({ success: true, data, message: 'Aviso confirmado.' })
}

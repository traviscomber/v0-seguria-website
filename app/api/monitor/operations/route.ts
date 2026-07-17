import { NextRequest, NextResponse } from 'next/server'
import { secretsMatch } from '@/lib/secret-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const authorized = secretsMatch(token, process.env.CRON_SECRET) || secretsMatch(token, process.env.SEGURIA_MONITOR_SECRET)
  if (!authorized) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })
  const [gateways, notifications] = await Promise.all([
    supabase.rpc('mark_stale_gateways', { stale_before: new Date(Date.now() - 3 * 60 * 1000).toISOString() }),
    supabase.rpc('escalate_overdue_notifications', { check_at: new Date().toISOString() }),
  ])
  const error = gateways.error || notifications.error
  if (error) {
    console.error('Operations monitor failed:', error.message)
    return NextResponse.json({ success: false, error: 'Monitor no disponible.' }, { status: 500 })
  }
  return NextResponse.json({ success: true, data: { gatewaysMarkedOffline: gateways.data || 0, notificationsEscalated: notifications.data || 0 } })
}

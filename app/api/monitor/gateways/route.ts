import { NextRequest, NextResponse } from 'next/server'
import { secretsMatch } from '@/lib/secret-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!secretsMatch(token, process.env.SEGURIA_MONITOR_SECRET)) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })

  const { data, error } = await supabase.rpc('mark_stale_gateways', {
    stale_before: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  })

  if (error) {
    console.error('Gateway health monitor failed', error)
    return NextResponse.json({ success: false, error: 'Monitor no disponible.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: { gatewaysMarkedOffline: data || 0 } })
}

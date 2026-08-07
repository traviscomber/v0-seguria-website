import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentAuthSession } from '@/lib/auth-store'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const channels = ['email', 'sms', 'push', 'webhook'] as const

const preferenceSchema = z.object({
  organizationId: z.string().uuid(),
  preferences: z.array(z.object({
    channel: z.enum(channels),
    enabled: z.boolean(),
    target: z.string().trim().max(240).optional().nullable(),
    minSeverity: z.enum(['warning', 'critical']).default('warning'),
  })).max(channels.length),
})

export async function GET() {
  const auth = await getCurrentAuthSession()
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const supabase = await createSupabaseServerClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })

  const { data, error } = await supabase
    .from('user_notification_preferences')
    .select('id,organization_id,channel,enabled,target,min_severity,updated_at')
    .order('channel', { ascending: true })

  if (error) return NextResponse.json({ success: false, error: 'No fue posible cargar preferencias.' }, { status: 500 })

  return NextResponse.json({
    success: true,
    data: {
      organizations: auth.user.organizationIds,
      preferences: data || [],
      defaults: channels.map((channel) => ({ channel, enabled: false, target: '', min_severity: 'warning' })),
    },
  })
}

export async function PATCH(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'notification.preferences' })
  if (guard) return guard

  const auth = await getCurrentAuthSession()
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsed = preferenceSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Preferencias invalidas.' }, { status: 400 })
  if (!auth.user.organizationIds.includes(parsed.data.organizationId)) {
    return NextResponse.json({ success: false, error: 'No autorizado para esta cuenta.' }, { status: 403 })
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })

  const rows = parsed.data.preferences.map((preference) => ({
    organization_id: parsed.data.organizationId,
    user_id: auth.user.id,
    channel: preference.channel,
    enabled: preference.enabled,
    target: preference.target || null,
    min_severity: preference.minSeverity,
  }))

  const { data, error } = await supabase
    .from('user_notification_preferences')
    .upsert(rows, { onConflict: 'organization_id,user_id,channel' })
    .select('id,organization_id,channel,enabled,target,min_severity,updated_at')

  if (error) return NextResponse.json({ success: false, error: 'No fue posible guardar preferencias.' }, { status: 500 })

  return NextResponse.json({ success: true, data: data || [], message: 'Preferencias actualizadas.' })
}

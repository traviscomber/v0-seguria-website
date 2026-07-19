import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

type DeliveryChannel = 'in_app' | 'email' | 'sms' | 'push' | 'webhook'

type DeliveryRow = {
  id: string
  organization_id: string
  notification_id: string
  channel: DeliveryChannel
  attempts: number
  metadata: Record<string, unknown> | null
  notifications: {
    id: string
    title: string
    body: string
    severity: string
    property_id: string
    recipient_user_id: string
  } | null
}

type DeliveryResult = {
  status: 'delivered' | 'failed'
  providerReference?: string
  error?: string
}

const maxAttempts = 5

function getRetryDelayMinutes(attempts: number) {
  return Math.min(60, 2 ** Math.max(0, attempts))
}

function getTarget(delivery: DeliveryRow) {
  const target = delivery.metadata?.target
  return typeof target === 'string' && target.trim() ? target.trim() : ''
}

async function postJson(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Webhook respondio ${response.status}`)
}

async function deliver(delivery: DeliveryRow): Promise<DeliveryResult> {
  if (delivery.channel === 'in_app') {
    return { status: 'delivered', providerReference: 'in_app' }
  }

  const notification = delivery.notifications
  if (!notification) return { status: 'failed', error: 'Aviso no encontrado.' }

  if (delivery.channel === 'webhook') {
    const target = getTarget(delivery) || process.env.SEGURIA_NOTIFICATION_WEBHOOK_URL || ''
    if (!target) return { status: 'failed', error: 'Webhook no configurado.' }
    await postJson(target, {
      notificationId: notification.id,
      title: notification.title,
      body: notification.body,
      severity: notification.severity,
      propertyId: notification.property_id,
    })
    return { status: 'delivered', providerReference: target }
  }

  const enabledEnv: Record<DeliveryChannel, string | undefined> = {
    in_app: 'true',
    email: process.env.SEGURIA_EMAIL_DELIVERY_ENABLED,
    sms: process.env.SEGURIA_SMS_DELIVERY_ENABLED,
    push: process.env.SEGURIA_PUSH_DELIVERY_ENABLED,
    webhook: process.env.SEGURIA_NOTIFICATION_WEBHOOK_URL,
  }

  if (enabledEnv[delivery.channel]?.toLowerCase() !== 'true') {
    return { status: 'failed', error: `Canal ${delivery.channel} pendiente de proveedor interno.` }
  }

  return {
    status: 'delivered',
    providerReference: `seguria-${delivery.channel}-stub`,
  }
}

export async function processNotificationDeliveries(supabase: SupabaseClient, now = new Date()) {
  const { data, error } = await supabase
    .from('notification_deliveries')
    .select('id,organization_id,notification_id,channel,attempts,metadata,notifications(id,title,body,severity,property_id,recipient_user_id)')
    .in('status', ['pending', 'failed'])
    .or(`next_attempt_at.is.null,next_attempt_at.lte.${now.toISOString()}`)
    .lt('attempts', maxAttempts)
    .order('next_attempt_at', { ascending: true, nullsFirst: true })
    .limit(25)

  if (error) throw new Error(error.message)

  let delivered = 0
  let failed = 0
  let deferred = 0

  for (const deliveryRow of data || []) {
    const delivery = deliveryRow as unknown as DeliveryRow
    const attempts = delivery.attempts + 1

    try {
      const result = await deliver(delivery)
      if (result.status === 'delivered') {
        delivered += 1
        await supabase
          .from('notification_deliveries')
          .update({
            status: 'delivered',
            attempts,
            delivered_at: now.toISOString(),
            provider_reference: result.providerReference || null,
            last_error: null,
            next_attempt_at: null,
          })
          .eq('id', delivery.id)
      } else {
        failed += 1
        const exhausted = attempts >= maxAttempts
        if (!exhausted) deferred += 1
        await supabase
          .from('notification_deliveries')
          .update({
            status: 'failed',
            attempts,
            last_error: result.error || 'Entrega no disponible.',
            next_attempt_at: exhausted
              ? null
              : new Date(now.getTime() + getRetryDelayMinutes(attempts) * 60_000).toISOString(),
          })
          .eq('id', delivery.id)
      }
    } catch (error) {
      failed += 1
      if (attempts < maxAttempts) deferred += 1
      await supabase
        .from('notification_deliveries')
        .update({
          status: 'failed',
          attempts,
          last_error: error instanceof Error ? error.message : 'Entrega no disponible.',
          next_attempt_at: attempts >= maxAttempts
            ? null
            : new Date(now.getTime() + getRetryDelayMinutes(attempts) * 60_000).toISOString(),
        })
        .eq('id', delivery.id)
    }
  }

  return {
    scanned: data?.length || 0,
    delivered,
    failed,
    deferred,
  }
}

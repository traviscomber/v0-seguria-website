import 'server-only'

import crypto from 'node:crypto'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export function secretsMatch(provided: string | null | undefined, expected: string | undefined) {
  if (!provided || !expected) return false

  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)
  if (providedBuffer.length !== expectedBuffer.length) return false

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer)
}

export function hashGatewaySecret(secret: string) {
  return crypto.createHash('sha256').update(secret, 'utf8').digest('hex')
}

export function generateGatewayCredential() {
  return {
    publicId: `gw_${crypto.randomBytes(18).toString('base64url')}`,
    secret: crypto.randomBytes(32).toString('base64url'),
  }
}

export async function verifyGatewayCredential(
  gatewayPublicId: string | null | undefined,
  providedSecret: string | null | undefined
) {
  if (!gatewayPublicId || !providedSecret) return false

  const supabase = createSupabaseAdminClient()
  if (!supabase) return false

  const { data, error } = await supabase
    .from('gateways')
    .select('secret_hash, status')
    .eq('public_id', gatewayPublicId)
    .maybeSingle()

  if (error || !data || data.status === 'revoked') return false
  return secretsMatch(hashGatewaySecret(providedSecret), data.secret_hash)
}

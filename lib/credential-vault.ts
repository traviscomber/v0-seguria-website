import 'server-only'

import crypto from 'node:crypto'

function getCredentialKey() {
  const raw =
    process.env.SEGURIA_CREDENTIAL_ENCRYPTION_KEY ||
    process.env.CREDENTIAL_ENCRYPTION_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!raw) return null

  if (/^[A-Za-z0-9+/=]{43,88}$/.test(raw)) {
    try {
      const decoded = Buffer.from(raw, 'base64')
      if (decoded.length === 32) return decoded
    } catch {
      // Fall through to deterministic derivation for operator-friendly setup.
    }
  }

  return crypto.createHash('sha256').update(raw).digest()
}

export function hasCredentialVaultKey() {
  return Boolean(getCredentialKey())
}

export function encryptCredentialSecret(secret: string) {
  const key = getCredentialKey()
  if (!key) throw new Error('Credential vault key is not configured.')

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return [
    'v1',
    iv.toString('base64url'),
    tag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.')
}

export function getSecretHint(secret: string) {
  const trimmed = secret.trim()
  if (trimmed.length <= 8) return 'Guardado'
  return `${trimmed.slice(0, 3)}...${trimmed.slice(-4)}`
}

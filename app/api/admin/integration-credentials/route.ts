import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { encryptCredentialSecret, getSecretHint, hasCredentialVaultKey } from '@/lib/credential-vault'
import { getOperationalGuardResponse } from '@/lib/environment-guard'

const credentialSchema = z.object({
  propertyId: z.string().uuid(),
  provider: z.enum(['home_assistant', 'tuya']),
  label: z.string().trim().min(2).max(120),
  endpoint: z.string().trim().url().max(500).optional().or(z.literal('')),
  accountIdentifier: z.string().trim().max(180).optional(),
  credentialKind: z.enum(['api_token', 'account_password', 'oauth_refresh', 'webhook_secret', 'other']).default('api_token'),
  secret: z.string().min(8).max(5000),
  notes: z.string().trim().max(500).optional(),
  rotationDays: z.number().int().min(7).max(365).optional(),
})

function toCredentialResponse(row: Record<string, unknown>) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    propertyId: row.property_id,
    integrationId: row.integration_id,
    provider: row.provider,
    label: row.label,
    accountIdentifier: row.account_identifier,
    credentialKind: row.credential_kind,
    secretHint: row.secret_hint,
    status: row.status,
    rotationDueAt: row.rotation_due_at,
    lastValidatedAt: row.last_validated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function GET(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })

  const url = new URL(request.url)
  const propertyId = url.searchParams.get('propertyId')
  let query = supabase
    .from('integration_credentials')
    .select('id, organization_id, property_id, integration_id, provider, label, account_identifier, credential_kind, secret_hint, status, rotation_due_at, last_validated_at, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100)

  if (propertyId) query = query.eq('property_id', propertyId)
  if (auth.user.role === 'technician') {
    if (auth.user.propertyIds.length === 0) return NextResponse.json({ success: true, data: [] })
    query = query.in('property_id', auth.user.propertyIds)
  }

  const { data, error } = await query
  if (error) {
    console.error('Credential list failed:', error.message)
    return NextResponse.json({ success: false, error: 'No fue posible cargar las credenciales.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: (data || []).map((row) => toCredentialResponse(row)) })
}

export async function POST(request: NextRequest) {
  const guard = getOperationalGuardResponse({ operation: 'integration_credential.store' })
  if (guard) return guard

  const auth = await getAuthorizedRequest(request, ['admin'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  if (!hasCredentialVaultKey()) {
    return NextResponse.json(
      { success: false, error: 'Falta configurar una clave server-only para cifrar credenciales.' },
      { status: 503 }
    )
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })

  const parsed = credentialSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Datos invalidos.' }, { status: 400 })

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id, organization_id, name')
    .eq('id', parsed.data.propertyId)
    .maybeSingle()

  if (propertyError || !property) {
    return NextResponse.json({ success: false, error: 'Propiedad no encontrada.' }, { status: 404 })
  }

  if (auth.user.role === 'technician' && !auth.user.propertyIds.includes(property.id)) {
    return NextResponse.json({ success: false, error: 'No autorizado para esta propiedad.' }, { status: 403 })
  }

  const rotationDueAt = parsed.data.rotationDays
    ? new Date(Date.now() + parsed.data.rotationDays * 24 * 60 * 60 * 1000).toISOString()
    : null
  const encryptedSecret = encryptCredentialSecret(parsed.data.secret)
  const notes = parsed.data.notes ? [parsed.data.notes] : []

  const { data: integration, error: integrationError } = await supabase
    .from('integrations')
    .upsert(
      {
        organization_id: property.organization_id,
        property_id: property.id,
        provider: parsed.data.provider,
        display_name: parsed.data.label,
        status: 'pending',
        endpoint: parsed.data.endpoint || null,
        external_account_ref: parsed.data.accountIdentifier || null,
        metadata: {
          notes,
          managedBy: 'seguria_internal',
          propertyName: property.name,
          credentialKind: parsed.data.credentialKind,
        },
      },
      { onConflict: 'organization_id,property_id,provider' }
    )
    .select('id')
    .single()

  if (integrationError || !integration) {
    console.error('Integration upsert failed:', integrationError?.message)
    return NextResponse.json({ success: false, error: 'No fue posible preparar la conexion.' }, { status: 400 })
  }

  const { data: credential, error: credentialError } = await supabase
    .from('integration_credentials')
    .upsert(
      {
        organization_id: property.organization_id,
        property_id: property.id,
        integration_id: integration.id,
        provider: parsed.data.provider,
        label: parsed.data.label,
        account_identifier: parsed.data.accountIdentifier || null,
        credential_kind: parsed.data.credentialKind,
        secret_ciphertext: encryptedSecret,
        secret_hint: getSecretHint(parsed.data.secret),
        config: {
          endpoint: parsed.data.endpoint || null,
          notes,
          propertyName: property.name,
        },
        status: 'stored',
        rotation_due_at: rotationDueAt,
        created_by: auth.user.id,
        updated_by: auth.user.id,
      },
      { onConflict: 'organization_id,property_id,provider,label' }
    )
    .select('id, organization_id, property_id, integration_id, provider, label, account_identifier, credential_kind, secret_hint, status, rotation_due_at, last_validated_at, created_at, updated_at')
    .single()

  if (credentialError || !credential) {
    console.error('Credential upsert failed:', credentialError?.message)
    return NextResponse.json({ success: false, error: 'No fue posible guardar la credencial.' }, { status: 400 })
  }

  await supabase
    .from('integrations')
    .update({ secret_ref: `integration_credential:${credential.id}` })
    .eq('id', integration.id)

  await supabase.from('audit_log').insert({
    organization_id: property.organization_id,
    property_id: property.id,
    actor_user_id: auth.user.id,
    action: 'integration_credential.stored',
    target_type: 'integration_credential',
    target_id: credential.id,
    payload: {
      provider: parsed.data.provider,
      label: parsed.data.label,
      credentialKind: parsed.data.credentialKind,
      hasEndpoint: Boolean(parsed.data.endpoint),
      rotationDueAt,
    },
  })

  return NextResponse.json({
    success: true,
    data: toCredentialResponse(credential),
    message: 'Credencial interna guardada.',
  })
}

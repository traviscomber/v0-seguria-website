import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { decryptCredentialSecret } from '@/lib/credential-vault'
import { getOperationalGuardResponse } from '@/lib/environment-guard'
import { verifyGatewayCredential } from '@/lib/secret-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const configSchema = z.object({
  gatewayId: z.string().trim().min(1).max(120),
})

function getOperationalProvider(provider: string) {
  if (provider === 'home_assistant') return 'local_bridge'
  if (provider === 'tuya') return 'client_account'
  return 'internal'
}

export async function POST(request: NextRequest) {
  try {
    const guard = getOperationalGuardResponse({ operation: 'gateway.config_delivery' })
    if (guard) return guard

    const parsed = configSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ success: false, error: 'Payload invalido.' }, { status: 400 })

    if (!(await verifyGatewayCredential(parsed.data.gatewayId, request.headers.get('x-seguria-gateway-secret')))) {
      return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
    }

    const supabase = createSupabaseAdminClient()
    if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })

    const { data: gateway, error: gatewayError } = await supabase
      .from('gateways')
      .select('id, organization_id, property_id, public_id, name, status')
      .eq('public_id', parsed.data.gatewayId)
      .maybeSingle()

    if (gatewayError || !gateway || gateway.status === 'revoked') {
      return NextResponse.json({ success: false, error: 'Gateway no encontrado.' }, { status: 404 })
    }

    const { data: credentials, error: credentialsError } = await supabase
      .from('integration_credentials')
      .select('id, provider, label, account_identifier, credential_kind, secret_ciphertext, config, status, updated_at')
      .eq('organization_id', gateway.organization_id)
      .eq('property_id', gateway.property_id)
      .neq('status', 'revoked')
      .order('updated_at', { ascending: false })

    if (credentialsError) {
      console.error('Gateway config credential lookup failed:', credentialsError.message)
      return NextResponse.json({ success: false, error: 'No fue posible cargar configuracion.' }, { status: 500 })
    }

    const connections = (credentials || []).map((credential) => {
      const config = (credential.config || {}) as Record<string, unknown>
      return {
        id: credential.id,
        provider: getOperationalProvider(credential.provider),
        internalProvider: credential.provider,
        label: credential.label,
        accountIdentifier: credential.account_identifier,
        credentialKind: credential.credential_kind,
        endpoint: typeof config.endpoint === 'string' ? config.endpoint : null,
        secret: decryptCredentialSecret(credential.secret_ciphertext),
        status: credential.status,
        config: {
          notes: Array.isArray(config.notes) ? config.notes.map(String) : [],
          propertyName: typeof config.propertyName === 'string' ? config.propertyName : null,
        },
      }
    })

    await supabase.from('audit_log').insert({
      organization_id: gateway.organization_id,
      property_id: gateway.property_id,
      actor_gateway_id: gateway.id,
      action: 'gateway.config.delivered',
      target_type: 'gateway',
      target_id: gateway.id,
      payload: {
        connectionCount: connections.length,
        providers: connections.map((connection) => connection.provider),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        gateway: {
          id: gateway.id,
          publicId: gateway.public_id,
          propertyId: gateway.property_id,
          organizationId: gateway.organization_id,
          name: gateway.name,
        },
        connections,
        deliveredAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Gateway config delivery failed:', error)
    return NextResponse.json({ success: false, error: 'No fue posible entregar configuracion.' }, { status: 500 })
  }
}

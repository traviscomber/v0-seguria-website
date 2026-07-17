import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { generateGatewayCredential, hashGatewaySecret } from '@/lib/secret-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const schema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
})

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Datos invalidos.' }, { status: 400 })

  const supabase = createSupabaseAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: 'Servicio no configurado.' }, { status: 503 })

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('id, organization_id')
    .eq('id', parsed.data.propertyId)
    .maybeSingle()

  if (propertyError || !property) {
    return NextResponse.json({ success: false, error: 'Propiedad no encontrada.' }, { status: 404 })
  }

  if (auth.user.role === 'technician' && !auth.user.propertyIds.includes(property.id)) {
    return NextResponse.json({ success: false, error: 'No autorizado para esta propiedad.' }, { status: 403 })
  }

  const credential = generateGatewayCredential()
  const { data: gateway, error: gatewayError } = await supabase
    .from('gateways')
    .insert({
      organization_id: property.organization_id,
      property_id: property.id,
      public_id: credential.publicId,
      name: parsed.data.name,
      secret_hash: hashGatewaySecret(credential.secret),
    })
    .select('id, public_id, name, status, created_at')
    .single()

  if (gatewayError) {
    console.error('Gateway provision failed', gatewayError)
    return NextResponse.json({ success: false, error: 'No fue posible crear el gateway.' }, { status: 400 })
  }

  await supabase.from('audit_log').insert({
    organization_id: property.organization_id,
    property_id: property.id,
    actor_user_id: auth.user.id,
    action: 'gateway.provisioned',
    target_type: 'gateway',
    target_id: gateway.id,
    payload: { publicId: gateway.public_id, name: gateway.name },
  })

  return NextResponse.json({
    success: true,
    data: { gateway, secret: credential.secret },
    message: 'Gateway creado. El secreto se muestra una sola vez.',
  })
}

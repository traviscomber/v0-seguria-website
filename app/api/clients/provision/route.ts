import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { z } from 'zod'
import { getAuthorizedRequest } from '@/lib/api-auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const provisionSchema = z.object({
  company_name: z.string().trim().min(2).max(120),
  client_email: z.string().trim().email(),
  password: z.string().min(12).max(128),
  site_name: z.string().trim().min(2).max(120),
  address: z.string().trim().max(240).optional(),
})

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function getAvailableOrganizationSlug(supabase: ReturnType<typeof createSupabaseAdminClient>, baseSlug: string) {
  if (!supabase) return baseSlug

  const normalized = baseSlug || `cliente-${Date.now()}`
  const { data, error } = await supabase
    .from('organizations')
    .select('slug')
    .or(`slug.eq.${normalized},slug.like.${normalized}-%`)

  if (error) throw error

  const used = new Set((data || []).map((row) => row.slug as string))
  if (!used.has(normalized)) return normalized

  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${normalized}-${index}`
    if (!used.has(candidate)) return candidate
  }

  return `${normalized}-${crypto.randomUUID().slice(0, 8)}`
}

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) {
    return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json(
      { success: false, error: 'El servicio de provision no esta configurado.' },
      { status: 503 }
    )
  }

  try {
    const parsed = provisionSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Datos invalidos.' }, { status: 400 })
    }

    const organizationSlug = await getAvailableOrganizationSlug(supabase, slugify(parsed.data.company_name))
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: parsed.data.client_email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { full_name: parsed.data.company_name },
      app_metadata: { platform_role: 'client' },
    })

    if (userError || !userData.user) {
      const duplicate = userError?.message.toLowerCase().includes('already')
      return NextResponse.json(
        { success: false, error: duplicate ? 'El usuario ya existe.' : 'No fue posible crear el usuario.' },
        { status: duplicate ? 409 : 400 }
      )
    }

    const { data: provisioned, error: provisionError } = await supabase.rpc(
      'provision_client_account',
      {
        target_user_id: userData.user.id,
        organization_name: parsed.data.company_name,
        organization_slug: organizationSlug,
        property_name: parsed.data.site_name,
        property_address: parsed.data.address || null,
      }
    )

    if (provisionError) {
      await supabase.auth.admin.deleteUser(userData.user.id)
      console.error('Error provisioning client data:', provisionError.message)
      return NextResponse.json(
        { success: false, error: 'No fue posible crear la empresa y propiedad.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        companyName: parsed.data.company_name,
        clientEmail: parsed.data.client_email,
        organizationId: provisioned?.organization_id,
        propertyId: provisioned?.property_id,
      },
      message: 'Cliente y propiedad creados.',
    })
  } catch (error) {
    console.error('Error provisioning client:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

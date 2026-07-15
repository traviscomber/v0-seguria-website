import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { upsertAuthUser } from '@/lib/auth-store'
import { connectTuyaIntegrationAccount } from '@/lib/integration-state'
import { importTuyaAccountPortfolio } from '@/lib/tuya-import'
import { upsertProjectWithId, createDocument } from '@/lib/store'

const provisionSchema = z.object({
  company_name: z.string().trim().min(1).max(120),
  property_id: z.string().trim().max(120).optional(),
  client_email: z.string().trim().email().optional(),
  site_name: z.string().trim().max(120).optional(),
  account_scope: z.string().trim().max(120).optional(),
  password: z.string().trim().min(8).max(128).optional(),
})

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const parsed = provisionSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Datos invalidos.' }, { status: 400 })
    }

    const propertyId = parsed.data.property_id || slugify(parsed.data.company_name)
    const clientEmail = parsed.data.client_email || `${propertyId}@seguria.client`
    const password = parsed.data.password || `${propertyId}-portal-2026`
    const siteName = parsed.data.site_name || parsed.data.company_name
    const accountScope = parsed.data.account_scope || siteName

    const project = upsertProjectWithId(propertyId, {
      leadId: 'provisioned-client',
      clienteNombre: parsed.data.company_name,
      clienteEmail: clientEmail,
      clienteTelefono: '+56 9 0000 0000',
      tipo: 'propiedad',
      ubicacion: siteName,
      descripcion: `Portal provisionado para ${parsed.data.company_name}`,
      estado: 'monitoreo',
      prioridad: 'media',
      responsable: 'SegurIA',
      notasTecnicas: `Cuenta provisionada para ${parsed.data.company_name}`,
    })

    await upsertAuthUser({
      name: parsed.data.company_name,
      email: clientEmail,
      role: 'client',
      password,
      clientIds: [propertyId],
      propertyIds: [propertyId],
    })

    const integrationEvent = connectTuyaIntegrationAccount({
      accountName: parsed.data.company_name,
      siteName,
      accountScope,
    })

    const imported = importTuyaAccountPortfolio({
      accountName: parsed.data.company_name,
      siteName,
      accountScope,
    })

    createDocument({
      proyectoId: project.id,
      tipo: 'informe_instalacion',
      titulo: `Resumen de provision - ${parsed.data.company_name}`,
      version: '1.0',
      estado: 'aprobado',
      autor: 'SegurIA',
      resumenIA: 'Portal provisionado con equipos base, acceso y monitoreo.',
    })

    return NextResponse.json({
      success: true,
      data: {
        companyName: parsed.data.company_name,
        propertyId,
        clientEmail,
        password,
        project,
        integrationEvent,
        importedDevices: imported.importedDevices.length,
      },
      message: 'Cliente provisionado.',
    })
  } catch (error) {
    console.error('Error provisioning client:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

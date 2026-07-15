import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectTuyaIntegrationAccount } from '@/lib/integration-state'
import { importTuyaAccountPortfolio } from '@/lib/tuya-import'

const connectSchema = z.object({
  account_name: z.string().trim().min(1).max(120),
  site_name: z.string().trim().max(120).optional(),
  account_scope: z.string().trim().max(120).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = connectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Datos invalidos para setear la cuenta del cliente.' }, { status: 400 })
    }

    const event = connectTuyaIntegrationAccount({
      accountName: parsed.data.account_name,
      siteName: parsed.data.site_name,
      accountScope: parsed.data.account_scope,
    })

    const portfolio = importTuyaAccountPortfolio({
      accountName: parsed.data.account_name,
      siteName: parsed.data.site_name,
      accountScope: parsed.data.account_scope,
    })

    return NextResponse.json({
      success: true,
      data: { event, portfolio },
      message: 'Cuenta del cliente lista para importar dispositivos.',
    })
  } catch (error) {
    console.error('Error connecting client account:', error)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

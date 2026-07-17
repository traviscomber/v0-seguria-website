import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizedRequest } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const auth = await getAuthorizedRequest(request, ['admin', 'technician'])
  if (!auth) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 })

  return NextResponse.json(
    {
      success: false,
      error: 'El alta simulada fue retirada. Usa el onboarding seguro por empresa, propiedad y Gateway.',
    },
    { status: 410 }
  )
}

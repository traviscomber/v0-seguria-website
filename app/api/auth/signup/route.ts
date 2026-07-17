import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'El alta de clientes se realiza desde el panel interno.',
    },
    { status: 410 }
  )
}

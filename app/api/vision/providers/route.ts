import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export async function GET() {
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY)

  return NextResponse.json(
    {
      providers: {
        openai: {
          configured: openaiConfigured,
          ready: openaiConfigured,
          status: openaiConfigured ? 'ready' : 'missing_api_key',
          model: process.env.OPENAI_VISION_MODEL || 'gpt-5-mini',
        },
      },
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}

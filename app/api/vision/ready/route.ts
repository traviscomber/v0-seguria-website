import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY)

  return NextResponse.json(
    { ok: openaiConfigured, status: openaiConfigured ? 'ready' : 'not_ready', timestamp: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  )
}

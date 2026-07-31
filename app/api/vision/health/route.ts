import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseProjectRef = (() => {
    try {
      return new URL(supabaseUrl).hostname.split('.')[0] || null
    } catch {
      return null
    }
  })()

  return NextResponse.json(
    {
      ok: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      diagnostics: { supabase_project_ref: supabaseProjectRef },
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  )
}

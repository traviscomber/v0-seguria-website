import { NextResponse } from 'next/server'

const SUPABASE_ASSET_BASE =
  'https://nzaonaqycyyzrbxcoosk.supabase.co/storage/v1/object/public/huilo-huilo-demo'

const ALLOWED_ASSETS = new Set([
  'huilo-huilo-forest-cabins.png',
  'huilo-huilo-forest-trail.png',
  'huilo-huilo-lake-overlook.png',
  'huilo-huilo-lodge-entry.png',
  'huilo-huilo-parking-lodge.png',
  'huilo-huilo-river-bridge.png',
  'huilo-huilo-riverside-lodge.png',
  'huilo-huilo-service-yard.png',
])

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ asset: string }> },
) {
  const { asset } = await context.params

  if (!ALLOWED_ASSETS.has(asset)) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const upstream = await fetch(`${SUPABASE_ASSET_BASE}/${encodeURIComponent(asset)}`, {
      cache: 'no-store',
    })

    if (!upstream.ok) {
      return new NextResponse('Image unavailable', { status: upstream.status })
    }

    const body = await upstream.arrayBuffer()

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      },
    })
  } catch {
    return new NextResponse('Image unavailable', { status: 502 })
  }
}

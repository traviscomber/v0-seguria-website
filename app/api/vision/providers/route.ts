import 'server-only'

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  let onnxReady = false
  let onnxStatus = 'unavailable'

  try {
    const response = await fetch(`${origin}/api/vision/ready`, { cache: 'no-store' })
    const payload = (await response.json()) as { ok?: boolean; status?: string }
    onnxReady = response.ok && payload.ok === true
    onnxStatus = payload.status || (onnxReady ? 'ready' : 'unavailable')
  } catch {
    onnxStatus = 'unreachable'
  }

  const openaiReady = Boolean(process.env.OPENAI_API_KEY)

  return NextResponse.json({
    ok: onnxReady || openaiReady,
    preferred_provider: onnxReady ? 'onnx' : openaiReady ? 'openai' : null,
    providers: {
      onnx: {
        configured: true,
        ready: onnxReady,
        status: onnxStatus,
      },
      openai: {
        configured: openaiReady,
        ready: openaiReady,
        status: openaiReady ? 'ready' : 'missing_api_key',
        model: process.env.OPENAI_VISION_MODEL || 'gpt-5-mini',
      },
    },
    timestamp: new Date().toISOString(),
  })
}

import { randomBytes, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

export const CSRF_COOKIE_NAME = '__Host-seguria-csrf'
export const CSRF_HEADER_NAME = 'x-csrf-token'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const LOCAL_ORIGINS = new Set(['http://localhost:3000', 'http://127.0.0.1:3000'])

function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value)
    return url.origin
  } catch {
    return null
  }
}

function configuredOrigins(): Set<string> {
  const values = [
    process.env.NEXT_PUBLIC_SITE_URL,
    ...(process.env.CSRF_ALLOWED_ORIGINS ?? '').split(','),
  ]

  const origins = new Set<string>()
  for (const value of values) {
    const normalized = value?.trim() ? normalizeOrigin(value.trim()) : null
    if (normalized) origins.add(normalized)
  }

  if (process.env.NODE_ENV !== 'production') {
    for (const origin of LOCAL_ORIGINS) origins.add(origin)
  }

  return origins
}

function requestOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin')
  if (origin) return normalizeOrigin(origin)

  const referer = request.headers.get('referer')
  return referer ? normalizeOrigin(referer) : null
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(',')[0]?.trim().toLowerCase() || null
}

export function validateRequestOrigin(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true

  const fetchSite = request.headers.get('sec-fetch-site')?.toLowerCase()
  if (fetchSite === 'cross-site') return false

  const origin = requestOrigin(request)
  if (!origin || !configuredOrigins().has(origin)) return false

  const expectedHost = new URL(origin).host.toLowerCase()
  const receivedHost = firstHeaderValue(
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  )

  return Boolean(receivedHost && receivedHost === expectedHost)
}

function safeTokenEqual(left: string, right: string): boolean {
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(left) || !/^[A-Za-z0-9_-]{32,128}$/.test(right)) {
    return false
  }

  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  return Boolean(cookieToken && headerToken && safeTokenEqual(cookieToken, headerToken))
}

export function requireCsrfProtection(
  request: NextRequest,
  options: { requireToken?: boolean; requireJson?: boolean } = {}
): NextResponse | null {
  const { requireToken = true, requireJson = true } = options

  if (!validateRequestOrigin(request)) {
    return NextResponse.json(
      { success: false, error: 'Solicitud no permitida.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (requireJson) {
    const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''
    if (!contentType.startsWith('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Tipo de contenido no permitido.' },
        { status: 415, headers: { 'Cache-Control': 'no-store' } }
      )
    }
  }

  if (requireToken && !validateCsrfToken(request)) {
    return NextResponse.json(
      { success: false, error: 'Solicitud no permitida.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return null
}

export function issueCsrfToken(): { token: string; response: NextResponse } {
  const token = randomBytes(32).toString('base64url')
  const response = NextResponse.json(
    { success: true, data: { csrfToken: token } },
    {
      headers: {
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
      },
    }
  )

  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  })

  return { token, response }
}

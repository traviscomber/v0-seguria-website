import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'seguria_session'

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(AUTH_COOKIE)
  const { pathname } = request.nextUrl

  if ((pathname.startsWith('/admin') || pathname.startsWith('/app')) && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/app', '/app/:path*'],
}

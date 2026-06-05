import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/backoffice']
const AUTH_ROUTES = ['/login', '/register']

export function proxy(request: NextRequest) {
  const token = request.cookies.get('kc_token')?.value
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/backoffice/:path*', '/login', '/register'],
}

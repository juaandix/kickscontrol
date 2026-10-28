import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Staff areas: the backoffice and the physical store's till and stock. The store's front (/tienda, /tienda/catalogo) is open.
const PROTECTED_ROUTES = ['/backoffice', '/tienda/caja', '/tienda/inventario']
const AUTH_ROUTES = ['/login', '/register']

export function proxy(request: NextRequest) {
  const token = request.cookies.get('kc_token')?.value
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))

  if (isProtected && !token) {
    const login = new URL('/login', request.url)
    login.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(login)
  }

  if (isAuthRoute && token) {
    // Already signed in: go where the login was meant to lead, the store front by default
    const returnTo = request.nextUrl.searchParams.get('returnTo')
    return NextResponse.redirect(new URL(returnTo?.startsWith('/') ? returnTo : '/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/backoffice/:path*', '/tienda/:path*', '/login', '/register'],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME } from './lib/auth-types'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore static assets, api routes, and Next.js internal files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const rawAuth = request.cookies.get(AUTH_COOKIE_NAME)?.value
  let isAuthenticated = false
  let userRole = ''

  if (rawAuth) {
    try {
      const parsed = JSON.parse(rawAuth)
      if (parsed && parsed.id && parsed.role) {
        isAuthenticated = true
        userRole = parsed.role
      }
    } catch {
      isAuthenticated = false
    }
  }

  const isLoginPage = pathname === '/login'

  // 1. Unauthenticated users trying to access protected pages -> redirect to /login
  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Authenticated users trying to access /login -> redirect to home /
  if (isAuthenticated && isLoginPage) {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }

  // 3. Role-Based Access Control (RBAC): Protect /admin routes (Super Admin only)
  if (isAuthenticated && pathname.startsWith('/admin')) {
    if (userRole !== 'SUPER_ADMIN') {
      const homeUrl = new URL('/', request.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

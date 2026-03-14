import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication (server-side redirect)
const PROTECTED_PREFIXES = ['/app', '/onboarding']

// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/auth/signin', '/auth/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for auth token in cookies or authorization header
  // Since we use localStorage for tokens, we check for a cookie marker
  // set by the client after login. This provides server-side protection
  // while the client-side auth context handles the full flow.
  const hasAuthCookie = request.cookies.get('tp_authenticated')

  // Protect /app/* and /onboarding routes
  const isProtectedRoute = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))
  if (isProtectedRoute && !hasAuthCookie) {
    const signinUrl = new URL('/auth/signin', request.url)
    signinUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signinUrl)
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))
  if (isAuthRoute && hasAuthCookie) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/onboarding/:path*', '/auth/signin', '/auth/signup'],
}

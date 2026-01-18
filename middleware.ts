import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale,
  // Don't add locale prefix for default locale
  localePrefix: 'as-needed',
})

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Exclude API routes, static files, and Next.js internals
  const isExcludedRoute = 
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')

  if (isExcludedRoute) {
    return NextResponse.next()
  }

  // Exclude public routes that don't need i18n
  // Root landing page should work without locale
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Exclude public routes that don't need i18n
  const publicRoutes = ['/auth', '/privacy', '/terms']
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next()
  }

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // If pathname already has a locale, apply i18n middleware
  if (pathnameHasLocale) {
    return intlMiddleware(request)
  }

  // For routes without locale (like /dashboard), apply i18n middleware
  // This will redirect to default locale if needed
  return intlMiddleware(request)
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - api routes
    // - _next (Next.js internals)
    // - static files (images, etc.)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}

import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Force all pages to be dynamically rendered
  const response = NextResponse.next()
  
  // Add headers to prevent static generation
  response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'questionsapp_access_token';
const PUBLIC_PATHS = new Set(['/login', '/register']);

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) {
    return false;
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return false;
  }

  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (isProtectedPath(pathname) && !hasAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (PUBLIC_PATHS.has(pathname) && hasAuthCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

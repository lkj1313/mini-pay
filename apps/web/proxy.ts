import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'session_id';
const AUTH_ROUTES = ['/login', '/signup'] as const;
const PROTECTED_PREFIXES = ['/wallets', '/transactions'] as const;

function matchesProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function matchesAuthRoute(pathname: string) {
  return AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number]);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (matchesProtectedPath(pathname) && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesAuthRoute(pathname) && hasSession) {
    const walletsUrl = request.nextUrl.clone();
    walletsUrl.pathname = '/wallets';
    walletsUrl.search = '';
    return NextResponse.redirect(walletsUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

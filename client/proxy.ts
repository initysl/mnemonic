import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

// Routes that require a session. Everything else stays public.
const PROTECTED_PREFIXES = ['/notes'];

export async function proxy(request: NextRequest) {
  const response = await auth0.middleware(request);

  // auth0.middleware mounts the /auth/* routes and refreshes the session; it
  // does not gate anything. Without this check the dashboard HTML is served to
  // anonymous visitors, who see a loading state before a client-side redirect.
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/auth')) {
    return response;
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const session = await auth0.getSession(request);

    if (!session) {
      const loginUrl = new URL('/auth/login', request.nextUrl.origin);
      loginUrl.searchParams.set(
        'returnTo',
        `${pathname}${request.nextUrl.search}`
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

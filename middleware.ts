import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { JWT } from 'next-auth/jwt';

type ExtendedToken = JWT;

interface AuthStatus {
  isAuthenticated: boolean;
  token: ExtendedToken | null;
}

async function getAuthStatus(request: NextRequest): Promise<AuthStatus> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    // secureCookie: process.env.NODE_ENV === 'production',
    secureCookie: request.headers.get('x-forwarded-proto') === 'https',
  });

  if (token && 'address' in token) {
    return { isAuthenticated: true, token };
  }

  if (token && typeof (token as any).sub === 'string') {
    return { isAuthenticated: true, token };
  }

  return { isAuthenticated: false, token: null };
}

export async function middleware(request: NextRequest) {
  try {
    const { isAuthenticated, token } = await getAuthStatus(request);
    const origin = request.nextUrl.origin;

    if (request.nextUrl.pathname.startsWith('/user')) {
      if (!isAuthenticated) {
        const callback = request.nextUrl.pathname;
        const loginUrl = new URL(`/login?returnTo=${encodeURIComponent(callback)}`, origin);
        return NextResponse.redirect(loginUrl);
      }
    }

    if (request.nextUrl.pathname.startsWith('/login')) {
      if (isAuthenticated) {
        const authLoginUrl = new URL('/api/auth/login', origin);
        return NextResponse.redirect(authLoginUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error in middleware:', error);
    const homeUrl = new URL('/', request.nextUrl.origin);
    return NextResponse.redirect(homeUrl);
  }
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/user', '/user/:path*', '/api/auth/login'],
};

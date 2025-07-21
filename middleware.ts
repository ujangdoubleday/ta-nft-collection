import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { JWT } from 'next-auth/jwt';

type ExtendedToken = JWT;

interface AuthStatus {
  isAuthenticated: boolean;
  token: ExtendedToken | null;
}

async function getAuthStatus(request: NextRequest): Promise<AuthStatus> {
  try {
    const isProduction = process.env.VERCEL_ENV === 'production';

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: isProduction,
      cookieName: 'next-auth.session-token',
    });

    // console.log('Middleware - Token check:', {
    //   hasToken: !!token,
    //   tokenSub: token?.sub,
    //   tokenAddress: (token as any)?.address,
    //   pathname: request.nextUrl.pathname,
    // });

    if (token) {
      if (token.sub || (token as any).address) {
        return { isAuthenticated: true, token };
      }
    }

    return { isAuthenticated: false, token: null };
  } catch (error) {
    console.error('Error getting auth status:', error);
    return { isAuthenticated: false, token: null };
  }
}

export async function middleware(request: NextRequest) {
  try {
    const { isAuthenticated, token } = await getAuthStatus(request);
    const origin = request.nextUrl.origin;
    const pathname = request.nextUrl.pathname;

    console.log('Middleware execution:', {
      pathname,
      isAuthenticated,
      hasToken: !!token,
    });

    if (pathname.startsWith('/user')) {
      if (!isAuthenticated) {
        const callback = pathname;
        const loginUrl = new URL(`/login?returnTo=${encodeURIComponent(callback)}`, origin);
        return NextResponse.redirect(loginUrl);
      }
      console.log('User route access granted');
    }

    if (pathname.startsWith('/login')) {
      if (isAuthenticated) {
        const returnTo = request.nextUrl.searchParams.get('returnTo') || '/';
        const redirectUrl = new URL(returnTo, origin);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Critical error in middleware:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    '/user/:path*',
    '/user',
    '/login',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

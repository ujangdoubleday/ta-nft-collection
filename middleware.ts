import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { JWT } from 'next-auth/jwt';
import { isAdminWallet } from '@/lib/auth/role';
import { forbidden } from 'next/navigation';

// Define a type for our custom token that might include fallback
type ExtendedToken = JWT | { fallback: boolean };

// Define auth status return type
interface AuthStatus {
  isAuthenticated: boolean;
  token: ExtendedToken | null;
  isFallback?: boolean;
}

// Custom token check function for production environment
async function getAuthStatus(request: NextRequest): Promise<AuthStatus> {
  // Try the standard method first
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  // If we have a valid token with an address, use it
  if (token && 'address' in token) {
    return { isAuthenticated: true, token };
  }

  // If we have a token with sub but no address, it's still valid
  if (token && typeof (token as any).sub === 'string') {
    return { isAuthenticated: true, token };
  }

  // Check for manual cookie fallback in production
  if (process.env.NODE_ENV === 'production') {
    const cookieHeader = request.headers.get('cookie') || '';
    const hasSessionToken = cookieHeader.includes('next-auth.session-token');

    // If we have the cookie but getToken failed, try manual parsing
    if (hasSessionToken) {
      // Extract the cookie for debugging
      const sessionTokenCookie = cookieHeader
        .split(';')
        .find((c) => c.trim().startsWith('next-auth.session-token='));

      if (sessionTokenCookie) {
        // We have the session cookie, use as fallback authentication
        return {
          isAuthenticated: true,
          isFallback: true,
          token: { fallback: true },
        };
      }
    }
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
        const loginUrl = new URL(`/login?callback=${encodeURIComponent(callback)}`, origin);
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

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { JWT } from 'next-auth/jwt';
import { isAdminWallet } from '@/lib/auth/role';

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

    // Check if the path is in admin protected route group
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Check if user is admin (only if we have a real token with address)
      if (token && 'address' in token) {
        const isAdmin = isAdminWallet(token.address as string);

        if (!isAdmin) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      } else {
        // No address in token, not an admin
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Admin is authenticated, allow access without rewriting
      return NextResponse.next();
    }

    // Handle user routes that require authentication
    if (request.nextUrl.pathname.startsWith('/my')) {
      if (!isAuthenticated) {
        // Redirect to unauthorized page with callback parameter
        const redirectUrl = new URL('/unauthorized', request.url);
        redirectUrl.searchParams.set('callback', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // // Handle API auth login route
    // if (request.nextUrl.pathname === '/api/auth/login') {
    //   if (!isAuthenticated) {
    //     return NextResponse.json(
    //       {
    //         error: 'Authentication required',
    //         success: false,
    //       },
    //       { status: 401 },
    //     );
    //   }
    // }

    return NextResponse.next();
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/my', '/my/:path*', '/api/auth/login'],
};

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of admin addresses (should be moved to environment variables)
const ADMIN_ADDRESSES = ['0x19191984DF6Ce7749B786b9a2BB869B4b735eC31'];

export async function middleware(request: NextRequest) {
  try {
    // Use secure cookie configurations for token retrieval
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });

    // For debugging in production logs
    if (process.env.NODE_ENV === 'production') {
      console.log('Middleware path:', request.nextUrl.pathname);
      console.log('Token exists:', !!token);
      console.log('Token has address:', token ? !!token.address : false);

      // Log cookies for debugging (exclude sensitive parts)
      const cookieHeader = request.headers.get('cookie') || '';
      console.log('Cookie header exists:', !!cookieHeader);
      console.log('Has session token:', cookieHeader.includes('next-auth.session-token'));
    }

    // Check if the path is in admin protected route group
    if (request.nextUrl.pathname.startsWith('/(admin)/(protected)')) {
      if (!token || !token.address) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Check if user is admin
      const isAdmin = ADMIN_ADDRESSES.map((addr) => addr.toLowerCase()).includes(
        (token.address as string).toLowerCase(),
      );

      if (!isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Rewrite admin protected route
      const url = request.nextUrl.clone();
      url.pathname = url.pathname.replace('/(admin)/(protected)', '');
      return NextResponse.rewrite(url);
    }

    // Handle protected collection routes
    if (request.nextUrl.pathname.includes('/(protected)')) {
      if (!token || (!token.address && !token.sub)) {
        const intendedPath = request.nextUrl.pathname.replace('/(protected)', '');
        const redirectUrl = new URL('/', request.url);
        redirectUrl.searchParams.set('redirect', intendedPath);
        return NextResponse.redirect(redirectUrl);
      }

      const url = request.nextUrl.clone();
      url.pathname = url.pathname.replace('/(protected)', '');
      return NextResponse.rewrite(url);
    }

    // // Handle user routes that require authentication
    if (request.nextUrl.pathname.startsWith('/my')) {
      if (!token || !token.address) {
        // Add a check for sub as fallback
        if (token && token.sub) {
          // We have a token with sub but no address, allow access
          return NextResponse.next();
        }

        // Redirect to unauthorized page with callback parameter
        const redirectUrl = new URL('/unauthorized', request.url);
        redirectUrl.searchParams.set('callback', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: [
    // Protected collections routes
    '/collections/(protected)/:path*',
    // Admin protected routes (including dashboard)
    '/(admin)/(protected)/:path*',
    // User routes requiring authentication
    '/my',
    '/my/:path*',
  ],
};

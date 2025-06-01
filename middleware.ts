import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define the paths that need wallet authentication
const PROTECTED_PATHS = [
  '/collections/new',
  '/collections/[collectionId]',
  '/collections/[collectionId]/mint',
  '/collections/[collectionId]/[nftId]',
];

// Helper function to check if a path matches any of the protected patterns
function isProtectedPath(path: string): boolean {
  // Explicitly check for /collections/new
  if (path === '/collections/new') {
    return true;
  }

  // Match exact paths
  if (PROTECTED_PATHS.includes(path)) {
    return true;
  }

  // Handle dynamic routes
  if (path.startsWith('/collections/') && path !== '/collections' && path !== '/collections/') {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  // Get the path from the URL
  const path = request.nextUrl.pathname;

  // Skip middleware if not accessing protected collection paths
  if (!isProtectedPath(path)) {
    return NextResponse.next();
  }

  try {
    // Get the authentication token from the request with more options
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
      cookieName: 'next-auth.session-token',
    });

    // Check if token exists and has either address or sub property
    if (!token || (!token.address && !token.sub)) {
      // Special handling for /collections/new - redirect to connect wallet first
      if (path === '/collections/new') {
        // Store the intended destination to redirect back after authentication
        const url = new URL('/collections?redirect=/collections/new', request.url);
        return NextResponse.redirect(url);
      }

      const url = new URL('/collections', request.url);
      return NextResponse.redirect(url);
    }

    // Allow the request to proceed if the user is authenticated
    return NextResponse.next();
  } catch (error) {
    const url = new URL('/collections', request.url);
    return NextResponse.redirect(url);
  }
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    '/collections/:path*', // Match any path that starts with /collections/
  ],
};

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define the paths that need wallet authentication
const PROTECTED_PATHS = [
  '/collections/(protected)/new',
  '/collections/(protected)/[collectionId]',
  '/collections/(protected)/[collectionId]/mint',
  '/collections/(protected)/[collectionId]/[nftId]',
];

// Helper function to check if a path matches any of the protected patterns
function isProtectedPath(path: string): boolean {
  // Check if path contains the (protected) route group
  if (path.includes('/(protected)/')) {
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
      // Store the intended destination to redirect back after authentication
      const redirectPath = path.replace('/(protected)', '');
      const url = new URL(`/collections?redirect=${redirectPath}`, request.url);
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
    '/collections/(protected)/:path*', // Match any path that contains the protected route group
  ],
};

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define the paths that need wallet authentication
const PROTECTED_PATHS = [
  '/collections/new',
  '/collections/[collectionId]/mint',
  '/collections/[collectionId]',
  '/collections/[collectionId]/[nftId]',
];

// Helper function to check if a path matches any of the protected patterns
function isProtectedPath(path: string): boolean {
  // Skip the base collections page
  if (path === '/collections' || path === '/collections/') {
    return false;
  }

  // Protect everything under /collections/ except the base page
  if (path.startsWith('/collections/')) {
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

  // Get the authentication token from the request
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // If no token exists or there's no wallet address in the token,
  // redirect to the main collections page
  if (!token || !token.address) {
    console.log(`Middleware: Redirecting from ${path} - No valid token or address`);
    const url = new URL('/collections', request.url);
    return NextResponse.redirect(url);
  }

  // For debugging - log successful auth
  console.log(`Middleware: Allowing access to ${path} for address ${token.address}`);

  // Allow the request to proceed if the user is authenticated
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    '/collections/:path*', // Match any path that starts with /collections/ followed by anything
  ],
};

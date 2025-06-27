import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || (!token.address && !token.sub)) {
      const intendedPath = request.nextUrl.pathname.replace('/(protected)', '');

      const redirectUrl = new URL('/collections', request.url);
      redirectUrl.searchParams.set('redirect', intendedPath);

      return NextResponse.redirect(redirectUrl);
    }

    const url = request.nextUrl.clone();
    url.pathname = url.pathname.replace('/(protected)', '');
    return NextResponse.rewrite(url);
  } catch (error) {
    console.error('Error in middleware:', error);

    const errorUrl = new URL('/collections', request.url);
    return NextResponse.redirect(errorUrl);
  }
}

export const config = {
  matcher: ['/collections/(protected)/:path*'],
};

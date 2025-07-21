import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);

    return response;
  } catch (error) {
    console.error('Critical error in middleware:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

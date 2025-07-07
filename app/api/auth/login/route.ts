import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserRole } from '@/lib/auth/role';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.address) {
      const redirectUrl = new URL('/unauthorized', request.url);
      redirectUrl.searchParams.set('callback', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const walletAddress = session.user.address;
    const role = getUserRole(walletAddress);
    const redirectPath = role === 'admin' ? '/admin' : '/my';

    return NextResponse.redirect(new URL(redirectPath, request.nextUrl.origin));
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
      },
      { status: 500 },
    );
  }
}

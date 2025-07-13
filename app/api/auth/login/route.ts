import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserRole } from '@/lib/auth/role';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.address) {
      const callback = request.nextUrl.pathname;
      const loginUrl = new URL(`/login`, request.nextUrl.origin);
      loginUrl.searchParams.set('callback', callback);
      return NextResponse.redirect(loginUrl);
    }

    const walletAddress = session.user.address;
    const role = await getUserRole(walletAddress);
    const redirectPath = role === 'admin' ? '/admin' : '/user';
    const destination = new URL(redirectPath, request.nextUrl.origin);
    return NextResponse.redirect(destination);
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

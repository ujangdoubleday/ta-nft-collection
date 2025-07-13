import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserRole } from '@/lib/auth/role';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.address) {
      const callback = request.nextUrl.pathname;
      return NextResponse.redirect(`/login?callback=${encodeURIComponent(callback)}`);
    }

    const walletAddress = session.user.address;
    const role = await getUserRole(walletAddress);
    const redirectPath = role === 'admin' ? '/admin' : '/user';

    return NextResponse.redirect(redirectPath);
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

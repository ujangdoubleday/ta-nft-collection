import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get('path');

    if (!path) {
      return NextResponse.json({ message: 'Missing path parameter' }, { status: 400 });
    }

    // Revalidate the specific path
    revalidatePath(path);

    return NextResponse.json({ revalidated: true, now: Date.now(), path }, { status: 200 });
  } catch (error) {
    console.error('Error revalidating path:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: (error as Error).message },
      { status: 500 },
    );
  }
}

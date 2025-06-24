import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    const tag = request.nextUrl.searchParams.get('tag');

    if (!tag) {
      return NextResponse.json({ message: 'Missing tag parameter' }, { status: 400 });
    }

    revalidateTag(tag);

    return NextResponse.json({ revalidated: true, now: Date.now(), tag }, { status: 200 });
  } catch (error) {
    console.error('Error revalidating tag:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: (error as Error).message },
      { status: 500 },
    );
  }
}

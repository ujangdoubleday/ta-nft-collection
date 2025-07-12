import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  const type = request.nextUrl.searchParams.get('type') || 'page';

  if (path) {
    revalidatePath(path, type === 'page' ? 'page' : 'layout');
    return Response.json({ revalidated: true, now: Date.now(), path, type });
  }

  return Response.json({
    revalidated: false,
    now: Date.now(),
    message: 'Missing path to revalidate',
  });
}

import { NextRequest, NextResponse } from 'next/server';
import {
  generateSimpleColorPlaceholder,
  getImagePlaceholder,
} from '@/lib/utils/helpers/plaiceholder';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const imageUrl = searchParams.get('url');
  const color = searchParams.get('color') || '#cccccc';
  const width = parseInt(searchParams.get('width') || '10', 10);
  const height = parseInt(searchParams.get('height') || '10', 10);

  if (!id && !imageUrl) {
    return new NextResponse('ID or URL parameter is required', { status: 400 });
  }

  try {
    let base64;

    // If URL is provided, try to generate a placeholder from the actual image
    if (imageUrl) {
      try {
        base64 = await getImagePlaceholder(imageUrl);
      } catch (error) {
        console.error('Error generating placeholder from URL:', error);
        // Fallback to simple color placeholder
        base64 = await generateSimpleColorPlaceholder(imageUrl);
      }
    } else if (id) {
      // Generate a color placeholder based on the ID
      base64 = await generateSimpleColorPlaceholder(id, color);
    } else {
      // Default simple color placeholder
      base64 = await generateSimpleColorPlaceholder(width, height, color);
    }

    // Extract image data from base64
    const imageData = base64.split(',')[1];
    const contentType = base64.split(';')[0].split(':')[1];

    // Create buffer from base64
    const buffer = Buffer.from(imageData, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return new NextResponse('Error generating placeholder', { status: 500 });
  }
}

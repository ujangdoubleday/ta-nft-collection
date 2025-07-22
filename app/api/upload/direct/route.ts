import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/api/services/pinata/helper';

// Set higher limits for this specific route in Next.js 15
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Extend timeout to 60 seconds for large uploads

// Set the runtime to edge for better handling of large files
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Parse the form data
    const formData = await req.formData();

    // Get the file from the form data
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get other form fields
    const fileName = (formData.get('fileName') as string) || file.name;
    const folderId = (formData.get('folderId') as string) || undefined;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload file to Pinata
    const result = await uploadFile(buffer, fileName, folderId);

    // Return the CID and URL
    return NextResponse.json({
      success: true,
      cid: result.cid,
      url: result.url,
    });
  } catch (error) {
    console.error('Error in direct upload:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error uploading to IPFS',
      },
      { status: 500 },
    );
  }
}

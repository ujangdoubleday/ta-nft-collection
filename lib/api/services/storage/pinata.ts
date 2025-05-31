'server only';

import { PinataSDK } from 'pinata';

// Inisialisasi SDK Pinata
export const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT}`,
  pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`,
});

/**
 * Pin file to IPFS via Pinata
 * @param file File to upload
 * @param name Optional name for the file
 * @returns Upload result including CID
 */
export async function pinFile(file: File, name?: string) {
  try {
    let upload = pinata.upload.public.file(file);

    // Add optional name if provided
    if (name) {
      upload = upload.name(name);
    }

    const result = await upload;
    return result;
  } catch (error) {
    console.error('Error pinning file to IPFS:', error);
    throw error;
  }
}

/**
 * Pin JSON data to IPFS via Pinata
 * @param jsonData JSON data to pin
 * @param name Name for the JSON metadata
 * @returns Upload result including CID
 */
export async function pinJSON(jsonData: object, name: string) {
  try {
    const result = await pinata.upload.public.json({
      name,
      content: jsonData,
    });
    return result;
  } catch (error) {
    console.error('Error pinning JSON to IPFS:', error);
    throw error;
  }
}

/**
 * Get content from IPFS via Gateway
 * @param cid IPFS CID
 * @returns Content from IPFS
 */
export async function getFromIPFS(cid: string) {
  try {
    const result = await pinata.gateways.public.get(cid);
    return result;
  } catch (error) {
    console.error('Error getting content from IPFS:', error);
    throw error;
  }
}

/**
 * Get the gateway URL for a CID
 * @param cid IPFS CID
 * @returns Full gateway URL
 */
export function getGatewayUrl(cid: string) {
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.pinata.cloud';
  return `${gateway}/ipfs/${cid}`;
}

/**
 * List files from Pinata with optional filters
 * @param options Filter options (limit, name, etc.)
 * @returns List of files
 */
export async function listFiles(options?: {
  limit?: number;
  name?: string;
  cid?: string;
  group?: string;
}) {
  try {
    let query = pinata.files.public.list();

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.name) {
      query = query.name(options.name);
    }

    if (options?.cid) {
      query = query.cid(options.cid);
    }

    if (options?.group) {
      query = query.group(options.group);
    }

    const result = await query;
    return result;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

/**
 * Delete file from Pinata by CID
 * @param cid IPFS CID to delete
 * @returns Success status
 */
export async function deleteFile(cid: string) {
  try {
    await pinata.files.public.delete([cid]);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

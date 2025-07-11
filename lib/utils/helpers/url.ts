/**
 * Ensures an IPFS URL is formatted correctly for display
 * @param url The URL to format
 * @returns A properly formatted URL for display
 */
export function formatIPFSUrl(url: string): string {
  if (!url) return '';

  // If it's already an HTTP URL, return it as is
  if (url.startsWith('http')) {
    return url;
  }

  // Get the gateway URL from environment variable
  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;

  // Convert IPFS URL to HTTP gateway URL
  if (url.startsWith('ipfs://')) {
    const ipfsHash = url.replace('ipfs://', '');
    return `https://${gatewayUrl}/ipfs/${ipfsHash}`;
  }

  // If it's just an IPFS hash
  if (url.startsWith('Qm') || url.startsWith('bafy')) {
    return `https://${gatewayUrl}/ipfs/${url}`;
  }

  return url;
}

/**
 * Converts an IPFS URL to an HTTP URL
 * @param url The IPFS URL to convert
 * @returns An HTTP URL
 */
export function ipfsToHttp(url: string): string {
  if (!url) return '';

  // Use the existing formatIPFSUrl function for consistency
  return formatIPFSUrl(url);
}

/**
 * Checks if an image URL is valid
 * @param url The URL to check
 * @returns A promise that resolves to a boolean indicating if the URL is valid
 */
export async function isImageUrlValid(url: string): Promise<boolean> {
  if (!url) return false;

  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Error checking image URL ${url}:`, error);
    return false;
  }
}

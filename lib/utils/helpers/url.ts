/**
 * Ensures an IPFS URL is formatted correctly for display
 * @param url The URL to format
 * @returns A properly formatted URL for display
 */
export function formatIPFSUrl(url: string): string {
  if (!url) return '';

  // Trim the URL
  url = url.trim();

  // Add debugging
  const isDev = process.env.VERCEL_ENV !== 'production';
  if (isDev) {
    console.log('Formatting URL:', url);
  }

  // If it's already an HTTP URL, return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Get the gateway URL from environment variable
  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'green-added-cattle-346.mypinata.cloud';

  // Handle different IPFS URL formats
  if (url.startsWith('ipfs://ipfs/')) {
    // Format: ipfs://ipfs/QmXxxx...
    const ipfsHash = url.replace('ipfs://ipfs/', '');
    return `https://${gatewayUrl}/ipfs/${ipfsHash}`;
  } else if (url.startsWith('ipfs://')) {
    // Format: ipfs://QmXxxx...
    const ipfsHash = url.replace('ipfs://', '');
    return `https://${gatewayUrl}/ipfs/${ipfsHash}`;
  } else if (url.startsWith('/ipfs/')) {
    // Format: /ipfs/QmXxxx...
    const ipfsHash = url.replace('/ipfs/', '');
    return `https://${gatewayUrl}/ipfs/${ipfsHash}`;
  } else if (url.startsWith('Qm') || url.startsWith('bafy')) {
    // If it's just an IPFS hash (Qm... or bafy...)
    return `https://${gatewayUrl}/ipfs/${url}`;
  } else if (url.startsWith('data:')) {
    // Handle data URLs (e.g., data:image/png;base64,...)
    return url;
  }

  // If it doesn't match any known format, but might be an IPFS CID
  if (/^[a-zA-Z0-9]{40,}$/.test(url)) {
    return `https://${gatewayUrl}/ipfs/${url}`;
  }

  // If no matches, return the original URL
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

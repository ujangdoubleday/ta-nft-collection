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

  // Convert IPFS URL to HTTP gateway URL
  if (url.startsWith('ipfs://')) {
    const ipfsHash = url.replace('ipfs://', '');
    return `https://cyan-dead-reptile-256.mypinata.cloud/ipfs/${ipfsHash}`;
  }

  // If it's just an IPFS hash
  if (url.startsWith('Qm') || url.startsWith('bafy')) {
    return `https://cyan-dead-reptile-256.mypinata.cloud/ipfs/${url}`;
  }

  return url;
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

/**
 * Generate a placeholder data URL for an image
 * This is a simple function that returns a data URL for a gray placeholder
 * @returns Data URL for a gray placeholder image
 */
export function generatePlaceholderDataURL(): string {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2MwYzBjMCIvPjwvc3ZnPg==';
}

/**
 * Generate a simple color-based placeholder from an image URL
 * This function creates a placeholder based on the image URL's hash
 * @param imageUrl URL of the image
 * @returns Data URL for a colored placeholder
 */
export function generateSimpleColorPlaceholder(imageUrl: string): string {
  // Generate a simple hash from the URL
  let hash = 0;
  for (let i = 0; i < imageUrl.length; i++) {
    hash = (hash << 5) - hash + imageUrl.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate a color from the hash
  const hue = Math.abs(hash % 360);
  const saturation = 70; // Fixed saturation
  const lightness = 60; // Fixed lightness

  // Create an SVG with the color
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="hsl(${hue}, ${saturation}%, ${lightness}%)" />
    </svg>
  `;

  // Convert to base64
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * This is a placeholder function that would normally generate a blurhash
 * Since we're having issues with the Sharp dependency, we're using a simpler approach
 * @param imageUrl URL of the image
 * @returns A simple color-based placeholder data URL
 */
export async function generateBlurhash(imageUrl: string): Promise<string | undefined> {
  try {
    // Instead of generating an actual blurhash, we'll return a color-based placeholder
    return generateSimpleColorPlaceholder(imageUrl);
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return generatePlaceholderDataURL();
  }
}

/**
 * Convert a blurhash or placeholder to a data URL
 * @param blurhash Blurhash string or placeholder URL
 * @returns Data URL that can be used as image placeholder
 */
export function blurhashToDataURL(blurhash: string): string {
  // If no blurhash is provided, return a default gray placeholder
  if (!blurhash) {
    return generatePlaceholderDataURL();
  }

  // If the blurhash is already a data URL, return it
  if (blurhash.startsWith('data:')) {
    return blurhash;
  }

  // Otherwise, return a default placeholder
  return generatePlaceholderDataURL();
}

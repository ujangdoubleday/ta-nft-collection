/**
 * NFT Helper utilities
 */
import { z } from 'zod';

/**
 * Standard NFT metadata schema
 * Based on ERC-721 and ERC-1155 metadata standards
 */
export const nftMetadataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  image: z.string().url('Image must be a valid URL'),
  external_url: z.string().url().optional(),
  attributes: z
    .array(
      z.object({
        trait_type: z.string(),
        value: z.union([z.string(), z.number(), z.boolean()]),
        display_type: z.string().optional(),
      }),
    )
    .optional(),
  animation_url: z.string().url().optional(),
  background_color: z
    .string()
    .regex(/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color')
    .optional(),
});

export type NFTMetadata = z.infer<typeof nftMetadataSchema>;

/**
 * Validate NFT metadata against schema
 * @param metadata NFT metadata to validate
 * @returns Validation result
 */
export function validateNFTMetadata(metadata: unknown): {
  success: boolean;
  data?: NFTMetadata;
  error?: z.ZodError;
} {
  try {
    const validatedData = nftMetadataSchema.parse(metadata);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Create new NFT metadata object
 * @param data Partial NFT metadata
 * @returns Complete NFT metadata
 */
export function createNFTMetadata(data: Partial<NFTMetadata>): NFTMetadata {
  const metadata = {
    name: data.name || 'Untitled NFT',
    description: data.description || '',
    image: data.image || '',
    attributes: data.attributes || [],
    ...data,
  };

  // Validate the metadata
  const validation = validateNFTMetadata(metadata);
  if (!validation.success) {
    throw new Error(`Invalid NFT metadata: ${validation.error?.message}`);
  }

  return metadata;
}

/**
 * Get trait value from NFT attributes
 * @param attributes NFT attributes array
 * @param traitType Trait type to find
 * @returns Trait value or undefined if not found
 */
export function getTraitValue(
  attributes: NFTMetadata['attributes'] = [],
  traitType: string,
): string | number | boolean | undefined {
  const attribute = attributes.find((attr) => attr.trait_type === traitType);
  return attribute?.value;
}

/**
 * Format IPFS URL to gateway URL
 * @param url IPFS URL (ipfs://)
 * @param gateway Gateway URL (defaults to Pinata gateway)
 * @returns Formatted gateway URL
 */
export function formatIPFSUrl(url: string, gateway?: string): string {
  if (!url) return '';

  const ipfsGateway =
    gateway || process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.pinata.cloud';

  // Handle ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '');
    return `${ipfsGateway}/ipfs/${cid}`;
  }

  // Already a HTTP URL
  if (url.startsWith('http')) {
    return url;
  }

  // Just a CID
  if (url.startsWith('Qm') || url.startsWith('bafy')) {
    return `${ipfsGateway}/ipfs/${url}`;
  }

  return url;
}

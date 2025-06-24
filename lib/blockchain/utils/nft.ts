/**
 * NFT Helper utilities
 */
import { z } from 'zod';
import { AlchemyNFT } from './alchemy';
import { generateSimpleColorPlaceholder } from '@/lib/utils/helpers/plaiceholder';
import { formatIPFSUrl } from '@/lib/utils/helpers/url';

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

// Define types for collection items
export type CollectionItem = {
  id: string;
  name: string;
  type: string;
  image: string;
  blurhash?: string;
  placeholder?: string;
  contractAddress: string;
  tokenId: string;
  attributes: {
    rarity?: string;
    pixels?: string;
    dimensions?: string;
    complexity?: string;
    era?: string;
    style?: string;
    category?: string;
    resolution?: string;
    [key: string]: string | undefined;
  };
};

/**
 * Processes an Alchemy NFT into a standardized CollectionItem format
 * @param nft The Alchemy NFT to process
 * @returns Promise with the processed CollectionItem
 */
export const processAlchemyNFT = async (nft: AlchemyNFT): Promise<CollectionItem> => {
  // Generate default placeholder
  const placeholder = await generateSimpleColorPlaceholder(nft.tokenId || 'default');

  // Get the best available image URL
  let imageUrl = '';
  if (nft.raw?.metadata.image) {
    imageUrl = nft.raw.metadata.image;
  } else if (nft.image?.originalUrl) {
    imageUrl = nft.image.originalUrl;
  } else if (nft.raw?.metadata?.image) {
    imageUrl = nft.raw.metadata.image;
  }

  // Format the image URL if it's an IPFS URL
  const image = imageUrl ? formatIPFSUrl(imageUrl) : '';

  // Process attributes
  let attributes: Record<string, string> = { rarity: 'Common' };
  if (nft.raw?.metadata?.attributes && nft.raw.metadata.attributes.length > 0) {
    attributes = nft.raw.metadata.attributes.reduce(
      (acc, attr) => {
        if (attr.trait_type && attr.value) {
          acc[attr.trait_type.toLowerCase()] = attr.value;
        }
        return acc;
      },
      { rarity: 'Common' } as Record<string, string>,
    );
  }

  return {
    id: nft.tokenId,
    name: nft.name || `NFT #${nft.tokenId}`,
    type: attributes.type || 'Digital Art',
    image,
    blurhash: placeholder,
    placeholder,
    contractAddress: nft.contract.address,
    tokenId: nft.tokenId,
    attributes,
  };
};

/**
 * Processes multiple Alchemy NFTs into standardized CollectionItems
 * @param nfts Array of Alchemy NFTs to process
 * @returns Promise with array of processed CollectionItems
 */
export const processAlchemyNFTs = async (nfts: AlchemyNFT[]): Promise<CollectionItem[]> => {
  return Promise.all(nfts.map((nft) => processAlchemyNFT(nft)));
};

/**
 * Collection-related utilities for blockchain operations
 */
import { createPublicClient, http } from 'viem';
import { sepolia } from 'wagmi/chains';

// Import ABIs from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_FACTORY_ABI from '../abi/NFTFactory.json';

// Constants for collection operations
export const NFT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
export const IPFS_GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || 'cyan-dead-reptile-256.mypinata.cloud';
export const ALCHEMY_RPC_URL =
  process.env.NEXT_PUBLIC_ALCHEMY_HTTP ||
  'https://eth-sepolia.g.alchemy.com/v2/yXhQ8MjEA5FQdiDCQ8Xnv';

// Create a public client with Alchemy transport
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(ALCHEMY_RPC_URL),
});

// Define the interface for collection info from contract
export interface CollectionInfo {
  collectionAddress: string;
  contractURI: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  createdAt: bigint;
}

// Define the interface for metadata from IPFS
export interface CollectionMetadata {
  name?: string;
  description?: string;
  image?: string;
  banner_image?: string;
  featured_image?: string;
  external_link?: string;
  collaborators?: string[];
  seller_fee_basis_points?: number;
  fee_recipient?: string;
}

// Define the interface for combined collection data
export interface EnrichedCollectionInfo extends CollectionInfo {
  metadata: CollectionMetadata;
  imageUrl: string; // Processed image URL ready for display
}

/**
 * Helper function to convert IPFS URI to HTTP URL using the gateway
 * @param uri IPFS URI to convert
 * @returns HTTP URL
 */
export function ipfsToHttp(uri: string): string {
  if (!uri) return '';

  // Handle ipfs:// protocol
  if (uri.startsWith('ipfs://')) {
    const ipfsId = uri.replace('ipfs://', '');
    return `https://${IPFS_GATEWAY_URL}/ipfs/${ipfsId}`;
  }
  // Handle /ipfs/ path format
  else if (uri.includes('/ipfs/')) {
    // Check if it's already a gateway URL
    if (uri.startsWith('http')) {
      return uri;
    }
    // Otherwise, extract the IPFS hash and create a gateway URL
    const ipfsPath = uri.substring(uri.indexOf('/ipfs/') + 6);
    return `https://${IPFS_GATEWAY_URL}/ipfs/${ipfsPath}`;
  }
  // Handle direct CID
  else if (/^(Qm[1-9A-Za-z]{44}|bafy[A-Za-z2-7]{55})$/.test(uri)) {
    return `https://${IPFS_GATEWAY_URL}/ipfs/${uri}`;
  }

  // Return as is if it's already an HTTP URL or other format
  return uri;
}

/**
 * Helper function to fetch metadata from URI
 * @param uri URI to fetch metadata from
 * @returns Collection metadata
 */
export async function fetchMetadata(uri: string): Promise<CollectionMetadata> {
  try {
    if (!uri) return {}; // Return empty object if no URI provided

    const httpUrl = ipfsToHttp(uri);
    console.log(`Fetching metadata from: ${httpUrl}`);

    const response = await fetch(httpUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {}; // Return empty object on error
  }
}

/**
 * Helper function to safely parse contract data
 * @param info Collection info from contract
 * @returns Parsed collection info
 */
export function safeParseCollectionInfo(info: any): CollectionInfo | null {
  try {
    // Handle array format (tuple from contract)
    if (Array.isArray(info)) {
      if (info.length < 6) {
        console.error('Invalid collection info array format:', info);
        return null;
      }

      return {
        collectionAddress: info[0] || '',
        contractURI: info[1] || '',
        name: info[2] || 'Unnamed Collection',
        symbol: info[3] || 'UNKNOWN',
        totalSupply: BigInt(info[4] || 0),
        createdAt: BigInt(info[5] || 0),
      };
    }
    // Handle object format (direct object from contract)
    else if (info && typeof info === 'object') {
      return {
        collectionAddress: info.collectionAddress || '',
        contractURI: info.contractURI || '',
        name: info.name || 'Unnamed Collection',
        symbol: info.symbol || 'UNKNOWN',
        totalSupply:
          typeof info.totalSupply === 'bigint' ? info.totalSupply : BigInt(info.totalSupply || 0),
        createdAt:
          typeof info.createdAt === 'bigint' ? info.createdAt : BigInt(info.createdAt || 0),
      };
    }

    console.error('Invalid collection info format:', info);
    return null;
  } catch (error) {
    console.error('Error parsing collection info:', error);
    return null;
  }
}

/**
 * Fetch collections created by a specific address
 * @param creatorAddress Address of the creator
 * @returns Array of enriched collection info
 */
export async function fetchCreatorCollections(
  creatorAddress: `0x${string}`,
): Promise<EnrichedCollectionInfo[]> {
  if (!creatorAddress || !NFT_FACTORY_ADDRESS) return [];

  try {
    console.log(`Fetching collections for creator: ${creatorAddress}`);

    // Call the contract method to get collections by creator
    let collectionsInfo;

    try {
      // Try getCollectionInfoByCreator first
      collectionsInfo = (await publicClient.readContract({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'getCollectionInfoByCreator',
        args: [creatorAddress],
      })) as any[];
      console.log('Successfully called getCollectionInfoByCreator');
    } catch (err) {
      console.log('getCollectionInfoByCreator failed, trying getCollectionsByCreator');
      // If that fails, try getCollectionsByCreator
      try {
        const collectionAddresses = (await publicClient.readContract({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'getCollectionsByCreator',
          args: [creatorAddress],
        })) as `0x${string}`[];

        console.log('Got collection addresses:', collectionAddresses);

        // For each address, get the collection info
        collectionsInfo = await Promise.all(
          collectionAddresses.map(async (address) => {
            try {
              // Try to get collection info
              const info = (await publicClient.readContract({
                address: NFT_FACTORY_ADDRESS,
                abi: NFT_FACTORY_ABI,
                functionName: 'getCollectionInfo',
                args: [address],
              })) as any;

              return info;
            } catch (infoErr) {
              console.error('Error getting collection info:', infoErr);
              // Return minimal info if we can't get full info
              return [address, '', 'Collection ' + address.slice(0, 6), 'NFT', 0, 0];
            }
          }),
        );
      } catch (err2) {
        console.error('Both methods failed:', err2);
        throw err2;
      }
    }

    console.log('Raw collections data:', collectionsInfo);

    if (!collectionsInfo) {
      console.error('Invalid response from contract: null or undefined');
      return [];
    }

    // Transform the data into a more usable format with validation
    let collections: CollectionInfo[] = [];

    // Handle array of collections
    if (Array.isArray(collectionsInfo)) {
      collections = collectionsInfo
        .map(safeParseCollectionInfo)
        .filter((info): info is CollectionInfo => info !== null);
    }
    // Handle single collection object
    else if (typeof collectionsInfo === 'object') {
      const parsedCollection = safeParseCollectionInfo(collectionsInfo);
      if (parsedCollection) {
        collections = [parsedCollection];
      }
    }

    console.log('Parsed collections:', collections);

    // Fetch metadata for each collection
    const enrichedCollections: EnrichedCollectionInfo[] = await Promise.all(
      collections.map(async (collection) => {
        const metadata = await fetchMetadata(collection.contractURI);
        console.log(`Metadata for ${collection.name}:`, metadata);

        // Process the image URL if it exists
        const imageUrl = metadata.image
          ? ipfsToHttp(metadata.image)
          : '/assets/images/placeholders/image-placeholder.svg';

        return {
          ...collection,
          metadata,
          imageUrl,
        };
      }),
    );

    console.log('Enriched collections:', enrichedCollections);
    return enrichedCollections;
  } catch (error) {
    console.error('Error fetching creator collections:', error);
    return [];
  }
}

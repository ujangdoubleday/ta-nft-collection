/**
 * Collection-related utilities for blockchain operations
 */
import { publicClient } from '@/lib/blockchain/viem';
import { NFT_FACTORY_ADDRESS, IPFS_GATEWAY_URL } from '@/lib/blockchain';

// Import ABIs from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_FACTORY_ABI from '../abi/NFTFactory.json';

// Define the interface for collection info from contract
export interface CollectionInfo {
  collectionAddress: string;
  contractURI: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  maxSupply: bigint;
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
        maxSupply: BigInt(info[5] || 0),
        createdAt: BigInt(info[6] || 0),
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
        maxSupply:
          typeof info.maxSupply === 'bigint' ? info.maxSupply : BigInt(info.maxSupply || 0), // Add maxSupply parsing
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
    // console.log(`Fetching collections for creator: ${creatorAddress}`);

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

    // Fetch metadata for each collection
    const enrichedCollections: EnrichedCollectionInfo[] = await Promise.all(
      collections.map(async (collection) => {
        const metadata = await fetchMetadata(collection.contractURI);
        console.log(`Metadata for ${collection.name}:`, metadata);

        // Process the image URL if it exists
        const imageUrl = metadata.image
          ? ipfsToHttp(metadata.image)
          : '/assets/images/placeholders/placeholder_loading.gif';

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

export async function fetchCreatorCollectionsBasic(
  creatorAddress: `0x${string}`,
): Promise<CollectionInfo[]> {
  if (!creatorAddress || !NFT_FACTORY_ADDRESS) return [];

  try {
    // console.log(`Fetching collections for creator: ${creatorAddress}`);

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

    return collections;
  } catch (error) {
    console.error('Error fetching creator collections:', error);
    return [];
  }
}

/**
 * Fetch the owner of a collection contract
 * @param collectionAddress The address of the collection contract
 * @returns The owner address or null if not found
 */
export async function fetchCollectionOwner(collectionAddress: string): Promise<string | null> {
  if (!collectionAddress) return null;

  try {
    // console.log(`Fetching owner for collection: ${collectionAddress}`);

    // Import the NFT Collection ABI
    const { NFT_COLLECTION_ABI } = await import('../abi');

    // Call the owner function on the collection contract
    const owner = await publicClient.readContract({
      address: collectionAddress as `0x${string}`,
      abi: NFT_COLLECTION_ABI,
      functionName: 'owner',
    });

    return owner as string;
  } catch (error) {
    console.error('Error fetching collection owner:', error);
    return null;
  }
}

export async function isCollectionValid(collectionAddress: string): Promise<boolean> {
  if (!collectionAddress) throw new Error('Collection address is required');

  try {
    console.log(`Checking validity for collection: ${collectionAddress}`);
    const { NFT_FACTORY_ABI } = await import('../abi');

    const isValid = await publicClient.readContract({
      address: NFT_FACTORY_ADDRESS as `0x${string}`,
      abi: NFT_FACTORY_ABI,
      functionName: 'isCollectionValid',
      args: [collectionAddress],
    });

    if (!isValid) {
      throw new Error('Invalid collection');
    }

    return true;
  } catch (error) {
    console.error('Error validating collection:', error);
    throw new Error('Invalid collection or unable to verify');
  }
}

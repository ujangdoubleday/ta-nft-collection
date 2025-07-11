import { z } from 'zod';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import {
  fetchCreatorCollectionsBasic,
  fetchCollectionOwner,
  isCollectionValid,
} from '@/lib/blockchain/utils/collection';
import { ipfsToHttp } from '@/lib/blockchain/utils/collection';
import { publicClient } from '@/lib/blockchain/viem';
import { NFT_COLLECTION_ABI, NFT_FACTORY_ABI } from '@/lib/blockchain/abi';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';

export const collectionRouter = router({
  getCreatorCollections: publicProcedure
    .input(z.object({ creatorAddress: z.string() }))
    .query(async ({ input }) => {
      const { creatorAddress } = input;

      if (!creatorAddress) {
        return [];
      }

      try {
        // Fetch collections from blockchain (tanpa metadata)
        const collections = await fetchCreatorCollectionsBasic(creatorAddress as `0x${string}`);

        // Sort collections by creation time (newest first)
        const sortedCollections = collections.sort((a, b) => {
          const timeA = Number(a.createdAt);
          const timeB = Number(b.createdAt);
          return timeB - timeA;
        });

        return sortedCollections;
      } catch (error) {
        console.error('Error fetching collections from blockchain:', error);
        throw new Error('Failed to fetch collections from blockchain');
      }
    }),

  fetchMetadata: publicProcedure.input(z.object({ uri: z.string() })).query(async ({ input }) => {
    const { uri } = input;

    if (!uri) return {}; // Return empty object if no URI provided

    try {
      const httpUrl = ipfsToHttp(uri);
      // console.log(`Fetching metadata from: ${httpUrl}`);

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
  }),

  fetchMultipleMetadata: publicProcedure
    .input(z.object({ uris: z.array(z.string()) }))
    .query(async ({ input }) => {
      const { uris } = input;

      if (!uris || uris.length === 0) return [];

      try {
        const metadataPromises = uris.map(async (uri) => {
          if (!uri) return { uri, metadata: {} };

          try {
            const httpUrl = ipfsToHttp(uri);
            // console.log(`Fetching metadata from: ${httpUrl}`);

            const response = await fetch(httpUrl);

            if (!response.ok) {
              throw new Error(`Failed to fetch metadata: ${response.statusText}`);
            }

            const metadata = await response.json();
            return { uri, metadata };
          } catch (error) {
            console.error(`Error fetching metadata for ${uri}:`, error);
            return { uri, metadata: {} };
          }
        });

        const results = await Promise.all(metadataPromises);
        return results;
      } catch (error) {
        console.error('Error fetching multiple metadata:', error);
        return [];
      }
    }),

  getEnrichedCreatorCollections: publicProcedure
    .input(z.object({ creatorAddress: z.string() }))
    .query(async ({ input }) => {
      const { creatorAddress } = input;

      if (!creatorAddress) {
        return [];
      }

      try {
        // Fetch basic collections
        const collections = await fetchCreatorCollectionsBasic(creatorAddress as `0x${string}`);

        if (collections.length === 0) {
          return [];
        }

        // Extract URIs for batch metadata fetching
        const uris = collections.map((collection) => collection.contractURI);

        // Fetch all metadata
        const metadataResults = await Promise.all(
          uris.map(async (uri) => {
            if (!uri) return { uri, metadata: {} };

            try {
              const httpUrl = ipfsToHttp(uri);
              const response = await fetch(httpUrl);

              if (!response.ok) {
                throw new Error(`Failed to fetch metadata: ${response.statusText}`);
              }

              const metadata = await response.json();
              return { uri, metadata };
            } catch (error) {
              console.error(`Error fetching metadata for ${uri}:`, error);
              return { uri, metadata: {} };
            }
          }),
        );

        // Create a map for quick lookup
        const metadataMap = new Map();
        metadataResults.forEach((result) => {
          metadataMap.set(result.uri, result.metadata);
        });

        // Enrich collections with metadata
        const enrichedCollections = collections.map((collection) => {
          const metadata = metadataMap.get(collection.contractURI) || {};

          // Process the image URL if it exists
          const imageUrl = metadata.image
            ? ipfsToHttp(metadata.image)
            : '/assets/images/placeholders/image-placeholder.svg';

          return {
            ...collection,
            metadata,
            imageUrl,
          };
        });

        // Sort by creation time (newest first)
        const sortedCollections = enrichedCollections.sort((a, b) => {
          const timeA = Number(a.createdAt);
          const timeB = Number(b.createdAt);
          return timeB - timeA;
        });

        return sortedCollections;
      } catch (error) {
        console.error('Error fetching enriched collections:', error);
        throw new Error('Failed to fetch enriched collections');
      }
    }),

  convertIpfsUrl: publicProcedure
    .input(z.object({ ipfsUrl: z.string() }))
    .query(async ({ input }) => {
      const { ipfsUrl } = input;

      if (!ipfsUrl) return '';

      try {
        const httpUrl = ipfsToHttp(ipfsUrl);
        return httpUrl;
      } catch (error) {
        console.error('Error converting IPFS URL:', error);
        return ipfsUrl; // Return original if conversion fails
      }
    }),

  // Atau procedure yang langsung return processed metadata dengan HTTP URLs
  fetchProcessedMetadata: publicProcedure
    .input(z.object({ uri: z.string() }))
    .query(async ({ input }) => {
      const { uri } = input;

      if (!uri) return { metadata: {}, imageUrl: '' };

      try {
        const httpUrl = ipfsToHttp(uri);
        // console.log(`Fetching metadata from: ${httpUrl}`);

        const response = await fetch(httpUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const metadata = await response.json();

        // Process image URL if it exists
        const imageUrl = metadata.image
          ? ipfsToHttp(metadata.image)
          : '/assets/images/placeholders/image-placeholder.svg';

        return {
          metadata,
          imageUrl,
        };
      } catch (error) {
        console.error('Error fetching processed metadata:', error);
        return {
          metadata: {},
          imageUrl: '/assets/images/placeholders/image-placeholder.svg',
        };
      }
    }),

  getCollectionOwner: publicProcedure
    .input(z.object({ collectionAddress: z.string() }))
    .query(async ({ input }) => {
      const { collectionAddress } = input;

      if (!collectionAddress) {
        return null;
      }

      try {
        // Fetch collection owner from blockchain
        const owner = await fetchCollectionOwner(collectionAddress);
        return owner;
      } catch (error) {
        console.error('Error fetching collection owner:', error);
        throw new Error('Failed to fetch collection owner');
      }
    }),

  getMultipleCollectionOwners: publicProcedure
    .input(z.object({ collectionAddresses: z.array(z.string()) }))
    .query(async ({ input }) => {
      const { collectionAddresses } = input;

      if (!collectionAddresses || collectionAddresses.length === 0) {
        return [];
      }

      try {
        // Fetch owners for multiple collections in parallel
        const ownerPromises = collectionAddresses.map(async (address) => {
          try {
            const owner = await fetchCollectionOwner(address);
            return {
              collectionAddress: address,
              owner: owner,
            };
          } catch (error) {
            console.error(`Error fetching owner for collection ${address}:`, error);
            return {
              collectionAddress: address,
              owner: null,
            };
          }
        });

        const results = await Promise.all(ownerPromises);
        return results;
      } catch (error) {
        console.error('Error fetching multiple collection owners:', error);
        return collectionAddresses.map((address) => ({ collectionAddress: address, owner: null }));
      }
    }),

  isCollectionValid: publicProcedure
    .input(z.object({ collectionAddress: z.string() }))
    .query(async ({ input }) => {
      const { collectionAddress } = input;

      if (!collectionAddress) {
        throw new Error('Collection address is required');
      }

      // Akan throw error jika tidak valid
      await isCollectionValid(collectionAddress as `0x${string}`);

      // Kalau valid, bisa return true atau data tambahan jika mau
      return true;
    }),

  // New procedure to get contractURI and collection info in a single call
  getContractURI: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { contractAddress } = input;

      try {
        // Call the contractURI function on the NFTCollection contract
        const contractURI = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'contractURI',
        });

        // Call the getCollectionInfo function on the NFTCollection contract
        const collectionInfo = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'getCollectionInfo',
        });

        return {
          contractURI,
          collectionInfo,
        };
      } catch (error) {
        console.error(`Error getting contract URI and info for ${contractAddress}:`, error);
        throw new Error('Failed to get collection data from blockchain');
      }
    }),

  getMultipleContractURIs: publicProcedure
    .input(z.object({ contractAddresses: z.array(z.string()) }))
    .query(async ({ input }) => {
      const { contractAddresses } = input;

      if (!contractAddresses || contractAddresses.length === 0) {
        return [];
      }

      try {
        const results = await Promise.all(
          contractAddresses.map(async (address) => {
            try {
              // Read contract URI
              const contractURI = await publicClient.readContract({
                address: address as `0x${string}`,
                abi: NFT_COLLECTION_ABI,
                functionName: 'contractURI',
              });

              return {
                contractAddress: address,
                contractURI: contractURI as string,
              };
            } catch (error) {
              console.error(`Error fetching contract URI for ${address}:`, error);
              return {
                contractAddress: address,
                contractURI: null,
              };
            }
          }),
        );

        return results;
      } catch (error) {
        console.error('Error fetching multiple contract URIs:', error);
        throw new Error('Failed to fetch contract URIs');
      }
    }),

  getCollectionInfo: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { contractAddress } = input;

      if (!contractAddress) {
        return null;
      }

      try {
        // Read collection name
        const name = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'name',
        });

        // Read collection symbol
        const symbol = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'symbol',
        });

        // Read total supply
        const totalSupply = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'totalSupply',
        });

        // For createdAt, we don't have a direct way to get it from the contract
        // We could fetch it from the blockchain by looking at the contract creation transaction
        // For now, we'll use the current timestamp as a placeholder
        const createdAt = Math.floor(Date.now() / 1000);

        return {
          name,
          symbol,
          totalSupply,
          createdAt,
        };
      } catch (error) {
        console.error(`Error fetching collection info for ${contractAddress}:`, error);
        return null;
      }
    }),

  getCreationFee: publicProcedure.query(async () => {
    try {
      const creationFee = await publicClient.readContract({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'creationFee',
      });

      // Ensure we return a bigint even if the fee is 0
      return creationFee ? (creationFee as bigint) : BigInt(0);
    } catch (error) {
      console.error('Error fetching creation fee:', error);
      return BigInt(0); // Return 0 wei instead of throwing error
    }
  }),

  // New procedure to get info for multiple collections at once
  getAllCollectionsInfo: publicProcedure
    .input(z.object({ contractAddresses: z.array(z.string()) }))
    .query(async ({ input }) => {
      const { contractAddresses } = input;

      if (!contractAddresses || contractAddresses.length === 0) {
        // console.log('No contract addresses provided to getAllCollectionsInfo');
        return [];
      }

      try {
        // console.log(`Fetching info for ${contractAddresses.length} collections`);

        // Fetch basic info for each collection in parallel
        const collectionsInfo = await Promise.all(
          contractAddresses.map(async (address) => {
            try {
              // console.log(`Fetching info for collection: ${address}`);

              // Read collection name
              const name = await publicClient.readContract({
                address: address as `0x${string}`,
                abi: NFT_COLLECTION_ABI,
                functionName: 'name',
              });

              // Read collection symbol
              const symbol = await publicClient.readContract({
                address: address as `0x${string}`,
                abi: NFT_COLLECTION_ABI,
                functionName: 'symbol',
              });

              // Get contract URI for metadata
              const contractURI = await publicClient.readContract({
                address: address as `0x${string}`,
                abi: NFT_COLLECTION_ABI,
                functionName: 'contractURI',
              });

              const result = {
                contractAddress: address,
                name: name as string,
                symbol: symbol as string,
                contractURI: contractURI as string,
              };

              // console.log(`Successfully fetched collection info for ${address}: ${name}`);
              return result;
            } catch (error) {
              console.error(`Error fetching info for collection ${address}:`, error);
              return {
                contractAddress: address,
                name: 'Unknown Collection',
                symbol: 'UNK',
                contractURI: '',
              };
            }
          }),
        );

        // console.log(`Successfully fetched info for ${collectionsInfo.length} collections`);
        return collectionsInfo;
      } catch (error) {
        console.error('Error fetching collections info:', error);
        return [];
      }
    }),
});

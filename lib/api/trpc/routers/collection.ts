import { z } from 'zod';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import {
  fetchCreatorCollectionsBasic,
  fetchCollectionOwner,
  isCollectionValid,
} from '@/lib/blockchain/utils/collection';
import { ipfsToHttp } from '@/lib/blockchain/utils/collection';
import { publicClient } from '@/lib/blockchain/viem';
import { NFT_COLLECTION_ABI } from '@/lib/blockchain/abi';

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
            console.log(`Fetching metadata from: ${httpUrl}`);

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
        console.log(`Fetching metadata from: ${httpUrl}`);

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
});

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import { revalidatePath } from 'next/cache';
import {
  fetchCreatorCollections,
  fetchCreatorCollectionsBasic,
  fetchCollectionOwner,
  isCollectionValid,
} from '@/lib/blockchain/utils/collection';
import { ipfsToHttp } from '@/lib/blockchain/utils/collection';

export const collectionRouter = router({
  getAll: publicProcedure.query(async () => {
    return prisma.collection.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            address: true,
            createdAt: true,
            updatedAt: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
          },
        },
      },
    });
  }),

  getByOwner: publicProcedure
    .input(z.object({ ownerAddress: z.string() }))
    .query(async ({ input }) => {
      const { ownerAddress } = input;

      if (!ownerAddress) {
        return [];
      }

      return prisma.collection.findMany({
        where: {
          ownerAddress,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              address: true,
              createdAt: true,
              updatedAt: true,
              name: true,
              email: true,
              emailVerified: true,
              image: true,
            },
          },
        },
      });
    }),

  getByContractAddress: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { contractAddress } = input;
      return prisma.collection.findUnique({
        where: { contractAddress },
        include: {
          owner: {
            select: {
              id: true,
              address: true,
              createdAt: true,
              updatedAt: true,
              name: true,
              email: true,
              emailVerified: true,
              image: true,
            },
          },
        },
      });
    }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const { id } = input;
    return prisma.collection.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            address: true,
            createdAt: true,
            updatedAt: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
          },
        },
      },
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        symbol: z.string().optional(),
        description: z.string().optional(),
        contractURI: z.string().optional(),
        contractAddress: z.string(),
        ownerAddress: z.string(),
        pinataGroupId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Check if collection already exists
      const existingCollection = await prisma.collection.findUnique({
        where: { contractAddress: input.contractAddress },
      });

      if (existingCollection) {
        return existingCollection;
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { address: input.ownerAddress },
      });

      // Create user if it doesn't exist
      if (!user) {
        user = await prisma.user.create({
          data: {
            address: input.ownerAddress,
            name: `User-${input.ownerAddress.substring(0, 8)}`,
          },
        });
        console.log(`Created new user with address: ${input.ownerAddress}`);
      }

      // Create new collection
      const newCollection = await prisma.collection.create({
        data: input,
        include: {
          owner: {
            select: {
              id: true,
              address: true,
              createdAt: true,
              updatedAt: true,
              name: true,
              email: true,
              emailVerified: true,
              image: true,
            },
          },
        },
      });

      // Revalidate the collections page to show the new collection immediately
      revalidatePath('/collections');

      return newCollection;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        symbol: z.string().optional(),
        description: z.string().optional(),
        contractURI: z.string().optional(),
        ownerAddress: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      return prisma.collection.update({
        where: { id },
        data,
        include: {
          owner: {
            select: {
              id: true,
              address: true,
              createdAt: true,
              updatedAt: true,
              name: true,
              email: true,
              emailVerified: true,
              image: true,
            },
          },
        },
      });
    }),

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
});

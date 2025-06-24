import { z } from 'zod';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import { prisma } from '@/lib/db';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { NFT_COLLECTION_ABI } from '@/lib/blockchain/abi';

// Create a public client for blockchain interactions
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export const nftRouter = router({
  getAll: publicProcedure.query(async () => {
    return prisma.nFT.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            address: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }),

  getByTokenId: publicProcedure
    .input(z.object({ tokenId: z.string(), contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { tokenId, contractAddress } = input;
      return prisma.nFT.findUnique({
        where: {
          tokenId_contractAddress: {
            tokenId,
            contractAddress,
          },
        },
        include: {
          owner: {
            select: {
              id: true,
              address: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }),

  getCollectionOwner: publicProcedure
    .input(z.object({ collectionAddress: z.string() }))
    .query(async ({ input }) => {
      const { collectionAddress } = input;

      try {
        // Call the owner() function on the NFTCollection contract
        const owner = await publicClient.readContract({
          address: collectionAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'owner',
        });

        return { owner };
      } catch (error) {
        console.error(`Error getting owner of collection ${collectionAddress}:`, error);
        return { owner: null, error: 'Failed to get collection owner' };
      }
    }),

  getByCollectionAddress: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { contractAddress } = input;
      return prisma.nFT.findMany({
        where: { contractAddress },
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              address: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }),

  getByOwnerAddress: publicProcedure
    .input(z.object({ ownerAddress: z.string() }))
    .query(async ({ input }) => {
      const { ownerAddress } = input;
      return prisma.nFT.findMany({
        where: { ownerAddress },
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              address: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        tokenId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        metadataUrl: z.string(),
        imageUrl: z.string(),
        contractAddress: z.string(),
        ownerAddress: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // Check if NFT already exists
      const existingNFT = await prisma.nFT.findUnique({
        where: {
          tokenId_contractAddress: {
            tokenId: input.tokenId,
            contractAddress: input.contractAddress,
          },
        },
      });

      if (existingNFT) {
        return existingNFT;
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

      // Create new NFT
      return prisma.nFT.create({
        data: input,
        include: {
          owner: {
            select: {
              id: true,
              address: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }),

  transferNFT: publicProcedure
    .input(
      z.object({
        tokenId: z.string(),
        contractAddress: z.string(),
        newOwnerAddress: z.string(),
        transferType: z.string().optional(), // Transfer type (e.g., "Transfer", "Mint")
        timestamp: z.string().optional(), // Timestamp of the transfer
      }),
    )
    .mutation(async ({ input }) => {
      const { tokenId, contractAddress, newOwnerAddress, transferType, timestamp } = input;

      // Find the current NFT to get the current owner
      const currentNFT = await prisma.nFT.findUnique({
        where: {
          tokenId_contractAddress: {
            tokenId,
            contractAddress,
          },
        },
      });

      if (!currentNFT) {
        throw new Error(`NFT with tokenId ${tokenId} not found`);
      }

      // Check if new owner exists
      let newOwner = await prisma.user.findUnique({
        where: { address: newOwnerAddress },
      });

      // Create new owner if it doesn't exist
      if (!newOwner) {
        newOwner = await prisma.user.create({
          data: {
            address: newOwnerAddress,
            name: `User-${newOwnerAddress.substring(0, 8)}`,
          },
        });
      }

      // Update NFT ownership
      return prisma.nFT.update({
        where: {
          tokenId_contractAddress: {
            tokenId,
            contractAddress,
          },
        },
        data: {
          ownerAddress: newOwnerAddress,
        },
      });
    }),
});

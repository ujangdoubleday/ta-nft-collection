import { z } from 'zod';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import { prisma } from '@/lib/db';

export const nftRouter = router({
  getAll: publicProcedure.query(async () => {
    return prisma.nFT.findMany({
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
      return prisma.nFT.findMany({
        where: { ownerAddress },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getByContractAddress: publicProcedure
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
            },
          },
        },
      });
    }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const { id } = input;
    return prisma.nFT.findUnique({
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

  getByTokenId: publicProcedure
    .input(
      z.object({
        tokenId: z.string(),
        contractAddress: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { tokenId, contractAddress } = input;
      return prisma.nFT.findFirst({
        where: {
          tokenId,
          contractAddress,
        },
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
        tokenId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        imageUrl: z.string(),
        contractAddress: z.string(),
        ownerAddress: z.string(),
        price: z.number().optional(),
        listed: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      // Create new NFT
      return prisma.nFT.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        price: z.number().optional(),
        listed: z.boolean().optional(),
        ownerAddress: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      return prisma.nFT.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const { id } = input;

    return prisma.nFT.delete({
      where: { id },
    });
  }),
});

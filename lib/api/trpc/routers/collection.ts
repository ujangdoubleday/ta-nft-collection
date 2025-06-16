import { z } from 'zod';
import { prisma } from '@/lib/db';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import { revalidatePath } from 'next/cache';

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
});

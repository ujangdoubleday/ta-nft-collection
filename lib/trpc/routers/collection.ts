import { z } from 'zod';
import { prisma } from '../../db';
import { publicProcedure, router } from '../server';

export const collectionRouter = router({
  getAll: publicProcedure.query(async () => {
    return prisma.collection.findMany({
      orderBy: { createdAt: 'desc' },
      include: { owner: true },
    });
  }),

  getByContractAddress: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { contractAddress } = input;
      return prisma.collection.findUnique({
        where: { contractAddress },
        include: { owner: true },
      });
    }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const { id } = input;
    return prisma.collection.findUnique({
      where: { id },
      include: { owner: true },
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        contractURI: z.string().optional(),
        contractAddress: z.string(),
        ownerAddress: z.string(),
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

      // Create new collection
      return prisma.collection.create({
        data: input,
        include: { owner: true },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
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
        include: { owner: true },
      });
    }),
});

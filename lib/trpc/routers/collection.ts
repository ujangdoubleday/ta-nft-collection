import { z } from "zod";
import { publicProcedure, router } from "../server";
import { prisma } from "../../db";

export const collectionRouter = router({
  getAll: publicProcedure.query(async () => {
    return prisma.collection.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getByContractAddress: publicProcedure
    .input(z.object({ contractAddress: z.string() }))
    .query(async ({ input }) => {
      const { contractAddress } = input;
      return prisma.collection.findUnique({
        where: { contractAddress },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { id } = input;
      return prisma.collection.findUnique({
        where: { id },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        contractAddress: z.string(),
      })
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
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      return prisma.collection.update({
        where: { id },
        data,
      });
    }),
});

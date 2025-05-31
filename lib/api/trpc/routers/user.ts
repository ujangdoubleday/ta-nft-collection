import { z } from 'zod';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import { prisma } from '@/lib/db';

export const userRouter = router({
  getByAddress: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      const { address } = input;
      const user = await prisma.user.findUnique({
        where: { address },
        include: { nfts: true },
      });
      return user;
    }),

  create: publicProcedure
    .input(
      z.object({
        address: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { address } = input;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { address },
      });

      if (existingUser) {
        return existingUser;
      }

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          address,
        },
      });

      return newUser;
    }),

  update: publicProcedure
    .input(
      z.object({
        address: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { address } = input;

      const updatedUser = await prisma.user.update({
        where: { address },
        data: {},
      });

      return updatedUser;
    }),
});

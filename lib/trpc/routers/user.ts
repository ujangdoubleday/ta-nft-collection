import { z } from "zod";
import { publicProcedure, router } from "../server";
import { prisma } from "../../db";

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
        username: z.string().optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { address, username, bio, avatarUrl } = input;

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
          username,
          bio,
          avatarUrl,
        },
      });

      return newUser;
    }),

  update: publicProcedure
    .input(
      z.object({
        address: z.string(),
        username: z.string().optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { address, username, bio, avatarUrl } = input;

      const updatedUser = await prisma.user.update({
        where: { address },
        data: {
          username,
          bio,
          avatarUrl,
        },
      });

      return updatedUser;
    }),
});

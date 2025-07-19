import { z } from 'zod';
import { publicProcedure, router } from '../server';
import { userRedis } from '@/lib/api/services/redis/user';

export const userRouter = router({
  setUsername: publicProcedure
    .input(
      z.object({
        address: z.string(),
        username: z.string().min(3).max(20),
      }),
    )
    .mutation(async ({ input }) => {
      const { address, username } = input;
      const success = await userRedis.setUsername(address, username);
      return { success };
    }),

  getUsername: publicProcedure
    .input(
      z.object({
        address: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { address } = input;
      const username = await userRedis.getUsername(address);
      return { username };
    }),
});

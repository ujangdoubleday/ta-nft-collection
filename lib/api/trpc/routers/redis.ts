import { z } from 'zod';
import { publicProcedure, router } from '../server';
import { getData, setData, deleteData } from '@/lib/api/services/redis';

export const redisRouter = router({
  set: publicProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.any(),
        expireInSeconds: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { key, value, expireInSeconds } = input;
      return await setData(key, value, expireInSeconds);
    }),

  get: publicProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { key } = input;
      return await getData(key);
    }),

  delete: publicProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { key } = input;
      return await deleteData(key);
    }),
});

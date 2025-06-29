import { z } from 'zod';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import { NFT_FACTORY_ABI } from '@/lib/blockchain/abi';
import { publicClient } from '@/lib/blockchain/viem';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';

export const blocklistRouter = router({
  // Get all blocklisted addresses
  getBlocklist: publicProcedure.query(async () => {
    try {
      const blocklist = await publicClient.readContract({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'getBlocklist',
      });

      return blocklist as `0x${string}`[];
    } catch (error) {
      console.error('Error getting blocklist:', error);
      return [];
    }
  }),

  // Check if address is blocklisted
  isBlocklisted: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      try {
        const blocklist = (await publicClient.readContract({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'getBlocklist',
        })) as `0x${string}`[];

        // Check if address is in blocklist (case-insensitive)
        return blocklist.some((addr) => addr.toLowerCase() === input.address.toLowerCase());
      } catch (error) {
        console.error('Error checking if address is blocklisted:', error);
        return false;
      }
    }),
});

import { z } from 'zod';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import { NFT_FACTORY_ABI } from '@/lib/blockchain/abi';
import { publicClient } from '@/lib/blockchain/viem';
import { formatEther } from 'viem';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';

export const factoryConfigRouter = router({
  // Get creation fee
  getCreationFee: publicProcedure.query(async () => {
    try {
      const creationFee = await publicClient.readContract({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'creationFee',
      });

      return {
        fee: formatEther(creationFee as bigint),
        rawFee: creationFee as bigint,
      };
    } catch (error) {
      console.error('Error getting creation fee:', error);
      return {
        fee: '0',
        rawFee: BigInt(0),
      };
    }
  }),

  // Check if address is admin
  isAdmin: publicProcedure.input(z.object({ address: z.string() })).query(async ({ input }) => {
    try {
      const isAdmin = await publicClient.readContract({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'isAdmin',
        args: [input.address as `0x${string}`],
      });

      return isAdmin as boolean;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }),

  // Check if address is owner
  isOwner: publicProcedure.input(z.object({ address: z.string() })).query(async ({ input }) => {
    try {
      const owner = await publicClient.readContract({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'owner',
      });

      const isOwner =
        owner && input.address
          ? (owner as string).toLowerCase() === input.address.toLowerCase()
          : false;

      return isOwner;
    } catch (error) {
      console.error('Error checking owner status:', error);
      return false;
    }
  }),
});

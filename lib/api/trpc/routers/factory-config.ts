import { z } from 'zod';
import { publicProcedure, router } from '@/lib/api/trpc/server';
import { NFT_FACTORY_ABI } from '@/lib/blockchain/abi';
import { publicClient } from '@/lib/blockchain/viem';
import { formatEther } from 'viem';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';
import { checkContractPaused, getContractBalance } from '@/lib/blockchain/utils/alchemy';

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

  // Get factory owner address
  getFactoryOwner: publicProcedure.query(async () => {
    try {
      const owner = await publicClient.readContract({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'owner',
      });

      return owner as string;
    } catch (error) {
      console.error('Error getting factory owner:', error);
      return null;
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

  // Check if contract is paused
  isPaused: publicProcedure.query(async () => {
    try {
      const isPaused = await checkContractPaused();
      return isPaused;
    } catch (error) {
      console.error('Error checking if contract is paused:', error);
      return false;
    }
  }),

  // Get contract balance
  getContractBalance: publicProcedure.query(async () => {
    try {
      const balance = await getContractBalance();
      return balance;
    } catch (error) {
      console.error('Error getting contract balance:', error);
      return 0;
    }
  }),

  // Get total fees collected
  getTotalFeesCollected: publicProcedure.query(async () => {
    try {
      const totalFeesCollected = await publicClient.readContract({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'totalFeesCollected',
      });

      return {
        total: formatEther(totalFeesCollected as bigint),
        rawTotal: totalFeesCollected as bigint,
      };
    } catch (error) {
      console.error('Error getting total fees collected:', error);
      return {
        total: '0',
        rawTotal: BigInt(0),
      };
    }
  }),

  // Get all collections
  getAllCollections: publicProcedure.query(async () => {
    try {
      const collections = await publicClient.readContract({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'getAllCollections',
      });

      return collections as string[];
    } catch (error) {
      console.error('Error getting all collections:', error);
      return [];
    }
  }),
});

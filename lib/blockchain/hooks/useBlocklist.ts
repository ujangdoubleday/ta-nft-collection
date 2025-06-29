'use client';

import { useState, useCallback, useEffect } from 'react';
import { useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { NFT_FACTORY_ABI } from '../abi';
import { trpc } from '@/lib/api/trpc/client';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';

export const useBlocklist = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  // Read blocklist using tRPC
  const {
    data: blocklist,
    isLoading: isLoadingBlocklist,
    refetch: refetchBlocklist,
  } = trpc.blocklist.getBlocklist.useQuery();

  // Watch transaction receipt
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Refetch when transaction is confirmed
  useEffect(() => {
    if (isSuccess && txHash) {
      refetchBlocklist();
    }
  }, [isSuccess, txHash, refetchBlocklist]);

  // Write contract function
  const { writeContractAsync } = useContractWrite();

  // Add address to blocklist
  const addToBlocklist = useCallback(
    async (address: string) => {
      setIsUpdating(true);
      setError(null);

      try {
        // Write to contract
        const hash = await writeContractAsync({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'addToBlocklist',
          args: [address as `0x${string}`],
        });

        // Set transaction hash
        setTxHash(hash);
        return hash;
      } catch (err) {
        console.error('Error adding to blocklist:', err);
        setError(err instanceof Error ? err : new Error('Failed to add to blocklist'));
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [writeContractAsync],
  );

  // Remove address from blocklist
  const removeFromBlocklist = useCallback(
    async (address: string) => {
      setIsUpdating(true);
      setError(null);

      try {
        // Write to contract
        const hash = await writeContractAsync({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'removeFromBlocklist',
          args: [address as `0x${string}`],
        });

        // Set transaction hash
        setTxHash(hash);
        return hash;
      } catch (err) {
        console.error('Error removing from blocklist:', err);
        setError(err instanceof Error ? err : new Error('Failed to remove from blocklist'));
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [writeContractAsync],
  );

  return {
    blocklist,
    isLoadingBlocklist,
    isUpdating: isUpdating || isConfirming,
    addToBlocklist,
    removeFromBlocklist,
    error,
    transactionHash: txHash,
  };
};

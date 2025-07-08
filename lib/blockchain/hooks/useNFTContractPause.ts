import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { trpc } from '@/lib/api/trpc/client';

// Import ABIs from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_FACTORY_ABI from '../abi/NFTFactory.json';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';

/**
 * Hook for pausing the NFT Factory contract (owner only)
 */
export function usePauseContract() {
  const [error, setError] = useState<Error | null>(null);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();

  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const pauseContract = useCallback(async () => {
    try {
      setError(null);

      // Use writeContractAsync which returns a transaction hash directly
      const hash = await writeContractAsync({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'pause',
        args: [],
        chainId: sepolia.id,
      });

      console.log('Pause transaction submitted:', hash);
      setTransactionHash(hash);
      return { hash };
    } catch (err) {
      console.error('Pause failed:', err);
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      return { error };
    }
  }, [writeContractAsync]);

  return {
    pauseContract,
    isLoading: isPending || isWaitingForReceipt,
    error,
    transactionHash,
  };
}

/**
 * Hook for unpausing the NFT Factory contract (owner only)
 */
export function useUnpauseContract() {
  const [error, setError] = useState<Error | null>(null);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();

  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const unpauseContract = useCallback(async () => {
    try {
      setError(null);

      // Use writeContractAsync which returns a transaction hash directly
      const hash = await writeContractAsync({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'unpause',
        args: [],
        chainId: sepolia.id,
      });

      console.log('Unpause transaction submitted:', hash);
      setTransactionHash(hash);
      return { hash };
    } catch (err) {
      console.error('Unpause failed:', err);
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      return { error };
    }
  }, [writeContractAsync]);

  return {
    unpauseContract,
    isLoading: isPending || isWaitingForReceipt,
    error,
    transactionHash,
  };
}

/**
 * Hook to check if the NFT Factory contract is paused using tRPC
 */
export function useIsPaused() {
  // Menggunakan tRPC yang sudah ada untuk mendapatkan status pause
  const { data: isPaused, isLoading, error, refetch } = trpc.factoryConfig.isPaused.useQuery();

  return {
    isPaused: !!isPaused,
    isLoading,
    error,
    refetch,
  };
}

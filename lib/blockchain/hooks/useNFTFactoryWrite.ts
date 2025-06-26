import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sepolia } from 'wagmi/chains';

// Import ABIs from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_FACTORY_ABI from '../abi/NFTFactory.json';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';

/**
 * Hook for creating a new NFT collection
 */
export function useCreateCollection() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const createCollection = useCallback(
    async (name: string, symbol: string, contractURI: string, totalSupply: bigint) => {
      try {
        setError(null);

        // Validate inputs
        if (!name) throw new Error('Collection name is required');
        if (!symbol) throw new Error('Collection symbol is required');
        if (!contractURI) throw new Error('Collection URI is required');
        if (totalSupply <= BigInt(0)) throw new Error('Total supply must be greater than 0');

        const hash = await writeContractAsync({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'createCollection',
          args: [name, symbol, contractURI, totalSupply],
          chainId: sepolia.id,
        });

        return { hash };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        return { error };
      }
    },
    [writeContractAsync],
  );

  return {
    createCollection,
    isLoading: isPending || isWaitingForReceipt,
    error,
  };
}

/**
 * Hook for setting the creation fee (owner only)
 */
export function useSetCreationFee() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();

  const setCreationFee = useCallback(
    async (newFee: bigint) => {
      try {
        setError(null);

        const hash = await writeContractAsync({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'setCreationFee',
          args: [newFee],
          chainId: sepolia.id,
        });

        return { hash };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        return { error };
      }
    },
    [writeContractAsync],
  );

  return {
    setCreationFee,
    isLoading: isPending,
    error,
  };
}

/**
 * Hook for withdrawing fees (owner only)
 */
export function useWithdrawFees() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();

  const withdrawFees = useCallback(
    async (to: `0x${string}`, amount: bigint) => {
      try {
        setError(null);

        const hash = await writeContractAsync({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'withdrawFees',
          args: [to, amount],
          chainId: sepolia.id,
        });

        return { hash };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        return { error };
      }
    },
    [writeContractAsync],
  );

  return {
    withdrawFees,
    isLoading: isPending,
    error,
  };
}

/**
 * Hook for emergency withdrawal (owner only)
 */
export function useEmergencyWithdraw() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();

  const emergencyWithdraw = useCallback(
    async (to: `0x${string}`) => {
      try {
        setError(null);

        const hash = await writeContractAsync({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'emergencyWithdraw',
          args: [to],
          chainId: sepolia.id,
        });

        return { hash };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        return { error };
      }
    },
    [writeContractAsync],
  );

  return {
    emergencyWithdraw,
    isLoading: isPending,
    error,
  };
}

/**
 * Hook for pausing the contract (owner only)
 */
export function usePauseContract() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();

  const pauseContract = useCallback(async () => {
    try {
      setError(null);

      const hash = await writeContractAsync({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'pause',
        args: [],
        chainId: sepolia.id,
      });

      return { hash };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      return { error };
    }
  }, [writeContractAsync]);

  return {
    pauseContract,
    isLoading: isPending,
    error,
  };
}

/**
 * Hook for unpausing the contract (owner only)
 */
export function useUnpauseContract() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();

  const unpauseContract = useCallback(async () => {
    try {
      setError(null);

      const hash = await writeContractAsync({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'unpause',
        args: [],
        chainId: sepolia.id,
      });

      return { hash };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      return { error };
    }
  }, [writeContractAsync]);

  return {
    unpauseContract,
    isLoading: isPending,
    error,
  };
}

/**
 * Hook for transferring ownership of the contract (owner only)
 */
export function useTransferOwnership() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();

  const transferOwnership = useCallback(
    async (newOwner: `0x${string}`) => {
      try {
        setError(null);

        const hash = await writeContractAsync({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'transferOwnership',
          args: [newOwner],
          chainId: sepolia.id,
        });

        return { hash };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        return { error };
      }
    },
    [writeContractAsync],
  );

  return {
    transferOwnership,
    isLoading: isPending,
    error,
  };
}

/**
 * Hook for renouncing ownership of the contract (owner only)
 */
export function useRenounceOwnership() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();

  const renounceOwnership = useCallback(async () => {
    try {
      setError(null);

      const hash = await writeContractAsync({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'renounceOwnership',
        args: [],
        chainId: sepolia.id,
      });

      return { hash };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      return { error };
    }
  }, [writeContractAsync]);

  return {
    renounceOwnership,
    isLoading: isPending,
    error,
  };
}

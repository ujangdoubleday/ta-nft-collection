import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sepolia } from 'wagmi/chains';

// Import ABIs from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_FACTORY_ABI from '../abi/NFTFactory.json';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';

export interface UseNFTFactoryReturn {
  createCollection: (
    name: string,
    symbol: string,
    collectionURI: string,
    totalSupply?: bigint,
  ) => Promise<{
    hash?: `0x${string}`;
    collectionAddress?: `0x${string}`;
    error?: Error;
  }>;
  isLoading: boolean;
  error: Error | null;
}

export function useNFTFactory(): UseNFTFactoryReturn {
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync, isPending: isCreateLoading } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const createCollection = useCallback(
    async (
      name: string,
      symbol: string,
      collectionURI: string,
      totalSupply: bigint = BigInt(100),
    ) => {
      try {
        setError(null);

        // Validate inputs
        if (!name) throw new Error('Collection name is required');
        if (!symbol) throw new Error('Collection symbol is required');
        if (!collectionURI) throw new Error('Collection URI is required');

        const hash = await writeContractAsync({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'createCollection',
          args: [name, symbol, collectionURI, totalSupply],
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
    isLoading: isCreateLoading || isWaitingForReceipt,
    error,
  };
}

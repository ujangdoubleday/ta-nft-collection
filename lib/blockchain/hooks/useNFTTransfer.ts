'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useNFTCollectionEvents } from './useNFTCollectionEvents';

// Import the full ABI from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_COLLECTION_ABI from '../abi/NFTCollection.json';

export interface UseNFTTransferReturn {
  transferNFT: (
    contractAddress: string,
    from: string, // current owner
    to: string, // new owner
    tokenId: string,
  ) => Promise<{
    hash?: `0x${string}`;
    error?: Error;
  }>;
  isLoading: boolean;
  isSuccess: boolean;
  isWaiting: boolean;
  error: Error | null;
  transactionHash: `0x${string}` | undefined;
  transferEvents: Array<{
    from: string;
    to: string;
    tokenId: string;
  }>;
  reset: () => void;
}

export function useNFTTransfer(): UseNFTTransferReturn {
  const [error, setError] = useState<Error | null>(null);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [currentContractAddress, setCurrentContractAddress] = useState<string | undefined>();

  // Track contract writes and transaction receipts
  const { writeContractAsync, isPending: isTransferLoading, isSuccess } = useWriteContract();

  const { data: receipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  // Watch for transfer events from the contract
  const { transferEvents, loading: isLoadingEvents } = useNFTCollectionEvents(
    currentContractAddress,
    transactionHash,
  );

  // Reset function to clear state
  const reset = () => {
    setError(null);
    setTransactionHash(undefined);
    setCurrentContractAddress(undefined);
  };

  const transferNFT = async (
    contractAddress: string,
    from: string,
    to: string,
    tokenId: string,
  ) => {
    try {
      // Convert tokenId to BigInt for the contract call
      const tokenIdBigInt = BigInt(tokenId);

      // Reset previous errors
      setError(null);

      // Update contract address to watch events
      setCurrentContractAddress(contractAddress);

      // Make the contract write call using safeTransferFrom instead of transferFrom
      const hash = await writeContractAsync({
        abi: NFT_COLLECTION_ABI,
        address: contractAddress as `0x${string}`,
        functionName: 'safeTransferFrom',
        args: [from, to, tokenIdBigInt],
        chainId: sepolia.id,
      });

      // Set transaction hash to track
      setTransactionHash(hash);

      return { hash };
    } catch (err) {
      console.error('Error transferring NFT:', err);
      const transferError = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(transferError);
      return { error: transferError };
    }
  };

  return {
    transferNFT,
    isLoading: isTransferLoading,
    isWaiting: isWaitingForReceipt,
    isSuccess,
    error,
    transactionHash,
    transferEvents,
    reset,
  };
}

import { useCallback, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sepolia } from 'wagmi/chains';

// Import ABIs from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_COLLECTION_ABI from '../abi/NFTCollection.json';

/**
 * Hook for minting a new NFT in a collection
 */
export function useMintNFT() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const mintNFT = useCallback(
    async (collectionAddress: string, recipient: string, tokenURI: string) => {
      try {
        setError(null);

        // Validate inputs
        if (!collectionAddress) throw new Error('Collection address is required');
        if (!recipient) throw new Error('Recipient address is required');
        if (!tokenURI) throw new Error('Token URI is required');

        const hash = await writeContractAsync({
          address: collectionAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'mintArtwork',
          args: [recipient, tokenURI],
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
    mintNFT,
    isLoading: isPending || isWaitingForReceipt,
    error,
  };
}

/**
 * Hook for batch minting multiple NFTs in a collection
 */
export function useBatchMint() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const batchMint = useCallback(
    async (collectionAddress: string, recipient: string, quantity: bigint) => {
      try {
        setError(null);

        // Validate inputs
        if (!collectionAddress) throw new Error('Collection address is required');
        if (!recipient) throw new Error('Recipient address is required');
        if (quantity <= BigInt(0)) throw new Error('Quantity must be greater than 0');

        const hash = await writeContractAsync({
          address: collectionAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'batchMint',
          args: [recipient, quantity],
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
    batchMint,
    isLoading: isPending || isWaitingForReceipt,
    error,
  };
}

/**
 * Hook for setting the base URI for a collection
 */
export function useSetBaseURI() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const setBaseURI = useCallback(
    async (collectionAddress: string, baseURI: string) => {
      try {
        setError(null);

        // Validate inputs
        if (!collectionAddress) throw new Error('Collection address is required');
        if (!baseURI) throw new Error('Base URI is required');

        const hash = await writeContractAsync({
          address: collectionAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'setBaseURI',
          args: [baseURI],
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
    setBaseURI,
    isLoading: isPending || isWaitingForReceipt,
    error,
  };
}

/**
 * Hook for setting the contract URI for a collection
 */
export function useSetContractURI() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const setContractURI = useCallback(
    async (collectionAddress: string, contractURI: string) => {
      try {
        setError(null);

        // Validate inputs
        if (!collectionAddress) throw new Error('Collection address is required');
        if (!contractURI) throw new Error('Contract URI is required');

        const hash = await writeContractAsync({
          address: collectionAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'setContractURI',
          args: [contractURI],
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
    setContractURI,
    isLoading: isPending || isWaitingForReceipt,
    error,
  };
}

/**
 * Hook for transferring ownership of a collection
 */
export function useTransferOwnership() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const transferOwnership = useCallback(
    async (collectionAddress: string, newOwner: string) => {
      try {
        setError(null);

        // Validate inputs
        if (!collectionAddress) throw new Error('Collection address is required');
        if (!newOwner) throw new Error('New owner address is required');

        const hash = await writeContractAsync({
          address: collectionAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
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
    isLoading: isPending || isWaitingForReceipt,
    error,
  };
}

/**
 * Hook for renouncing ownership of a collection
 */
export function useRenounceOwnership() {
  const [error, setError] = useState<Error | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: undefined,
  });

  const renounceOwnership = useCallback(
    async (collectionAddress: string) => {
      try {
        setError(null);

        // Validate inputs
        if (!collectionAddress) throw new Error('Collection address is required');

        const hash = await writeContractAsync({
          address: collectionAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'renounceOwnership',
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
    renounceOwnership,
    isLoading: isPending || isWaitingForReceipt,
    error,
  };
}

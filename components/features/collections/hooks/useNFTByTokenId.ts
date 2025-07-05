'use client';

import { trpc } from '@/lib/api/trpc/client';

/**
 * Hook to fetch NFT by token ID and contract address directly from the blockchain
 * @param tokenId The token ID of the NFT
 * @param contractAddress The contract address of the collection
 * @returns The NFT data, loading state, and error
 */
export function useNFTByTokenId(tokenId: string, contractAddress: string) {
  const { data, isLoading, error, refetch } = trpc.nft.getByTokenId.useQuery(
    { tokenId, contractAddress },
    {
      enabled: !!tokenId && !!contractAddress,
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Retry failed queries
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      // Cache for 2 minutes (reduced since blockchain data can change)
      staleTime: 2 * 60 * 1000,
    },
  );

  return {
    nft: data,
    isLoading,
    error,
    refetch,
  };
}

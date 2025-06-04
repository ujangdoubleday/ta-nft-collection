'use client';

import { trpc } from '@/lib/api/trpc/client';

/**
 * Hook to fetch NFT by token ID and contract address
 * @param tokenId The token ID of the NFT
 * @param contractAddress The contract address of the collection
 * @returns The NFT data, loading state, and error
 */
export function useNFTByTokenId(tokenId: string, contractAddress: string) {
  const { data, isLoading, error } = trpc.nft.getByTokenId.useQuery(
    { tokenId, contractAddress },
    {
      enabled: !!tokenId && !!contractAddress,
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep cached data for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Use a consistent cache key
      queryKey: ['nft', contractAddress, tokenId],
    },
  );

  return {
    nft: data,
    isLoading,
    error,
  };
}

'use client';

import { trpc } from '@/lib/api/trpc/client';

/**
 * Hook to fetch NFTs by contract address
 * @param contractAddress The contract address of the collection
 * @returns The NFTs data, loading state, and error
 */
export function useNFTsByContractAddress(contractAddress: string) {
  const { data, isLoading, error } = trpc.nft.getByCollectionAddress.useQuery(
    { contractAddress },
    {
      enabled: !!contractAddress,
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep cached data for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Use a consistent cache key
      queryKey: ['nfts', contractAddress],
    },
  );

  return {
    nfts: data || [],
    isLoading,
    error,
  };
}

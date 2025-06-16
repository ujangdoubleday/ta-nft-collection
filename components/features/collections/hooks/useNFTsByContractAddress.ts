'use client';

import { trpc } from '@/lib/api/trpc/client';

/**
 * Hook to fetch NFTs by contract address
 * @param contractAddress The contract address of the collection
 * @returns The NFTs data, loading state, error, and refetch function
 */
export function useNFTsByContractAddress(contractAddress: string) {
  const { data, isLoading, error, refetch } = trpc.nft.getByCollectionAddress.useQuery(
    { contractAddress },
    {
      enabled: !!contractAddress,
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
    },
  );

  return {
    nfts: data || [],
    isLoading,
    error,
    refetch, // Expose refetch function to allow manual refresh
  };
}

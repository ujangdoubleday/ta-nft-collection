'use client';

import { trpc } from '@/lib/api/trpc/client';

/**
 * Hook to fetch NFTs by contract address
 * @param contractAddress The contract address of the collection
 * @returns The NFTs data, loading state, and error
 */
export function useNFTsByContractAddress(contractAddress: string) {
  const { data, isLoading, error } = trpc.nft.getByContractAddress.useQuery(
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
  };
}

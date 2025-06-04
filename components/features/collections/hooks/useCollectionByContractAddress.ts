'use client';

import { trpc } from '@/lib/api/trpc/client';

/**
 * Hook to fetch collection data by contract address
 * @param contractAddress The contract address of the collection (used as the slug in the URL)
 * @returns The collection data, loading state, and error
 */
export function useCollectionByContractAddress(contractAddress: string) {
  const { data, isLoading, error } = trpc.collection.getByContractAddress.useQuery(
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
      queryKey: ['collection', contractAddress],
    },
  );

  return {
    collection: data,
    isLoading,
    error,
  };
}

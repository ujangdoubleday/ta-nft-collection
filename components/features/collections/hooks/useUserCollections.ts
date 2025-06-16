'use client';

import { trpc } from '@/lib/api/trpc/client';
import { useWallet } from '@/lib/hooks/wallet';

/**
 * Hook to fetch collections created by the currently connected wallet
 * @returns The user's collections data, loading state, and error
 */
export function useUserCollections() {
  const { address } = useWallet();

  const { data, isLoading, error } = trpc.collection.getByOwner.useQuery(
    { ownerAddress: address || '' },
    {
      // Only run the query if we have an address
      enabled: !!address,
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Disable cache completely
      staleTime: 0,
      // Don't cache between renders
      gcTime: 0,
      // Always refetch when component mounts
      refetchOnMount: 'always',
    },
  );

  return {
    collections: data || [],
    isLoading,
    error,
  };
}

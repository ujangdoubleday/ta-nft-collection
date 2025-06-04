'use client';

import { trpc } from '@/lib/api/trpc/client';

/**
 * Hook to fetch all collections from the database
 * @returns The collections data, loading state, and error
 */
export function useAllCollections() {
  const { data, isLoading, error } = trpc.collection.getAll.useQuery(undefined, {
    // Don't refetch on window focus for better UX
    refetchOnWindowFocus: false,
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep cached data for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Use a consistent cache key
    queryKey: ['collections', 'all'],
  });

  return {
    collections: data || [],
    isLoading,
    error,
  };
}

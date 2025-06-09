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
    // Disable cache completely
    staleTime: 0,
    // Don't cache between renders
    gcTime: 0,
    // Always refetch when component mounts
    refetchOnMount: 'always',
  });

  return {
    collections: data || [],
    isLoading,
    error,
  };
}

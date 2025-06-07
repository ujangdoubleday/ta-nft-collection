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
    // Refresh cache every minute
    staleTime: 60 * 1000, // 60 seconds
    // Force garbage collection after 60 seconds
    gcTime: 60 * 1000, // 60 seconds
    // Always refetch when component mounts
    refetchOnMount: true,
  });

  return {
    collections: data || [],
    isLoading,
    error,
  };
}

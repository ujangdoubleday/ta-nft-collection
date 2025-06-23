'use client';

import { trpc } from '@/lib/api/trpc/client';

/**
 * Hook to fetch all collections from the database
 * Collections are automatically sorted by createdAt in descending order (newest first)
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
    collections: data || [], // Collections are already sorted by createdAt desc from the API
    isLoading,
    error,
  };
}

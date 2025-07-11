'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/api/trpc/client';
import { useAddress } from '@/lib/hooks/use-address';

/**
 * Hook to fetch collections created by the current user
 */
export function useUserCollections() {
  const { data: address } = useAddress();
  const [mounted, setMounted] = useState(false);

  // Fetch collections created by the current address using tRPC
  const {
    data: collections = [],
    isLoading,
    error,
    refetch,
  } = trpc.collection.getCreatorCollections.useQuery(
    {
      creatorAddress: address || '',
    },
    {
      enabled: !!address && mounted,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );

  // Format collections for filter panel
  const collectionOptions = collections.map((collection) => ({
    address: collection.collectionAddress,
    name: collection.name || collection.collectionAddress.substring(0, 8),
  }));

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    collections: collectionOptions,
    isLoading: isLoading || !mounted,
    error,
    refetch,
  };
}

'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/api/trpc/client';
import { useAddress } from '@/lib/hooks/use-address';

/**
 * Hook to fetch all NFTs owned by the current user across all collections
 */
export function useOwnerNFTs() {
  const { data: address } = useAddress();
  const [mounted, setMounted] = useState(false);

  // Get all collection addresses from factory
  const { data: collectionAddresses, isLoading: isLoadingCollections } =
    trpc.factoryConfig.getAllCollections.useQuery(undefined, { enabled: mounted });
  // console.log('collectionAddresses:', collectionAddresses);

  // Fetch NFTs owned by the current address across all collections using tRPC
  const {
    data: nfts,
    isLoading: isLoadingNFTs,
    error,
    refetch,
  } = trpc.nft.getByOwner.useQuery(
    {
      ownerAddress: address || '',
      contractAddresses: collectionAddresses || [],
    },
    {
      enabled: !!address && mounted && !!collectionAddresses && collectionAddresses.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    nfts: nfts || [],
    isLoading: isLoadingCollections || isLoadingNFTs || !mounted,
    error,
    refetch,
  };
}

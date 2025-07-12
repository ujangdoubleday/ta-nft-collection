'use client';

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/api/trpc/client';
import { useAddress } from '@/lib/hooks/use-address';

interface UseOwnerNFTsProps {
  showAll?: boolean;
}

/**
 * Hook to fetch all NFTs owned by the current user across all collections
 * @param showAll When true, fetches all NFTs instead of just the user's own NFTs
 */
export function useOwnerNFTs(props?: UseOwnerNFTsProps) {
  const { showAll = false } = props || {};
  const { data: address } = useAddress();
  const [mounted, setMounted] = useState(false);
  const trpcUtils = trpc.useUtils();

  // Get all collection addresses from factory
  const { data: collectionAddresses, isLoading: isLoadingCollections } =
    trpc.factoryConfig.getAllCollections.useQuery(undefined, { enabled: mounted });

  // If showAll is true, use getAllNFTs instead of getByOwner
  const {
    data: allNFTs,
    isLoading: isLoadingAllNFTs,
    error: allNFTsError,
    refetch: refetchAllNFTs,
  } = trpc.nft.getAllNFTs.useQuery(
    {
      contractAddresses: collectionAddresses || [],
      limit: 500, // Limit the number of NFTs to prevent performance issues
    },
    {
      enabled: showAll && mounted && !!collectionAddresses && collectionAddresses.length > 0,
    },
  );

  // Fetch NFTs owned by the current address across all collections using tRPC
  const {
    data: ownedNFTs,
    isLoading: isLoadingOwnedNFTs,
    error: ownedNFTsError,
    refetch: refetchOwnedNFTs,
  } = trpc.nft.getByOwner.useQuery(
    {
      ownerAddress: address || '',
      contractAddresses: collectionAddresses || [],
    },
    {
      enabled:
        !showAll && !!address && mounted && !!collectionAddresses && collectionAddresses.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );

  // Custom refetch function that maintains existing data during refresh
  const refetch = useCallback(async () => {
    try {
      // Invalidate the queries
      await trpcUtils.invalidate();

      // Then perform the refetch based on which query is active
      if (showAll) {
        return refetchAllNFTs();
      } else {
        return refetchOwnedNFTs();
      }
    } catch (err) {
      console.error('Error during refetch:', err);
      throw err;
    }
  }, [address, collectionAddresses, refetchOwnedNFTs, refetchAllNFTs, trpcUtils, showAll]);

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use the appropriate data based on showAll flag
  const nfts = showAll ? allNFTs : ownedNFTs;
  const isLoading =
    isLoadingCollections || (showAll ? isLoadingAllNFTs : isLoadingOwnedNFTs) || !mounted;
  const error = showAll ? allNFTsError : ownedNFTsError;

  return {
    nfts: nfts || [],
    isLoading,
    error,
    refetch,
  };
}

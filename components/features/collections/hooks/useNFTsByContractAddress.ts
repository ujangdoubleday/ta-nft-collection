'use client';

import { trpc } from '@/lib/api/trpc/client';
import { useState, useEffect } from 'react';

/**
 * Hook to fetch NFTs by contract address directly from the blockchain
 * @param contractAddress The contract address of the collection
 * @returns The NFTs data, loading state, error, and refetch function
 */
export function useNFTsByContractAddress(contractAddress: string) {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const { data, isLoading, error, refetch, isError, isFetching } =
    trpc.nft.getByCollectionAddress.useQuery(
      { contractAddress },
      {
        enabled: !!contractAddress,
        // Don't refetch on window focus for better UX
        refetchOnWindowFocus: false,
        // Retry failed queries
        retry: maxRetries,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        // Cache for 5 minutes (reduced since blockchain data can change)
        staleTime: 5 * 60 * 1000,
      },
    );

  // Auto-retry logic for critical errors
  useEffect(() => {
    if (isError && retryCount < maxRetries) {
      const timer = setTimeout(
        () => {
          // console.log(
          //   `Retrying blockchain NFT fetch for ${contractAddress} (attempt ${retryCount + 1}/${maxRetries})`,
          // );
          setRetryCount((prev) => prev + 1);
          refetch();
        },
        2000 * (retryCount + 1),
      ); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [isError, retryCount, contractAddress, refetch, maxRetries]);

  return {
    nfts: data || [],
    isLoading: isLoading || isFetching,
    error,
    refetch,
    isError,
  };
}

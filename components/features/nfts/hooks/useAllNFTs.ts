'use client';

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/api/trpc/client';
import { simplifyNFTForLogging } from '@/lib/blockchain/utils/alchemy';

/**
 * Hook to fetch all NFTs across all collections
 */
export function useAllNFTs() {
  const [mounted, setMounted] = useState(false);
  const trpcUtils = trpc.useUtils();

  // Get all collection addresses from factory
  const { data: collectionAddresses, isLoading: isLoadingCollections } =
    trpc.factoryConfig.getAllCollections.useQuery(undefined, { enabled: mounted });

  // console.log('Admin NFTs - Collection Addresses:', collectionAddresses);

  // Track progress of fetching NFTs from each collection
  const [collectionProgress, setCollectionProgress] = useState({
    total: 0,
    loaded: 0,
  });
  const [allNFTs, setAllNFTs] = useState<any[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get collection info for all collections
  const { data: collections = [] } = trpc.collection.getAllCollectionsInfo.useQuery(
    {
      contractAddresses: collectionAddresses || [],
    },
    {
      enabled: !!collectionAddresses && collectionAddresses.length > 0 && mounted,
    },
  );

  // console.log('Admin NFTs - Collections Info:', collections);

  // Fetch all NFTs at once using the new endpoint
  const {
    data: allNFTsData,
    isLoading: isLoadingAllNFTs,
    error: fetchError,
  } = trpc.nft.getAllNFTs.useQuery(
    {
      contractAddresses: collectionAddresses || [],
      limit: 500, // Limit the number of NFTs to prevent performance issues
    },
    {
      enabled: !!collectionAddresses && collectionAddresses.length > 0 && mounted,
    },
  );

  // Handle success or error when data changes
  useEffect(() => {
    if (allNFTsData) {
      console.log(`Admin NFTs - Fetched ${allNFTsData.length} NFTs from all collections`);
      setAllNFTs(allNFTsData);
      setIsLoadingNFTs(false);
      setCollectionProgress({
        total: collectionAddresses?.length || 0,
        loaded: collectionAddresses?.length || 0,
      });
    }

    if (fetchError) {
      console.error('Error fetching all NFTs:', fetchError);
      setError(fetchError instanceof Error ? fetchError : new Error('Failed to fetch NFTs'));
      setIsLoadingNFTs(false);
    }
  }, [allNFTsData, fetchError, collectionAddresses]);

  // Add extra debugging to check the NFT array
  // useEffect(() => {
  //   if (allNFTsData) {
  //     console.log('Admin NFTs - allNFTsData:', allNFTsData);
  //     console.log('Admin NFTs - allNFTs state:', allNFTs);

  //     if (allNFTsData.length === 0) {
  //       console.log('Admin NFTs - No NFTs found in allNFTsData');
  //     }

  //     // Verify NFTs have all required data
  //     const validNFTs = allNFTsData.filter(
  //       (nft) => nft && typeof nft === 'object' && nft.tokenId && nft.contractAddress,
  //     );

  //     console.log(`Admin NFTs - ${validNFTs.length} of ${allNFTsData.length} NFTs are valid`);

  //     if (validNFTs.length !== allNFTsData.length) {
  //       console.warn(
  //         'Some NFTs are missing required data:',
  //         allNFTsData.filter(
  //           (nft) => !(nft && typeof nft === 'object' && nft.tokenId && nft.contractAddress),
  //         ),
  //       );
  //     }
  //   }
  // }, [allNFTsData, allNFTs]);

  // Function to fetch NFTs from a single collection (as backup)
  const fetchNFTsForCollection = useCallback(
    async (contractAddress: string) => {
      try {
        // console.log(`Admin NFTs - Directly fetching NFTs for collection: ${contractAddress}`);

        // Use the TRPC client directly for better error handling
        const result = await trpcUtils.client.nft.getByCollectionAddress.query({ contractAddress });

        // console.log(`Admin NFTs - Directly fetched ${result.length} NFTs from ${contractAddress}`);

        // Log simplified result for debugging
        // if (result && result.length > 0) {
        //   console.log(
        //     'Simplified NFTs:',
        //     result.map((nft) => simplifyNFTForLogging(nft)),
        //   );
        // }

        // Add collection address to each NFT
        return result.map((nft) => ({
          ...nft,
          contractAddress,
        }));
      } catch (error) {
        console.error(`Failed to fetch NFTs for collection ${contractAddress}:`, error);
        return []; // Return empty array on error
      }
    },
    [trpcUtils],
  );

  // Fallback method to fetch NFTs if the primary method fails
  useEffect(() => {
    // Skip if the primary method is working or we don't have collection addresses
    if (allNFTsData || !mounted || !collectionAddresses || collectionAddresses.length === 0) {
      return;
    }

    // If primary fetch has failed and we need to use fallback
    if (!isLoadingAllNFTs && error) {
      console.log('Admin NFTs - Using fallback method to fetch NFTs');

      setCollectionProgress({
        total: collectionAddresses.length,
        loaded: 0,
      });

      // Store all fetched NFTs
      const fetchedNFTs: any[] = [];
      let loadedCount = 0;

      // Process collections sequentially to avoid overloading
      const processCollections = async () => {
        for (const address of collectionAddresses) {
          try {
            const nfts = await fetchNFTsForCollection(address);
            fetchedNFTs.push(...nfts);
          } catch (err) {
            console.error(`Error in collection processing for ${address}:`, err);
          }

          // Update progress
          loadedCount++;
          setCollectionProgress({
            total: collectionAddresses.length,
            loaded: loadedCount,
          });
        }

        // When all collections are processed
        // console.log(
        //   `Admin NFTs - Completed loading ${fetchedNFTs.length} total NFTs from ${loadedCount} collections (fallback)`,
        // );

        // if (fetchedNFTs.length > 0) {
        //   console.log('Admin NFTs - Sample of first NFT:', simplifyNFTForLogging(fetchedNFTs[0]));
        // }

        setAllNFTs(fetchedNFTs);
        setIsLoadingNFTs(false);
      };

      // Start processing
      processCollections().catch((err) => {
        console.error('Failed to process collections:', err);
        setError(err as Error);
        setIsLoadingNFTs(false);
      });
    }
  }, [collectionAddresses, mounted, error, isLoadingAllNFTs, allNFTsData, fetchNFTsForCollection]);

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
    // console.log('Admin NFTs - Component mounted');
  }, []);

  // Function to refetch all NFTs
  const refetch = async () => {
    // console.log('Admin NFTs - Refetching data');
    setIsLoadingNFTs(true);
    setError(null);

    // Keep the existing NFTs data during refetch
    const currentNFTs = allNFTs;

    try {
      // Invalidate the queries
      await trpcUtils.invalidate();

      // If we have no current NFTs, reset mounted to trigger a complete refetch
      if (!currentNFTs || currentNFTs.length === 0) {
        setMounted(false);
        // Small delay to ensure the effect runs again
        setTimeout(() => {
          setMounted(true);
        }, 100);
      }
    } catch (err) {
      console.error('Error during refetch:', err);
      setError(err instanceof Error ? err : new Error('Failed to refetch NFTs'));
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  return {
    nfts: allNFTs || [],
    collections,
    isLoading: isLoadingCollections || isLoadingNFTs || !mounted,
    progress: collectionProgress,
    error,
    refetch,
  };
}

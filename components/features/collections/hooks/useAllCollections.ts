'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/api/trpc/client';
import { ipfsToHttp } from '@/lib/utils/helpers/url';
import { EnrichedCollectionInfo } from '@/lib/blockchain/utils/collection';

export function useAllCollections() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [collections, setCollections] = useState<EnrichedCollectionInfo[]>([]);

  // Fetch all collection addresses from the factory
  const {
    data: collectionAddresses,
    isLoading: isLoadingAddresses,
    error: addressesError,
  } = trpc.factoryConfig.getAllCollections.useQuery();

  // Use the collection addresses to fetch contract URIs
  const {
    data: contractURIs,
    isLoading: isLoadingURIs,
    error: urisError,
  } = trpc.collection.getMultipleContractURIs.useQuery(
    { contractAddresses: collectionAddresses || [] },
    { enabled: !!collectionAddresses && collectionAddresses.length > 0 },
  );

  useEffect(() => {
    const enrichCollections = async () => {
      if (!collectionAddresses || !contractURIs || isLoadingAddresses || isLoadingURIs) {
        return;
      }

      try {
        setIsLoading(true);

        // Create a map of collection addresses to their contract URIs
        const uriMap = new Map<string, string>();
        contractURIs.forEach((item) => {
          if (item.contractAddress && item.contractURI) {
            uriMap.set(item.contractAddress, item.contractURI);
          }
        });

        // Fetch metadata for each collection
        const enrichedCollections = await Promise.all(
          collectionAddresses.map(async (address) => {
            const contractURI = uriMap.get(address) || '';

            // Skip if no contract URI
            if (!contractURI) {
              return {
                collectionAddress: address,
                contractURI: '',
                name: 'Unknown Collection',
                symbol: 'NFT',
                totalSupply: BigInt(0),
                createdAt: BigInt(0),
                metadata: {},
                imageUrl: '/assets/images/placeholders/image-placeholder.svg',
              };
            }

            try {
              // For simplicity, we'll only use the metadata from the contract URI
              // and not try to fetch additional collection info
              const httpUrl = ipfsToHttp(contractURI);
              const response = await fetch(httpUrl);

              if (!response.ok) {
                throw new Error(`Failed to fetch metadata: ${response.statusText}`);
              }

              const metadata = await response.json();

              // Process the image URL if it exists
              const imageUrl = metadata.image
                ? ipfsToHttp(metadata.image)
                : '/assets/images/placeholders/image-placeholder.svg';

              return {
                collectionAddress: address,
                contractURI,
                name: metadata?.name || 'Unknown Collection',
                symbol: metadata?.symbol || 'NFT',
                totalSupply: BigInt(0), // We don't have this info without a separate query
                createdAt: BigInt(Math.floor(Date.now() / 1000)), // Use current time as placeholder
                metadata,
                imageUrl,
              };
            } catch (error) {
              console.error(`Error enriching collection ${address}:`, error);
              return {
                collectionAddress: address,
                contractURI,
                name: 'Error Loading Collection',
                symbol: 'ERR',
                totalSupply: BigInt(0),
                createdAt: BigInt(0),
                metadata: {},
                imageUrl: '/assets/images/placeholders/image-placeholder.svg',
              };
            }
          }),
        );

        // Sort by creation time (newest first)
        const sortedCollections = enrichedCollections.sort((a, b) => {
          const timeA = Number(a.createdAt);
          const timeB = Number(b.createdAt);
          return timeB - timeA;
        });

        setCollections(sortedCollections);
      } catch (err) {
        console.error('Error enriching collections:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    enrichCollections();
  }, [collectionAddresses, contractURIs, isLoadingAddresses, isLoadingURIs]);

  return {
    collections,
    isLoading: isLoading || isLoadingAddresses || isLoadingURIs,
    error: error || addressesError || urisError,
  };
}

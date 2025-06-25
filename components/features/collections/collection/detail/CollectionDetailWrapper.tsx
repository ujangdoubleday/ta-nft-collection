'use client';

import { CollectionDetail } from '@/components/features/collections/collection/detail';
import { LoadingWindow } from '@/components/shared/loading';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';
import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EmptyCollectionContent } from '@/components/features/collections/collection/empty/EmptyCollectionContent';
import { useRouter } from 'next/navigation';
import { useNFTsByContractAddress } from '@/components/features/collections/hooks';
import { CollectionItem } from '@/lib/blockchain/utils/nft';
import { useContractURI, useCollectionInfo } from '@/lib/blockchain/hooks/useNFTCollectionRead';
import { fetchMetadata } from '@/lib/blockchain/utils/collection';
import { generateSimpleColorPlaceholder } from '@/lib/utils/helpers/plaiceholder';
import { formatIPFSUrl } from '@/lib/utils/helpers/url';

type Collection = {
  id: string;
  name: string;
  description: string;
  items: CollectionItem[];
};

interface CollectionDetailWrapperProps {
  contractAddress: string;
}

// Loading component for collection
const CollectionLoading = () => {
  return (
    <LoadingWindow
      title="Loading Collection"
      text="Loading NFTs..."
      icon="/assets/icons/window/gallery.png"
    />
  );
};

export const CollectionDetailWrapper = ({ contractAddress }: CollectionDetailWrapperProps) => {
  const router = useRouter();

  // State for UI management
  const [isDataReady, setIsDataReady] = useState(false);
  const [processingError, setProcessingError] = useState<Error | null>(null);

  // Handler for mint NFT action
  const handleMintNFT = () => {
    router.push(`/collections/${contractAddress}/mint`);
  };

  // Fetch collection metadata URI from the contract
  const {
    data: contractURI,
    isLoading: isLoadingURI,
    error: uriError,
  } = useContractURI(contractAddress as `0x${string}`);

  // Fetch collection info from the contract
  const {
    data: collectionInfo,
    isLoading: isLoadingInfo,
    error: infoError,
  } = useCollectionInfo(contractAddress as `0x${string}`);

  // Fetch collection metadata from IPFS
  const {
    data: metadata,
    isLoading: isLoadingMetadata,
    error: metadataError,
  } = useQuery({
    queryKey: ['collection-metadata', contractAddress, contractURI],
    queryFn: async () => {
      if (!contractURI) return null;
      return fetchMetadata(contractURI as string);
    },
    enabled: !!contractURI,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Fetch NFTs using tRPC procedure (now fetches directly from blockchain)
  const {
    nfts: blockchainNfts,
    isLoading: isLoadingNFTs,
    error: nftsError,
    refetch: refetchNFTs,
    isError: isNftsError,
  } = useNFTsByContractAddress(contractAddress);

  // Transform blockchain NFTs to CollectionItem format
  const { data: processedNfts, isLoading: isProcessingNfts } = useQuery({
    queryKey: ['processed-blockchain-nfts', contractAddress, blockchainNfts?.length],
    queryFn: async () => {
      if (!blockchainNfts || blockchainNfts.length === 0) return [];

      try {
        return Promise.all(
          blockchainNfts.map(async (nft) => {
            try {
              // Generate placeholder for the image
              const placeholder = await generateSimpleColorPlaceholder(nft.tokenId || 'default');

              // Format image URL if it's an IPFS URL
              const image = nft.imageUrl ? formatIPFSUrl(nft.imageUrl) : '';

              // Create attributes object from metadata if available
              let attributes: Record<string, string> = { rarity: 'Common' };
              try {
                if (nft.metadataUrl) {
                  const metadataResponse = await fetch(formatIPFSUrl(nft.metadataUrl));
                  if (!metadataResponse.ok) {
                    throw new Error(`Failed to fetch metadata: ${metadataResponse.statusText}`);
                  }

                  const nftMetadata = await metadataResponse.json();

                  if (nftMetadata.attributes && Array.isArray(nftMetadata.attributes)) {
                    attributes = nftMetadata.attributes.reduce(
                      (acc: { [x: string]: string }, attr: { trait_type: string; value: any }) => {
                        if (attr.trait_type && attr.value) {
                          acc[attr.trait_type.toLowerCase()] = String(attr.value);
                        }
                        return acc;
                      },
                      { rarity: 'Common' } as Record<string, string>,
                    );
                  }
                }
              } catch (error) {
                console.error(`Error fetching metadata for NFT ${nft.tokenId}:`, error);
                // Continue with default attributes
              }

              // Return formatted collection item
              return {
                id: nft.tokenId,
                name: nft.name || `NFT #${nft.tokenId}`,
                type: attributes.type || 'Digital Art',
                image,
                blurhash: placeholder,
                placeholder,
                contractAddress: nft.contractAddress,
                tokenId: nft.tokenId,
                attributes,
              } as CollectionItem;
            } catch (itemError) {
              console.error(`Error processing NFT ${nft.tokenId}:`, itemError);
              // Return a fallback item to prevent the entire collection from failing
              return {
                id: nft.tokenId,
                name: `NFT #${nft.tokenId}`,
                type: 'Digital Art',
                image: '',
                contractAddress: nft.contractAddress,
                tokenId: nft.tokenId,
                attributes: { rarity: 'Common' },
              } as CollectionItem;
            }
          }),
        );
      } catch (error) {
        console.error('Error processing NFTs:', error);
        setProcessingError(
          error instanceof Error ? error : new Error('Unknown error processing NFTs'),
        );
        return [];
      }
    },
    enabled: !!blockchainNfts && blockchainNfts.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Create formatted collection using useMemo
  const formattedCollection = useMemo((): Collection | null => {
    if (!metadata) return null;

    // Cast collectionInfo to an array type to access numeric indices
    const collectionInfoArray = collectionInfo as unknown as string[];

    return {
      id: contractAddress,
      name: metadata.name || collectionInfoArray?.[2] || 'Unnamed Collection',
      description: metadata.description || '',
      items: processedNfts || [],
    };
  }, [contractAddress, metadata, collectionInfo, processedNfts]);

  // Handle data ready state
  useEffect(() => {
    if (metadata && (!blockchainNfts || blockchainNfts.length === 0)) {
      // Collection exists but no NFTs
      setIsDataReady(true);
    } else if (formattedCollection && processedNfts) {
      // Collection and NFTs are ready
      const timer = setTimeout(() => {
        setIsDataReady(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsDataReady(false);
    }
  }, [metadata, blockchainNfts, formattedCollection, processedNfts]);

  // Refresh data on component mount
  useEffect(() => {
    refetchNFTs();
  }, [refetchNFTs]);

  // Determine loading state
  const isLoading =
    isLoadingURI ||
    isLoadingInfo ||
    isLoadingMetadata ||
    isLoadingNFTs ||
    isProcessingNfts ||
    !isDataReady;

  // Show loading state
  if (isLoading) {
    return <CollectionLoading />;
  }

  // Show error state
  const hasError =
    uriError || infoError || metadataError || nftsError || processingError || isNftsError;
  if (hasError || !metadata) {
    return <CollectionErrorMessage />;
  }

  // Show empty state when collection exists but has no NFTs
  if (!blockchainNfts || blockchainNfts.length === 0) {
    return <EmptyCollectionContent onAddNewAction={handleMintNFT} />;
  }

  // Return the collection detail component with the formatted collection
  return formattedCollection ? (
    <CollectionDetail collectionId={contractAddress} collection={formattedCollection} />
  ) : (
    <EmptyCollectionContent onAddNewAction={handleMintNFT} />
  );
};

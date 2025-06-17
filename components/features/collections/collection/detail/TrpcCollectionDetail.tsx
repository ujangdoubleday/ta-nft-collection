'use client';

import {
  useCollectionByContractAddress,
  useNFTsByContractAddress,
} from '@/components/features/collections/hooks';
import { CollectionDetail } from '@/components/features/collections/collection/detail';
import { LoadingWindow } from '@/components/shared/loading';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';
import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { generateSimpleColorPlaceholder } from '@/lib/utils/helpers/plaiceholder';
import { formatIPFSUrl } from '@/lib/utils/helpers/url';
import { EmptyCollectionContent } from '@/components/features/collections/collection/empty/EmptyCollectionContent';
import { useRouter } from 'next/navigation';

// Define types for collection items
type CollectionItem = {
  id: string;
  name: string;
  type: string;
  image: string;
  blurhash?: string;
  placeholder?: string;
  attributes: {
    rarity?: string;
    pixels?: string;
    dimensions?: string;
    complexity?: string;
    era?: string;
    style?: string;
    category?: string;
    resolution?: string;
    [key: string]: string | undefined;
  };
};

type Collection = {
  id: string;
  name: string;
  description: string;
  items: CollectionItem[];
};

// Define NFT metadata type
type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  blurhash?: string;
  placeholder?: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
};

interface TrpcCollectionDetailProps {
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

// Function to fetch single NFT metadata
const fetchNFTMetadata = async (nft: any): Promise<CollectionItem> => {
  // Generate default placeholder
  const placeholder = await generateSimpleColorPlaceholder(nft.tokenId || 'default');
  let image = '';
  let blurhash = placeholder;
  let attributes: Record<string, string> = { rarity: 'Common' };

  // If NFT has imageUrl, use it directly
  if (nft.imageUrl) {
    image = formatIPFSUrl(nft.imageUrl);
    console.log('Using direct imageUrl from NFT database:', image);

    try {
      blurhash = `/api/placeholder?url=${encodeURIComponent(image)}`;
    } catch (error) {
      console.error(`Error generating placeholder for ${image}:`, error);
    }

    return {
      id: nft.tokenId,
      name: nft.name,
      type: 'Digital Art',
      image: image,
      blurhash: blurhash,
      placeholder: blurhash,
      attributes: attributes,
    };
  }
  // Otherwise try to fetch metadata if URL exists
  else if (nft.metadataUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(new DOMException('Timeout', 'TimeoutError')),
        3000,
      );

      const response = await fetch(nft.metadataUrl, {
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const metadata: NFTMetadata = await response.json();

        if (metadata.image) {
          console.log('Original image URL from metadata:', metadata.image);
          image = formatIPFSUrl(metadata.image);
          console.log('Final image URL to be used:', image);

          if (metadata.placeholder) {
            blurhash = metadata.placeholder;
          } else if (metadata.blurhash) {
            blurhash = metadata.blurhash;
          } else {
            try {
              blurhash = await generateSimpleColorPlaceholder(metadata.image);
            } catch (error) {
              console.error(`Error generating placeholder for ${metadata.image}:`, error);
            }
          }
        }

        if (metadata.attributes && metadata.attributes.length > 0) {
          attributes = metadata.attributes.reduce(
            (acc, attr) => {
              if (attr.trait_type && attr.value) {
                acc[attr.trait_type.toLowerCase()] = attr.value;
              }
              return acc;
            },
            {} as Record<string, string>,
          );
        }
      }
    } catch (error) {
      console.error(`Error fetching metadata for NFT ${nft.tokenId}:`, error);
    }
  }

  return {
    id: nft.tokenId,
    name: nft.name,
    type: 'Digital Art',
    image: image,
    blurhash: blurhash,
    placeholder: blurhash,
    attributes: attributes,
  };
};

// Function to process all NFTs metadata
const processNFTsMetadata = async (nfts: any[]): Promise<CollectionItem[]> => {
  return Promise.all(nfts.map((nft) => fetchNFTMetadata(nft)));
};

export const TrpcCollectionDetail = ({ contractAddress }: TrpcCollectionDetailProps) => {
  const router = useRouter();

  // State for UI management (keep using useState + useEffect)
  const [isDataReady, setIsDataReady] = useState(false);

  // Handler for mint NFT action
  const handleMintNFT = () => {
    router.push(`/collections/${contractAddress}/mint`);
  };

  // Fetch collection data using tRPC hook (existing)
  const {
    collection,
    isLoading: isLoadingCollection,
    error: collectionError,
  } = useCollectionByContractAddress(contractAddress);

  // Fetch NFTs data using tRPC hook (existing)
  const {
    nfts,
    isLoading: isLoadingNFTs,
    error: nftsError,
    refetch: refetchNFTs,
  } = useNFTsByContractAddress(contractAddress);

  // Use React Query for processing NFT metadata (data transformation)
  const {
    data: processedItems,
    isLoading: isProcessingMetadata,
    error: metadataError,
  } = useQuery({
    queryKey: ['nft-metadata', contractAddress, nfts?.length],
    queryFn: () => processNFTsMetadata(nfts || []),
    enabled: !!nfts && nfts.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  // Create formatted collection using useMemo (derived state)
  const formattedCollection = useMemo((): Collection | null => {
    if (!collection || !processedItems) return null;

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description || '',
      items: processedItems,
    };
  }, [collection, processedItems]);

  // Handle data ready state (UI state management - keep useEffect)
  useEffect(() => {
    if (collection && (!nfts || nfts.length === 0)) {
      // Collection exists but no NFTs
      setIsDataReady(true);
    } else if (formattedCollection && processedItems) {
      // Collection and processed items are ready
      const timer = setTimeout(() => {
        setIsDataReady(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsDataReady(false);
    }
  }, [collection, nfts, formattedCollection, processedItems]);

  // Refresh data on component mount (side effect - keep useEffect)
  useEffect(() => {
    refetchNFTs();
  }, [refetchNFTs]);

  // Determine loading state
  const isLoading = isLoadingCollection || isLoadingNFTs || isProcessingMetadata || !isDataReady;

  // Show loading state
  if (isLoading) {
    return <CollectionLoading />;
  }

  // Show error state
  if (collectionError || !collection || metadataError) {
    return <CollectionErrorMessage />;
  }

  // Show empty state when collection exists but has no NFTs
  if (!nfts || nfts.length === 0) {
    return <EmptyCollectionContent onAddNewAction={handleMintNFT} />;
  }

  // Return the collection detail component with the formatted collection
  return formattedCollection ? (
    <CollectionDetail collectionId={contractAddress} collection={formattedCollection} />
  ) : (
    <EmptyCollectionContent onAddNewAction={handleMintNFT} />
  );
};

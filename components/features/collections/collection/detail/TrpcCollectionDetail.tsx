'use client';

import { useCollectionByContractAddress } from '@/components/features/collections/hooks';
import { CollectionDetail } from '@/components/features/collections/collection/detail';
import { LoadingWindow } from '@/components/shared/loading';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';
import { useEffect, useState, useMemo, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EmptyCollectionContent } from '@/components/features/collections/collection/empty/EmptyCollectionContent';
import { useRouter } from 'next/navigation';
import { useAlchemyNFTs } from '@/lib/blockchain/hooks';
import { processAlchemyNFTs, CollectionItem } from '@/lib/blockchain/utils/nft';

type Collection = {
  id: string;
  name: string;
  description: string;
  items: CollectionItem[];
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

export const TrpcCollectionDetail = ({ contractAddress }: TrpcCollectionDetailProps) => {
  const router = useRouter();

  // State for UI management
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

  // Fetch NFTs data using Alchemy API hook
  const {
    nfts: alchemyNfts,
    isLoading: isLoadingNFTs,
    error: nftsError,
    refetch: refetchNFTs,
  } = useAlchemyNFTs(contractAddress);

  // Use React Query for processing NFT metadata
  const {
    data: processedItems,
    isLoading: isProcessingMetadata,
    error: metadataError,
  } = useQuery({
    queryKey: ['processed-nfts', contractAddress, alchemyNfts?.length],
    queryFn: () => processAlchemyNFTs(alchemyNfts || []),
    enabled: !!alchemyNfts && alchemyNfts.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  // Create formatted collection using useMemo
  const formattedCollection = useMemo((): Collection | null => {
    if (!collection || !processedItems) return null;

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description || '',
      items: processedItems,
    };
  }, [collection, processedItems]);

  // Handle data ready state
  useEffect(() => {
    if (collection && (!alchemyNfts || alchemyNfts.length === 0)) {
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
  }, [collection, alchemyNfts, formattedCollection, processedItems]);

  // Refresh data on component mount
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
  if (!alchemyNfts || alchemyNfts.length === 0) {
    return <EmptyCollectionContent onAddNewAction={handleMintNFT} />;
  }

  // Return the collection detail component with the formatted collection
  return formattedCollection ? (
    <Suspense fallback={isLoading ? <CollectionLoading /> : null}>
      <CollectionDetail collectionId={contractAddress} collection={formattedCollection} />
    </Suspense>
  ) : (
    <EmptyCollectionContent onAddNewAction={handleMintNFT} />
  );
};

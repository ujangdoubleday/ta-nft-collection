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
import { formatIPFSUrl } from '@/lib/utils/helpers/url';
import { trpc } from '@/lib/api/trpc/client';

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

  // Fetch collection metadata URI and collection info from the server using tRPC
  const {
    data: contractData,
    isLoading: isLoadingContract,
    error: contractError,
  } = trpc.collection.getContractURI.useQuery(
    { contractAddress: contractAddress as `0x${string}` },
    { enabled: !!contractAddress },
  );

  // Extract contractURI and collectionInfo from the combined response
  const contractURI = contractData?.contractURI;
  const collectionInfo = contractData?.collectionInfo;
  const isLoadingURI = isLoadingContract;
  const isLoadingInfo = isLoadingContract;
  const uriError = contractError;
  const infoError = contractError;

  // Fetch collection metadata from IPFS using tRPC
  const {
    data: metadataResult,
    isLoading: isLoadingMetadata,
    error: metadataError,
  } = trpc.collection.fetchProcessedMetadata.useQuery(
    { uri: contractURI as string },
    {
      enabled: !!contractURI,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  );

  // Extract metadata from the response
  const metadata = metadataResult?.metadata;

  // Fetch NFTs using tRPC procedure (now fetches directly from blockchain)
  const {
    nfts: blockchainNfts,
    isLoading: isLoadingNFTs,
    error: nftsError,
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
              // Generate placeholder using the API route instead of direct function call
              const placeholderUrl = `/api/placeholder?url=${encodeURIComponent(formatIPFSUrl(nft.imageUrl)) || 'default'}`;
              const placeholder = placeholderUrl;

              // Format image URL if it's an IPFS URL
              const image = nft.imageUrl ? formatIPFSUrl(nft.imageUrl) : '';
              let processedImageUrl = image;

              // Return formatted collection item
              return {
                id: nft.tokenId,
                image: processedImageUrl,
                blurhash: placeholder,
                placeholder,
                contractAddress: nft.contractAddress,
                tokenId: nft.tokenId,
              } as CollectionItem;
            } catch (itemError) {
              console.error(`Error processing NFT ${nft.tokenId}:`, itemError);
              // Return a fallback item to prevent the entire collection from failing
              return {
                id: nft.tokenId,
                image: '',
                contractAddress: nft.contractAddress,
                tokenId: nft.tokenId,
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

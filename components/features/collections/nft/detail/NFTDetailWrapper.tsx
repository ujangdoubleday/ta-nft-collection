'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatIPFSUrl } from '@/lib/utils/helpers/url';
import { generateSimpleColorPlaceholder } from '@/lib/utils/helpers/plaiceholder';
import { LoadingWindow } from '@/components/shared/loading/LoadingWindow';
import { NFTDetail } from './NFTDetail';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';
import { NFTErrorMessage } from '@/components/features/collections/shared/error/NFTErrorMessage';
import { useAlchemyNFT, useNFTOwner } from '@/lib/blockchain/hooks/useAlchemyNFTs';
import { useContractURI, useCollectionInfo } from '@/lib/blockchain/hooks/useNFTCollectionRead';
import { fetchMetadata } from '@/lib/blockchain/utils/collection';
import { useCollectionOwner } from '@/lib/blockchain/hooks/useNFTCollectionRead';

// Define type for NFT history item
type HistoryItem = {
  type: string;
  from: string;
  to: string;
  date: string;
  price?: string;
};

// Define type for NFT item
type NFTItem = {
  name: string;
  description: string;
  type: string;
  creator: string;
  owner: string;
  mintDate: string;
  tokenId: string;
  blockchain: string;
  image: string;
  attributes: Record<string, string>;
  history?: HistoryItem[];
};

interface NFTDetailWrapperProps {
  contractAddress: string;
  tokenId: string;
}

// Helper functions
const formatDate = (date: Date | string): string => {
  return new Date(date).toISOString().split('T')[0];
};

const generatePlaceholder = async (imageUrl: string): Promise<string> => {
  return await generateSimpleColorPlaceholder(imageUrl);
};

// Loading component for NFT detail
export const NFTDetailWrapperLoading = () => {
  return (
    <LoadingWindow
      title="Loading NFT"
      text="Loading NFT details from blockchain..."
      icon="/assets/icons/window/nft.png"
      minHeight="min-h-[400px]"
    />
  );
};

export const NFTDetailWrapper = ({ contractAddress, tokenId }: NFTDetailWrapperProps) => {
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

  // Fetch collection owner
  const {
    data: collectionOwner,
    isLoading: isLoadingCollectionOwner,
    error: ownerError,
  } = useCollectionOwner(contractAddress as `0x${string}`);

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

  // Fetch NFT data using Alchemy
  const {
    nft: alchemyNft,
    isLoading: isLoadingNft,
    error: nftError,
  } = useAlchemyNFT(contractAddress, tokenId);

  // Fetch NFT owner
  const { owner: nftOwner, isLoading: isLoadingOwner } = useNFTOwner(contractAddress, tokenId);

  // React Query for generating placeholder
  const { data: placeholderImage, isLoading: isGeneratingPlaceholder } = useQuery({
    queryKey: ['nft-placeholder', alchemyNft?.tokenId || tokenId],
    queryFn: () =>
      generatePlaceholder(
        alchemyNft?.image?.originalUrl ||
          alchemyNft?.raw?.metadata?.image ||
          alchemyNft?.tokenId ||
          tokenId,
      ),
    enabled: !!alchemyNft,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get image URL with fallbacks (derived state)
  const imageUrl = useMemo((): string => {
    if (!alchemyNft) return '';

    if (alchemyNft.raw?.metadata?.image) {
      return formatIPFSUrl(alchemyNft.raw.metadata.image);
    }
    if (alchemyNft.image?.originalUrl) {
      return alchemyNft.image.originalUrl;
    }
    return '';
  }, [alchemyNft]);

  // Process attributes (derived state)
  const processedAttributes = useMemo((): Record<string, string> => {
    const attributes: Record<string, string> = { rarity: 'Common' };

    if (alchemyNft?.raw?.metadata?.attributes && alchemyNft.raw.metadata.attributes.length > 0) {
      alchemyNft.raw.metadata.attributes.forEach((attr) => {
        if (attr.trait_type && attr.value) {
          attributes[attr.trait_type.toLowerCase()] = String(attr.value);
        }
      });
    }

    return attributes;
  }, [alchemyNft]);

  // Create NFT history (derived state)
  const nftHistory = useMemo((): HistoryItem[] => {
    if (!alchemyNft || !nftOwner) return [];

    return [
      {
        type: 'Mint',
        from: '0x0000000000000000000000000000000000000000',
        to: nftOwner,
        date: alchemyNft.timeLastUpdated
          ? formatDate(alchemyNft.timeLastUpdated)
          : formatDate(new Date()),
        price: '0.05 ETH', // Default price
      },
    ];
  }, [alchemyNft, nftOwner]);

  // Cast collectionInfo to an array type to access numeric indices
  const collectionInfoArray = collectionInfo as unknown as string[];
  const collectionName = metadata?.name || collectionInfoArray?.[2] || 'Unnamed Collection';

  // Convert Alchemy NFT to the expected format (derived state)
  const nft = useMemo((): NFTItem | null => {
    if (!alchemyNft) return null;

    return {
      name: alchemyNft.name || `NFT #${alchemyNft.tokenId}`,
      description: alchemyNft.description || `An NFT from the ${collectionName} collection.`,
      type: 'Digital Art',
      creator: (collectionOwner as string) || '0x0000000000000000000000000000000000000000',
      owner: nftOwner || '0x0000000000000000000000000000000000000000',
      mintDate: alchemyNft.timeLastUpdated
        ? formatDate(alchemyNft.timeLastUpdated)
        : formatDate(new Date()),
      tokenId: alchemyNft.tokenId,
      blockchain: 'Ethereum',
      image: imageUrl,
      attributes: processedAttributes,
      history: nftHistory,
    };
  }, [
    alchemyNft,
    collectionName,
    collectionOwner,
    imageUrl,
    processedAttributes,
    nftHistory,
    nftOwner,
  ]);

  // Calculate loading state
  const isLoading =
    isLoadingURI ||
    isLoadingInfo ||
    isLoadingMetadata ||
    isLoadingCollectionOwner ||
    isLoadingNft ||
    isLoadingOwner;

  // Show loading state
  if (isLoading) {
    return <NFTDetailWrapperLoading />;
  }

  // Show error states
  const hasError = uriError || infoError || metadataError || ownerError;
  if (hasError) {
    return <CollectionErrorMessage />;
  }

  if (nftError || !alchemyNft) {
    return <NFTErrorMessage collectionId={contractAddress} />;
  }

  if (!nft) {
    return <NFTErrorMessage collectionId={contractAddress} />;
  }

  return (
    <NFTDetail
      collectionId={contractAddress}
      nftId={tokenId}
      nft={nft}
      placeholderImage={placeholderImage}
    />
  );
};

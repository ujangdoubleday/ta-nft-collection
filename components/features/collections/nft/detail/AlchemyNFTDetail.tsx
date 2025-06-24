'use client';

import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatIPFSUrl } from '@/lib/utils/helpers/url';
import { generateSimpleColorPlaceholder } from '@/lib/utils/helpers/plaiceholder';
import { LoadingWindow } from '@/components/shared/loading/LoadingWindow';
import { useCollectionByContractAddress } from '@/components/features/collections/hooks';
import { ClientNFTDetail } from './ClientNFTDetail';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';
import { NFTErrorMessage } from '@/components/features/collections/shared/error/NFTErrorMessage';
import { processAlchemyNFT } from '@/lib/blockchain/utils/nft';
import { useAlchemyNFT, useNFTOwner } from '@/lib/blockchain/hooks/useAlchemyNFTs';
import { AlchemyNFT } from '@/lib/blockchain/utils/alchemy';

// Define gateway URL from environment variable or use default
const GATEWAY_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'cyan-dead-reptile-256.mypinata.cloud';

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

interface AlchemyNFTDetailProps {
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
export const AlchemyNFTDetailLoading = () => {
  return (
    <LoadingWindow
      title="Loading NFT"
      text="Loading NFT details from blockchain..."
      icon="/assets/icons/window/nft.png"
      minHeight="min-h-[400px]"
    />
  );
};

export const AlchemyNFTDetail = ({ contractAddress, tokenId }: AlchemyNFTDetailProps) => {
  // Fetch collection data using tRPC hook (keep this for now for collection info)
  const {
    collection,
    isLoading: isLoadingCollection,
    error: collectionError,
  } = useCollectionByContractAddress(contractAddress);

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

  // Convert Alchemy NFT to the expected format (derived state)
  const nft = useMemo((): NFTItem | null => {
    if (!alchemyNft || !collection) return null;

    return {
      name: alchemyNft.name || `NFT #${alchemyNft.tokenId}`,
      description: alchemyNft.description || `An NFT from the ${collection.name} collection.`,
      type: 'Digital Art',
      creator: collection.owner.address,
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
  }, [alchemyNft, collection, imageUrl, processedAttributes, nftHistory, nftOwner]);

  // Calculate loading state
  const isLoading = isLoadingCollection || isLoadingNft || isLoadingOwner;

  // Show loading state
  if (isLoading) {
    return <AlchemyNFTDetailLoading />;
  }

  // Show error states
  if (collectionError || !collection) {
    return <CollectionErrorMessage />;
  }

  if (nftError || !alchemyNft) {
    return <NFTErrorMessage collectionId={contractAddress} />;
  }

  if (!nft) {
    return <NFTErrorMessage collectionId={contractAddress} />;
  }

  return (
    <ClientNFTDetail
      collectionId={contractAddress}
      nftId={tokenId}
      nft={nft}
      collectionName={collection.name}
      placeholderImage={placeholderImage || null}
    />
  );
};

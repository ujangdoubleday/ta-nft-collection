'use client';

import { useCollectionByContractAddress, useNFTsByContractAddress } from '../../hooks';
import { CollectionDetail } from '@/components/features/collections';
import { Win98Spinner } from '@/components/ui/organisms/Win98Spinner';
import { CollectionErrorMessage } from '../errors/CollectionErrorMessage';

// Define types for collection items
type CollectionItem = {
  id: string;
  name: string;
  type: string;
  image: string;
  attributes: {
    rarity?: string;
    pixels?: string;
    dimensions?: string;
    complexity?: string;
    era?: string;
    style?: string;
    category?: string;
    resolution?: string;
  };
};

type Collection = {
  id: string;
  name: string;
  description: string;
  items: CollectionItem[];
};

interface TrpcCollectionDetailProps {
  contractAddress: string;
}

export const TrpcCollectionDetail = ({ contractAddress }: TrpcCollectionDetailProps) => {
  // Fetch collection data using tRPC hook
  const {
    collection,
    isLoading: isLoadingCollection,
    error: collectionError,
  } = useCollectionByContractAddress(contractAddress);

  // Fetch NFTs data using tRPC hook
  const {
    nfts,
    isLoading: isLoadingNFTs,
    error: nftsError,
  } = useNFTsByContractAddress(contractAddress);

  // Show loading state
  if (isLoadingCollection || isLoadingNFTs) {
    return <Win98Spinner />;
  }

  // Show error state
  if (collectionError || !collection) {
    return <CollectionErrorMessage />;
  }

  // Convert NFTs to the expected format
  const items: CollectionItem[] = nfts.map((nft) => ({
    id: nft.tokenId,
    name: nft.name,
    type: 'Digital Art',
    image: nft.imageUrl,
    attributes: {
      // You can add attributes from the NFT if available
      // For now, we'll just add some basic info
      rarity: 'Common',
    },
  }));

  // Convert database collection to the expected format
  const formattedCollection: Collection = {
    id: collection.id,
    name: collection.name,
    description: collection.description || '',
    items: items,
  };

  return <CollectionDetail collectionId={contractAddress} collection={formattedCollection} />;
};

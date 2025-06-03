'use client';

import { useCollectionByContractAddress, useNFTByTokenId } from '../../hooks';
import { ClientNFTDetail } from './ClientNFTDetail';
import { Win98Spinner } from '@/components/ui/organisms/Win98Spinner';
import { CollectionErrorMessage, NFTErrorMessage } from '../errors';

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

interface TrpcNFTDetailProps {
  contractAddress: string;
  nftId: string;
}

export const TrpcNFTDetail = ({ contractAddress, nftId }: TrpcNFTDetailProps) => {
  // Fetch collection data using tRPC hook
  const {
    collection,
    isLoading: isLoadingCollection,
    error: collectionError,
  } = useCollectionByContractAddress(contractAddress);

  // Fetch NFT data using tRPC hook
  const {
    nft: dbNft,
    isLoading: isLoadingNft,
    error: nftError,
  } = useNFTByTokenId(nftId, contractAddress);

  // Show loading state
  if (isLoadingCollection || isLoadingNft) {
    return <Win98Spinner />;
  }

  // Show error state for collection
  if (collectionError || !collection) {
    return <CollectionErrorMessage />;
  }

  // Show error state for NFT
  if (!dbNft) {
    return <NFTErrorMessage collectionId={contractAddress} />;
  }

  // Convert database NFT to the expected format
  const nft: NFTItem = {
    name: dbNft.name,
    description: dbNft.description || `An NFT from the ${collection.name} collection.`,
    type: 'Digital Art',
    creator: collection.owner.address,
    owner: dbNft.owner.address,
    mintDate: dbNft.createdAt
      ? new Date(dbNft.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    tokenId: dbNft.tokenId,
    blockchain: 'Ethereum', // Assuming Ethereum for now
    image: dbNft.imageUrl,
    attributes: {
      // You can add attributes from the NFT if available
      // For now, we'll just add some basic info
      rarity: 'Common',
    },
    history: [
      {
        type: 'Mint',
        from: '0x0000000000000000000000000000000000000000',
        to: dbNft.owner.address,
        date: dbNft.createdAt
          ? new Date(dbNft.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        price: dbNft.price ? `${dbNft.price} ETH` : '0.05 ETH',
      },
    ],
  };

  return (
    <ClientNFTDetail
      collectionId={contractAddress}
      nftId={nftId}
      nft={nft}
      collectionName={collection.name}
    />
  );
};

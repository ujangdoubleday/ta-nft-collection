'use client';

import { NFTDetail } from '@/components/features/collections/nft/detail';

// Type definition for NFT history
type HistoryItem = {
  type: string;
  from: string;
  to: string;
  date: string;
  price?: string;
};

// Type definition for NFT
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

interface ClientNFTDetailProps {
  collectionId: string;
  nftId: string;
  nft: NFTItem;
  collectionName: string;
  placeholderImage?: string | null;
}

export const ClientNFTDetail = ({
  collectionId,
  nftId,
  nft,
  collectionName,
  placeholderImage,
}: ClientNFTDetailProps) => {
  return (
    <>
      <NFTDetail
        collectionId={collectionId}
        nftId={nftId}
        nft={nft}
        placeholderImage={placeholderImage}
      />
    </>
  );
};

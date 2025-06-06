'use client';

import { NFTMintForm } from '@/components/features/collections/nft/mint';

interface ClientNFTMintFormProps {
  collectionId: string;
  collectionName: string;
}

export const ClientNFTMintForm = ({ collectionId, collectionName }: ClientNFTMintFormProps) => {
  return (
    <>
      <NFTMintForm collectionId={collectionId} collectionName={collectionName} />
    </>
  );
};

'use client';

import { useCollectionByContractAddress } from '../../hooks';
import { ClientNFTMintForm } from './ClientNFTMintForm';
import { LoadingWindow } from '@/components/shared/loading';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';

interface TrpcNFTMintFormProps {
  contractAddress: string;
}

export const TrpcNFTMintForm = ({ contractAddress }: TrpcNFTMintFormProps) => {
  // Fetch collection data using tRPC hook
  const { collection, isLoading, error } = useCollectionByContractAddress(contractAddress);

  // Show loading state
  if (isLoading) {
    return (
      <LoadingWindow
        title="Loading Collection"
        text="Loading collection details..."
        icon="/assets/icons/window/gallery-create.png"
      />
    );
  }

  // Show error state
  if (error || !collection) {
    return (
      <CollectionErrorMessage
        title="Error - Collection Not Found"
        icon="/assets/icons/window/gallery-create.png"
      />
    );
  }

  return <ClientNFTMintForm collectionId={contractAddress} collectionName={collection.name} />;
};

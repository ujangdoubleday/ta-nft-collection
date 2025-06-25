'use client';

import { useCollectionByContractAddress } from '../../hooks';
import { NFTMintForm } from './NFTMintForm';
import { LoadingWindow } from '@/components/shared/loading';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';

interface NFTMintWrapperProps {
  contractAddress: string;
}

export const NFTMintWrapper = ({ contractAddress }: NFTMintWrapperProps) => {
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

  return <NFTMintForm collectionId={contractAddress} collectionName={collection.name} />;
};

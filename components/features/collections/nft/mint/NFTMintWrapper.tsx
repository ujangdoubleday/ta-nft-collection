'use client';

import { NFTMintForm } from './NFTMintForm';
import { LoadingWindow } from '@/components/shared/loading';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';
import { trpc } from '@/lib/api/trpc/client';

interface NFTMintWrapperProps {
  contractAddress: string;
}

export const NFTMintWrapper = ({ contractAddress }: NFTMintWrapperProps) => {
  const {
    data: isValid,
    isLoading: collectionLoading,
    error: collectionError,
  } = trpc.collection.isCollectionValid.useQuery(
    { collectionAddress: contractAddress },
    { enabled: !!contractAddress },
  );

  console.log('contractAddress:', contractAddress);

  const isLoading = collectionLoading;
  const isError = collectionError || !isValid;

  if (isLoading) {
    return (
      <LoadingWindow
        title="Loading Collection"
        text="Loading collection details..."
        icon="/assets/icons/window/gallery-create.png"
      />
    );
  }

  if (isError) {
    return (
      <CollectionErrorMessage
        title="Error - Collection Not Found or Invalid"
        icon="/assets/icons/window/gallery-create.png"
      />
    );
  }

  return <NFTMintForm collectionId={contractAddress} />;
};

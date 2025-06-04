'use client';

import { useCollectionByContractAddress } from '../../hooks';
import { ClientNFTMintForm } from './ClientNFTMintForm';
import { Win98Spinner } from '@/components/ui/organisms/Win98Spinner';
import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { CollectionErrorMessage } from '../errors/CollectionErrorMessage';

interface TrpcNFTMintFormProps {
  contractAddress: string;
}

export const TrpcNFTMintForm = ({ contractAddress }: TrpcNFTMintFormProps) => {
  // Fetch collection data using tRPC hook
  const { collection, isLoading, error } = useCollectionByContractAddress(contractAddress);

  // Show loading state
  if (isLoading) {
    return (
      <Win98Window
        title="Loading Collection"
        icon="/assets/icons/window/gallery-create.png"
        className="max-w-12xl mx-auto"
      >
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <Win98Spinner />
          <p className="text-center mt-4">Loading collection details...</p>
        </div>
      </Win98Window>
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

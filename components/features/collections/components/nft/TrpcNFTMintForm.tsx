'use client';

import { useCollectionByContractAddress } from '../../hooks';
import { ClientNFTMintForm } from './ClientNFTMintForm';
import { Win98Spinner } from '@/components/ui/organisms/Win98Spinner';
import { CollectionErrorMessage } from '../errors/CollectionErrorMessage';

interface TrpcNFTMintFormProps {
  contractAddress: string;
}

export const TrpcNFTMintForm = ({ contractAddress }: TrpcNFTMintFormProps) => {
  // Fetch collection data using tRPC hook
  const { collection, isLoading, error } = useCollectionByContractAddress(contractAddress);

  // Show loading state
  if (isLoading) {
    return <Win98Spinner />;
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

'use client';

import { useNFTsByContractAddress } from '@/components/features/collections/hooks/useNFTsByContractAddress';
import { NFTMintForm } from './NFTMintForm';
import { LoadingWindow } from '@/components/shared/loading';
import { CollectionErrorMessage } from '@/components/features/collections/shared/error/CollectionErrorMessage';
import { trpc } from '@/lib/api/trpc/client';

interface NFTMintWrapperProps {
  contractAddressC: string;
}

export const NFTMintWrapper = ({ contractAddressC }: NFTMintWrapperProps) => {
  // Fetch collection data using tRPC hook
  const {
    nfts,
    isLoading: nftsLoading,
    error: nftsError,
  } = useNFTsByContractAddress(contractAddressC);

  // Fetch collection details to get the name
  const {
    data: collection,
    isLoading: collectionLoading,
    error: collectionError,
  } = trpc.collection.getByContractAddress.useQuery(
    { contractAddress: contractAddressC },
    { enabled: !!contractAddressC },
  );

  const isLoading = nftsLoading || collectionLoading;
  const error = nftsError || collectionError || (!collection && !nftsLoading);

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

  return <NFTMintForm collectionId={contractAddressC} collectionName={collection.name} />;
};

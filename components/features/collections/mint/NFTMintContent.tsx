'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/api/trpc/client';
import { NFTMintHeader } from './NFTMintHeader';
import { ImageUploader } from './ImageUploader';
import { AttributesManager } from './AttributesManager';
import { NFTForm } from './NFTForm';
import { MintSuccess } from './MintSuccess';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { useNFTMinting } from './hooks/useNFTMinting';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface NFTMintContentProps {
  contractAddress: string;
  role?: 'admin' | 'user';
  isOwner: boolean;
}

export function NFTMintContent({ contractAddress, role = 'user', isOwner }: NFTMintContentProps) {
  const [mounted, setMounted] = useState(false);
  const [collectionName, setCollectionName] = useState('Unnamed Collection');
  const router = useRouter();

  const utils = trpc.useContext();

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/user/collections';

  // Fetch collection data using tRPC
  const {
    data: isValid,
    isLoading,
    error,
  } = trpc.collection.isCollectionValid.useQuery(
    { collectionAddress: contractAddress },
    { enabled: !!contractAddress && mounted },
  );

  // Fetch contract URI to get collection name
  const { data: contractData } = trpc.collection.getContractURI.useQuery(
    { contractAddress: contractAddress as `0x${string}` },
    { enabled: !!contractAddress && mounted },
  );

  // Fetch metadata to get collection name
  const { data: metadataResult } = trpc.collection.fetchProcessedMetadata.useQuery(
    { uri: contractData?.contractURI as string },
    { enabled: !!contractData?.contractURI },
  );

  // Use the minting hook
  const mintingState = useNFTMinting(contractAddress, utils);

  // Set collection name when metadata is loaded
  useEffect(() => {
    if (metadataResult?.metadata?.name) {
      setCollectionName(metadataResult.metadata.name);
    } else if (contractData?.collectionInfo) {
      const collectionInfoArray = contractData.collectionInfo as unknown as string[];
      if (collectionInfoArray?.[2]) {
        setCollectionName(collectionInfoArray[2]);
      }
    }
  }, [metadataResult, contractData]);

  if (!mounted || isLoading) {
    return <LoadingState />;
  }

  if (error || !isValid) {
    // Convert tRPC error to standard Error object
    const errorObj = error ? new Error(error.message) : null;
    return <ErrorState contractAddress={contractAddress} error={errorObj} basePath={basePath} />;
  }

  if (!isOwner) {
    return (
      <div className="p-6 bg-[#0A0A0A] text-center border border-[#1f1f1f] rounded-lg">
        <Alert
          variant="default"
          className="text-center p-10 text-red-500 bg-transparent border text-lg border-red-500 rounded-lg"
        >
          You are not the owner of this collection. Only the collection owner can mint new NFTs.
        </Alert>
      </div>
    );
  }

  if (mintingState.mintSuccess) {
    return (
      <MintSuccess
        contractAddress={contractAddress}
        onMintAnother={mintingState.resetForm}
        basePath={basePath}
      />
    );
  }

  return (
    <>
      <NFTMintHeader
        collectionName={collectionName}
        contractAddress={contractAddress}
        basePath={basePath}
      />

      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <NFTForm
          nftName={mintingState.nftName}
          setNftName={mintingState.setNftName}
          nftDescription={mintingState.nftDescription}
          setNftDescription={mintingState.setNftDescription}
          onSubmit={mintingState.handleMint}
          isMinting={mintingState.isMinting}
          isUploading={mintingState.isUploading}
          isMintLoading={mintingState.isMintLoading}
          address={mintingState.address}
        >
          {/* Left Column - Image Upload */}
          <div className="w-full lg:w-1/3">
            <ImageUploader
              imagePreview={mintingState.imagePreview}
              setImagePreview={mintingState.setImagePreview}
              setImageFile={mintingState.setImageFile}
            />
          </div>

          {/* Attributes Manager will be rendered inside NFTForm */}
          <AttributesManager
            attributes={mintingState.attributes}
            setAttributes={mintingState.setAttributes}
          />
        </NFTForm>
      </div>
    </>
  );
}

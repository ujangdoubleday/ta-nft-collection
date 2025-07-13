'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/api/trpc/client';
import { NFTMintHeader } from './NFTMintHeader';
import { ImageUploader } from './ImageUploader';
import { AttributesManager } from './AttributesManager';
import { NFTForm } from './NFTForm';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { useNFTMinting } from './hooks/useNFTMinting';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MintingTimeline, MintConfirmationDialog } from './components';

interface NFTMintContentProps {
  contractAddress: string;
  role?: 'admin' | 'user';
  isOwner: boolean;
}

export function NFTMintContent({ contractAddress, role = 'user', isOwner }: NFTMintContentProps) {
  const [mounted, setMounted] = useState(false);
  const [collectionName, setCollectionName] = useState('Unnamed Collection');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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

  // Redirect to NFTs page when minting is successful after a delay
  useEffect(() => {
    if (mintingState.mintSuccess) {
      // Short delay to ensure the user sees the "Complete" step
      const redirectTimer = setTimeout(() => {
        router.push(`${basePath}/${contractAddress}/nfts`);
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }
  }, [mintingState.mintSuccess, router, basePath, contractAddress]);

  // Wrapper function to call handleMint without arguments
  const handleConfirmMint = () => {
    // Create a synthetic event
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    mintingState.handleMint(syntheticEvent);
  };

  // Handle form submission to show confirmation dialog
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mintingState.nftName || !mintingState.nftDescription || !mintingState.imagePreview) {
      return;
    }

    setShowConfirmDialog(true);
  };

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

  return (
    <>
      {/* Confirmation Dialog */}
      <MintConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmMint}
        nftName={mintingState.nftName}
        nftDescription={mintingState.nftDescription}
        imagePreview={mintingState.imagePreview}
        attributes={mintingState.attributes}
      />

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
          onSubmit={handleSubmit}
          isMinting={mintingState.isMinting}
          isUploading={mintingState.isUploading}
          isMintLoading={mintingState.isMintLoading}
          mintSuccess={mintingState.mintSuccess}
          address={mintingState.address}
        >
          {/* Left Column - Image Upload */}
          <div className="w-full lg:w-1/3">
            <ImageUploader
              imagePreview={mintingState.imagePreview}
              setImagePreview={mintingState.setImagePreview}
              setImageFile={mintingState.setImageFile}
              disabled={mintingState.isMinting || mintingState.mintSuccess}
            />
          </div>

          {/* Attributes Manager will be rendered inside NFTForm */}
          <AttributesManager
            attributes={mintingState.attributes}
            setAttributes={mintingState.setAttributes}
            disabled={mintingState.isMinting || mintingState.mintSuccess}
          />
        </NFTForm>
      </div>

      {/* Display minting timeline */}
      <div className="max-w-full">
        <MintingTimeline
          processingStep={mintingState.processingStep}
          isMinting={mintingState.isMinting}
          mintSuccess={mintingState.mintSuccess}
        />

        {/* Error display */}
        {mintingState.error && (
          <>
            <h3 className="mt-4 text-white text-sm font-medium mb-2">Error:</h3>
            <div className="p-4 bg-black/50 border border-zinc-800 rounded-md">
              <p className="text-white text-sm break-words">{mintingState.error.message}</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

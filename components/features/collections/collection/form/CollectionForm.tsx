'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { Win98Spinner } from '@/components/ui/organisms';
import { trpc } from '@/lib/api/trpc/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  CollectionFormActions,
  CollectionFormFields,
} from '@/components/features/collections/collection/form';
import { CollectionFormData } from '@/components/features/collections/collection/form/CollectionFormFields';
import { usePinataUpload } from '@/lib/hooks/usePinataUpload';
import { useWallet } from '@/lib/hooks/wallet';
import { useNFTFactoryEvents } from '@/lib/blockchain/hooks';
import { useAlchemyNFTFactoryEvents } from '@/lib/blockchain/hooks/useAlchemyEvents';
import { useCreateCollection } from '@/lib/blockchain/hooks/useNFTFactoryWrite';
import { revalidatePathAction } from '@/lib/utils/helpers/revalidation';
import { alchemy } from '@/lib/blockchain/utils/alchemy';

interface CollectionFormProps {
  // Props can be added if needed
}

// Types
type CollectionData = {
  name: string;
  symbol?: string;
  description?: string;
  contractURI?: string;
  contractAddress: string;
  ownerAddress: string;
  pinataGroupId?: string;
};

// Async functions for React Query
const createPinataFolder = async (
  collectionName: string,
  address: string,
  createFolder: (name: string) => Promise<any>,
) => {
  const shortAddress = `${address.slice(0, 6)}${address.slice(-4)}`;
  const storageName = `${collectionName.toLowerCase().replace(/\s+/g, '-')}-${shortAddress}`;
  return await createFolder(storageName);
};

const uploadMetadataToIPFS = async (
  formData: CollectionFormData,
  uploadToPinata: (file: File, metadata: any, folderId?: string) => Promise<any>,
  folderId?: string,
) => {
  if (formData.coverImage) {
    return await uploadToPinata(
      formData.coverImage,
      {
        name: formData.name,
        description: formData.description,
      },
      folderId,
    );
  } else {
    // Create basic metadata
    const basicMetadata = {
      name: formData.name,
      description: formData.description || `Collection of NFTs: ${formData.name}`,
      image: 'https://ipfs.io/ipfs/QmUFc4dyX7TJn5dPxp8CKjAz9jCdZyiPeBrAmE5W2XRBEg',
    };

    const metadataBlob = new Blob([JSON.stringify(basicMetadata)], {
      type: 'application/json',
    });
    const metadataFile = new File([metadataBlob], 'metadata.json');

    return await uploadToPinata(
      metadataFile,
      {
        name: `${formData.name}-metadata`,
        description: formData.description,
      },
      folderId,
    );
  }
};

export function CollectionForm({}: CollectionFormProps) {
  const router = useRouter();
  const { address } = useWallet();

  // Form state (keep useState + useEffect for UI state)
  const [formData, setFormData] = useState<CollectionFormData>({
    name: '',
    symbol: '',
    description: '',
    coverImage: null,
    storage: 'Ethereum',
    totalSupply: '100', // Default total supply
  });

  // UI state management (keep useState + useEffect)
  const [showConsole, setShowConsole] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [needsDbSave, setNeedsDbSave] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get hooks
  const { uploadToPinata, createFolder, isUploading, isCreatingFolder } = usePinataUpload();
  const {
    createCollection,
    isLoading: isFactoryLoading,
    error: factoryError,
  } = useCreateCollection();
  const { collectionCreatedEvents, loading: isEventLoading } = useNFTFactoryEvents(txHash || '');
  const { collectionCreatedEvents: alchemyEvents, loading: isAlchemyLoading } =
    useAlchemyNFTFactoryEvents(txHash || '');

  // UI state management functions (keep useEffect)
  const addConsoleMessage = useCallback((message: string) => {
    setConsoleMessages((prev) => [...prev, message]);
  }, []);

  // React Query for creating Pinata folder
  const createPinataFolderMutation = useMutation({
    mutationFn: ({ collectionName, address }: { collectionName: string; address: string }) =>
      createPinataFolder(collectionName, address, createFolder),
    onSuccess: (result) => {
      if (result) {
        addConsoleMessage('> IPFS storage successfully initialized.');
      }
    },
    onError: (error) => {
      addConsoleMessage(
        `> Warning: Unable to set up IPFS storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      addConsoleMessage('> Proceeding with upload without structured IPFS storage...');
    },
  });

  // React Query for uploading metadata
  const uploadMetadataMutation = useMutation({
    mutationFn: ({ formData, folderId }: { formData: CollectionFormData; folderId?: string }) =>
      uploadMetadataToIPFS(formData, uploadToPinata, folderId),
    onSuccess: (result) => {
      if (result?.metadata) {
        if (formData.coverImage) {
          addConsoleMessage('> Image uploaded successfully to IPFS');
        } else {
          addConsoleMessage('> Basic metadata uploaded successfully to IPFS');
        }
      }
    },
    onError: (error) => {
      addConsoleMessage(
        `> Error uploading to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    },
  });

  // React Query for blockchain collection creation
  const createBlockchainCollectionMutation = useMutation({
    mutationFn: async ({
      name,
      symbol,
      contractURI,
      totalSupply,
    }: {
      name: string;
      symbol: string;
      contractURI: string;
      totalSupply: bigint;
    }) => {
      const result = await createCollection(name, symbol, contractURI, totalSupply);
      if (result.error) {
        throw result.error;
      }
      return result;
    },
    onSuccess: (result) => {
      if (result.hash) {
        setTxHash(result.hash);
        addConsoleMessage('> Transaction submitted successfully');
        addConsoleMessage('> This may take a few minutes. Please wait...');
      }
    },
    onError: (error) => {
      addConsoleMessage(
        `> Error creating collection: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    },
  });

  // tRPC mutation for database save
  const createCollectionMutation = trpc.collection.create.useMutation({
    onSuccess: async (_newCollection) => {
      addConsoleMessage('> Collection saved to database successfully!');
      addConsoleMessage('> Revalidating collections page...');

      try {
        // Method 1: Use the API endpoint
        const revalidateResponse = await fetch('/api/revalidate?path=/collections');
        if (revalidateResponse.ok) {
          addConsoleMessage('> Collections page revalidated successfully');
        }
      } catch (error) {
        console.error('Error revalidating collections page:', error);
      }

      addConsoleMessage('> Redirecting to collections page...');

      setTimeout(() => {
        router.push('/collections');
        router.refresh(); // Force client-side refresh
      }, 1500);
    },
    onError: (error) => {
      const errorMessage = error.message;
      if (errorMessage.includes('Foreign key constraint')) {
        addConsoleMessage('> Error: User account not found in the database.');
        addConsoleMessage('> Creating user account...');

        // Retry after delay
        setTimeout(() => {
          if (collectionData) {
            createCollectionMutation.mutate(collectionData);
          }
        }, 1000);
      } else {
        addConsoleMessage(`> Database error: ${errorMessage}`);
      }
    },
  });

  // Handle form changes (UI state - keep useState)
  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      coverImage: file,
    }));
  };

  // Add console message about blockchain monitoring
  useEffect(() => {
    if (txHash) {
      addConsoleMessage('> Scanning blockchain for collection creation events...');
    }
  }, [txHash, addConsoleMessage]);

  // Add console message when events are detected

  // Listen for blockchain events and save to database (side effect - keep useEffect)
  useEffect(() => {
    const saveCollectionFromEvent = async () => {
      if (
        needsDbSave &&
        (collectionCreatedEvents.length > 0 || alchemyEvents.length > 0) &&
        collectionData &&
        !createCollectionMutation.isPending
      ) {
        try {
          // First try to find event from any source
          let event = alchemyEvents.find((e) => e.collectionAddress);

          // If not found, try regular events
          if (!event) {
            event = collectionCreatedEvents.find((e) => e.collectionAddress);
          }

          if (event) {
            addConsoleMessage(`> Collection created on blockchain: ${event.collectionAddress}`);
            addConsoleMessage('> Event successfully captured from blockchain');

            const updatedCollectionData = {
              ...collectionData,
              contractAddress: event.collectionAddress,
            };

            createCollectionMutation.mutate(updatedCollectionData);
          } else {
            addConsoleMessage(
              '> Warning: Could not find collection address from blockchain events',
            );

            // Try to get the transaction receipt directly as a last resort
            try {
              addConsoleMessage('> Attempting alternative method to find collection...');
              const receipt = await alchemy.core.getTransactionReceipt(txHash || '');

              if (receipt && receipt.contractAddress) {
                addConsoleMessage(`> Collection address found: ${receipt.contractAddress}`);
                const updatedCollectionData = {
                  ...collectionData,
                  contractAddress: receipt.contractAddress,
                };
                createCollectionMutation.mutate(updatedCollectionData);
              } else {
                addConsoleMessage('> Using transaction hash as temporary reference');
                createCollectionMutation.mutate(collectionData);
              }
            } catch (receiptError) {
              addConsoleMessage('> Using transaction hash as temporary reference');
              createCollectionMutation.mutate(collectionData);
            }
          }

          setNeedsDbSave(false);
        } catch (error) {
          console.error('Error in saveCollectionFromEvent:', error);
        }
      }
    };

    saveCollectionFromEvent();
  }, [
    collectionCreatedEvents,
    alchemyEvents,
    needsDbSave,
    collectionData,
    createCollectionMutation,
    addConsoleMessage,
    txHash,
  ]);

  // Main form submission handler
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!showConsole) {
      setShowConsole(true);
      return;
    }

    if (!address) {
      addConsoleMessage('> Error: No wallet connected. Please connect your wallet first.');
      return;
    }

    setIsSubmitting(true);
    setShowProgressBar(true);
    setConsoleMessages([]);
    addConsoleMessage('> Processing data...');
    addConsoleMessage(`> Owner address: ${address}`);

    try {
      // Step 1: Create Pinata folder
      addConsoleMessage('> Initializing IPFS storage...');
      let folder = null;
      try {
        folder = await createPinataFolderMutation.mutateAsync({
          collectionName: formData.name,
          address,
        });
      } catch (error) {
        // Continue without folder if creation fails
      }

      // Step 2: Upload metadata
      const uploadMessage = formData.coverImage
        ? '> Uploading image to IPFS...'
        : '> No image provided. Creating basic metadata...';
      addConsoleMessage(uploadMessage);

      const uploadResult = await uploadMetadataMutation.mutateAsync({
        formData,
        folderId: folder?.id,
      });

      if (!uploadResult?.metadata?.url) {
        throw new Error('Failed to create collection metadata URI');
      }

      // Step 3: Create collection on blockchain
      addConsoleMessage('> Creating collection on blockchain...');
      addConsoleMessage('> Waiting for transaction confirmation...');

      // Convert totalSupply string to bigint
      const totalSupplyBigInt = BigInt(parseInt(formData.totalSupply || '100'));

      const blockchainResult = await createBlockchainCollectionMutation.mutateAsync({
        name: formData.name,
        symbol: formData.symbol || 'NFT',
        contractURI: uploadResult.metadata.url,
        totalSupply: totalSupplyBigInt,
      });

      // Step 4: Prepare for database save
      if (blockchainResult.hash) {
        const collectionToSave: CollectionData = {
          name: formData.name,
          symbol: formData.symbol || undefined,
          description: formData.description || undefined,
          contractURI: uploadResult.metadata.url,
          contractAddress: blockchainResult.hash,
          ownerAddress: address,
          pinataGroupId: folder?.id || undefined,
        };

        setCollectionData(collectionToSave);
        setNeedsDbSave(true);
      }
    } catch (error) {
      addConsoleMessage(`> Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/collections');
  };

  // Calculate loading state using correct properties
  const isLoading =
    isSubmitting ||
    createPinataFolderMutation.isPending ||
    uploadMetadataMutation.isPending ||
    createBlockchainCollectionMutation.isPending ||
    isUploading ||
    isCreatingFolder ||
    isFactoryLoading ||
    isEventLoading ||
    isAlchemyLoading ||
    createCollectionMutation.isPending;

  return (
    <Win98Window
      title="Create Collection - NFT Creator Wizard"
      className="max-w-12xl mx-auto"
      icon="/assets/icons/window/gallery-create.png"
    >
      <form onSubmit={handleSubmit} className="p-4 bg-[#c0c0c0]">
        <CollectionFormFields
          formData={formData}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
        />

        {/* Wallet connection status */}
        <div className="mt-4 p-3 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]">
          <p className="text-sm">
            <span className="font-bold">Collection Owner:</span>{' '}
            {address ? (
              <span className="font-mono text-xs">
                {address.slice(0, 6)}...{address.slice(-4)} <b>{'(YOU)'}</b>{' '}
              </span>
            ) : (
              <span className="text-red-600">No wallet connected. Please connect your wallet.</span>
            )}
          </p>
        </div>

        {/* Console */}
        {showConsole && (
          <>
            <div className="mt-6 mb-4 bg-black text-[#00FF00] p-3 font-mono text-sm border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white">
              <div className="bg-[#000080] text-white px-2 py-1 -mt-3 -mx-3 mb-2 flex items-center">
                <span className="text-xs font-bold">Console</span>
              </div>
              {consoleMessages.length > 0 ? (
                consoleMessages.map((message, index) => (
                  <p
                    key={index}
                    className={message.includes('Error') ? 'text-red-400 mb-1' : 'mb-1'}
                  >
                    {message}
                  </p>
                ))
              ) : (
                <>
                  <p className="mb-1">{'> Processing data...'}</p>
                  <p className="text-white">{`> Owner: ${address || 'Not connected'}`}</p>
                  <p className="text-white">{"> Click 'Create Collection' again to confirm."}</p>
                </>
              )}
            </div>
            {showProgressBar && (
              <div className="flex items-center mb-4">
                <div className="w-full h-4 bg-white border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white overflow-hidden mr-2">
                  <div className="win98-progress-bar h-full"></div>
                </div>
                <Win98Spinner size="small" />
              </div>
            )}
          </>
        )}

        <CollectionFormActions
          onCancel={handleCancel}
          showConfirmation={showConsole}
          isSubmitting={isLoading}
        />
      </form>
    </Win98Window>
  );
}

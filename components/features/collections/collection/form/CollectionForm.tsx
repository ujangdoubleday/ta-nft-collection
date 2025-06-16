'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { Win98Spinner } from '@/components/ui/organisms';
import { trpc } from '@/lib/api/trpc/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  CollectionFormActions,
  CollectionFormFields,
} from '@/components/features/collections/collection/form';
import { CollectionFormData } from '@/components/features/collections/collection/form/CollectionFormFields';
import { usePinataUpload } from '@/lib/hooks/usePinataUpload';
import { useWallet } from '@/lib/hooks/wallet';
import { useNFTFactory, useNFTFactoryEvents } from '@/lib/blockchain/hooks';

interface CollectionFormProps {
  // Props can be added if needed
}

export function CollectionForm({}: CollectionFormProps) {
  const router = useRouter();
  const { address } = useWallet();

  const [formData, setFormData] = useState<CollectionFormData>({
    name: '',
    symbol: '',
    description: '',
    coverImage: null,
    storage: 'Ethereum',
  });
  const [showConsole, setShowConsole] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const [folderCreated, setFolderCreated] = useState(false);
  const [collectionFolder, setCollectionFolder] = useState<any>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [needsDbSave, setNeedsDbSave] = useState(false);
  const [dbSavePending, setDbSavePending] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [collectionData, setCollectionData] = useState<{
    name: string;
    symbol?: string;
    description?: string;
    contractURI?: string;
    contractAddress: string;
    ownerAddress: string;
    pinataGroupId?: string;
  } | null>(null);

  // Get the Pinata upload hook
  const { uploadToPinata, createFolder, isUploading, isCreatingFolder } = usePinataUpload();

  // Get the NFT Factory hook
  const { createCollection, isLoading: isFactoryLoading } = useNFTFactory();

  // Get the NFT Factory events hook
  const { collectionCreatedEvents, loading: isEventLoading } = useNFTFactoryEvents(
    txHash || undefined,
  );

  // Get the create collection mutation
  const createCollectionMutation = trpc.collection.create.useMutation({
    onSuccess: (_newCollection) => {
      // Redirect to collections list
      addConsoleMessage('> Collection saved to database successfully!');
      addConsoleMessage('> Redirecting to collections page...');

      // Short delay before redirecting
      setTimeout(() => {
        router.push('/collections');
        router.refresh();
      }, 1500);
    },
  });

  // Listen for collection creation events and save to database
  useEffect(() => {
    const saveCollectionFromEvent = async () => {
      if (needsDbSave && collectionCreatedEvents.length > 0 && !dbSavePending && collectionData) {
        try {
          setDbSavePending(true);

          // Find the event for the current collection (match by name)
          const event = collectionCreatedEvents.find((e) => e.name === collectionData.name);

          if (event) {
            addConsoleMessage(`> Collection created on blockchain: ${event.collectionAddress}`);

            // Save the collection to the database with the actual contract address
            await createCollectionMutation.mutateAsync({
              ...collectionData,
              contractAddress: event.collectionAddress,
            });

            setNeedsDbSave(false);
          } else {
            // If we can't find a matching event, just use the transaction hash as the address (temporary)
            addConsoleMessage('> Warning: Could not find collection address from event logs');
            addConsoleMessage('> Saving with transaction hash as temporary address');

            await createCollectionMutation.mutateAsync(collectionData);

            setNeedsDbSave(false);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown database error';

          if (errorMessage.includes('Foreign key constraint')) {
            addConsoleMessage('> Error: User account not found in the database.');
            addConsoleMessage('> Creating user account...');

            // Try again after a short delay (the collection router should now create the user)
            setTimeout(async () => {
              try {
                await createCollectionMutation.mutateAsync(collectionData);
                setNeedsDbSave(false);
              } catch (retryError) {
                addConsoleMessage(
                  `> Error on retry: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`,
                );
              }
            }, 1000);
          } else {
            addConsoleMessage(`> Database error: ${errorMessage}`);
          }
        } finally {
          setDbSavePending(false);
        }
      }
    };

    saveCollectionFromEvent();
  }, [
    collectionCreatedEvents,
    needsDbSave,
    dbSavePending,
    collectionData,
    createCollectionMutation,
  ]);

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

  const addConsoleMessage = (message: string) => {
    setConsoleMessages((prev) => [...prev, message]);
  };

  // Function to create Pinata folder automatically
  const createCollectionFolder = async (collectionName: string) => {
    if (folderCreated || !collectionName || !address) return null;

    try {
      // Create name based on collection name and owner address
      // Format: collectionName-ownerAddress
      const shortAddress = `${address.slice(0, 6)}${address.slice(-4)}`;
      const storageName = `${collectionName.toLowerCase().replace(/\s+/g, '-')}-${shortAddress}`;
      addConsoleMessage('> Initializing IPFS storage...');

      const result = await createFolder(storageName);
      if (result) {
        setFolderCreated(true);
        setCollectionFolder(result);
        addConsoleMessage('> IPFS storage successfully initialized.');
        return result;
      }
    } catch (error) {
      // If creation fails, show message but continue process
      addConsoleMessage(
        `> Warning: Unable to set up IPFS storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      addConsoleMessage('> Proceeding with upload without structured IPFS storage...');
    }
    return null;
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!showConsole) {
      // Show console first time button is clicked
      setShowConsole(true);
      return;
    }

    // Validate wallet connection
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
      // Create automatic folder for this collection
      const folder = await createCollectionFolder(formData.name);
      const folderId = folder?.id;

      // Upload image to Pinata if available
      let contractURI = null;
      if (formData.coverImage) {
        addConsoleMessage('> Uploading image to IPFS...');

        try {
          const uploadResult = await uploadToPinata(
            formData.coverImage,
            {
              name: formData.name,
              description: formData.description,
            },
            folderId,
          );

          if (uploadResult && uploadResult.metadata) {
            contractURI = uploadResult.metadata.url;
            addConsoleMessage(`> Image uploaded successfully to IPFS`);
          }
        } catch (error) {
          addConsoleMessage(
            `> Error uploading to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          throw error; // Re-throw to be caught by the outer try/catch
        }
      } else {
        // If no image is provided, create a minimal metadata JSON and upload it
        addConsoleMessage('> No image provided. Creating basic metadata...');
        try {
          // Create a minimal metadata object
          const basicMetadata = {
            name: formData.name,
            description: formData.description || `Collection of NFTs: ${formData.name}`,
            image: 'https://ipfs.io/ipfs/QmUFc4dyX7TJn5dPxp8CKjAz9jCdZyiPeBrAmE5W2XRBEg', // Default placeholder image
          };

          // Convert to blob for upload
          const metadataBlob = new Blob([JSON.stringify(basicMetadata)], {
            type: 'application/json',
          });
          const metadataFile = new File([metadataBlob], 'metadata.json');

          addConsoleMessage('> Uploading basic metadata to IPFS...');

          const uploadResult = await uploadToPinata(
            metadataFile,
            {
              name: `${formData.name}-metadata`,
              description: formData.description,
            },
            folderId,
          );

          if (uploadResult && uploadResult.metadata) {
            contractURI = uploadResult.metadata.url;
            addConsoleMessage(`> Basic metadata uploaded successfully to IPFS`);
          }
        } catch (error) {
          addConsoleMessage(
            `> Error creating basic metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          throw error;
        }
      }

      if (!contractURI) {
        addConsoleMessage('> Error: Failed to create collection metadata URI');
        throw new Error('Failed to create collection metadata URI');
      }

      addConsoleMessage('> Creating collection on blockchain...');
      addConsoleMessage('> Waiting for transaction confirmation...');

      const {
        hash,
        collectionAddress,
        error: factoryError,
      } = await createCollection(formData.name, formData.symbol || 'NFT', contractURI);

      if (factoryError) {
        addConsoleMessage(`> Error creating collection: ${factoryError.message}`);
        throw factoryError;
      }

      if (hash) {
        setTxHash(hash);
        addConsoleMessage(`> Transaction submitted successfully`);
        addConsoleMessage('> This may take a few minutes. Please wait...');

        if (collectionAddress) {
          const collectionToSave = {
            name: formData.name,
            symbol: formData.symbol || undefined,
            description: formData.description || undefined,
            contractURI: contractURI || undefined,
            contractAddress: collectionAddress || hash, // Use collection address if available, otherwise tx hash
            ownerAddress: address,
            pinataGroupId: folderId || undefined,
          };

          setCollectionData(collectionToSave);
          setNeedsDbSave(true);
        }
      }
    } catch (error) {
      // Just add to console without logging details to browser console
      addConsoleMessage(`> Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't show alert, we already show the error in the console
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/collections');
  };

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

        {/* Console Style Note - appears above buttons */}
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
          isSubmitting={
            isSubmitting ||
            isUploading ||
            isCreatingFolder ||
            isFactoryLoading ||
            isEventLoading ||
            dbSavePending
          }
        />
      </form>
    </Win98Window>
  );
}

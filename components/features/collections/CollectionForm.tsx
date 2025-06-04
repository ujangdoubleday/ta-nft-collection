'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { trpc } from '@/lib/api/trpc/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  CollectionFormActions,
  CollectionFormFields,
} from '@/components/features/collections/components/collection';
import { CollectionFormData } from '@/components/features/collections/components/collection/CollectionFormFields';
import { usePinataUpload } from '@/lib/hooks/usePinataUpload';
import { useWallet } from '@/lib/hooks/wallet';
import { Button } from '@/components/ui/atoms';

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

  // Get the Pinata upload hook
  const { uploadToPinata, createFolder, isUploading, isCreatingFolder } = usePinataUpload();

  // Get the create collection mutation
  const createCollectionMutation = trpc.collection.create.useMutation({
    onSuccess: () => {
      router.push('/collections');
      router.refresh();
    },
  });

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
    if (folderCreated || !collectionName) return null;

    try {
      // Create folder name based on collection name and timestamp
      const folderName = `${collectionName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      addConsoleMessage(`> Creating Pinata group: ${folderName}`);

      const folder = await createFolder(folderName);
      if (folder) {
        setFolderCreated(true);
        setCollectionFolder(folder);
        addConsoleMessage(`> Group successfully created: ${folder.name} (${folder.id})`);
        return folder;
      }
    } catch (error) {
      // If folder creation fails, show message but continue process
      addConsoleMessage(
        `> Note: Cannot create Pinata group: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      addConsoleMessage('> Continuing upload without group...');
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
    setConsoleMessages([]);
    addConsoleMessage('> Processing data...');
    addConsoleMessage(`> Owner address: ${address}`);

    try {
      // Generate a mock contract address (in a real app, this would come from blockchain)
      const contractAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
      addConsoleMessage(`> Contract Address: ${contractAddress}`);

      // Create automatic folder for this collection
      const folder = await createCollectionFolder(formData.name);
      const folderId = folder?.id;

      if (folderId) {
        addConsoleMessage(`> Pinata group will be used: ${folder.name} (${folderId})`);
      } else {
        addConsoleMessage('> Upload will be done without Pinata group');
      }

      // Upload image to Pinata if available
      let contractURI = null;
      if (formData.coverImage) {
        addConsoleMessage('> Uploading image to Pinata IPFS...');

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
            addConsoleMessage(`> Metadata CID: ${uploadResult.metadata.cid}`);
            addConsoleMessage(`> Metadata URL: ${uploadResult.metadata.url}`);
          }
        } catch (error) {
          addConsoleMessage(
            `> Error uploading to Pinata: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          throw error; // Re-throw to be caught by the outer try/catch
        }
      }

      addConsoleMessage('> Creating collection in database...');

      try {
        // Use tRPC to create collection with the connected wallet address
        await createCollectionMutation.mutateAsync({
          name: formData.name,
          symbol: formData.symbol || undefined,
          description: formData.description || undefined,
          contractURI: contractURI || undefined,
          contractAddress,
          ownerAddress: address,
          pinataGroupId: folderId || undefined,
        });

        addConsoleMessage('> Collection created successfully!');
        addConsoleMessage('> Redirecting to collections page...');

        // Short delay before redirecting to allow user to see the success message
        setTimeout(() => {
          router.push('/collections');
          router.refresh();
        }, 1500);
      } catch (error) {
        // Handle specific database errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown database error';

        if (errorMessage.includes('Foreign key constraint')) {
          addConsoleMessage('> Error: User account not found in the database.');
          addConsoleMessage('> Creating user account...');

          // Try again after a short delay (the collection router should now create the user)
          setTimeout(async () => {
            try {
              await createCollectionMutation.mutateAsync({
                name: formData.name,
                symbol: formData.symbol || undefined,
                description: formData.description || undefined,
                contractURI: contractURI || undefined,
                contractAddress,
                ownerAddress: address,
                pinataGroupId: folderId || undefined,
              });

              addConsoleMessage('> Collection created successfully!');
              addConsoleMessage('> Redirecting to collections page...');

              setTimeout(() => {
                router.push('/collections');
                router.refresh();
              }, 1500);
            } catch (retryError) {
              addConsoleMessage(
                `> Error on retry: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`,
              );
            }
          }, 1000);
        } else {
          addConsoleMessage(`> Database error: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error creating collection:', error);
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

        {/* Pinata Folder Status */}
        <div className="mt-4 p-3 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm">Pinata Storage</h3>
          </div>
          <p className="text-sm mt-1">
            {collectionFolder ? (
              <>
                Group to be used: <span className="font-mono text-xs">{collectionFolder.name}</span>
              </>
            ) : (
              <>Group will be created automatically when collection is created</>
            )}
          </p>
          <p className="text-xs text-[#808080] mt-1">
            Files and metadata will be stored in the same group on Pinata
          </p>
        </div>

        {/* Wallet connection status */}
        <div className="mt-4 p-3 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]">
          <p className="text-sm">
            <span className="font-bold">Collection Owner:</span>{' '}
            {address ? (
              <span className="font-mono text-xs">
                {address} <b>{'(YOU)'}</b>{' '}
              </span>
            ) : (
              <span className="text-red-600">No wallet connected. Please connect your wallet.</span>
            )}
          </p>
        </div>

        {/* Console Style Note - appears above buttons */}
        {showConsole && (
          <div className="mt-6 mb-4 bg-black text-[#00FF00] p-3 font-mono text-sm border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white">
            <div className="bg-[#000080] text-white px-2 py-1 -mt-3 -mx-3 mb-2 flex items-center">
              <span className="text-xs font-bold">Console</span>
            </div>
            {consoleMessages.length > 0 ? (
              consoleMessages.map((message, index) => (
                <p key={index} className={message.includes('Error') ? 'text-red-400 mb-1' : 'mb-1'}>
                  {message}
                </p>
              ))
            ) : (
              <>
                <p className="mb-1">{'> Processing data...'}</p>
                <p className="mb-1 text-yellow-400">
                  {
                    '> Note: Creating a collection is the first step to bringing your digital artwork to life.'
                  }
                </p>
                <p className="text-white">{`> Owner: ${address || 'Not connected'}`}</p>
                <p className="text-white">{"> Click 'Create Collection' again to confirm."}</p>
              </>
            )}
          </div>
        )}

        <CollectionFormActions
          onCancel={handleCancel}
          showConfirmation={showConsole}
          isSubmitting={isSubmitting || isUploading || isCreatingFolder}
        />
      </form>
    </Win98Window>
  );
}

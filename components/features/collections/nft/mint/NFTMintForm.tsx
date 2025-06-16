'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/api/trpc/client';
import { useWallet } from '@/lib/hooks/wallet';
import { usePinataUpload } from '@/lib/hooks/usePinataUpload';
import {
  NFTFormFields,
  NFTFormActions,
  NFTFormNote,
} from '@/components/features/collections/nft/mint';
import { NFTPreview } from '@/components/features/collections/nft/preview';
import { NFTFormData } from '@/components/features/collections/nft/mint/NFTFormFields';
import { useNFTCollection, useNFTCollectionEvents } from '@/lib/blockchain/hooks';
import { Win98Spinner } from '@/components/ui/organisms';

interface NFTMintFormProps {
  collectionId: string;
  collectionName: string;
}

export function NFTMintForm({ collectionId, collectionName }: NFTMintFormProps) {
  const router = useRouter();
  const { address } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [needsDbSave, setNeedsDbSave] = useState(false);
  const [dbSavePending, setDbSavePending] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [nftData, setNftData] = useState<{
    tokenId: string;
    name: string;
    description?: string;
    metadataUrl: string;
    imageUrl: string;
    contractAddress: string;
    ownerAddress: string;
  } | null>(null);

  const [formData, setFormData] = useState<NFTFormData>({
    title: '',
    description: '',
    file: null,
    properties: [
      { name: 'Rarity', value: 'Common' },
      { name: 'Type', value: 'Pixel Art' },
    ],
  });

  // Get the Pinata upload hook
  const { uploadToPinata, isUploading } = usePinataUpload();

  // Get the NFT Collection hooks
  const { mintNFT, isLoading: isMintLoading } = useNFTCollection();
  const { transferEvents, loading: isEventLoading } = useNFTCollectionEvents(
    collectionId,
    txHash || undefined,
  );

  // Get the create NFT mutation
  const createNFTMutation = trpc.nft.create.useMutation({
    onSuccess: () => {
      addConsoleMessage('> Redirecting to collection page...');

      // Short delay before redirecting
      setTimeout(() => {
        router.push(`/collections/${collectionId}`);
        router.refresh();
      }, 1000);
    },
  });

  // Get collection details to retrieve pinataGroupId
  const { data: collection } = trpc.collection.getByContractAddress.useQuery(
    { contractAddress: collectionId },
    { enabled: !!collectionId },
  );

  // Listen for NFT transfer events and save to database
  useEffect(() => {
    const saveNFTFromEvent = async () => {
      if (needsDbSave && transferEvents.length > 0 && !dbSavePending && nftData) {
        try {
          setDbSavePending(true);

          // Find the most recent transfer event (should be the mint)
          const event = transferEvents[transferEvents.length - 1];

          if (event) {
            addConsoleMessage(`> Blockchain confirmation received!`);
            addConsoleMessage(`> NFT created successfully`);

            // Save the NFT to the database with the actual token ID
            addConsoleMessage(`> Save NFT Metadata in the system...`);
            await createNFTMutation.mutateAsync({
              ...nftData,
              tokenId: event.tokenId,
            });

            setNeedsDbSave(false);
          } else {
            // If we can't find a transfer event, use a temporary token ID
            addConsoleMessage('> Warning: Could not find event information');
            addConsoleMessage('> Using temporary ID for registration');

            await createNFTMutation.mutateAsync(nftData);

            setNeedsDbSave(false);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          addConsoleMessage(`> System error: ${errorMessage}`);
        } finally {
          setDbSavePending(false);
        }
      }
    };

    saveNFTFromEvent();
  }, [transferEvents, needsDbSave, dbSavePending, nftData, createNFTMutation]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    propertyIndex: number | null = null,
    field: string | null = null,
  ) => {
    if (propertyIndex !== null && field !== null) {
      // Update property
      const updatedProperties = [...formData.properties];
      updatedProperties[propertyIndex] = {
        ...updatedProperties[propertyIndex],
        [field]: e.target.value,
      };

      setFormData({
        ...formData,
        properties: updatedProperties,
      });
    } else {
      // Update regular field
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAddProperty = () => {
    setFormData({
      ...formData,
      properties: [...formData.properties, { name: '', value: '' }],
    });
  };

  const addConsoleMessage = (message: string) => {
    setConsoleMessages((prev) => [...prev, message]);
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

    // Validate file
    if (!formData.file) {
      addConsoleMessage('> Error: Please upload an image for your NFT.');
      return;
    }

    setIsSubmitting(true);
    setShowProgressBar(true);
    setConsoleMessages([]);
    addConsoleMessage('> Processing data...');
    addConsoleMessage(`> Owner address: ${address?.slice(0, 6)}...${address?.slice(-4)}`);
    addConsoleMessage(`> Collection: ${collectionName}`);

    try {
      // Get IPFS folder ID from collection if available
      const ipfsFolderId = collection?.pinataGroupId || undefined;

      // Upload image to IPFS
      addConsoleMessage('> Uploading asset to IPFS...');
      let imageUrl = '';
      let metadataUrl = '';

      try {
        // Prepare metadata with properties
        const nftMetadata = {
          name: formData.title,
          description: formData.description,
          attributes: formData.properties.map((prop) => ({
            trait_type: prop.name,
            value: prop.value,
          })),
        };

        const uploadResult = await uploadToPinata(formData.file, nftMetadata, ipfsFolderId);

        if (uploadResult) {
          imageUrl = uploadResult.image.url;
          metadataUrl = uploadResult.metadata.url;

          addConsoleMessage(`> Asset uploaded successfully to IPFS`);
          addConsoleMessage(`> Metadata prepared successfully`);
        }
      } catch (error) {
        addConsoleMessage(
          `> Error uploading to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        throw error; // Re-throw to be caught by the outer try/catch
      }

      // Prepare NFT data for database save (will be saved after blockchain confirmation)
      const nftToSave = {
        tokenId: `${Date.now()}-temp`, // Temporary token ID, will be replaced with actual one from event
        name: formData.title,
        description: formData.description || undefined,
        metadataUrl,
        imageUrl,
        contractAddress: collectionId,
        ownerAddress: address,
      };

      // Mint the NFT using the smart contract
      addConsoleMessage('> Creating NFT on blockchain...');
      addConsoleMessage('> Waiting for wallet confirmation...');

      const { hash, error: mintError } = await mintNFT(collectionId, address, metadataUrl);

      if (mintError) {
        addConsoleMessage(`> Error creating NFT: ${mintError.message}`);
        throw mintError;
      }

      if (hash) {
        setTxHash(hash);
        addConsoleMessage(`> Transaction submitted successfully`);
        addConsoleMessage('> This may take a few minutes. Please wait...');

        // Store NFT data for saving to database after blockchain confirmation
        setNftData(nftToSave);
        setNeedsDbSave(true);
      }
    } catch (error) {
      console.error('Error creating NFT:', error);
      addConsoleMessage(`> Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSubmitting(false);
      setShowProgressBar(false);
    }
  };

  const handleCancel = () => {
    router.push(`/collections/${collectionId}`);
  };

  // Placeholder image for preview
  const previewImage =
    formData.file && formData.file instanceof File
      ? URL.createObjectURL(formData.file)
      : '/assets/images/placeholder.svg';

  // Clean up object URLs when component unmounts or file changes
  useEffect(() => {
    let objectUrl = '';
    if (formData.file && formData.file instanceof File) {
      objectUrl = URL.createObjectURL(formData.file);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [formData.file]);

  return (
    <Win98Window
      title={`Create NFT - ${collectionName}`}
      className="max-w-12xl mx-auto"
      icon="/assets/icons/window/gallery-create.png"
    >
      <form onSubmit={handleSubmit} className="p-4 bg-[#c0c0c0]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <NFTFormFields
              formData={formData}
              handleChange={handleChange}
              handleAddProperty={handleAddProperty}
            />

            <NFTFormNote />

            {/* Wallet connection status */}
            <div className="mt-4 p-3 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]">
              <p className="text-sm">
                <span className="font-bold">NFT Owner:</span>{' '}
                {address ? (
                  <span className="font-mono text-xs">
                    {address.slice(0, 6)}...{address.slice(-4)} <b>{'(YOU)'}</b>{' '}
                  </span>
                ) : (
                  <span className="text-red-600">
                    No wallet connected. Please connect your wallet.
                  </span>
                )}
              </p>
            </div>

            {/* Console Output */}
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
                      <p className="mb-1 text-yellow-400">
                        {'> Note: Creating an NFT requires asset uploading and blockchain minting.'}
                      </p>
                      <p className="text-white">{`> Owner: ${address ? address.slice(0, 6) + '...' + address.slice(-4) : 'Not connected'}`}</p>
                      <p className="text-white">{"> Click 'Create NFT' again to confirm."}</p>
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
          </div>

          <div>
            <NFTPreview
              title={formData.title || 'Untitled NFT'}
              image={previewImage}
              description={formData.description || 'No description'}
              properties={formData.properties}
            />
          </div>
        </div>

        <NFTFormActions
          onCancel={handleCancel}
          showConfirmation={showConsole}
          isSubmitting={
            isSubmitting || isUploading || isMintLoading || isEventLoading || dbSavePending
          }
        />
      </form>
    </Win98Window>
  );
}

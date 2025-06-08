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

  // Get the create NFT mutation
  const createNFTMutation = trpc.nft.create.useMutation({
    onSuccess: () => {
      router.push(`/collections/${collectionId}`);
      router.refresh();
    },
  });

  // Get collection details to retrieve pinataGroupId
  const { data: collection } = trpc.collection.getByContractAddress.useQuery(
    { contractAddress: collectionId },
    { enabled: !!collectionId },
  );

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
    setConsoleMessages([]);
    addConsoleMessage('> Processing data...');
    addConsoleMessage(`> Owner address: ${address}`);
    addConsoleMessage(`> Collection: ${collectionName} (${collectionId})`);

    try {
      // Generate a mock token ID (in a real app, this would come from blockchain)
      const tokenId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      addConsoleMessage(`> Token ID: ${tokenId}`);

      // Get Pinata group ID from collection if available
      const pinataGroupId = collection?.pinataGroupId || undefined;

      // Upload image to Pinata
      addConsoleMessage('> Uploading image to IPFS...');
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

        // Add properties to console output
        addConsoleMessage(`> Properties: ${formData.properties.length} attributes`);
        formData.properties.forEach((prop) => {
          if (prop.name && prop.value) {
            addConsoleMessage(`>   ${prop.name}: ${prop.value}`);
          }
        });

        const uploadResult = await uploadToPinata(formData.file, nftMetadata, pinataGroupId);

        if (uploadResult) {
          imageUrl = uploadResult.image.url;
          metadataUrl = uploadResult.metadata.url;

          addConsoleMessage(`> Image uploaded successfully to IPFS`);
          addConsoleMessage(`> Image CID: ${uploadResult.image.cid}`);
          addConsoleMessage(`> Image URL: ${uploadResult.image.url}`);
          addConsoleMessage(`> Metadata CID: ${uploadResult.metadata.cid}`);
          addConsoleMessage(`> Metadata URL: ${uploadResult.metadata.url}`);
        }
      } catch (error) {
        addConsoleMessage(
          `> Error uploading to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        throw error; // Re-throw to be caught by the outer try/catch
      }

      addConsoleMessage('> Creating NFT in database...');

      try {
        // Use tRPC to create NFT with the connected wallet address
        await createNFTMutation.mutateAsync({
          tokenId,
          name: formData.title,
          description: formData.description || undefined,
          metadataUrl,
          imageUrl: imageUrl,
          contractAddress: collectionId,
          ownerAddress: address,
        });

        addConsoleMessage('> NFT created successfully!');
        addConsoleMessage('> Redirecting to collection page...');

        // Short delay before redirecting to allow user to see the success message
        setTimeout(() => {
          router.push(`/collections/${collectionId}`);
          router.refresh();
        }, 1500);
      } catch (error) {
        // Handle specific database errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
        addConsoleMessage(`> Database error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error creating NFT:', error);
      addConsoleMessage(`> Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
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
                    {address} <b>{'(YOU)'}</b>{' '}
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
                      {
                        '> Note: Minting an NFT will create a unique digital asset in your collection.'
                      }
                    </p>
                    <p className="text-white">{`> Owner: ${address || 'Not connected'}`}</p>
                    <p className="text-white">{"> Click 'Create NFT' again to confirm."}</p>
                  </>
                )}
              </div>
            )}

            <NFTFormActions
              onCancel={handleCancel}
              isSubmitting={isSubmitting || isUploading}
              showConfirmation={showConsole}
            />
          </div>

          <div className="md:col-span-1">
            <NFTPreview
              name={formData.title || 'New NFT'}
              description={formData.description || 'Your NFT description will appear here'}
              image={previewImage}
              properties={formData.properties}
            />
          </div>
        </div>
      </form>
    </Win98Window>
  );
}

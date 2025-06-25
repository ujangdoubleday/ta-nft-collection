'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { useState, ChangeEvent, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/api/trpc/client';
import { useWallet } from '@/lib/hooks/wallet';
import { usePinataUpload, METADATA_TYPE } from '@/lib/hooks/usePinataUpload';
import {
  NFTFormFields,
  NFTFormActions,
  NFTFormNote,
} from '@/components/features/collections/nft/mint';
import { NFTPreview } from '@/components/features/collections/nft/preview';
import { NFTFormData } from '@/components/features/collections/nft/mint/NFTFormFields';
import { useNFTCollection, useNFTCollectionEvents } from '@/lib/blockchain/hooks';
import { Win98Spinner } from '@/components/ui/organisms';
import { refreshNFTMetadata } from '@/lib/blockchain/utils';

interface NFTMintFormProps {
  collectionId: string;
}

type UploadResult = {
  success: boolean;
  image: { url: string };
  metadata: { url: string };
  error?: string;
};

const createObjectURL = (file: File): string => URL.createObjectURL(file);

const formatAddress = (address: string): string => `${address.slice(0, 6)}...${address.slice(-4)}`;

const createNFTMetadata = (formData: NFTFormData) => ({
  name: formData.title,
  description: formData.description,
  attributes: formData.properties.map((prop) => ({
    trait_type: prop.name,
    value: prop.value,
  })),
  external_url: '', // Optional for NFT metadata
});

const uploadNFTToIPFS = async (
  file: File,
  metadata: any,
  uploadToPinata: (
    file: File,
    metadata: any,
    folderId?: string,
    metadataType?: string,
  ) => Promise<any>,
  folderId?: string,
): Promise<UploadResult> => {
  const result = await uploadToPinata(file, metadata, folderId, METADATA_TYPE.NFT);
  if (!result) {
    throw new Error('Failed to upload to IPFS');
  }
  return result;
};

const mintNFTOnBlockchain = async (
  collectionId: string,
  ownerAddress: string,
  metadataUrl: string,
  mintNFT: (collectionId: string, ownerAddress: string, metadataUrl: string) => Promise<any>,
) => {
  const result = await mintNFT(collectionId, ownerAddress, metadataUrl);
  if (result.error) {
    throw result.error;
  }
  return result;
};

export function NFTMintForm({ collectionId }: NFTMintFormProps) {
  const router = useRouter();
  const { address } = useWallet();

  // Form state
  const [formData, setFormData] = useState<NFTFormData>({
    title: '',
    description: '',
    file: null,
    properties: [
      { name: 'Rarity', value: 'Common' },
      { name: 'Type', value: 'Pixel Art' },
    ],
  });

  // UI and process states
  const [showConsole, setShowConsole] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { uploadToPinata, isUploading } = usePinataUpload();
  const { mintNFT, isLoading: isMintLoading } = useNFTCollection();
  const { transferEvents, loading: isEventLoading } = useNFTCollectionEvents(
    collectionId,
    txHash || '',
  );

  const addConsoleMessage = useCallback((message: string) => {
    setConsoleMessages((prev) => [...prev, message]);
  }, []);

  const { data: collection } = trpc.collection.getByContractAddress.useQuery(
    { contractAddress: collectionId },
    {
      enabled: !!collectionId,
      staleTime: 300000,
    },
  );

  const uploadToIPFSMutation = useMutation({
    mutationFn: ({ file, metadata, folderId }: { file: File; metadata: any; folderId?: string }) =>
      uploadNFTToIPFS(file, metadata, uploadToPinata, folderId),
    onSuccess: () => {
      addConsoleMessage('> Asset uploaded successfully to IPFS');
      addConsoleMessage('> Metadata prepared successfully');
    },
    onError: (error) => {
      addConsoleMessage(
        `> Error uploading to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    },
  });

  const mintNFTMutation = useMutation({
    mutationFn: ({
      collectionId,
      ownerAddress,
      metadataUrl,
    }: {
      collectionId: string;
      ownerAddress: string;
      metadataUrl: string;
    }) => mintNFTOnBlockchain(collectionId, ownerAddress, metadataUrl, mintNFT),
    onSuccess: (result) => {
      if (result.hash) {
        setTxHash(result.hash);
        addConsoleMessage('> Transaction submitted to blockchain');
        addConsoleMessage('> This may take a few minutes. Please wait...');
      }
    },
    onError: (error) => {
      addConsoleMessage(
        `> Error creating NFT: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    },
  });

  // Handle blockchain confirmation and redirect
  useEffect(() => {
    const handleConfirmationAndRedirect = async () => {
      if (transferEvents.length > 0 && txHash) {
        try {
          const event = transferEvents[transferEvents.length - 1];
          if (event) {
            addConsoleMessage('> Blockchain confirmation received!');
            addConsoleMessage('> NFT created successfully');

            // Refresh NFT metadata on Alchemy
            addConsoleMessage('> Refreshing NFT metadata.');
            try {
              await refreshNFTMetadata(collectionId, event.tokenId);
              addConsoleMessage('> Metadata refresh request sent to Alchemy');
            } catch (refreshError) {
              console.error('Error refreshing metadata:', refreshError);
              addConsoleMessage('> Warning: Failed to refresh metadata, continuing anyway');
            }

            addConsoleMessage('> Redirecting to collection page...');
            setTimeout(() => {
              router.push(`/collections/${collectionId}`);
              router.refresh();
            }, 3000); // 3 second delay before redirect
          }
        } catch (error) {
          console.error('Error in handleConfirmationAndRedirect:', error);
        }
      }
    };

    handleConfirmationAndRedirect();
  }, [transferEvents, txHash, addConsoleMessage, collectionId, router]);

  // Cleanup object URL
  useEffect(() => {
    let objectUrl = '';
    if (formData.file && formData.file instanceof File) {
      objectUrl = createObjectURL(formData.file);
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [formData.file]);

  // Preview image URL
  const previewImage = useMemo(() => {
    if (formData.file && formData.file instanceof File) {
      return createObjectURL(formData.file);
    }
    return '/assets/images/placeholder.svg';
  }, [formData.file]);

  // Handlers
  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    propertyIndex: number | null = null,
    field: string | null = null,
  ) => {
    if (propertyIndex !== null && field !== null) {
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

    // Validate required fields
    if (!formData.title) {
      addConsoleMessage('> Error: NFT title is required.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.file) {
      addConsoleMessage('> Error: NFT image is required. Please upload an image.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    setShowProgressBar(true);
    setConsoleMessages([]);
    addConsoleMessage('> Processing data...');
    addConsoleMessage(`> Owner address: ${address}`);
    addConsoleMessage(`> Collection: ${collectionId}`);

    try {
      addConsoleMessage('> Uploading asset to IPFS...');
      const nftMetadata = createNFTMetadata(formData);
      const ipfsFolderId = collection?.pinataGroupId || undefined;

      const uploadResult = await uploadToIPFSMutation.mutateAsync({
        file: formData.file,
        metadata: nftMetadata,
        folderId: ipfsFolderId,
      });

      addConsoleMessage('> Creating NFT on blockchain...');
      addConsoleMessage('> Waiting for wallet confirmation...');

      await mintNFTMutation.mutateAsync({
        collectionId,
        ownerAddress: address,
        metadataUrl: uploadResult.metadata.url,
      });

      // Add more detailed logging
      addConsoleMessage('> Transaction submitted to blockchain');
      addConsoleMessage('> Waiting for blockchain confirmation...');

      // Add a fallback timer in case event listening fails
      const fallbackTimer = setTimeout(() => {
        if (!transferEvents.length) {
          addConsoleMessage('> Using fallback: Event detection timed out');
          addConsoleMessage('> Redirecting to collection page...');
          router.push(`/collections/${collectionId}`);
          router.refresh();
        }
      }, 15000); // 15 second fallback

      return () => clearTimeout(fallbackTimer);
    } catch (error) {
      addConsoleMessage(`> Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
      setShowProgressBar(false);
    }
  };

  const handleCancel = () => {
    router.push(`/collections/${collectionId}`);
  };

  // Compute loading state
  const isLoading =
    isSubmitting ||
    uploadToIPFSMutation.isPending ||
    mintNFTMutation.isPending ||
    isUploading ||
    isMintLoading ||
    isEventLoading;

  return (
    <Win98Window
      title={'Create NFT'}
      className="max-w-12xl mx-auto"
      icon="/assets/icons/window/gallery-create.png"
    >
      <form onSubmit={handleSubmit} className="p-4 bg-[#c0c0c0]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <NFTFormFields
              formData={formData}
              handleChangeAction={handleChange}
              handleAddPropertyAction={handleAddProperty}
            />
            <NFTFormNote />

            <div className="mt-4 p-3 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]">
              <p className="text-sm">
                <span className="font-bold">NFT Owner:</span>{' '}
                {address ? (
                  <span className="font-mono text-xs">
                    {formatAddress(address)} <b>(YOU)</b>
                  </span>
                ) : (
                  <span className="text-red-600">
                    No wallet connected. Please connect your wallet.
                  </span>
                )}
              </p>
            </div>

            {showConsole && (
              <>
                <div className="mt-6 mb-4 bg-black text-[#00FF00] p-3 font-mono text-sm border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white">
                  <div className="bg-[#000080] text-white px-2 py-1 -mt-3 -mx-3 mb-2 flex items-center">
                    <span className="text-xs font-bold">Console</span>
                  </div>
                  {consoleMessages.length > 0 ? (
                    consoleMessages.map((msg, i) => (
                      <p key={i} className={msg.includes('Error') ? 'text-red-400 mb-1' : 'mb-1'}>
                        {msg}
                      </p>
                    ))
                  ) : (
                    <>
                      <p className="mb-1">{'> Processing data...'}</p>
                      <p className="mb-1 text-yellow-400">
                        {'> Note: Creating an NFT requires asset uploading and blockchain minting.'}
                      </p>
                      <p className="text-white">{`> Owner: ${address ? formatAddress(address) : 'Not connected'}`}</p>
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
          onCancelAction={handleCancel}
          showConfirmation={showConsole}
          isSubmitting={isLoading}
        />
      </form>
    </Win98Window>
  );
}

'use client';

import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { Win98Spinner } from '@/components/ui/organisms';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  CollectionFormActions,
  CollectionFormFields,
} from '@/components/features/collections/collection/form';
import { CollectionFormData } from '@/components/features/collections/collection/form/CollectionFormFields';
import { usePinataUpload, METADATA_TYPE } from '@/lib/hooks/usePinataUpload';
import { useWallet } from '@/lib/hooks/wallet';
import { useNFTFactory } from '@/lib/blockchain/hooks';
import { subscribeToContractEvents } from '@/lib/blockchain/utils/alchemy';
import { decodeEventLog, parseAbiItem } from 'viem';
import { trpc } from '@/lib/api/trpc/client';

// Get the factory address from environment variable
const NFT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

// Event signature for CollectionCreated
const COLLECTION_CREATED_EVENT_SIGNATURE =
  'CollectionCreated(address,string,string,address,uint256,uint256,uint256)';

// Parse the event ABI item for proper decoding
const collectionCreatedEventAbi = parseAbiItem(
  'event CollectionCreated(address indexed collectionAddress, string name, string symbol, address indexed creator, uint256 totalSupply, uint256 indexed collectionId, uint256 feesPaid)',
);

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

// Collection event type
type CollectionCreatedEvent = {
  collectionAddress: string;
  name: string;
  symbol: string;
  owner: string;
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
  uploadToPinata: (
    file: File,
    metadata: any,
    folderId?: string,
    metadataType?: string,
  ) => Promise<any>,
  folderId?: string,
) => {
  if (formData.coverImage) {
    return await uploadToPinata(
      formData.coverImage,
      {
        name: formData.name,
        description: formData.description || `Collection of NFTs: ${formData.name}`,
        banner_image: '',
        featured_image: '',
        external_link: '',
        collaborators: [],
      },
      folderId,
      METADATA_TYPE.COLLECTION,
    );
  } else {
    throw new Error('Collection image is required');
  }
};

export function CollectionForm({}: CollectionFormProps) {
  const router = useRouter();
  const { address } = useWallet();
  const utils = trpc.useContext();

  // Refs to prevent unnecessary re-renders and fetches
  const hasSetupWebsocket = useRef(false);
  const hasRefreshedData = useRef(false);
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [formData, setFormData] = useState<CollectionFormData>({
    name: '',
    symbol: '',
    description: '',
    coverImage: null,
    storage: 'Ethereum',
    totalSupply: '100',
  });

  // UI state management
  const [showConsole, setShowConsole] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed websocketEvents state - tidak diperlukan lagi
  const [isWebsocketConnected, setIsWebsocketConnected] = useState(false);

  // Get hooks
  const { uploadToPinata, createFolder, isUploading, isCreatingFolder } = usePinataUpload();
  const { createCollection, isLoading: isFactoryLoading, error: factoryError } = useNFTFactory();

  // Add creation fee query
  const { data: creationFee } = trpc.collection.getCreationFee.useQuery();

  // REMOVED: Hooks yang menyebabkan excessive eth_newFilter calls
  // const { collectionCreatedEvents, loading: isEventLoading } = useNFTFactoryEvents(txHash || '');
  // const { collectionCreatedEvents: alchemyEvents, loading: isAlchemyLoading } =
  //   useAlchemyNFTFactoryEvents(txHash || '');

  // Memoized console message handler
  const addConsoleMessage = useCallback((message: string) => {
    setConsoleMessages((prev) => [...prev, message]);
  }, []);

  // Memoized refresh function that only runs once per creation
  const refreshCollectionsData = useCallback(async () => {
    if (hasRefreshedData.current) return;

    try {
      hasRefreshedData.current = true;
      addConsoleMessage('> Refreshing collections data...');

      const revalidateResponse = await fetch('/api/revalidate?tag=collections');
      if (!revalidateResponse.ok) {
        console.error('Failed to revalidate collections page');
      } else {
        addConsoleMessage('> Collections page revalidated');
      }

      // Invalidate and refetch tRPC queries for collections
      if (address) {
        await Promise.all([
          utils.collection.getEnrichedCreatorCollections.invalidate({ creatorAddress: address }),
          utils.collection.getCreatorCollections.invalidate({ creatorAddress: address }),
        ]);
      }
    } catch (error) {
      console.error('Error refreshing collections:', error);
      hasRefreshedData.current = false; // Reset on error
    }
  }, [addConsoleMessage, utils, address]);

  // React Query mutations
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
      // Ensure we have a valid creation fee (use 0 if not set)
      const fee = creationFee ?? BigInt(0);

      // Convert wei to ETH for display
      const ethValue = Number(fee) / 1e18;
      addConsoleMessage(`> Required creation fee: ${fee} wei (${ethValue} ETH)`);
      const result = await createCollection(name, symbol, contractURI, totalSupply, fee);
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
        addConsoleMessage('> Scanning blockchain for collection creation events...');
      }
    },
    onError: (error) => {
      // Check if error is due to insufficient funds
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (
        errorMessage.toLowerCase().includes('insufficient') ||
        errorMessage.toLowerCase().includes('funds')
      ) {
        addConsoleMessage('> Error: Insufficient funds to pay creation fee');

        addConsoleMessage(
          `> Make sure you have enough ETH to cover the creation fee (${Number(creationFee ?? 0) / 1e18} ETH)`,
        );
      } else {
        addConsoleMessage(`> Error creating collection: ${errorMessage}`);
      }
    },
  });

  // Handle form changes
  const handleChange = useCallback((e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleFileChange = useCallback((file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      coverImage: file,
    }));
  }, []);

  // Setup Alchemy websocket - hanya ketika ada txHash dan belum setup
  useEffect(() => {
    if (!NFT_FACTORY_ADDRESS || !txHash || hasSetupWebsocket.current) return;

    hasSetupWebsocket.current = true;
    addConsoleMessage('> Setting up real-time blockchain monitoring...');
    setIsWebsocketConnected(true);

    const unsubscribe = subscribeToContractEvents(
      NFT_FACTORY_ADDRESS,
      COLLECTION_CREATED_EVENT_SIGNATURE,
      (log) => {
        try {
          // Hanya process jika ini adalah transaksi kita
          if (log.transactionHash !== txHash) return;

          const decodedEvent = decodeEventLog({
            abi: [collectionCreatedEventAbi],
            data: log.data as `0x${string}`,
            topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
          });

          if (decodedEvent.args) {
            const event: CollectionCreatedEvent = {
              collectionAddress: decodedEvent.args.collectionAddress as string,
              name: decodedEvent.args.name as string,
              symbol: decodedEvent.args.symbol as string,
              owner: decodedEvent.args.creator as string,
            };

            // Pastikan ini adalah event kita
            if (address && event.owner.toLowerCase() === address.toLowerCase()) {
              addConsoleMessage('> Collection created successfully!');
              addConsoleMessage(`> Collection address: ${event.collectionAddress}`);

              setCollectionData((prevData) => {
                if (!prevData) return null;
                return {
                  ...prevData,
                  contractAddress: event.collectionAddress,
                };
              });

              // Trigger refresh and redirect
              refreshCollectionsData().then(() => {
                addConsoleMessage('> Redirecting to collection page...');

                // Clear any existing timeout
                if (redirectTimeout.current) {
                  clearTimeout(redirectTimeout.current);
                }

                redirectTimeout.current = setTimeout(() => {
                  router.push(`/collections`);
                }, 3000);
              });

              // Cleanup websocket setelah berhasil
              unsubscribe();
              setIsWebsocketConnected(false);
              hasSetupWebsocket.current = false;
            }
          }
        } catch (error) {
          console.error('Error processing blockchain event:', error);
        }
      },
    );

    return () => {
      unsubscribe();
      setIsWebsocketConnected(false);
      hasSetupWebsocket.current = false;
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, [txHash, address, addConsoleMessage, refreshCollectionsData, router]); // Hanya depend pada txHash dan address

  // Main form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
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
    if (!formData.name) {
      addConsoleMessage('> Error: Collection name is required.');
      return;
    }

    if (!formData.description) {
      addConsoleMessage('> Error: Collection description is required.');
      return;
    }

    if (!formData.coverImage) {
      addConsoleMessage('> Error: Collection image is required. Please upload an image.');
      return;
    }

    setIsSubmitting(true);
    setShowProgressBar(true);
    setConsoleMessages([]);
    hasRefreshedData.current = false; // Reset refresh flag for new submission

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
      }
    } catch (error) {
      addConsoleMessage(`> Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = useCallback(() => {
    router.push('/collections');
  }, [router]);

  // Calculate loading state
  const isLoading =
    isSubmitting ||
    createPinataFolderMutation.isPending ||
    uploadMetadataMutation.isPending ||
    createBlockchainCollectionMutation.isPending ||
    isUploading ||
    isCreatingFolder ||
    isFactoryLoading;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  return (
    <Win98Window
      title="Create Collection - NFT Creator Wizard"
      className="max-w-12xl mx-auto"
      icon="/assets/icons/window/gallery-create.png"
    >
      <form onSubmit={handleSubmit} className="p-4 bg-[#c0c0c0]">
        <CollectionFormFields
          formData={formData}
          handleChangeAction={handleChange}
          handleFileChangeAction={handleFileChange}
        />

        {/* Wallet connection status */}
        <div className="mt-4 p-3 bg-[#c0c0c0] border-[2px] border-t-white border-l-white border-r-[#808080] border-b-[#808080]">
          <p className="text-sm">
            <span className="font-bold">Collection Owner:</span>{' '}
            {address ? (
              <>
                <span className="font-mono text-xs">
                  {address.slice(0, 6)}...{address.slice(-4)} <b>{'(YOU)'}</b>{' '}
                </span>
                <span className="font-mono text-xs">
                  {creationFee} wei <b>{'(Creation Fee)'}</b>{' '}
                </span>
              </>
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
          onCancelAction={handleCancel}
          showConfirmation={showConsole}
          isSubmitting={isLoading}
        />
      </form>
    </Win98Window>
  );
}

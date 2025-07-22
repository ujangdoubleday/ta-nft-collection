'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePinataUpload, METADATA_TYPE } from '@/lib/hooks/usePinataUpload';
import { useWallet } from '@/lib/hooks/wallet';
import { useNFTCollection } from '@/lib/blockchain/hooks';
import { subscribeToContractEvents } from '@/lib/blockchain/utils/alchemy';
import { decodeEventLog, parseAbiItem } from 'viem';
import { disconnectWebSocket } from '@/lib/blockchain/alchemy/config';
import { useTrpc } from '@/lib/hooks/use-trpc';
import { toast } from 'sonner';

// Event signature for Transfer event
const TRANSFER_EVENT_SIGNATURE = 'Transfer(address,address,uint256)';

// Parse the event ABI item for proper decoding
const transferEventAbi = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
);

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface NFTTransferEvent {
  from: string;
  to: string;
  tokenId: string;
}

export const useNFTMinting = (contractAddress: string, utils: any) => {
  const router = useRouter();
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<NFTAttribute[]>([{ trait_type: '', value: '' }]);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [transferEvent, setTransferEvent] = useState<NFTTransferEvent | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [processingStep, setProcessingStep] = useState('');

  // Refs to prevent unnecessary re-renders
  const hasSetupWebsocket = useRef(false);
  const hasRefreshedData = useRef(false);
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null);

  const { address } = useWallet();
  const { uploadToPinata, isUploading } = usePinataUpload();
  const { mintNFT, isLoading: isMintLoading } = useNFTCollection();
  const { nft } = useTrpc();

  // Create the mutation hook
  const refreshMetadataMutation = nft.refreshNFTMetadata.useMutation();

  // Prevent navigation during minting process or after success (until redirect)
  const preventNavigation = useCallback(
    (e: PopStateEvent) => {
      if (isMinting || mintSuccess) {
        // This will prevent the navigation and keep the user on the current page
        e.preventDefault();
        // Push the current URL back to the history to cancel the navigation
        window.history.pushState(null, '', window.location.href);
        // Show an alert to inform the user
        const message = isMinting
          ? 'NFT minting is in progress. Please wait until the process is complete.'
          : 'NFT minted successfully. Please wait for redirect.';
        alert(message);
      }
    },
    [isMinting, mintSuccess],
  );

  // Handle browser back/forward navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Add event listener for popstate (browser back/forward)
      window.addEventListener('popstate', preventNavigation);

      // Push initial state to enable popstate detection
      window.history.pushState(null, '', window.location.href);

      return () => {
        window.removeEventListener('popstate', preventNavigation);
      };
    }
  }, [preventNavigation]);

  // Add navigation warning when minting is in progress or completed but not yet redirected
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isMinting || mintSuccess) {
        // Standard way to show a confirmation dialog before leaving
        const message = isMinting
          ? 'NFT minting is in progress. Are you sure you want to leave?'
          : 'NFT minted successfully. Please wait for redirect. Are you sure you want to leave?';
        e.preventDefault();
        e.returnValue = message; // Required for Chrome
        return message; // For other browsers
      }
    };

    // Add event listener for page unload/refresh
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Clean up event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isMinting, mintSuccess]);

  // Memoized refresh function that only runs once per creation
  const refreshNFTData = useCallback(
    async (tokenId: string) => {
      if (hasRefreshedData.current) return;

      try {
        hasRefreshedData.current = true;
        setProcessingStep('Refreshing NFT metadata...');
        console.log('Refreshing NFT data...');

        try {
          // Use tRPC procedure instead of direct function call
          await refreshMetadataMutation.mutateAsync({
            contractAddress,
            tokenId,
          });
          console.log('Metadata refresh request sent via tRPC');
        } catch (refreshError) {
          console.error('Error refreshing metadata via tRPC:', refreshError);
        }

        // await fetch(`/api/revalidate?path=/user/collections/${contractAddress}/nfts&type=page`);
        // await fetch(`/api/revalidate?path=/admin/collections/${contractAddress}/nfts&type=page`);

        // if (!revalidateResponse.ok) {
        //   console.error('Failed to revalidate collections page');
        // }

        if (address) {
          await utils.collection.getEnrichedCreatorCollections.invalidate({
            creatorAddress: address,
          });
        }

        setProcessingStep('NFT minted successfully!');
      } catch (error) {
        console.error('Error refreshing NFT data:', error);
        hasRefreshedData.current = false;
      }
    },
    [utils, address, contractAddress, refreshMetadataMutation],
  );

  // Setup Alchemy websocket when transaction hash is available
  useEffect(() => {
    if (!contractAddress || !txHash || hasSetupWebsocket.current) return;

    hasSetupWebsocket.current = true;
    setProcessingStep('Waiting for blockchain confirmation...');
    console.log('Setting up real-time blockchain monitoring...');

    const unsubscribe = subscribeToContractEvents(
      contractAddress,
      TRANSFER_EVENT_SIGNATURE,
      (log) => {
        try {
          if (log.transactionHash !== txHash) return;

          const decodedEvent = decodeEventLog({
            abi: [transferEventAbi],
            data: log.data as `0x${string}`,
            topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
          });

          if (decodedEvent.args) {
            const event: NFTTransferEvent = {
              from: decodedEvent.args.from as string,
              to: decodedEvent.args.to as string,
              tokenId: decodedEvent.args.tokenId ? decodedEvent.args.tokenId.toString() : '0',
            };

            if (event.from === '0x0000000000000000000000000000000000000000') {
              console.log('NFT minted successfully!');
              setTransferEvent(event);

              refreshNFTData(event.tokenId).then(() => {
                setMintSuccess(true);
                setProcessingStep('NFT minted successfully!');
                toast.success('NFT minted successfully!');

                // Only reset isMinting if there was an error
                // If successful, keep it true until redirect happens
                if (error) {
                  setIsMinting(false);
                }

                if (redirectTimeout.current) {
                  clearTimeout(redirectTimeout.current);
                }
              });

              unsubscribe();
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
      hasSetupWebsocket.current = false;
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
      disconnectWebSocket();
    };
  }, [txHash, address, refreshNFTData, contractAddress, error]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);

    if (file) {
      // Validate file size before setting preview
      if (file.size > 20 * 1024 * 1024) {
        // 20MB limit
        toast.error('Image size exceeds 20MB limit. Please choose a smaller image.');
        setImageFile(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!imageFile) {
      toast.error('Please upload an image');
      setError(new Error('Image is required'));
      return;
    }

    if (!nftName.trim()) {
      toast.error('Name is required');
      setError(new Error('Name is required'));
      return;
    }

    if (!nftDescription.trim()) {
      toast.error('Description is required');
      setError(new Error('Description is required'));
      return;
    }

    setIsMinting(true);
    hasRefreshedData.current = false;

    try {
      // The key is to call uploadToPinata directly with the NFT file and minimal metadata
      // This will use the backend upload.ts route which handles proper metadata creation
      setProcessingStep('Uploading NFT to IPFS...');
      console.log('Uploading NFT to IPFS...');

      const filteredAttributes = attributes.filter((attr) => attr.trait_type && attr.value);

      // Use the enhanced uploadToPinata which handles large files
      const uploadResult = await uploadToPinata(
        imageFile,
        {
          name: nftName,
          description: nftDescription,
          attributes: filteredAttributes,
          external_url: '',
        },
        undefined, // No folder ID
        METADATA_TYPE.NFT, // Specify this is NFT metadata type
      );

      console.log('Upload result:', uploadResult);

      if (!uploadResult?.metadata?.url) {
        throw new Error('Failed to get metadata URL from upload');
      }

      // Mint the NFT with the metadata URL
      setProcessingStep('Minting NFT on blockchain...');
      console.log('Minting NFT with metadata URL:', uploadResult.metadata.url);
      const result = await mintNFT(contractAddress, address, uploadResult.metadata.url);

      if (result.error) {
        throw result.error;
      }

      if (result.hash) {
        setTxHash(result.hash);
        setProcessingStep('Transaction submitted, waiting for confirmation...');
        console.log('Mint transaction submitted:', result.hash);

        // Set a fallback timer in case the event listener doesn't catch the event
        const fallbackTimer = setTimeout(() => {
          if (!transferEvent && !mintSuccess) {
            console.log('Using fallback: Event detection timed out');
            setProcessingStep('NFT minted successfully (fallback)');
            setMintSuccess(true);
            toast.success('NFT minted successfully!');
            // Don't reset isMinting here to keep the button in loading state
          }
        }, 30000);

        redirectTimeout.current = fallbackTimer;
      }
    } catch (err) {
      console.error('Mint process error:', err);

      // Improved error handling
      let errorMessage = 'Unknown error during minting';

      if (err instanceof Error) {
        errorMessage = err.message;

        // Check for specific errors
        if (errorMessage.includes('413') || errorMessage.includes('Content Too Large')) {
          errorMessage = 'Image file is too large. Please choose a smaller image (under 20MB).';
        } else if (errorMessage.includes('User denied') || errorMessage.includes('rejected')) {
          errorMessage = 'Transaction was rejected. Please approve the transaction to continue.';
        } else if (errorMessage.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds in your wallet to complete this transaction.';
        }
      }

      toast.error(errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
      setIsMinting(false);
    }
  };

  const resetForm = () => {
    setNftName('');
    setNftDescription('');
    setImagePreview(null);
    setImageFile(null);
    setAttributes([{ trait_type: '', value: '' }]);
    setMintSuccess(false);
    setTxHash(null);
    setTransferEvent(null);
    setError(null);
    setProcessingStep('');
    setIsMinting(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
      disconnectWebSocket();
    };
  }, []);

  return {
    nftName,
    setNftName,
    nftDescription,
    setNftDescription,
    imagePreview,
    setImagePreview,
    imageFile,
    setImageFile,
    attributes,
    setAttributes,
    isMinting,
    mintSuccess,
    txHash,
    transferEvent,
    error,
    processingStep,
    isUploading,
    isMintLoading,
    address,
    handleMint,
    resetForm,
  };
};

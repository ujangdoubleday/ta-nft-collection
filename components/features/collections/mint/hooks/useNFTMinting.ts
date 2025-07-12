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

  // Memoized refresh function that only runs once per creation
  const refreshNFTData = useCallback(
    async (tokenId: string) => {
      if (hasRefreshedData.current) return;

      try {
        hasRefreshedData.current = true;
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
                setIsMinting(false);

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
  }, [txHash, address, refreshNFTData, contractAddress]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contractAddress || !imageFile || !address) {
      setError(new Error('Please select an image for your NFT and connect your wallet'));
      return;
    }

    if (!nftName.trim()) {
      setError(new Error('Name is required'));
      return;
    }

    if (!nftDescription.trim()) {
      setError(new Error('Description is required'));
      return;
    }

    setIsMinting(true);
    hasRefreshedData.current = false;

    try {
      // The key is to call uploadToPinata directly with the NFT file and minimal metadata
      // This will use the backend upload.ts route which handles proper metadata creation
      console.log('Uploading NFT to IPFS...');

      const filteredAttributes = attributes.filter((attr) => attr.trait_type && attr.value);

      // This is the key change - use the direct uploadToPinata call with minimal metadata
      // The server-side code in upload.ts will handle creating proper metadata structure
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
      console.log('Minting NFT with metadata URL:', uploadResult.metadata.url);
      const result = await mintNFT(contractAddress, address, uploadResult.metadata.url);

      if (result.error) {
        throw result.error;
      }

      if (result.hash) {
        setTxHash(result.hash);
        console.log('Mint transaction submitted:', result.hash);

        // Set a fallback timer in case the event listener doesn't catch the event
        const fallbackTimer = setTimeout(() => {
          if (!transferEvent && !mintSuccess) {
            console.log('Using fallback: Event detection timed out');
            setMintSuccess(true);
            setIsMinting(false);
          }
        }, 30000);

        redirectTimeout.current = fallbackTimer;
      }
    } catch (err) {
      console.error('Mint process error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error during minting'));
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
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  return {
    nftName,
    setNftName,
    nftDescription,
    setNftDescription,
    imagePreview,
    setImagePreview,
    attributes,
    setAttributes,
    isMinting,
    mintSuccess,
    imageFile,
    setImageFile,
    handleMint,
    resetForm,
    isUploading,
    isMintLoading,
    address,
    error,
  };
};

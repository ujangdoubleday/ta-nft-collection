'use client';

import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { subscribeToContractEvents } from '../utils/alchemy';
import { decodeEventLog, parseAbiItem } from 'viem';

// Import the full ABI from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_COLLECTION_ABI from '../abi/NFTCollection.json';

// Event signature for Transfer event
const TRANSFER_EVENT_SIGNATURE = 'Transfer(address,address,uint256)';

// Parse the event ABI item for proper decoding
const transferEventAbi = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
);

export interface NFTTransferEvent {
  from: string;
  to: string;
  tokenId: string;
}

export interface UseNFTTransferReturn {
  transferNFT: (
    contractAddress: string,
    from: string, // current owner
    to: string, // new owner
    tokenId: string,
  ) => Promise<{
    hash?: `0x${string}`;
    error?: Error;
  }>;
  isLoading: boolean;
  isSuccess: boolean;
  isWaiting: boolean;
  error: Error | null;
  transactionHash: `0x${string}` | undefined;
  transferEvents: Array<NFTTransferEvent>;
  reset: () => void;
}

export function useNFTTransfer(): UseNFTTransferReturn {
  const [error, setError] = useState<Error | null>(null);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [currentContractAddress, setCurrentContractAddress] = useState<string | undefined>();
  const [transferEvents, setTransferEvents] = useState<NFTTransferEvent[]>([]);

  // Refs to prevent unnecessary re-renders and duplicate websocket connections
  const hasSetupWebsocket = useRef(false);

  // Track contract writes and transaction receipts
  const { writeContractAsync, isPending: isTransferLoading, isSuccess } = useWriteContract();

  const { data: receipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  // Setup Alchemy websocket for transfer events
  useEffect(() => {
    if (!currentContractAddress || !transactionHash || hasSetupWebsocket.current) return;

    hasSetupWebsocket.current = true;
    console.log('Setting up websocket for transfer events:', currentContractAddress);

    const unsubscribe = subscribeToContractEvents(
      currentContractAddress,
      TRANSFER_EVENT_SIGNATURE,
      (log) => {
        try {
          // Only process if this is our transaction
          if (log.transactionHash !== transactionHash) return;

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

            console.log('Transfer event detected:', event);

            // Add the event to our state
            setTransferEvents((prev) => [...prev, event]);
          }
        } catch (error) {
          console.error('Error processing transfer event:', error);
        }
      },
    );

    return () => {
      console.log('Cleaning up transfer event websocket');
      unsubscribe();
      hasSetupWebsocket.current = false;
    };
  }, [currentContractAddress, transactionHash]);

  // Reset function to clear state
  const reset = () => {
    setError(null);
    setTransactionHash(undefined);
    setCurrentContractAddress(undefined);
    setTransferEvents([]);
    hasSetupWebsocket.current = false;
  };

  const transferNFT = async (
    contractAddress: string,
    from: string,
    to: string,
    tokenId: string,
  ) => {
    try {
      // Convert tokenId to BigInt for the contract call
      const tokenIdBigInt = BigInt(tokenId);

      // Reset previous errors
      setError(null);

      // Update contract address to watch events
      setCurrentContractAddress(contractAddress);

      // Make the contract write call using safeTransferFrom instead of transferFrom
      const hash = await writeContractAsync({
        abi: NFT_COLLECTION_ABI,
        address: contractAddress as `0x${string}`,
        functionName: 'safeTransferFrom',
        args: [from, to, tokenIdBigInt],
        chainId: sepolia.id,
      });

      // Set transaction hash to track
      setTransactionHash(hash);

      return { hash };
    } catch (err) {
      console.error('Error transferring NFT:', err);
      const transferError = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(transferError);
      return { error: transferError };
    }
  };

  return {
    transferNFT,
    isLoading: isTransferLoading,
    isWaiting: isWaitingForReceipt,
    isSuccess,
    error,
    transactionHash,
    transferEvents,
    reset,
  };
}

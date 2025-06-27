'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { subscribeToContractEvents } from '../utils/alchemy';
import { decodeEventLog, parseAbiItem } from 'viem';
import { alchemy } from '../alchemy';

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
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isUnmountedRef = useRef(false);

  // Track contract writes and transaction receipts
  const { writeContractAsync, isPending: isTransferLoading, isSuccess } = useWriteContract();

  const { data: receipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  // Setup Alchemy websocket for transfer events
  useEffect(() => {
    if (!currentContractAddress || hasSetupWebsocket.current) return;

    // Clean up any existing subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    hasSetupWebsocket.current = true;
    console.log('Setting up websocket for transfer events:', currentContractAddress);

    // First, set up a broader filter to catch all events from this contract
    const unsubscribe = subscribeToContractEvents(
      currentContractAddress,
      TRANSFER_EVENT_SIGNATURE,
      (log, event) => {
        try {
          console.log('Received transfer event log:', log);
          console.log('Transaction hash comparison:', {
            logTxHash: log.transactionHash,
            ourTxHash: transactionHash,
            matches: transactionHash
              ? log.transactionHash === transactionHash
              : 'No tx hash set yet',
          });

          if (isUnmountedRef.current) return;

          // Process all transfer events, we'll filter by transaction hash if needed
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

            console.log('Decoded transfer event:', event);

            // Add the event to our state
            setTransferEvents((prev) => [...prev, event]);
          }
        } catch (error) {
          console.error('Error processing transfer event:', error);
        }
      },
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      console.log('Cleaning up transfer event websocket');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      hasSetupWebsocket.current = false;
    };
  }, [currentContractAddress]);

  // Also watch for transaction receipt to extract events
  useEffect(() => {
    if (!receipt || !currentContractAddress || isUnmountedRef.current) return;

    console.log('Transaction receipt received:', receipt);

    // Look for Transfer events in the receipt logs
    const transferLogs = receipt.logs.filter((log) => {
      // Transfer event topic (keccak256 hash of Transfer(address,address,uint256))
      return log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    });

    console.log('Found transfer logs in receipt:', transferLogs);

    // Process each transfer log
    const newEvents: NFTTransferEvent[] = [];

    transferLogs.forEach((log) => {
      try {
        const decodedEvent = decodeEventLog({
          abi: [transferEventAbi],
          data: log.data,
          topics: log.topics,
        });

        if (decodedEvent.args) {
          const event: NFTTransferEvent = {
            from: decodedEvent.args.from as string,
            to: decodedEvent.args.to as string,
            tokenId: decodedEvent.args.tokenId ? decodedEvent.args.tokenId.toString() : '0',
          };

          console.log('Decoded transfer event from receipt:', event);
          newEvents.push(event);
        }
      } catch (error) {
        console.error('Error decoding transfer event from receipt:', error);
      }
    });

    // Only update state if we have new events and not unmounted
    if (newEvents.length > 0 && !isUnmountedRef.current) {
      setTransferEvents((prev) => [...prev, ...newEvents]);
    }
  }, [receipt]);

  // Set up unmount detection
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  // Reset function to clear state
  const reset = useCallback(() => {
    // Prevent reset from causing state updates if component is unmounted
    if (isUnmountedRef.current) return;

    setError(null);
    setTransactionHash(undefined);
    setCurrentContractAddress(undefined);
    setTransferEvents([]);

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    hasSetupWebsocket.current = false;
  }, []);

  const transferNFT = useCallback(
    async (contractAddress: string, from: string, to: string, tokenId: string) => {
      try {
        // Convert tokenId to BigInt for the contract call
        const tokenIdBigInt = BigInt(tokenId);

        // Reset previous errors
        setError(null);

        // Update contract address to watch events
        setCurrentContractAddress(contractAddress);

        console.log(`Initiating NFT transfer: from ${from} to ${to}, token ID ${tokenId}`);

        // Make the contract write call using safeTransferFrom instead of transferFrom
        const hash = await writeContractAsync({
          abi: NFT_COLLECTION_ABI,
          address: contractAddress as `0x${string}`,
          functionName: 'safeTransferFrom',
          args: [from, to, tokenIdBigInt],
          chainId: sepolia.id,
        });

        console.log(`Transaction submitted with hash: ${hash}`);

        // Set transaction hash to track
        setTransactionHash(hash);

        return { hash };
      } catch (err) {
        console.error('Error transferring NFT:', err);
        const transferError = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(transferError);
        return { error: transferError };
      }
    },
    [writeContractAsync],
  );

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

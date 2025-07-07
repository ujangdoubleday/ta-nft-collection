'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  usePublicClient,
  useWalletClient,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { subscribeToContractEvents } from '../utils/alchemy';
import { decodeEventLog, parseAbiItem, getContract } from 'viem';
import { disconnectWebSocket } from '../alchemy/config';
import { NFT_COLLECTION_ABI } from '@/lib/blockchain/abi';

// Event signature for Transfer event (burn is a transfer to zero address)
const TRANSFER_EVENT_SIGNATURE = 'Transfer(address,address,uint256)';

// Parse the event ABI item for proper decoding
const transferEventAbi = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
);

// Rename interface to avoid conflict with NFTTransferEvent
export interface NFTBurnEventData {
  from: string;
  to: string;
  tokenId: string;
  transactionHash?: string;
}

export interface NFTBurnResult {
  hash?: `0x${string}`;
  error?: Error;
}

export function useNFTBurn() {
  const [error, setError] = useState<Error | null>(null);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [currentContractAddress, setCurrentContractAddress] = useState<string | undefined>();
  const [burnEvents, setBurnEvents] = useState<NFTBurnEventData[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Refs to prevent unnecessary re-renders
  const hasSetupWebsocket = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isUnmountedRef = useRef(false);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Watch for transaction receipt
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
    console.log('Setting up websocket for burn events:', currentContractAddress);

    // Set up a filter for Transfer events
    const unsubscribe = subscribeToContractEvents(
      currentContractAddress,
      TRANSFER_EVENT_SIGNATURE,
      (log) => {
        try {
          console.log('Received transfer event log:', log);

          if (isUnmountedRef.current) return;

          // Process all transfer events to look for burns (transfers to zero address)
          const decodedEvent = decodeEventLog({
            abi: [transferEventAbi],
            data: log.data as `0x${string}`,
            topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
          });

          if (decodedEvent.args) {
            const event: NFTBurnEventData = {
              from: decodedEvent.args.from as string,
              to: decodedEvent.args.to as string,
              tokenId: decodedEvent.args.tokenId ? decodedEvent.args.tokenId.toString() : '0',
              transactionHash: log.transactionHash,
            };

            // Only track burns (transfers to zero address)
            if (event.to.toLowerCase() === '0x0000000000000000000000000000000000000000') {
              console.log('Decoded burn event:', event);
              setBurnEvents((prev) => [...prev, event]);
            }
          }
        } catch (error) {
          console.error('Error processing burn event:', error);
        }
      },
    );

    unsubscribeRef.current = unsubscribe;

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      hasSetupWebsocket.current = false;
      isUnmountedRef.current = true;
      disconnectWebSocket();
    };
  }, [currentContractAddress]);

  // Also watch for transaction receipt to extract events
  useEffect(() => {
    if (!receipt || !currentContractAddress || isUnmountedRef.current) return;

    console.log('Transaction receipt received:', receipt);
    setIsWaiting(false);
    setIsSuccess(true);

    // Look for Transfer events in the receipt logs
    const transferLogs = receipt.logs.filter((log) => {
      // Transfer event topic (keccak256 hash of Transfer(address,address,uint256))
      return log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    });

    console.log('Found transfer logs in receipt:', transferLogs);

    // Process each transfer log
    const newEvents: NFTBurnEventData[] = [];

    transferLogs.forEach((log) => {
      try {
        const decodedEvent = decodeEventLog({
          abi: [transferEventAbi],
          data: log.data,
          topics: log.topics,
        });

        if (decodedEvent.args) {
          const event: NFTBurnEventData = {
            from: decodedEvent.args.from as string,
            to: decodedEvent.args.to as string,
            tokenId: decodedEvent.args.tokenId ? decodedEvent.args.tokenId.toString() : '0',
            transactionHash: receipt.transactionHash,
          };

          // Only add burn events (transfers to zero address)
          if (event.to.toLowerCase() === '0x0000000000000000000000000000000000000000') {
            console.log('Decoded burn event from receipt:', event);
            newEvents.push(event);
          }
        }
      } catch (error) {
        console.error('Error decoding burn event from receipt:', error);
      }
    });

    // Only update state if we have new events and not unmounted
    if (newEvents.length > 0 && !isUnmountedRef.current) {
      setBurnEvents((prev) => [...prev, ...newEvents]);
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
    setBurnEvents([]);
    setIsLoading(false);
    setIsWaiting(false);
    setIsSuccess(false);

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    hasSetupWebsocket.current = false;
  }, []);

  const burnNFT = useCallback(
    async (contractAddress: string, tokenId: string): Promise<NFTBurnResult> => {
      if (!walletClient) {
        const walletError = new Error('Wallet not connected');
        setError(walletError);
        return { error: walletError };
      }

      setError(null);
      setTransactionHash(undefined);
      setCurrentContractAddress(contractAddress);
      setBurnEvents([]);
      setIsLoading(true);
      setIsWaiting(false);
      setIsSuccess(false);

      try {
        // Create contract instance
        const contract = getContract({
          address: contractAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          client: { public: publicClient, wallet: walletClient },
        });

        console.log('Burning NFT:', {
          contractAddress,
          tokenId,
        });

        // Call transferFrom instead of safeTransferFrom
        const hash = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'transferFrom',
          args: [
            walletClient.account.address,
            '0x0000000000000000000000000000000000000000' as `0x${string}`,
            BigInt(tokenId),
          ],
        });

        console.log('Transaction submitted:', hash);
        setTransactionHash(hash);
        setIsLoading(false);
        setIsWaiting(true);

        return { hash };
      } catch (err) {
        console.error('Burn failed:', err);
        setIsLoading(false);
        setIsWaiting(false);
        const error = err instanceof Error ? err : new Error('Unknown error during burn');
        setError(error);
        return { error };
      }
    },
    [publicClient, walletClient],
  );

  return {
    burnNFT,
    isLoading,
    isWaiting,
    isSuccess,
    transactionHash,
    burnEvents,
    error,
    reset,
  };
}

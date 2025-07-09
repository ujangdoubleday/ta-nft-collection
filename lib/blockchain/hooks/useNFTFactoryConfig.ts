'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useContractWrite } from 'wagmi';
import { NFT_FACTORY_ABI } from '../abi';
import { parseEther, decodeEventLog, parseAbiItem, formatEther } from 'viem';
import { trpc } from '@/lib/api/trpc/client';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';
import { subscribeToContractEvents } from '../utils/alchemy';
import { disconnectWebSocket } from '../alchemy/config';
import { publicClient } from '@/lib/blockchain/viem';

// Event signature for CreationFeeUpdated event
const FEE_UPDATED_EVENT_SIGNATURE = 'CreationFeeUpdated(uint256,uint256)';

// Parse the event ABI item for proper decoding
const feeUpdatedEventAbi = parseAbiItem('event CreationFeeUpdated(uint256 oldFee, uint256 newFee)');

export interface FeeUpdatedEvent {
  oldFee: string;
  newFee: string;
}

export const useNFTFactoryConfig = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [feeEvents, setFeeEvents] = useState<FeeUpdatedEvent[]>([]);

  // Refs to prevent unnecessary re-renders
  const hasSetupWebsocket = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isUnmountedRef = useRef(false);

  // Read creation fee using tRPC
  const {
    data: feeData,
    isLoading: isLoadingFee,
    refetch: refetchFee,
  } = trpc.factoryConfig.getCreationFee.useQuery();

  // Write contract function
  const { writeContractAsync } = useContractWrite();

  // Setup Alchemy websocket for fee update events
  useEffect(() => {
    if (hasSetupWebsocket.current) return;

    // Clean up any existing subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    hasSetupWebsocket.current = true;
    console.log('Setting up websocket for fee update events');

    // Set up event listener
    const unsubscribe = subscribeToContractEvents(
      NFT_FACTORY_ADDRESS,
      FEE_UPDATED_EVENT_SIGNATURE,
      (log, event) => {
        try {
          console.log('Received fee update event log:', log);

          if (isUnmountedRef.current) return;

          // Process fee update events
          const decodedEvent = decodeEventLog({
            abi: [feeUpdatedEventAbi],
            data: log.data as `0x${string}`,
            topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
          });

          if (decodedEvent.args) {
            const event: FeeUpdatedEvent = {
              oldFee: decodedEvent.args.oldFee ? decodedEvent.args.oldFee.toString() : '0',
              newFee: decodedEvent.args.newFee ? decodedEvent.args.newFee.toString() : '0',
            };

            console.log('Decoded fee update event:', event);

            // Add the event to our state
            setFeeEvents((prev) => [...prev, event]);

            // Refetch the fee data
            refetchFee();
          }
        } catch (error) {
          console.error('Error processing fee update event:', error);
        }
      },
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      console.log('Cleaning up fee update event websocket');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      hasSetupWebsocket.current = false;
      isUnmountedRef.current = true;
      disconnectWebSocket();
    };
  }, [refetchFee]);

  // Set up unmount detection
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  // Handle fee update
  const updateCreationFee = useCallback(
    async (newFee: string) => {
      setIsUpdating(true);
      setError(null);

      try {
        const parsedFee = parseEther(newFee);

        // Write to contract
        const hash = await writeContractAsync({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
          functionName: 'setCreationFee',
          args: [parsedFee],
        });

        // Set transaction hash
        setTransactionHash(hash);

        return hash;
      } catch (err) {
        console.error('Error updating creation fee:', err);
        setError(err instanceof Error ? err : new Error('Failed to update creation fee'));
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [writeContractAsync],
  );

  return {
    creationFee: feeData?.fee ?? '0',
    rawFee: feeData?.rawFee ?? BigInt(0),
    isLoadingFee,
    isUpdating,
    updateCreationFee,
    error,
    feeEvents,
    transactionHash,
  };
};

/**
 * Hook to get total fees collected from the factory contract
 */
export const useTotalFeesCollected = () => {
  const [totalFees, setTotalFees] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTotalFees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const totalFeesCollected = await publicClient.readContract({
        address: NFT_FACTORY_ADDRESS,
        abi: NFT_FACTORY_ABI,
        functionName: 'totalFeesCollected',
      });

      setTotalFees(formatEther(totalFeesCollected as bigint));
      return formatEther(totalFeesCollected as bigint);
    } catch (err) {
      console.error('Error getting total fees collected:', err);
      setError(err instanceof Error ? err : new Error('Failed to get total fees collected'));
      return '0';
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch total fees on mount
  useEffect(() => {
    fetchTotalFees();
  }, [fetchTotalFees]);

  return {
    totalFees,
    isLoading,
    error,
    refetch: fetchTotalFees,
  };
};

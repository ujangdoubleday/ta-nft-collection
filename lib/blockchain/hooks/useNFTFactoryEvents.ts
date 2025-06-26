import { useEffect, useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { decodeEventLog, parseAbiItem } from 'viem';
import { publicClient } from '../viem';

// Types
export interface CollectionCreatedEvent {
  collectionAddress: string;
  name: string;
  symbol: string;
  owner: string;
  transactionHash: string;
}

// Constants
const NFT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
const COLLECTION_CREATED_EVENT_ABI = parseAbiItem(
  'event CollectionCreated(address indexed collectionAddress, string name, string symbol, address indexed creator, uint256 totalSupply, uint256 indexed collectionId, uint256 feesPaid)',
);

// Utility function to safely decode event logs
function safeDecodeEventLog(log: any): any | null {
  try {
    return decodeEventLog({
      abi: [COLLECTION_CREATED_EVENT_ABI],
      data: log.data as `0x${string}`,
      topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
    });
  } catch (error) {
    return null;
  }
}

/**
 * Optimized hook for fetching collections created by a specific address
 * Uses React Query with proper caching and stale-while-revalidate strategy
 */
export function useCreatorCollections(creatorAddress?: `0x${string}` | null) {
  return useQuery({
    queryKey: ['creatorCollections', creatorAddress],
    queryFn: async () => {
      if (!creatorAddress || !NFT_FACTORY_ADDRESS) return [];

      try {
        // Use a single contract call to get all collections by creator
        const collections = await publicClient.readContract({
          address: NFT_FACTORY_ADDRESS,
          abi: [
            {
              inputs: [{ name: 'creator', type: 'address' }],
              name: 'getCollectionsByCreator',
              outputs: [{ name: '', type: 'address[]' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'getCollectionsByCreator',
          args: [creatorAddress],
        });

        return collections as `0x${string}`[];
      } catch (error) {
        console.error('Error fetching creator collections:', error);
        return [];
      }
    },
    enabled: !!creatorAddress && !!NFT_FACTORY_ADDRESS,
    staleTime: 60 * 1000, // Cache for 60 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
}

/**
 * Optimized hook for monitoring specific transaction events
 * Only fetches when a transaction hash is provided and stops after finding the event
 */
export function useTransactionEvents(transactionHash?: string) {
  const [events, setEvents] = useState<CollectionCreatedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use ref to prevent duplicate requests
  const processedTxRef = useRef<Set<string>>(new Set());

  const fetchTransactionEvents = useCallback(async (txHash: string) => {
    if (processedTxRef.current.has(txHash)) {
      return; // Already processed this transaction
    }

    setIsLoading(true);
    setError(null);

    try {
      // Wait for transaction receipt with timeout
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
        timeout: 60_000, // 60 seconds timeout
      });

      // Filter logs for our contract address
      const factoryLogs = receipt.logs.filter(
        (log) => log.address.toLowerCase() === NFT_FACTORY_ADDRESS.toLowerCase(),
      );

      const newEvents: CollectionCreatedEvent[] = [];

      for (const log of factoryLogs) {
        const decodedLog = safeDecodeEventLog(log);

        if (decodedLog && decodedLog.eventName === 'CollectionCreated' && decodedLog.args) {
          newEvents.push({
            collectionAddress: decodedLog.args.collectionAddress as string,
            name: decodedLog.args.name as string,
            symbol: decodedLog.args.symbol as string,
            owner: decodedLog.args.creator as string,
            transactionHash: txHash,
          });
        }
      }

      if (newEvents.length > 0) {
        setEvents(newEvents);
        processedTxRef.current.add(txHash); // Mark as processed
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!transactionHash || !NFT_FACTORY_ADDRESS) return;

    fetchTransactionEvents(transactionHash);
  }, [transactionHash, fetchTransactionEvents]);

  return {
    events,
    isLoading,
    error,
  };
}

/**
 * Lightweight hook for real-time event monitoring
 * Uses polling with exponential backoff instead of WebSocket
 */
export function useRealtimeEvents(enabled: boolean = false) {
  const [latestEvents, setLatestEvents] = useState<CollectionCreatedEvent[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastBlockRef = useRef<number>(0);

  const pollForEvents = useCallback(async () => {
    if (!enabled || !NFT_FACTORY_ADDRESS) return;

    try {
      const currentBlock = await publicClient.getBlockNumber();

      // Only fetch events from new blocks
      if (lastBlockRef.current === 0) {
        lastBlockRef.current = Number(currentBlock) - 10; // Start from 10 blocks ago
        return;
      }

      if (Number(currentBlock) <= lastBlockRef.current) {
        return; // No new blocks
      }

      const logs = await publicClient.getLogs({
        address: NFT_FACTORY_ADDRESS,
        fromBlock: BigInt(lastBlockRef.current + 1),
        toBlock: currentBlock,
        event: COLLECTION_CREATED_EVENT_ABI,
      });

      const newEvents: CollectionCreatedEvent[] = [];

      for (const log of logs) {
        const decodedLog = safeDecodeEventLog(log);

        if (decodedLog && decodedLog.eventName === 'CollectionCreated' && decodedLog.args) {
          newEvents.push({
            collectionAddress: decodedLog.args.collectionAddress as string,
            name: decodedLog.args.name as string,
            symbol: decodedLog.args.symbol as string,
            owner: decodedLog.args.creator as string,
            transactionHash: log.transactionHash || '',
          });
        }
      }

      if (newEvents.length > 0) {
        setLatestEvents((prev) => [...prev, ...newEvents]);
      }

      lastBlockRef.current = Number(currentBlock);
    } catch (error) {
      console.warn('Error polling for events:', error);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Poll every 12 seconds (average Ethereum block time)
    intervalRef.current = setInterval(pollForEvents, 12000);

    // Initial poll
    pollForEvents();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, pollForEvents]);

  return {
    latestEvents,
    clearEvents: useCallback(() => setLatestEvents([]), []),
  };
}

/**
 * Simple hook for getting transaction receipt when needed
 */
export function useTransactionReceipt(transactionHash?: string) {
  return useQuery({
    queryKey: ['transactionReceipt', transactionHash],
    queryFn: async () => {
      if (!transactionHash) return null;

      try {
        return await publicClient.waitForTransactionReceipt({
          hash: transactionHash as `0x${string}`,
          timeout: 60_000,
        });
      } catch (error) {
        throw error;
      }
    },
    enabled: !!transactionHash,
    staleTime: Infinity, // Transaction receipts never change
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

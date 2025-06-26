import { useEffect, useState } from 'react';
import { subscribeToContractEvents } from '../utils/alchemy';
import { alchemy } from '../alchemy';
import { parseAbiItem, decodeEventLog } from 'viem';

// Get the factory address from environment variable
const NFT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

// Event signature for CollectionCreated
// This matches the actual event in the contract
const COLLECTION_CREATED_EVENT_SIGNATURE =
  'CollectionCreated(address,string,string,address,uint256,uint256,uint256)';

// Parse the event ABI item for proper decoding
const collectionCreatedEventAbi = parseAbiItem(
  'event CollectionCreated(address indexed collectionAddress, string name, string symbol, address indexed creator, uint256 totalSupply, uint256 indexed collectionId, uint256 feesPaid)',
);

export interface CollectionCreatedEvent {
  collectionAddress: string;
  name: string;
  symbol: string;
  owner: string;
}

/**
 * Hook to listen for NFT Factory events using Alchemy
 * @param transactionHash Optional transaction hash to check for events
 */
export function useAlchemyNFTFactoryEvents(transactionHash?: string) {
  const [collectionCreatedEvents, setCollectionCreatedEvents] = useState<CollectionCreatedEvent[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Listen for real-time events using Alchemy WebSocket
  useEffect(() => {
    // Don't set up listener if we're just checking a specific transaction
    if (transactionHash) return;

    const unsubscribe = subscribeToContractEvents(
      NFT_FACTORY_ADDRESS,
      COLLECTION_CREATED_EVENT_SIGNATURE,
      (log) => {
        try {
          // Try to decode the event using Viem
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

            setCollectionCreatedEvents((prev) => [...prev, event]);
          }
        } catch (decodeError) {
          // Silent error handling
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Check for events in a specific transaction
  useEffect(() => {
    if (!transactionHash) return;

    const fetchTransactionEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the transaction receipt from Alchemy
        const receipt = await alchemy.core.getTransactionReceipt(transactionHash);

        if (!receipt) {
          throw new Error(`Transaction receipt not found for hash: ${transactionHash}`);
        }

        // Filter logs for our contract address
        const factoryLogs = receipt.logs.filter(
          (log) => log.address.toLowerCase() === NFT_FACTORY_ADDRESS.toLowerCase(),
        );

        // Process each log to find CollectionCreated events
        const events: CollectionCreatedEvent[] = [];

        for (const log of factoryLogs) {
          try {
            // Try to decode the log using Viem
            const decodedLog = decodeEventLog({
              abi: [collectionCreatedEventAbi],
              data: log.data as `0x${string}`,
              topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
            });

            if (decodedLog.eventName === 'CollectionCreated' && decodedLog.args) {
              events.push({
                collectionAddress: decodedLog.args.collectionAddress as string,
                name: decodedLog.args.name as string,
                symbol: decodedLog.args.symbol as string,
                owner: decodedLog.args.creator as string,
              });
            }
          } catch (decodeError) {
            // Fallback: try to extract address from indexed parameter (first topic)
            if (log.topics && log.topics.length > 1) {
              const potentialAddress = log.topics[1];
              if (potentialAddress && potentialAddress.length === 66) {
                // Convert from bytes32 to address (remove padding)
                const addressHex = '0x' + potentialAddress.slice(26);

                if (/^0x[a-fA-F0-9]{40}$/.test(addressHex)) {
                  events.push({
                    collectionAddress: addressHex,
                    name: 'Collection from Alchemy',
                    symbol: 'NFT',
                    owner: receipt.from,
                  });
                }
              }
            }
          }
        }

        // If we found events, update state - avoid duplicates
        if (events.length > 0) {
          // Use a Set to deduplicate events based on collectionAddress
          const uniqueEvents = events.reduce((acc, event) => {
            // Only add if not already in the accumulator
            if (
              !acc.some(
                (e) => e.collectionAddress.toLowerCase() === event.collectionAddress.toLowerCase(),
              )
            ) {
              acc.push(event);
            }
            return acc;
          }, [] as CollectionCreatedEvent[]);

          setCollectionCreatedEvents(uniqueEvents);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setLoading(false);
      }
    };

    fetchTransactionEvents();
  }, [transactionHash]);

  return {
    collectionCreatedEvents,
    loading,
    error,
  };
}

/**
 * Hook to get logs for a specific transaction using Alchemy
 * @param txHash Transaction hash
 * @returns Transaction logs and receipt
 */
export function useAlchemyTransactionLogs(txHash?: string) {
  const [receipt, setReceipt] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!txHash) return;

    const fetchTxLogs = async () => {
      try {
        setLoading(true);

        // Get transaction receipt
        const txReceipt = await alchemy.core.getTransactionReceipt(txHash);
        setReceipt(txReceipt);

        if (txReceipt && txReceipt.logs) {
          setLogs(txReceipt.logs);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchTxLogs();
  }, [txHash]);

  return { receipt, logs, loading, error };
}

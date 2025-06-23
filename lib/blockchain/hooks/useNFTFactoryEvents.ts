import { useEffect, useState } from 'react';
import { useWatchContractEvent } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { Log, TransactionReceipt, decodeEventLog, parseAbiItem } from 'viem';
import { useReadContract } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http } from 'viem';

// Import ABI from compiled contracts
import NFT_FACTORY_EVENTS_ABI from '../abi/NFTFactoryEvents.json';

// Import ABIs from the Hardhat-compiled contracts
// @ts-ignore - This will be imported properly as JSON
import NFT_FACTORY_ABI from '../abi/NFTFactory.json';

// Import Alchemy utilities
import { alchemy, getLogsForTransaction } from '../utils/alchemy';

// Get the factory address from environment variable
const NFT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

// Create a public client with Alchemy transport
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const alchemyRpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(alchemyRpcUrl),
});

// Parse the event ABI item for proper decoding
const collectionCreatedEventAbi = parseAbiItem(
  'event CollectionCreated(address indexed collectionAddress, string name, string symbol, address indexed creator, uint256 totalSupply, uint256 indexed collectionId, uint256 feesPaid)',
);

// Helper function to safely decode event logs
function safeDecodeEventLog(log: any) {
  try {
    return decodeEventLog({
      abi: [collectionCreatedEventAbi],
      data: log.data as `0x${string}`,
      topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
    });
  } catch (error) {
    return null;
  }
}

export interface CollectionCreatedEvent {
  collectionAddress: string;
  name: string;
  symbol: string;
  owner: string;
}

export function useNFTFactoryEvents(transactionHash?: string) {
  const [collectionCreatedEvents, setCollectionCreatedEvents] = useState<CollectionCreatedEvent[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Watch for CollectionCreated events using Wagmi (for real-time events)
  useWatchContractEvent({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_EVENTS_ABI,
    eventName: 'CollectionCreated',
    onLogs: (logs) => {
      try {
        const events = logs.map((log) => {
          try {
            // Try to decode the event using the updated ABI
            const decodedLog = safeDecodeEventLog(log);

            if (decodedLog && decodedLog.eventName === 'CollectionCreated' && decodedLog.args) {
              return {
                collectionAddress: decodedLog.args.collectionAddress as string,
                name: decodedLog.args.name as string,
                symbol: decodedLog.args.symbol as string,
                owner: decodedLog.args.creator as string,
              };
            }

            // Fallback to direct args access if decoding fails
            const args = (log as any).args;
            if (args) {
              return {
                collectionAddress: args.collectionAddress,
                name: args.name || 'Unknown Collection',
                symbol: args.symbol || 'NFT',
                owner: args.creator || args.owner,
              };
            }

            throw new Error('Could not extract event data');
          } catch (decodeError) {
            throw decodeError;
          }
        });

        // Deduplicate events before adding to state
        setCollectionCreatedEvents((prev) => {
          // Combine previous and new events
          const combined = [...prev, ...events];

          // Deduplicate based on collectionAddress
          return combined.reduce((acc, event) => {
            if (
              !acc.some(
                (e) => e.collectionAddress.toLowerCase() === event.collectionAddress.toLowerCase(),
              )
            ) {
              acc.push(event);
            }
            return acc;
          }, [] as CollectionCreatedEvent[]);
        });
      } catch (error) {
        console.error('Error processing event logs');
      }
    },
  });

  // If a transaction hash is provided, try to find the collection address from the transaction receipt
  useEffect(() => {
    if (!transactionHash) return;

    const getCollectionFromTx = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get transaction receipt and logs
        const { receipt, logs } = await getLogsForTransaction(transactionHash, NFT_FACTORY_ADDRESS);

        // Process the logs to find CollectionCreated events
        const events: CollectionCreatedEvent[] = [];

        if (logs && logs.length > 0) {
          for (const log of logs) {
            try {
              // Try to decode the log using Viem
              const decodedLog = safeDecodeEventLog(log);

              if (decodedLog && decodedLog.eventName === 'CollectionCreated' && decodedLog.args) {
                events.push({
                  collectionAddress: decodedLog.args.collectionAddress as string,
                  name: decodedLog.args.name as string,
                  symbol: decodedLog.args.symbol as string,
                  owner: decodedLog.args.creator as string,
                });
                continue;
              }
            } catch (decodeError) {
              // Silent fail, try fallback
            }

            // Fallback: Try to extract address from indexed parameter (first topic)
            if (log.topics && log.topics.length > 1) {
              const potentialAddress = log.topics[1];
              if (potentialAddress && potentialAddress.length === 66) {
                // Convert from bytes32 to address (remove padding)
                const addressHex = '0x' + potentialAddress.slice(26);

                if (/^0x[a-fA-F0-9]{40}$/.test(addressHex)) {
                  events.push({
                    collectionAddress: addressHex,
                    name: 'Unknown Collection', // Will be updated from database
                    symbol: 'NFT',
                    owner: receipt.from,
                  });
                }
              }
            }
          }
        }

        // If we still don't have events, look for contract creation
        if (events.length === 0 && receipt.contractAddress) {
          events.push({
            collectionAddress: receipt.contractAddress,
            name: 'Unknown Collection', // Will be updated from database
            symbol: 'NFT',
            owner: receipt.from,
          });
        }

        if (events.length > 0) {
          // Deduplicate events before adding to state
          setCollectionCreatedEvents((prev) => {
            // Combine previous and new events
            const combined = [...prev, ...events];

            // Deduplicate based on collectionAddress
            return combined.reduce((acc, event) => {
              if (
                !acc.some(
                  (e) =>
                    e.collectionAddress.toLowerCase() === event.collectionAddress.toLowerCase(),
                )
              ) {
                acc.push(event);
              }
              return acc;
            }, [] as CollectionCreatedEvent[]);
          });
        } else {
          // If we couldn't find events, try fallback method
          fallbackGetCollectionFromTx(transactionHash);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));

        // Fallback to traditional method if first method fails
        fallbackGetCollectionFromTx(transactionHash);
      } finally {
        setLoading(false);
      }
    };

    getCollectionFromTx();
  }, [transactionHash]);

  // Fallback method using Viem if first method fails
  const fallbackGetCollectionFromTx = async (txHash: string) => {
    try {
      setLoading(true);

      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      // Find CollectionCreated event in the logs
      if (receipt.logs && receipt.logs.length > 0) {
        const events: CollectionCreatedEvent[] = [];

        for (const log of receipt.logs) {
          if (log.address.toLowerCase() === NFT_FACTORY_ADDRESS.toLowerCase()) {
            try {
              // Try to decode the log using Viem
              const decodedLog = safeDecodeEventLog(log);

              if (decodedLog && decodedLog.eventName === 'CollectionCreated' && decodedLog.args) {
                events.push({
                  collectionAddress: decodedLog.args.collectionAddress as string,
                  name: decodedLog.args.name as string,
                  symbol: decodedLog.args.symbol as string,
                  owner: decodedLog.args.creator as string,
                });
                continue;
              }
            } catch (decodeError) {
              // Silent fail, try fallback
            }

            // Fallback: Try to extract address from indexed parameter (first topic)
            if (log.topics && log.topics.length > 1) {
              const potentialAddress = log.topics[1];
              if (potentialAddress && potentialAddress.length === 66) {
                // Convert from bytes32 to address (remove padding)
                const addressHex = '0x' + potentialAddress.slice(26);

                if (/^0x[a-fA-F0-9]{40}$/.test(addressHex)) {
                  events.push({
                    collectionAddress: addressHex,
                    name: 'Unknown Collection', // Will be updated from database
                    symbol: 'NFT',
                    owner: receipt.from,
                  });
                }
              }
            }
          }
        }

        if (events.length > 0) {
          // Deduplicate events before adding to state
          setCollectionCreatedEvents((prev) => {
            // Combine previous and new events
            const combined = [...prev, ...events];

            // Deduplicate based on collectionAddress
            return combined.reduce((acc, event) => {
              if (
                !acc.some(
                  (e) =>
                    e.collectionAddress.toLowerCase() === event.collectionAddress.toLowerCase(),
                )
              ) {
                acc.push(event);
              }
              return acc;
            }, [] as CollectionCreatedEvent[]);
          });
        }
      }
    } catch (err) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  return {
    collectionCreatedEvents,
    loading,
    error,
  };
}

/**
 * Hook to fetch collections created by a specific address using the NFT Factory contract
 */
export function useCreatorCollections(creatorAddress?: `0x${string}` | null) {
  return useQuery({
    queryKey: ['creatorCollections', creatorAddress],
    queryFn: async () => {
      if (!creatorAddress || !NFT_FACTORY_ADDRESS) return [];

      try {
        // Use Wagmi to read contract data
        const collections = await publicClient.readContract({
          address: NFT_FACTORY_ADDRESS,
          abi: NFT_FACTORY_ABI,
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
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });
}

// Helper function to get function selector (first 4 bytes of the keccak256 hash of the function signature)
function getFunctionSelector(functionName: string): string {
  // This is a simplified version - in a real app you would use a proper library
  // For getCollectionsByCreator(address) the selector is 0x8a591baa
  return '8a591baa';
}

// Helper function to encode an address parameter
function encodeParameter(type: string, value: string): string {
  if (type === 'address') {
    // Remove 0x prefix and pad to 32 bytes (64 hex characters)
    return value.slice(2).padStart(64, '0');
  }
  return '';
}

// Helper function to decode array result
function decodeArrayResult(data: string): `0x${string}`[] {
  // This is a simplified decoder - in a real app you would use a proper library
  try {
    // Remove 0x prefix
    const hexData = data.startsWith('0x') ? data.slice(2) : data;

    // First 32 bytes (64 chars) is the offset to the array data
    const offset = parseInt(hexData.slice(0, 64), 16);

    // Read array length from offset position
    const arrayLengthHex = hexData.slice(offset * 2, offset * 2 + 64);
    const arrayLength = parseInt(arrayLengthHex, 16);

    const result: `0x${string}`[] = [];

    // Read each address (20 bytes = 40 chars) from the array
    for (let i = 0; i < arrayLength; i++) {
      const startPos = offset * 2 + 64 + i * 64;
      const addressHex = '0x' + hexData.slice(startPos + 24, startPos + 64);
      result.push(addressHex as `0x${string}`);
    }

    return result;
  } catch (error) {
    console.error('Error decoding array result:', error);
    return [];
  }
}

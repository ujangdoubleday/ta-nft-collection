import { useEffect, useState } from 'react';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { Log, TransactionReceipt } from 'viem';

// Import ABI from compiled contracts
import NFT_FACTORY_EVENTS_ABI from '../abi/NFTFactoryEvents.json';

// Factory contract address on Sepolia
const NFT_FACTORY_ADDRESS = '0x667d34aDc81895967C39277e2Cd2e32585afdeC3';

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

  const publicClient = usePublicClient();

  // Watch for CollectionCreated events
  useWatchContractEvent({
    address: NFT_FACTORY_ADDRESS,
    abi: NFT_FACTORY_EVENTS_ABI,
    eventName: 'CollectionCreated',
    onLogs: (logs) => {
      console.log('CollectionCreated event detected:', logs);
      const events = logs.map((log) => {
        // Extract arguments from the event log
        const args = (log as any).args as {
          collectionAddress: string;
          name: string;
          symbol: string;
          owner: string;
        };

        return {
          collectionAddress: args.collectionAddress,
          name: args.name,
          symbol: args.symbol,
          owner: args.owner,
        };
      });

      setCollectionCreatedEvents((prev) => [...prev, ...events]);
    },
  });

  // If a transaction hash is provided, try to find the collection address from the transaction receipt
  useEffect(() => {
    if (!transactionHash || !publicClient) return;

    const getCollectionFromTx = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`Looking for collection creation in transaction: ${transactionHash}`);

        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: transactionHash as `0x${string}`,
        });

        console.log('Transaction receipt:', receipt);

        // Find CollectionCreated event in the logs
        if (receipt.logs && receipt.logs.length > 0) {
          const events: CollectionCreatedEvent[] = [];

          // First try to use the publicClient to decode logs
          try {
            const logs = await publicClient.getLogs({
              address: NFT_FACTORY_ADDRESS,
              event: {
                type: 'event',
                name: 'CollectionCreated',
                inputs: [
                  { indexed: false, name: 'collectionAddress', type: 'address' },
                  { indexed: false, name: 'name', type: 'string' },
                  { indexed: false, name: 'symbol', type: 'string' },
                  { indexed: false, name: 'owner', type: 'address' },
                ],
              },
              fromBlock: receipt.blockNumber,
              toBlock: receipt.blockNumber,
            });

            console.log('Logs from getLogs:', logs);

            for (const log of logs) {
              if (log.args && 'collectionAddress' in log.args) {
                events.push({
                  collectionAddress: log.args.collectionAddress as string,
                  name: log.args.name as string,
                  symbol: log.args.symbol as string,
                  owner: log.args.owner as string,
                });
              }
            }
          } catch (logsError) {
            console.warn('Error using getLogs:', logsError);
          }

          // If we couldn't get events from getLogs, try manual parsing
          if (events.length === 0) {
            console.log('Trying manual log parsing...');

            for (const log of receipt.logs) {
              if (log.address.toLowerCase() === NFT_FACTORY_ADDRESS.toLowerCase()) {
                try {
                  // Try to decode the log as a CollectionCreated event
                  const decodedLog = (publicClient as any).decodeEventLog({
                    abi: NFT_FACTORY_EVENTS_ABI,
                    data: log.data,
                    topics: log.topics,
                  });

                  console.log('Decoded log:', decodedLog);

                  if (decodedLog && 'collectionAddress' in decodedLog) {
                    console.log('Found collection event:', decodedLog);
                    events.push({
                      collectionAddress: decodedLog.collectionAddress as string,
                      name: decodedLog.name as string,
                      symbol: decodedLog.symbol as string,
                      owner: decodedLog.owner as string,
                    });
                  }
                } catch (decodeError) {
                  // If we can't decode, try manual extraction
                  console.log('Could not decode log, trying manual extraction:', log);

                  if (log.data && log.data.length >= 66) {
                    try {
                      // Data format for our event: address(32 bytes) + name + symbol + owner
                      const dataWithoutPrefix = log.data.startsWith('0x')
                        ? log.data.slice(2)
                        : log.data;

                      // The address is padded to 32 bytes, so we need to extract the last 40 chars (20 bytes)
                      // of the first 32 bytes (64 chars)
                      const addressHex = '0x' + dataWithoutPrefix.slice(24, 64);
                      console.log('Extracted address from data:', addressHex);

                      // Validate that it's a proper Ethereum address
                      if (/^0x[a-fA-F0-9]{40}$/.test(addressHex)) {
                        // We can't extract the name and symbol easily, so use placeholders
                        events.push({
                          collectionAddress: addressHex,
                          name: 'Unknown Collection', // Will be updated from database
                          symbol: 'NFT',
                          owner: receipt.from,
                        });
                      }
                    } catch (extractError) {
                      console.error('Error extracting address from log data:', extractError);
                    }
                  }
                }
              }
            }
          }

          // If we still don't have events, look for contract creation
          if (events.length === 0 && receipt.contractAddress) {
            console.log('Using contract address from receipt:', receipt.contractAddress);
            events.push({
              collectionAddress: receipt.contractAddress,
              name: 'Unknown Collection', // Will be updated from database
              symbol: 'NFT',
              owner: receipt.from,
            });
          }

          if (events.length > 0) {
            console.log('Found collection events:', events);
            setCollectionCreatedEvents((prev) => [...prev, ...events]);
          } else {
            console.warn('No collection events found in transaction logs');
          }
        }
      } catch (err) {
        console.error('Error getting collection from transaction:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    getCollectionFromTx();
  }, [transactionHash, publicClient]);

  return {
    collectionCreatedEvents,
    loading,
    error,
  };
}

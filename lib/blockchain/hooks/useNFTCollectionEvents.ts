import { useEffect, useState } from 'react';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { Log } from 'viem';

// NFT Collection contract ABI for the Transfer event
const NFT_COLLECTION_EVENT_ABI = [
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
    ],
  },
];

export interface NFTTransferEvent {
  from: string;
  to: string;
  tokenId: string;
}

export function useNFTCollectionEvents(contractAddress?: string, transactionHash?: string) {
  const [transferEvents, setTransferEvents] = useState<NFTTransferEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = usePublicClient();

  // Watch for Transfer events if contract address is provided
  useWatchContractEvent({
    address: contractAddress ? (contractAddress as `0x${string}`) : undefined,
    abi: NFT_COLLECTION_EVENT_ABI,
    eventName: 'Transfer',
    onLogs: (logs) => {
      console.log('Transfer event detected:', logs);
      const events = logs.map((log) => {
        // Extract arguments from the event log
        const args = (log as any).args as {
          from: string;
          to: string;
          tokenId: bigint;
        };

        return {
          from: args.from,
          to: args.to,
          tokenId: args.tokenId.toString(),
        };
      });

      setTransferEvents((prev) => [...prev, ...events]);
    },
    enabled: !!contractAddress,
  });

  // If a transaction hash is provided, try to find the token ID from the transaction receipt
  useEffect(() => {
    if (!transactionHash || !publicClient || !contractAddress) return;

    const getTokenFromTx = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`Looking for NFT transfer in transaction: ${transactionHash}`);

        // Wait for transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: transactionHash as `0x${string}`,
        });

        console.log('Transaction receipt:', receipt);

        // Find Transfer event in the logs
        if (receipt.logs && receipt.logs.length > 0) {
          const events: NFTTransferEvent[] = [];

          for (const log of receipt.logs) {
            if (log.address.toLowerCase() === contractAddress.toLowerCase()) {
              try {
                // Try to decode the log as a Transfer event
                const decodedLog = (publicClient as any).decodeEventLog({
                  abi: NFT_COLLECTION_EVENT_ABI,
                  data: log.data,
                  topics: log.topics,
                });

                if (decodedLog && 'tokenId' in decodedLog) {
                  console.log('Found transfer event:', decodedLog);
                  events.push({
                    from: decodedLog.from as string,
                    to: decodedLog.to as string,
                    tokenId: (decodedLog.tokenId as bigint).toString(),
                  });
                }
              } catch (decodeError) {
                // Ignore decode errors, as not all logs are Transfer events
                console.log('Could not decode log as Transfer event');
              }
            }
          }

          if (events.length > 0) {
            setTransferEvents((prev) => [...prev, ...events]);
          }
        }
      } catch (err) {
        console.error('Error getting token from transaction:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    getTokenFromTx();
  }, [transactionHash, publicClient, contractAddress]);

  return {
    transferEvents,
    loading,
    error,
  };
}

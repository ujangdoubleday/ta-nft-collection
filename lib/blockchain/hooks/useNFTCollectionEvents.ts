import { useEffect, useState } from 'react';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { Log, decodeEventLog } from 'viem';

// Define the type for the decoded arguments
interface TransferEventArgs {
  from: `0x${string}`;
  to: `0x${string}`;
  tokenId: bigint;
}

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

/**
 * Hook to watch for NFT transfer events or fetch them from transaction history
 * @param contractAddress The NFT collection contract address
 * @param transactionHash Optional transaction hash to fetch events from
 * @returns The transfer events, loading state, and error
 */
export function useNFTCollectionEvents(contractAddress?: string, transactionHash?: string) {
  const [transferEvents, setTransferEvents] = useState<NFTTransferEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  // Watch for transfer events (only if contract address is provided)
  useWatchContractEvent({
    address: contractAddress as `0x${string}`,
    abi: NFT_COLLECTION_EVENT_ABI,
    eventName: 'Transfer',
    onLogs: (logs) => {
      const newEvents = logs
        .map((log) => {
          try {
            const decoded = decodeEventLog({
              abi: NFT_COLLECTION_EVENT_ABI,
              data: log.data,
              topics: log.topics,
            });

            if (decoded && decoded.args) {
              // Destructure array items directly
              const [from, to, tokenId] = decoded.args;
              return {
                from: from?.toString() || '0x0',
                to: to?.toString() || '0x0',
                tokenId: tokenId ? tokenId.toString() : '0',
              };
            }
            return null;
          } catch (err) {
            console.error('Error decoding event log:', err);
            return null;
          }
        })
        .filter((event): event is NFTTransferEvent => event !== null);

      if (newEvents.length > 0) {
        setTransferEvents((prev) => [...prev, ...newEvents]);
      }
    },
    enabled: !!contractAddress,
  });

  // Fetch transfer events from transaction (if tx hash provided)
  useEffect(() => {
    if (!transactionHash || !publicClient) return;

    const fetchTransferEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get transaction receipt
        const receipt = await publicClient.getTransactionReceipt({
          hash: transactionHash as `0x${string}`,
        });

        // Parse Transfer events from logs
        const events = receipt.logs
          .map((log) => {
            try {
              // Check if this log matches our event signature
              if (
                log.topics.length === 4 &&
                log.topics[0] ===
                  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
              ) {
                // This is a Transfer event (ERC721 standard)
                const decoded = decodeEventLog({
                  abi: NFT_COLLECTION_EVENT_ABI,
                  data: log.data,
                  topics: log.topics,
                });

                if (decoded && decoded.args) {
                  // Destructure array items directly
                  const [from, to, tokenId] = decoded.args;
                  return {
                    from: from?.toString() || '0x0',
                    to: to?.toString() || '0x0',
                    tokenId: tokenId ? tokenId.toString() : '0',
                  };
                }
              }
              return null;
            } catch (err) {
              // Skip logs that can't be decoded
              return null;
            }
          })
          .filter((event): event is NFTTransferEvent => event !== null);

        if (events.length > 0) {
          setTransferEvents((prev) => [...prev, ...events]);
        }
      } catch (err) {
        console.error('Error fetching transfer events:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchTransferEvents();
  }, [transactionHash, publicClient]);

  return {
    transferEvents,
    loading,
    error,
  };
}

import { useEffect, useState } from 'react';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { Log, decodeEventLog } from 'viem';
import NFT_COLLECTION_ABI from '../abi/NFTCollection.json';

// Define the type for the decoded arguments
interface TransferEventArgs {
  from: `0x${string}`;
  to: `0x${string}`;
  tokenId: bigint;
}

// Create an array with just the Transfer event from the full ABI
const TRANSFER_EVENT_ABI = [
  NFT_COLLECTION_ABI.find((item) => item.type === 'event' && item.name === 'Transfer'),
].filter(Boolean);

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

  // Helper function to handle decoding various event log formats
  const safeDecodeEventLog = (log: any) => {
    try {
      // First try standard decode
      // console.log('Attempting to decode log:', log);

      // Try with full ABI first for more accurate decoding
      const decoded = decodeEventLog({
        abi: NFT_COLLECTION_ABI,
        data: log.data,
        topics: log.topics,
      });

      // console.log('Successfully decoded:', decoded);

      if (decoded && decoded.args) {
        // Extract by position if needed
        let from, to, tokenId;

        if (Array.isArray(decoded.args)) {
          [from, to, tokenId] = decoded.args as [any, any, any];
        } else {
          const args = decoded.args as Record<string, any>;
          from = args.from;
          to = args.to;
          tokenId = args.tokenId;
        }

        return {
          from: from?.toString() || '0x0',
          to: to?.toString() || '0x0',
          tokenId: tokenId ? tokenId.toString() : '0',
        };
      }

      // If above does not return, try alternative (used for some ERC721 implementations)
      // Manually decode the topics if necessary based on ERC721 standard
      if (log.topics.length >= 4) {
        return {
          from: `0x${log.topics[1]?.slice(26)}` || '0x0',
          to: `0x${log.topics[2]?.slice(26)}` || '0x0',
          tokenId: log.topics[3] ? BigInt(log.topics[3]).toString() : '0',
        };
      }

      throw new Error('Could not decode event log, missing required data');
    } catch (err) {
      console.error('Error decoding log:', err, 'Log data:', log);
      return null;
    }
  };

  // Watch for transfer events (only if contract address is provided)
  useWatchContractEvent({
    address: contractAddress as `0x${string}`,
    abi: TRANSFER_EVENT_ABI,
    eventName: 'Transfer',
    onLogs: (logs) => {
      // console.log('Received contract event logs:', logs);

      const newEvents = logs
        .map((log) => safeDecodeEventLog(log))
        .filter((event): event is NFTTransferEvent => event !== null);

      if (newEvents.length > 0) {
        // console.log('Successfully decoded events:', newEvents);
        setTransferEvents((prev) => [...prev, ...newEvents]);
      } else {
        console.warn('No events could be decoded from logs');
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
        // console.log('Fetching receipt for transaction:', transactionHash);

        // Get transaction receipt
        const receipt = await publicClient.getTransactionReceipt({
          hash: transactionHash as `0x${string}`,
        });

        // console.log('Transaction receipt logs:', receipt.logs);

        // Parse Transfer events from logs
        const events = receipt.logs
          .map((log) => {
            // Check if this log potentially matches a Transfer event (ERC721)
            const isTransferTopic =
              log.topics[0] ===
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

            if (isTransferTopic) {
              return safeDecodeEventLog(log);
            }
            return null;
          })
          .filter((event): event is NFTTransferEvent => event !== null);

        if (events.length > 0) {
          // console.log('Found Transfer events in transaction:', events);
          setTransferEvents((prev) => [...prev, ...events]);
        } else {
          console.warn('No Transfer events found in transaction receipt');
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

import { useState, useEffect } from 'react';
import { getTransferHistory } from '../utils/alchemy';
import { formatDateToString } from '@/lib/utils/formatting';

export type NFTHistoryItem = {
  type: string;
  from: string;
  to: string;
  date: string;
  price?: string;
  transactionHash?: string;
};

/**
 * Hook to fetch the transfer history of an NFT from the blockchain
 * @param contractAddress The contract address of the NFT
 * @param tokenId The token ID of the NFT
 * @returns Object containing the transfer history, loading state, and error state
 */
export function useNFTHistory(contractAddress: string | undefined, tokenId: string | undefined) {
  const [history, setHistory] = useState<NFTHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!contractAddress || !tokenId) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(
          `Fetching transfer history for contract: ${contractAddress}, token: ${tokenId}`,
        );

        // Fetch transfer history from Alchemy
        const transferEvents = await getTransferHistory(contractAddress, tokenId);

        console.log('Raw transfer events:', transferEvents);

        if (transferEvents.length === 0) {
          console.log('No transfer events found');
          setHistory([]);
          return;
        }

        // Convert to history items - ensure we keep all events in the history
        const historyItems = transferEvents.map(
          (event: { from: string; to: string; timestamp: number; transactionHash: string }) => {
            const isZeroAddress = event.from === '0x0000000000000000000000000000000000000000';

            return {
              type: isZeroAddress ? 'Mint' : 'Transfer',
              from: event.from,
              to: event.to,
              date: formatDateToString(new Date(event.timestamp * 1000)),
              transactionHash: event.transactionHash,
              // If it's a mint, add a default price (could be fetched from transaction in the future)
              price: isZeroAddress ? '0.05 ETH' : undefined,
            };
          },
        );

        console.log('Processed history items:', historyItems);

        // Sort by date (oldest first) for chronological display
        // This ensures mint event is first, followed by transfers
        const sortedHistory = [...historyItems];
        console.log('Final sorted history:', sortedHistory);

        setHistory(sortedHistory);
      } catch (err) {
        console.error('Error fetching NFT history:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch transfer history'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [contractAddress, tokenId]);

  return { history, isLoading, error };
}

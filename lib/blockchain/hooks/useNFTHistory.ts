import { useState, useEffect } from 'react';
import { formatDateToString } from '@/lib/utils/formatting';
import { useTrpc } from '@/lib/hooks/use-trpc';

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
  const [error, setError] = useState<Error | null>(null);
  const { nft } = useTrpc();

  // Use tRPC query for fetching transfer history
  const {
    data: transferEvents,
    isLoading,
    error: trpcError,
  } = nft.getTransferHistory.useQuery(
    { contractAddress: contractAddress || '', tokenId: tokenId || '' },
    {
      enabled: !!(contractAddress && tokenId && contractAddress.startsWith('0x') && tokenId !== ''),
      retry: 1,
    },
  );

  // Handle tRPC error
  useEffect(() => {
    if (trpcError) {
      console.error('tRPC error fetching NFT history:', trpcError);
      setError(new Error(trpcError.message));
    }
  }, [trpcError]);

  // Add debug logs at the start of the hook
  useEffect(() => {
    console.log('useNFTHistory hook called with:', {
      contractAddress,
      tokenId,
      validContractAddress: !!(contractAddress && contractAddress.startsWith('0x')),
      validTokenId: !!(tokenId && tokenId !== ''),
    });
  }, [contractAddress, tokenId]);

  // Process the transfer events when they arrive
  useEffect(() => {
    if (!transferEvents || transferEvents.length === 0) {
      console.log('No transfer events found');
      setHistory([]);
      return;
    }

    console.log('Raw transfer events from tRPC:', transferEvents);

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
  }, [transferEvents]);

  return { history, isLoading, error };
}

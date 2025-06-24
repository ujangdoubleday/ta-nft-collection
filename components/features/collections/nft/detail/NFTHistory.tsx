'use client';

import { HistoryItem } from '@/components/features/collections/types';
import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { useNFTHistory } from '@/lib/blockchain/hooks';
import { LoadingSpinner } from '@/components/shared/loading/LoadingSpinner';

interface NFTHistoryProps {
  contractAddress: string;
  tokenId: string;
  history?: HistoryItem[]; // Keep for backward compatibility
}

// Helper function to format address for display
const formatAddress = (address: string): string => {
  if (!address) return '';
  if (address === '0x0000000000000000000000000000000000000000') {
    return 'New Mint';
  }
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export function NFTHistory({ contractAddress, tokenId, history = [] }: NFTHistoryProps) {
  // Fetch transfer history from blockchain
  const { history: blockchainHistory, isLoading, error } = useNFTHistory(contractAddress, tokenId);

  // Use blockchain history if available, otherwise fallback to provided history
  const displayHistory = blockchainHistory.length > 0 ? blockchainHistory : history;

  // Add transaction link generator
  const getEtherscanLink = (hash?: string) => {
    if (!hash) return null;
    return `https://sepolia.etherscan.io/tx/${hash}`;
  };

  return (
    <Win98Window title="Transfer History" icon="/assets/icons/window/gallery.png" className="mb-3">
      <div className="border-[2px] border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white p-1 mb-1 max-h-24 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-16">
            <LoadingSpinner size="small" text="Loading transfer history..." />
          </div>
        ) : (
          <table className="w-full text-black text-xs">
            <thead className="bg-[#c0c0c0] sticky top-0">
              <tr>
                <th className="py-[3px] px-2 text-left">Type</th>
                <th className="py-[3px] px-2 text-left">From</th>
                <th className="py-[3px] px-2 text-left">To</th>
                <th className="py-[3px] px-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {displayHistory.map((event, index) => {
                const transactionLink = getEtherscanLink(event.transactionHash);

                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-[#efefef]' : ''}>
                    <td className="py-[3px] px-2">
                      {transactionLink ? (
                        <a
                          href={transactionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {event.type}
                        </a>
                      ) : (
                        event.type
                      )}
                    </td>
                    <td className="py-[3px] px-2 truncate max-w-[80px]">
                      {event.from === '0x0000000000000000000000000000000000000000'
                        ? 'New Mint'
                        : formatAddress(event.from)}
                    </td>
                    <td className="py-[3px] px-2 truncate max-w-[80px]">
                      {formatAddress(event.to)}
                    </td>
                    <td className="py-[3px] px-2">{event.date}</td>
                  </tr>
                );
              })}
              {displayHistory.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="py-1 px-2 text-center">
                    {error
                      ? `Error loading history: ${error.message}`
                      : 'No transfer history found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Win98Window>
  );
}

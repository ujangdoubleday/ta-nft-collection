'use client';

import { Clock, ExternalLink, Loader2 } from 'lucide-react';
import { shortenAddress } from '@/lib/utils/formatting';
import { getEtherscanLink } from './utils';
import { HistoryItem } from './types';
import { useNFTHistory } from '@/lib/blockchain/hooks';
import { useEffect } from 'react';

interface HistorySectionProps {
  contractAddress: string;
  tokenId: string;
  history?: HistoryItem[]; // Fallback history
}

export function HistorySection({ contractAddress, tokenId, history = [] }: HistorySectionProps) {
  // // Add debug logging
  // useEffect(() => {
  //   console.log('HistorySection props:', { contractAddress, tokenId });
  //   console.log(
  //     'Is contractAddress valid:',
  //     contractAddress && typeof contractAddress === 'string' && contractAddress.startsWith('0x'),
  //   );
  //   console.log('Is tokenId valid:', tokenId && typeof tokenId === 'string');
  // }, [contractAddress, tokenId]);

  // Ensure contractAddress is properly formatted
  const formattedAddress =
    contractAddress && contractAddress.startsWith('0x')
      ? (contractAddress as `0x${string}`)
      : undefined;

  // Fetch transfer history from blockchain
  const { history: blockchainHistory, isLoading, error } = useNFTHistory(formattedAddress, tokenId);

  // // Add debug logging for hook results
  // useEffect(() => {
  //   console.log('useNFTHistory results:', {
  //     blockchainHistory,
  //     isLoading,
  //     error,
  //     historyLength: blockchainHistory?.length,
  //   });
  // }, [blockchainHistory, isLoading, error]);

  // Use blockchain history if available, otherwise fallback to provided history
  const displayHistory = blockchainHistory?.length > 0 ? blockchainHistory : history;

  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-white" />
        <h3 className="text-white font-medium">History</h3>
        {/* Add debug display */}
        <span className="text-xs text-zinc-500">
          {formattedAddress ? formattedAddress.substring(0, 6) : 'Invalid'}-{tokenId || 'No ID'}
        </span>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-6 w-6 text-white animate-spin mr-2" />
            <span className="text-zinc-400">Loading transaction history...</span>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">Txn Hash</th>
                <th className="text-left py-2 text-zinc-400 font-medium">From</th>
                <th className="text-left py-2 text-zinc-400 font-medium">To</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {displayHistory.length > 0 ? (
                displayHistory.map((item, index) => (
                  <tr key={index} className="border-b border-zinc-800">
                    <td className="py-2">
                      <a
                        href={getEtherscanLink('tx', item.transactionHash || '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        {shortenAddress(item.transactionHash || '', 8)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="py-2">
                      <a
                        href={getEtherscanLink('address', item.from)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-blue-400 transition-colors"
                      >
                        {item.from === '0x0000000000000000000000000000000000000000'
                          ? 'New Mint'
                          : shortenAddress(item.from, 6)}
                      </a>
                    </td>
                    <td className="py-2">
                      <a
                        href={getEtherscanLink('address', item.to)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-blue-400 transition-colors"
                      >
                        {shortenAddress(item.to, 6)}
                      </a>
                    </td>
                    <td className="py-2 text-zinc-400">{item.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-zinc-500">
                    {error
                      ? `Error loading history: ${error.message}`
                      : 'No transaction history found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

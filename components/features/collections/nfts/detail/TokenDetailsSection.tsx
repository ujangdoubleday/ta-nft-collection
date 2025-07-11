'use client';

import { Tag } from 'lucide-react';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { getEtherscanLink } from './utils';

interface TokenDetailsSectionProps {
  tokenId: string;
  address: string;
  tokenType: string;
  copiedAddress: string | null;
  onCopyAddressAction: (address: string) => void;
}

export function TokenDetailsSection({
  tokenId,
  address,
  tokenType,
  copiedAddress,
  onCopyAddressAction,
}: TokenDetailsSectionProps) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <Tag className="h-4 w-4 text-white" />
        <h3 className="text-white font-medium">Token Details</h3>
      </div>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400">Token ID</span>
          <span className="text-white">{tokenId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Contract</span>
          <div className="flex items-center gap-2">
            <a
              href={getEtherscanLink('address', address)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-mono hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              {address}
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={() => onCopyAddressAction(address)}
              className="text-zinc-400 hover:text-white transition-colors"
              title="Copy address"
            >
              {copiedAddress === address ? (
                <Check className="h-3 w-3 text-zinc-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Token Standard</span>
          <span className="text-white">{tokenType}</span>
        </div>
      </div>
    </div>
  );
}

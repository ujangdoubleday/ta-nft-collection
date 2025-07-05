'use client';

import { Tag } from 'lucide-react';
import { shortenAddress } from '@/lib/utils/formatting';

interface TokenDetailsSectionProps {
  tokenId: string;
  address: string;
  tokenType: string;
}

export function TokenDetailsSection({ tokenId, address, tokenType }: TokenDetailsSectionProps) {
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
          <span className="text-white font-mono">{shortenAddress(address, 6)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Token Type</span>
          <span className="text-white">{tokenType}</span>
        </div>
      </div>
    </div>
  );
}

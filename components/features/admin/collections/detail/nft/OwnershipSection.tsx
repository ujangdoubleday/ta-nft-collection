'use client';

import { Copy, ExternalLink, User } from 'lucide-react';
import { getEtherscanLink } from './utils';

interface OwnershipSectionProps {
  creator: string;
  owner: string;
  copiedAddress: string | null;
  onCopyAddressAction: (address: string) => void;
}

export function OwnershipSection({
  creator,
  owner,
  copiedAddress,
  onCopyAddressAction,
}: OwnershipSectionProps) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-1">
        <User className="h-4 w-4 text-white" />
        <h3 className="text-white font-medium">Ownership</h3>
      </div>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Creator</span>
          <div className="flex items-center gap-2">
            <a
              href={getEtherscanLink('address', creator)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-mono hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              {creator}
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={() => onCopyAddressAction(creator)}
              className="text-zinc-400 hover:text-white transition-colors"
              title="Copy address"
            >
              <Copy className="h-3 w-3" />
            </button>
            {copiedAddress === creator && <span className="text-green-500 text-xs">Copied!</span>}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-400">Owner</span>
          <div className="flex items-center gap-2">
            <a
              href={getEtherscanLink('address', owner)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-mono hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              {owner}
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={() => onCopyAddressAction(owner)}
              className="text-zinc-400 hover:text-white transition-colors"
              title="Copy address"
            >
              <Copy className="h-3 w-3" />
            </button>
            {copiedAddress === owner && <span className="text-green-500 text-xs">Copied!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useCollectionOwner } from '@/lib/blockchain/hooks/useNFTCollection';
import { useAccount } from 'wagmi';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CurrentCollectionOwnershipProps {
  collectionAddress: string;
  isLoading: boolean;
}

export function CurrentCollectionOwnership({
  collectionAddress,
  isLoading,
}: CurrentCollectionOwnershipProps) {
  const { address } = useAccount();

  // Get current owner
  const { data: currentOwner, isLoading: isLoadingOwner } = useCollectionOwner(
    collectionAddress as `0x${string}`,
  );

  const [ownerCopied, setOwnerCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const copyToClipboard = (text: string, type: 'owner' | 'collection') => {
    navigator.clipboard.writeText(text);
    if (type === 'owner') {
      setOwnerCopied(true);
      setTimeout(() => setOwnerCopied(false), 2000);
    } else {
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };

  // Check if the connected wallet is the owner
  const isOwner =
    address &&
    currentOwner &&
    typeof currentOwner === 'string' &&
    address.toLowerCase() === currentOwner.toLowerCase();

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-bold text-white mb-2">Current Ownership</h2>
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
        <p className="text-xs text-zinc-400 mb-1">Collection Owner</p>
        <div className="p-3 rounded-md border border-zinc-800 mb-3 flex items-center justify-between">
          {isLoading || isLoadingOwner ? (
            <div className="h-6 bg-[#1f1f1f] rounded w-1/2 animate-pulse"></div>
          ) : (
            <>
              <a
                href={`https://sepolia.etherscan.io/address/${currentOwner}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-white break-all hover:text-blue-400 flex items-center"
              >
                {currentOwner && typeof currentOwner === 'string' ? currentOwner : 'No owner'}
                <ExternalLink size={12} className="ml-1" />
              </a>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-zinc-800"
                onClick={() =>
                  currentOwner && typeof currentOwner === 'string'
                    ? copyToClipboard(currentOwner, 'owner')
                    : null
                }
              >
                {ownerCopied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-zinc-400 mb-1">Collection Contract Address</p>
        <div className="p-3 rounded-md border border-zinc-800 mb-3 flex items-center justify-between">
          <a
            href={`https://sepolia.etherscan.io/address/${collectionAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-white break-all hover:text-blue-400 flex items-center"
          >
            {collectionAddress}
            <ExternalLink size={12} className="ml-1" />
          </a>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-zinc-800"
            onClick={() => copyToClipboard(collectionAddress, 'collection')}
          >
            {addressCopied ? <Check size={14} /> : <Copy size={14} />}
          </Button>
        </div>

        <p className="text-xs text-zinc-400 mb-1">Your Status</p>
        <div className="p-3 rounded-md border border-zinc-800">
          {isLoading || isLoadingOwner ? (
            <div className="h-5 bg-[#1f1f1f] rounded w-2/3 animate-pulse"></div>
          ) : (
            <p className={`text-sm font-medium ${isOwner ? 'text-green-400' : 'text-red-400'}`}>
              {isOwner ? 'You are the owner' : 'Not owner'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { EnrichedCollectionInfo } from '@/lib/blockchain/utils/collection';
import { shortenAddress } from '@/lib/utils/formatting';
import { NextImage } from '@/components/shared/NextImage';
import { useEffect } from 'react';
import { trpc } from '@/lib/api/trpc/client';

interface CollectionHeaderProps {
  collection: EnrichedCollectionInfo;
}

export function CollectionHeader({ collection }: CollectionHeaderProps) {
  const [copied, setCopied] = useState(false);

  // Use tRPC to fetch collection owner
  const { data: ownerData, isLoading: isLoadingOwner } =
    trpc.collection.getCollectionOwner.useQuery(
      { collectionAddress: collection?.collectionAddress || '' },
      { enabled: !!collection?.collectionAddress },
    );

  // Get collection name from metadata or fallback to contract name
  const name = collection?.metadata?.name || collection?.name || 'Unnamed Collection';

  // Get collection description from metadata or create a fallback
  const description =
    collection?.metadata?.description || `A collection of NFTs on the Ethereum blockchain.`;

  // Format max supply
  const maxSupply = collection?.maxSupply ? collection.maxSupply.toString() : '0';

  // Format total minted NFTs
  const totalMinted = collection?.totalSupply ? collection.totalSupply.toString() : '0';

  // Format creation date with null check
  const createdAt = collection?.createdAt ? Number(collection.createdAt) * 1000 : Date.now();
  const createdDate = new Date(createdAt);
  const formattedDate = createdDate.toLocaleDateString();

  // Format address for display
  const fullAddress = collection?.collectionAddress || 'Unknown Address';

  // External link to blockchain explorer
  const blockExplorerUrl = collection?.collectionAddress
    ? `https://sepolia.etherscan.io/address/${collection.collectionAddress}`
    : '#';

  // Function to copy address to clipboard
  const copyToClipboard = async () => {
    if (navigator.clipboard && fullAddress !== 'Unknown Address') {
      try {
        await navigator.clipboard.writeText(fullAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const copyToClipboardAddress = async () => {
    if (navigator.clipboard && ownerData !== null) {
      try {
        await navigator.clipboard.writeText(ownerData || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Collection Image */}
        <div className="relative w-full md:w-48 h-48 bg-[#111111] rounded-lg overflow-hidden flex-shrink-0">
          <NextImage
            src={collection?.imageUrl || '/assets/images/placeholders/placeholder_loading.gif'}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 192px"
            className="object-cover"
            fallbackSrc="/assets/images/placeholders/placeholder_loading.gif"
            placeholderType="blur"
          />
        </div>

        {/* Collection Info */}
        <div className="flex-grow">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <h1 className="text-2xl font-bold text-white">{name}</h1>
          </div>

          <p className="text-gray-300 mb-6">{description}</p>

          {/* Collection Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-md px-4 py-2">
              <span className="text-gray-400 text-sm">Max Supply</span>
              <p className="text-white font-medium mt-1">{maxSupply}</p>
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-md px-4 py-2">
              <span className="text-gray-400 text-sm">Total NFTs Minted</span>
              <p className="text-white font-medium mt-1">{totalMinted}</p>
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-md px-4 py-2">
              <span className="text-gray-400 text-sm">Symbol</span>
              <p className="text-white font-medium mt-1">{collection?.symbol || 'UNKNOWN'}</p>
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-md px-4 py-2">
              <span className="text-gray-400 text-sm">Created</span>
              <p className="text-white font-medium mt-1">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ownership Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-white mb-4">Ownership</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contract Address */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-md p-4">
            <span className="text-gray-400 text-sm block mb-2">Contract Address</span>
            <div className="flex items-center gap-2">
              <a
                href={blockExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-mono text-sm hover:text-blue-400 transition-colors flex items-center gap-1 truncate"
              >
                {fullAddress}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
              <button
                onClick={copyToClipboard}
                className="text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                title="Copy address"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-white" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Collection Owner */}
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-md p-4">
            <span className="text-gray-400 text-sm block mb-2">Collection Owner</span>
            <div className="flex items-center gap-2">
              {isLoadingOwner ? (
                <span className="text-gray-300 text-sm">Loading owner...</span>
              ) : ownerData ? (
                <a
                  href={`https://sepolia.etherscan.io/address/${ownerData}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-mono text-sm hover:text-blue-400 transition-colors flex items-center gap-1 truncate"
                >
                  {ownerData}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              ) : (
                <span className="text-gray-300 text-sm">Unknown owner</span>
              )}
              <button
                onClick={copyToClipboardAddress}
                className="text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                title="Copy address"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-white" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

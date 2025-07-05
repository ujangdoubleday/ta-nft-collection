'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { EnrichedCollectionInfo } from '@/lib/blockchain/utils/collection';
import { shortenAddress } from '@/lib/utils/formatting';

interface CollectionHeaderProps {
  collection: EnrichedCollectionInfo;
}

export function CollectionHeader({ collection }: CollectionHeaderProps) {
  // Get collection name from metadata or fallback to contract name
  const name = collection?.metadata?.name || collection?.name || 'Unnamed Collection';

  // Get collection description from metadata or create a fallback
  const description =
    collection?.metadata?.description || `A collection of NFTs on the Ethereum blockchain.`;

  // Format total supply
  const totalSupply = collection?.totalSupply ? collection.totalSupply.toString() : '0';

  // Format creation date with null check
  const createdAt = collection?.createdAt ? Number(collection.createdAt) * 1000 : Date.now();
  const createdDate = new Date(createdAt);
  const formattedDate = createdDate.toLocaleDateString();

  // Format address for display
  const formattedAddress = collection?.collectionAddress
    ? shortenAddress(collection.collectionAddress)
    : 'Unknown Address';

  // External link to blockchain explorer
  const blockExplorerUrl = collection?.collectionAddress
    ? `https://sepolia.etherscan.io/address/${collection.collectionAddress}`
    : '#';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Collection Image */}
        <div className="relative w-full md:w-48 h-48 bg-[#111111] rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={collection?.imageUrl || '/assets/images/placeholders/image-placeholder.svg'}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 192px"
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                '/assets/images/placeholders/image-placeholder.svg';
            }}
          />
        </div>

        {/* Collection Info */}
        <div className="flex-grow">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <h1 className="text-2xl font-bold text-white">{name}</h1>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-400 text-sm">{formattedAddress}</span>
            <a
              href={blockExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <p className="text-gray-300 mb-6">{description}</p>

          {/* Collection Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-md px-4 py-2">
              <span className="text-gray-400 text-sm">Total Supply</span>
              <p className="text-white font-medium mt-1">{totalSupply}</p>
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
    </div>
  );
}

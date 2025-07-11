'use client';

import Link from 'next/link';
import { ImagePlus, ExternalLink, Settings, Share2 } from 'lucide-react';
import { EnrichedCollectionInfo } from '@/lib/blockchain/utils/collection';

interface CollectionActionsProps {
  collection: EnrichedCollectionInfo;
  role?: 'admin' | 'user';
}

export function CollectionActions({ collection, role = 'user' }: CollectionActionsProps) {
  // External link to blockchain explorer
  const blockExplorerUrl = collection?.collectionAddress
    ? `https://sepolia.etherscan.io/address/${collection.collectionAddress}`
    : '#';

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/user/collections';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href={`${basePath}/${collection.collectionAddress}/mint`}
          className="flex items-center gap-3 bg-[#111111] border border-[#1f1f1f] rounded-md p-4 hover:border-indigo-500 transition-colors"
        >
          <div className="bg-[#1f1f1f] p-2 rounded-full">
            <ImagePlus className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-medium">Mint New NFT</p>
            <p className="text-gray-400 text-sm">Create a new NFT in this collection</p>
          </div>
        </Link>

        <Link
          href={`${basePath}/${collection.collectionAddress}/nfts`}
          className="flex items-center gap-3 bg-[#111111] border border-[#1f1f1f] rounded-md p-4 hover:border-indigo-500 transition-colors"
        >
          <div className="bg-[#1f1f1f] p-2 rounded-full">
            <Settings className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-medium">View NFTs</p>
            <p className="text-gray-400 text-sm">Browse all NFTs in this collection</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href={blockExplorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#111111] border border-[#1f1f1f] rounded-md p-4 hover:border-indigo-500 transition-colors"
        >
          <div className="bg-[#1f1f1f] p-2 rounded-full">
            <ExternalLink className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-medium">View on Explorer</p>
            <p className="text-gray-400 text-sm">See on blockchain explorer</p>
          </div>
        </a>

        <button className="flex items-center gap-3 bg-[#111111] border border-[#1f1f1f] rounded-md p-4 hover:border-indigo-500 transition-colors">
          <div className="bg-[#1f1f1f] p-2 rounded-full">
            <Share2 className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-medium">Share Collection</p>
            <p className="text-gray-400 text-sm">Share with others</p>
          </div>
        </button>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { ImagePlus, ExternalLink, Settings, Cog } from 'lucide-react';
import { EnrichedCollectionInfo } from '@/lib/blockchain/utils/collection';
import { useCollectionContext } from '@/components/features/layout/user/UserLayout';

interface CollectionActionsProps {
  collection: EnrichedCollectionInfo;
  role?: 'admin' | 'user';
}

export function CollectionActions({ collection, role = 'user' }: CollectionActionsProps) {
  // Always call the hook unconditionally
  const collectionContext = useCollectionContext();
  // Then conditionally use its value
  const isOwner = role === 'admin' ? true : collectionContext.isOwner;

  // Base path for links based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/user/collections';
  const collectionAddress = collection?.collectionAddress || '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* View NFTs */}
      <Link
        href={`${basePath}/${collectionAddress}/nfts`}
        className="flex flex-col items-center justify-center p-6 bg-[#111111] border border-[#1f1f1f] rounded-lg hover:bg-[#1a1a1a] transition-colors"
      >
        <ExternalLink className="h-8 w-8 text-white mb-3" />
        <span className="text-white font-medium">View NFTs</span>
      </Link>

      {/* Mint NFT - Only show if user is owner */}
      {isOwner && (
        <Link
          href={`${basePath}/${collectionAddress}/mint`}
          className="flex flex-col items-center justify-center p-6 bg-[#111111] border border-[#1f1f1f] rounded-lg hover:bg-[#1a1a1a] transition-colors"
        >
          <ImagePlus className="h-8 w-8 text-white mb-3" />
          <span className="text-white font-medium">Mint NFT</span>
        </Link>
      )}

      {/* Collection Settings - Only show if user is owner */}
      {isOwner && (
        <Link
          href={`${basePath}/${collectionAddress}/settings`}
          className="flex flex-col items-center justify-center p-6 bg-[#111111] border border-[#1f1f1f] rounded-lg hover:bg-[#1a1a1a] transition-colors"
        >
          <Settings className="h-8 w-8 text-white mb-3" />
          <span className="text-white font-medium">Settings</span>
        </Link>
      )}
    </div>
  );
}

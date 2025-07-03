'use client';

import Image from 'next/image';
import { shortenAddress } from '@/lib/utils/formatting';

interface CollectionHeaderProps {
  collection: {
    id: string;
    address: string;
    name: string;
    description: string;
    imageUrl: string;
    itemCount: number;
    createdAt: string;
    symbol: string;
    creator: string;
  };
}

export function CollectionHeader({ collection }: CollectionHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Collection Image */}
      <div className="relative w-full md:w-48 h-48 bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden">
        {collection.imageUrl && (
          <Image
            src={collection.imageUrl}
            alt={collection.name}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src =
                '/assets/images/placeholders/image-placeholder.svg';
            }}
          />
        )}
      </div>

      {/* Collection Info */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white">{collection.name}</h1>
          <span className="bg-[#1f1f1f] text-white text-xs px-2 py-1 rounded">
            {collection.symbol}
          </span>
        </div>

        <p className="text-zinc-400 mb-4">{collection.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Collection Address</span>
            <p className="text-white font-mono">{shortenAddress(collection.address, 8)}</p>
          </div>
          <div>
            <span className="text-zinc-500">Created By</span>
            <p className="text-white font-mono">{shortenAddress(collection.creator, 8)}</p>
          </div>
          <div>
            <span className="text-zinc-500">Created On</span>
            <p className="text-white">{new Date(collection.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-zinc-500">Total NFTs</span>
            <p className="text-white">{collection.itemCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

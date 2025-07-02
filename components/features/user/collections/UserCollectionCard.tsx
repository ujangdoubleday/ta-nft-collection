'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Edit, MoreHorizontal, ExternalLink, ImagePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { shortenAddress } from '@/lib/utils/formatting';

interface UserCollectionCardProps {
  collection: {
    id: string;
    address: string;
    name: string;
    description: string;
    imageUrl: string;
    itemCount: number;
    createdAt: string;
    symbol: string;
  };
}

export function UserCollectionCard({ collection }: UserCollectionCardProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="group bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Collection Image */}
      <div className="relative w-full aspect-square bg-zinc-900">
        {collection.imageUrl ? (
          <Image
            src={collection.imageUrl}
            alt={collection.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src =
                '/assets/images/placeholders/image-placeholder.svg';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <ImagePlus className="h-12 w-12 text-zinc-600" />
          </div>
        )}

        {/* Options button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 bg-zinc-800/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-zinc-700 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4 text-zinc-300" />
          </button>

          {/* Dropdown menu */}
          {showOptions && (
            <div className="absolute right-0 top-10 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-10">
              <div className="py-1">
                <Link
                  href={`/my/collections/${collection.address}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                >
                  <Edit className="h-4 w-4" />
                  Manage Collection
                </Link>
                <Link
                  href={`/my/collections/${collection.address}/nfts/mint`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                >
                  <ImagePlus className="h-4 w-4" />
                  Mint New NFT
                </Link>
                <Link
                  href={`/collections/${collection.address}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Public Page
                </Link>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-zinc-700">
                  <Trash2 className="h-4 w-4" />
                  Delete Collection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collection Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/my/collections/${collection.address}`} className="block">
            <h3 className="font-bold text-white hover:text-zinc-300 transition-colors">
              {collection.name}
            </h3>
          </Link>
          <span className="bg-zinc-700 text-zinc-300 text-xs px-2 py-1 rounded">
            {collection.itemCount} NFTs
          </span>
        </div>

        <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{collection.description}</p>

        <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
          <span title={collection.address}>{shortenAddress(collection.address, 6)}</span>
          <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

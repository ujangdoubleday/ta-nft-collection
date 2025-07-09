'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Edit, MoreHorizontal, ExternalLink, ImagePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { shortenAddress } from '@/lib/utils/formatting';

interface CollectionCardProps {
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
  role?: 'admin' | 'user'; // Add role prop to determine link paths
}

export function CollectionCard({ collection, role = 'user' }: CollectionCardProps) {
  // Format creation date
  const formattedDate = (() => {
    try {
      return new Date(collection.createdAt).toLocaleDateString();
    } catch (e) {
      return 'Unknown date';
    }
  })();

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/my/collections';

  return (
    <>
      <Link href={`${basePath}/${collection.address}`} className="">
        <div className="group bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden hover:bg-zinc-900 hover:border-zinc-600  duration-300 shadow-sm hover:shadow-md transition-all p-4">
          <div className="flex gap-4">
            {/* Collection Image - Left Side */}
            <div className="flex-shrink-0">
              <div className="relative w-20 h-20 bg-[#0A0A0A] rounded-lg overflow-hidden">
                {collection.imageUrl ? (
                  <Image
                    src={collection.imageUrl}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 768px) 80px, 80px"
                    className="object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).src =
                        '/assets/images/placeholders/image-placeholder.svg';
                    }}
                    priority={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]">
                    <ImagePlus className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Collection Info - Right Side */}
            <div className="flex-grow">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-bold text-white hover:text-zinc-300 transition-colors truncate max-w-[70%]">
                  {collection.name || 'Unnamed Collection'}
                </h3>

                <span className="bg-[#1f1f1f] text-white text-xs px-2 py-1 rounded ml-2">
                  {collection.itemCount || 0} NFTs
                </span>
              </div>

              <p className="text-zinc-400 text-sm mb-2 line-clamp-2">
                {collection.description || 'No description available'}
              </p>

              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span title={collection.address}>{shortenAddress(collection.address, 6)}</span>
                <span>Created {formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}

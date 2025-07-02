'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MoreHorizontal, ExternalLink, Share2 } from 'lucide-react';
import { useState } from 'react';
import { shortenAddress } from '@/lib/utils/formatting';

interface NFTCardProps {
  nft: {
    id: string;
    tokenId: string;
    name: string;
    description: string;
    imageUrl: string;
    owner: string;
    creator: string;
    mintedAt: string;
  };
  collectionAddress: string;
}

export function NFTCard({ nft, collectionAddress }: NFTCardProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden hover:shadow-md transition-all">
      {/* NFT Image */}
      <Link href={`/my/collections/${collectionAddress}/nfts/${nft.tokenId}`}>
        <div className="relative w-full aspect-square bg-[#0A0A0A]">
          <Image
            src={nft.imageUrl}
            alt={nft.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src =
                '/assets/images/placeholders/image-placeholder.svg';
            }}
          />

          {/* Options button */}
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowOptions(!showOptions);
              }}
              className="p-2 bg-[#0A0A0A]/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-[#1f1f1f] transition-colors border border-[#1f1f1f]"
            >
              <MoreHorizontal className="h-4 w-4 text-white" />
            </button>

            {/* Dropdown menu */}
            {showOptions && (
              <div
                className="absolute right-0 top-10 w-48 bg-[#0A0A0A] border border-[#1f1f1f] rounded-md shadow-lg z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <Link
                    href={`/my/collections/${collectionAddress}/nfts/${nft.tokenId}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#1f1f1f]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Details
                  </Link>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#1f1f1f]"
                    onClick={(e) => {
                      e.preventDefault();
                      // Share functionality would go here
                      navigator.clipboard.writeText(
                        `${window.location.origin}/collections/${collectionAddress}/nfts/${nft.tokenId}`,
                      );
                      alert('Link copied to clipboard!');
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Share NFT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* NFT Info */}
      <div className="p-3">
        <Link href={`/my/collections/${collectionAddress}/nfts/${nft.tokenId}`}>
          <h3 className="font-medium text-white hover:text-zinc-300 transition-colors">
            {nft.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1 text-xs text-zinc-500">
          <span>Token ID: {nft.tokenId}</span>
          <span title={nft.owner}>{shortenAddress(nft.owner, 4)}</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import { NFTItem } from './types';

interface NFTImageSectionProps {
  nft: NFTItem;
  onTransfer: () => void;
  isOwner?: boolean;
}

export function NFTImageSection({ nft, isOwner = false }: NFTImageSectionProps) {
  return (
    <div className="w-full md:w-1/2">
      <div className="relative aspect-square bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden">
        <Image
          src={nft.imageUrl}
          alt={nft.name}
          fill
          className="object-contain"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            (e.target as HTMLImageElement).src =
              '/assets/images/placeholders/image-placeholder.svg';
          }}
        />
      </div>
    </div>
  );
}

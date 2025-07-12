'use client';

import { NFTItem } from './types';
import { NextImage } from '@/components/shared/NextImage';

interface NFTImageSectionProps {
  nft: NFTItem;
  onTransfer: () => void;
  isOwner?: boolean;
}

export function NFTImageSection({ nft, isOwner = false }: NFTImageSectionProps) {
  return (
    <div className="w-full md:w-1/2">
      <div className="relative aspect-square bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden">
        <NextImage
          src={nft.imageUrl}
          alt={nft.name}
          fill
          className="object-contain"
          fallbackSrc="/assets/images/placeholders/image-placeholder.svg"
          placeholderType="blur"
        />
      </div>
    </div>
  );
}

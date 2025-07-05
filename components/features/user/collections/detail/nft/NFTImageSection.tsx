'use client';

import { Trash2, Send } from 'lucide-react';
import Image from 'next/image';
import { NFTItem } from './types';

interface NFTImageSectionProps {
  nft: NFTItem;
  onTransfer: () => void;
  onBurn: () => void;
}

export function NFTImageSection({ nft, onTransfer, onBurn }: NFTImageSectionProps) {
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

      <div className="flex justify-center mt-4 gap-2">
        <button
          className="flex items-center gap-2 bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] hover:border-zinc-600 text-white py-2 px-4 rounded-md transition-colors text-sm"
          onClick={onTransfer}
        >
          <Send className="h-4 w-4" />
          Transfer
        </button>
        <button
          className="flex items-center gap-2 bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] hover:border-zinc-600 text-white py-2 px-4 rounded-md transition-colors text-sm"
          onClick={onBurn}
        >
          <Trash2 className="h-4 w-4" />
          Burn
        </button>
      </div>
    </div>
  );
}

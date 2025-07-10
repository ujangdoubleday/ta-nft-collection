'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { shortenAddress } from '@/lib/utils/formatting';
import { formatIPFSUrl } from '@/lib/utils/helpers/url';

interface NFTCardProps {
  nft: {
    id: string;
    tokenId: string;
    name: string;
    description: string;
    imageUrl: string;
    contractAddress: string;
    owner?: string;
    metadata?: any;
  };
}

export function NFTCard({ nft }: NFTCardProps) {
  const [imageError, setImageError] = useState(false);

  // Process the image URL to ensure it's properly formatted
  const imageUrl = imageError
    ? '/assets/images/placeholders/image-placeholder.svg'
    : formatIPFSUrl(nft.metadata?.image);

  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden hover:shadow-md transition-all">
      {/* NFT Image */}
      <Link href={`/user/collections/${nft.contractAddress}/nfts/${nft.tokenId}`}>
        <div className="relative w-full aspect-square bg-[#0A0A0A]">
          <Image
            src={imageUrl}
            alt={nft.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized={true} // Disable Next.js image optimization for external URLs
          />
        </div>

        {/* NFT Info */}
        <div className="p-3">
          <h3 className="font-medium text-white hover:text-zinc-300 transition-colors">
            {nft.name}
          </h3>

          <div className="flex items-center justify-between mt-1 text-xs text-zinc-500">
            <span>Token ID: {nft.tokenId}</span>
            <span className="truncate max-w-[120px]" title={nft.contractAddress}>
              {shortenAddress(nft.contractAddress, 4)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

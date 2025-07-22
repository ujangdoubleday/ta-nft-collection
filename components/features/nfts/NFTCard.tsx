'use client';

import Link from 'next/link';
import { useState } from 'react';
import { shortenAddress } from '@/lib/utils/formatting';
import { formatIPFSUrl } from '@/lib/utils/helpers/url';
import { NextImage } from '@/components/shared/NextImage';

interface NFTCardProps {
  nft: {
    id?: string;
    tokenId: string;
    name?: string;
    description?: string;
    imageUrl?: string;
    contractAddress: string;
    owner?: string;
    metadata?: any;
    image?: { originalUrl?: string; cachedUrl?: string };
  };
  role?: 'admin' | 'user';
}

export function NFTCard({ nft, role = 'user' }: NFTCardProps) {
  const [imageError, setImageError] = useState(false);

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/user/collections';

  // Get token ID safely
  const tokenId = nft.tokenId || nft.id || '0';

  // Get name safely
  const name = nft.name || `NFT #${tokenId}`;

  // Process the image URL to ensure it's properly formatted - handle different formats
  const getImageUrl = (): string => {
    if (imageError) return '/assets/images/placeholders/placeholder_loading.gif';

    // Try different possible image formats
    if (nft.metadata?.image) {
      return formatIPFSUrl(nft.metadata.image);
      // return '/assets/images/placeholders/placeholder_loading.gif';
    }

    if (nft.imageUrl) {
      return formatIPFSUrl(nft.imageUrl);
      // return '/assets/images/placeholders/placeholder_loading.gif';
    }

    if (nft.image?.originalUrl) {
      return formatIPFSUrl(nft.image.originalUrl);
    }

    if (nft.image?.cachedUrl) {
      return nft.image.cachedUrl;
    }

    return '/assets/images/placeholders/placeholder_loading.gif';
  };

  const imageUrl = getImageUrl();

  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden hover:shadow-md transition-all">
      {/* NFT Image */}
      <Link href={`${basePath}/${nft.contractAddress}/nfts/${tokenId}`}>
        <div className="relative w-full aspect-square bg-[#0A0A0A]">
          <NextImage
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            onError={() => setImageError(true)}
            fallbackSrc="/assets/images/placeholders/placeholder_loading.gif"
            placeholderType="blur"
          />
        </div>

        {/* NFT Info */}
        <div className="p-2 sm:p-3">
          <h3 className="font-medium text-sm sm:text-base text-white hover:text-zinc-300 transition-colors truncate">
            {name}
          </h3>

          <div className="flex items-center justify-between mt-1 text-[10px] sm:text-xs text-zinc-500">
            <span>Token ID: {tokenId}</span>
            <span className="truncate max-w-[100px] sm:max-w-[120px]" title={nft.contractAddress}>
              {shortenAddress(nft.contractAddress, 4)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

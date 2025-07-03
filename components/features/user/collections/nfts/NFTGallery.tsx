'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NFTCard } from './NFTCard';
import { ImagePlus } from 'lucide-react';

// Sample NFT data - in a real app, this would come from an API or blockchain
const SAMPLE_NFTS = [
  {
    id: '1',
    tokenId: '1',
    name: 'Pixel Art #1',
    description: 'A unique pixel art NFT inspired by retro gaming aesthetics.',
    imageUrl: '/assets/images/nfts/pixel-art/pixel-1.svg',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    creator: '0x7890abcdef1234567890abcdef1234567890abcd',
    mintedAt: '2023-10-20',
  },
  {
    id: '2',
    tokenId: '2',
    name: 'Pixel Art #2',
    description: 'A vibrant pixel art piece with bold colors and geometric patterns.',
    imageUrl: '/assets/images/nfts/pixel-art/pixel-2.svg',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    creator: '0x7890abcdef1234567890abcdef1234567890abcd',
    mintedAt: '2023-10-25',
  },
  {
    id: '3',
    tokenId: '3',
    name: 'Retro Computing #1',
    description: 'An NFT celebrating the history of computing and vintage technology.',
    imageUrl: '/assets/images/nfts/retro-computing/retro-1.svg',
    owner: '0xabcdef1234567890abcdef1234567890abcdef12',
    creator: '0x7890abcdef1234567890abcdef1234567890abcd',
    mintedAt: '2023-11-05',
  },
];

interface NFTGalleryProps {
  collectionAddress: string;
}

export function NFTGallery({ collectionAddress }: NFTGalleryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [nfts, setNfts] = useState<typeof SAMPLE_NFTS>([]);

  // Simulate loading NFTs
  useEffect(() => {
    const timer = setTimeout(() => {
      setNfts(SAMPLE_NFTS);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [collectionAddress]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden">
            <div className="w-full aspect-square bg-[#1f1f1f] animate-pulse"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 bg-[#1f1f1f] rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-[#1f1f1f] rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!nfts.length) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8 text-center">
        <div className="bg-[#0A0A0A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1f1f1f]">
          <ImagePlus className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No NFTs Yet</h3>
        <p className="text-zinc-400 mb-6">This collection doesn&apos;t have any NFTs yet.</p>
        <Link
          href={`/my/collections/${collectionAddress}/nfts/mint`}
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
        >
          <ImagePlus className="h-4 w-4" />
          Mint Your First NFT
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-zinc-400 text-sm">Showing {nfts.length} NFTs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.map((nft) => (
          <NFTCard key={nft.id} nft={nft} collectionAddress={collectionAddress} />
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { NFTGallery } from './NFTGallery';

// Sample data for a collection - in a real app, this would come from an API
const SAMPLE_COLLECTION = {
  id: '1',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  name: 'Pixel Art Collection',
  description: 'A collection of unique pixel art NFTs inspired by retro gaming aesthetics.',
  imageUrl: '/assets/images/nfts/pixel-art/pixel-1.svg',
  itemCount: 8,
  createdAt: '2023-10-15',
  symbol: 'PIXEL',
};

interface CollectionNFTsContentProps {
  address: string;
}

export function CollectionNFTsContent({ address }: CollectionNFTsContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [collection, setCollection] = useState<typeof SAMPLE_COLLECTION | null>(null);

  // Simulate loading collection data
  useEffect(() => {
    const timer = setTimeout(() => {
      setCollection(SAMPLE_COLLECTION);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [address]);

  if (isLoading) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-[#1f1f1f] rounded w-1/4 mb-4"></div>
        <div className="h-12 bg-[#1f1f1f] rounded w-3/4 mb-6"></div>
        <div className="h-32 bg-[#1f1f1f] rounded w-full"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <Link
          href="/my/collections"
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collections
        </Link>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">Collection Not Found</h2>
          <p className="text-zinc-400">The collection with address {address} could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-white">{collection.name} - NFTs</h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"></div>
        <div className="h-px w-full bg-[#1f1f1f] mb-6"></div>
      </div>

      <NFTGallery collectionAddress={address} />
    </>
  );
}

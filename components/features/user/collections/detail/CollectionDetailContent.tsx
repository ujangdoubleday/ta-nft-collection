'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CollectionHeader } from './CollectionHeader';
import { CollectionStats } from './CollectionStats';
import { CollectionActions } from './CollectionActions';
import { NFTGallery } from '../nfts/NFTGallery';

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
  creator: '0x7890abcdef1234567890abcdef1234567890abcd',
};

interface CollectionDetailContentProps {
  address: string;
}

export function CollectionDetailContent({ address }: CollectionDetailContentProps) {
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
        <div className="h-32 bg-[#1f1f1f] rounded w-full mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-[#1f1f1f] rounded"></div>
          <div className="h-24 bg-[#1f1f1f] rounded"></div>
          <div className="h-24 bg-[#1f1f1f] rounded"></div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">Collection Not Found</h2>
          <p className="text-zinc-400">The collection with address {address} could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collection Header */}
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <CollectionHeader collection={collection} />
      </div>

      {/* Stats and Actions in Side-by-Side Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Collection Stats - Left Side */}

        <div className="lg:w-5/12">
          <h2 className="text-md font-bold text-white mb-3">Recent Activity</h2>
          <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
            <CollectionStats collection={collection} />
          </div>
        </div>

        {/* Collection Actions - Right Side */}
        <div className="lg:w-7/12">
          <h2 className="text-md font-bold text-white mb-4">Collection Actions</h2>
          <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
            <CollectionActions collection={collection} />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';
import { UserCollectionCard } from './UserCollectionCard';
import { ImagePlus } from 'lucide-react';
import Link from 'next/link';

// Sample data for collections - in a real app, this would come from an API
const SAMPLE_COLLECTIONS = [
  {
    id: '1',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'Pixel Art Collection',
    description: 'A collection of unique pixel art NFTs inspired by retro gaming aesthetics.',
    imageUrl: '/assets/images/nfts/pixel-art/pixel-1.svg',
    itemCount: 8,
    createdAt: '2023-10-15',
    symbol: 'PIXEL',
  },
  {
    id: '2',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    name: 'Retro Computing',
    description: 'NFTs celebrating the history of computing and vintage technology.',
    imageUrl: '/assets/images/nfts/retro-computing/retro-1.svg',
    itemCount: 3,
    createdAt: '2023-11-20',
    symbol: 'RETRO',
  },
  {
    id: '3',
    address: '0x7890abcdef1234567890abcdef1234567890abcd',
    name: 'Windows 98 Icons',
    description: 'Nostalgic collection featuring iconic elements from the Windows 98 era.',
    imageUrl: '/assets/images/nfts/windows-98-icons/win98-1.svg',
    itemCount: 5,
    createdAt: '2023-12-05',
    symbol: 'WIN98',
  },
];

export function UserCollectionsList() {
  const { data: address } = useAddress();
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<typeof SAMPLE_COLLECTIONS>([]);

  // Simulate loading collections
  useEffect(() => {
    if (address) {
      const timer = setTimeout(() => {
        setCollections(SAMPLE_COLLECTIONS);
        setIsLoading(false);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [address]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden shadow-sm"
          >
            <div className="w-full aspect-square bg-[#1f1f1f] animate-pulse"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 bg-[#1f1f1f] rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-[#1f1f1f] rounded w-full animate-pulse"></div>
              <div className="h-4 bg-[#1f1f1f] rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!collections.length) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8 text-center">
        <div className="bg-[#0A0A0A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1f1f1f]">
          <ImagePlus className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Collections Yet</h3>
        <p className="text-zinc-400 mb-6">You haven&apos;t created any NFT collections yet.</p>
        <Link
          href="/my/collections/new"
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
        >
          <ImagePlus className="h-4 w-4" />
          Create Your First Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <UserCollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}

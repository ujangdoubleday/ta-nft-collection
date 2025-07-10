'use client';

import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';
import { CollectionCard } from './CollectionCard';
import { ImagePlus } from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/lib/api/trpc/client';

interface CollectionsListProps {
  role?: 'admin' | 'user';
}

export function CollectionsList({ role = 'user' }: CollectionsListProps) {
  const { data: address } = useAddress();
  const [isLoading, setIsLoading] = useState(true);

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/user/collections';

  // Fetch collections from blockchain using trpc
  const {
    data: collections,
    isLoading: isLoadingCollections,
    error,
    refetch,
  } = trpc.collection.getEnrichedCreatorCollections.useQuery(
    { creatorAddress: address || '' },
    {
      enabled: !!address,
      // Refresh collections data every 30 seconds
      refetchInterval: 30000,
    },
  );

  // Handle query state changes
  useEffect(() => {
    if (!isLoadingCollections) {
      setIsLoading(false);
    }
  }, [isLoadingCollections]);

  useEffect(() => {
    // Set loading to false after a timeout even if query is still loading
    // to prevent infinite loading state in case of errors
    if (address) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [address]);

  if (isLoading || isLoadingCollections) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden shadow-sm p-4"
          >
            <div className="flex gap-4">
              {/* Collection Image Skeleton - Left Side */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-[#1f1f1f] rounded-lg animate-pulse"></div>
              </div>

              {/* Collection Info Skeleton - Right Side */}
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <div className="h-5 bg-[#1f1f1f] rounded w-3/5 animate-pulse"></div>
                  <div className="h-5 bg-[#1f1f1f] rounded w-1/5 animate-pulse"></div>
                </div>
                <div className="h-4 bg-[#1f1f1f] rounded w-full animate-pulse mb-2"></div>
                <div className="h-4 bg-[#1f1f1f] rounded w-4/5 animate-pulse mb-2"></div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-[#1f1f1f] rounded w-1/4 animate-pulse"></div>
                  <div className="h-3 bg-[#1f1f1f] rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Collections</h3>
        <p className="text-zinc-400 mb-6">{error.message || 'Failed to fetch your collections'}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
          >
            Try Again
          </button>
          <Link
            href={`${basePath}/new`}
            className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
          >
            <ImagePlus className="h-4 w-4" />
            Create New Collection
          </Link>
        </div>
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8 text-center">
        <div className="bg-[#0A0A0A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1f1f1f]">
          <ImagePlus className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Collections Yet</h3>
        <p className="text-zinc-400 mb-6">You haven&apos;t created any NFT collections yet.</p>
        <Link
          href={`${basePath}/new`}
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
        <CollectionCard
          key={collection.collectionAddress}
          role={role}
          collection={{
            id: collection.collectionAddress,
            address: collection.collectionAddress,
            name: collection.name || 'Unnamed Collection',
            description: collection.metadata?.description || 'No description available',
            imageUrl: collection.imageUrl || '/assets/images/placeholders/image-placeholder.svg',
            itemCount: Number(collection.totalSupply) || 0,
            createdAt: new Date(Number(collection.createdAt) * 1000).toISOString(),
            symbol: collection.symbol || 'NFT',
          }}
        />
      ))}
    </div>
  );
}

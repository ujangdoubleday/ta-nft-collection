'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAllCollections } from '@/components/features/collections/hooks/useAllCollections';
import { CollectionCard } from '@/components/features/collections/CollectionCard';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

export function AllCollectionsList() {
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Parse page number from URL or default to 1
  const page = Number(searchParams.get('page') || '1');
  const ITEMS_PER_PAGE = 9;

  // Fetch all collections
  const { collections, isLoading: isLoadingCollections, error } = useAllCollections();

  // Handle query state changes
  useEffect(() => {
    if (!isLoadingCollections) {
      setIsLoading(false);
    }
  }, [isLoadingCollections]);

  useEffect(() => {
    // Set loading to false after a timeout even if query is still loading
    // to prevent infinite loading state in case of errors
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Calculate pagination info
  const totalCollections = collections?.length || 0;
  const totalPages = Math.ceil(totalCollections / ITEMS_PER_PAGE);

  // Get paginated collections
  const paginatedCollections = useMemo(() => {
    if (!collections) return [];

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return collections.slice(startIndex, endIndex);
  }, [collections, page]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 h-[120px]"
          >
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Collections</h2>
          <p className="text-zinc-400">{error.message || 'Failed to fetch collections'}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (collections.length === 0) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">No Collections Found</h2>
          <p className="text-zinc-400">There are no collections available in the system.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCollections.map((collection) => (
          <CollectionCard
            key={collection.collectionAddress}
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
            role="admin"
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
}

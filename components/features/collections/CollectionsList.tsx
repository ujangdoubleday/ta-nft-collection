'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAddress } from '@/lib/hooks/use-address';
import { CollectionCard } from './CollectionCard';
import { ImagePlus } from 'lucide-react';
import Link from 'next/link';
import { trpc } from '@/lib/api/trpc/client';
import {
  PaginationNav,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { CollectionFilters } from './FilterPanel';
import { useAllCollections } from './hooks/useAllCollections';
import { Skeleton } from '@/components/ui/skeleton';

interface CollectionsListProps {
  role?: 'admin' | 'user';
  filters?: CollectionFilters; // Now optional as we'll use URL params
}

export function CollectionsList({ role = 'user', filters }: CollectionsListProps) {
  const { data: address } = useAddress();
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Parse page number from URL or default to 1
  const page = Number(searchParams.get('page') || '1');
  const ITEMS_PER_PAGE = 9;

  // Get filters directly from URL for real-time updates
  const searchQuery = searchParams.get('search') || '';
  const ownerFilter = (searchParams.get('filter') as 'all' | 'owned' | 'not-owned') || 'all';

  // Create a filters object from URL params (overrides props for real-time updates)
  const urlFilters = useMemo(
    () => ({
      search: searchQuery,
      ownerFilter: ownerFilter as 'all' | 'owned' | 'not-owned',
    }),
    [searchQuery, ownerFilter],
  );

  // Use URL filters but fall back to props if needed
  const activeFilters = Object.keys(urlFilters).length > 0 ? urlFilters : filters;

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/user/collections';

  // Fetch user collections using trpc
  const {
    data: userCollections,
    isLoading: isLoadingUserCollections,
    error: userCollectionsError,
    refetch: refetchUserCollections,
  } = trpc.collection.getEnrichedCreatorCollections.useQuery(
    { creatorAddress: address || '' },
    {
      enabled: !!address,
      // Refresh collections data every 30 seconds
      refetchInterval: 30000,
    },
  );

  // Fetch all collections for admin view
  const {
    collections: allCollections,
    isLoading: isLoadingAllCollections,
    error: allCollectionsError,
  } = useAllCollections();

  // Determine which collections to use based on role
  const collections = role === 'admin' ? allCollections : userCollections;
  const isLoadingCollections =
    role === 'admin' ? isLoadingAllCollections : isLoadingUserCollections;
  const error = role === 'admin' ? allCollectionsError : userCollectionsError;
  const refetch = role === 'admin' ? () => {} : refetchUserCollections;

  // Handle query state changes
  useEffect(() => {
    if (!isLoadingCollections && (!isLoadingAllCollections || role !== 'admin')) {
      setIsLoading(false);
    }
  }, [isLoadingCollections, isLoadingAllCollections, role]);

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

  // Define a type for our collection data
  type CollectionData = {
    collectionAddress: string;
    contractURI: string;
    name: string;
    symbol: string;
    totalSupply: bigint;
    createdAt: bigint;
    metadata?: any;
    imageUrl?: string;
  };

  // Track state for tagged collections
  const [taggedCollections, setTaggedCollections] = useState<
    Array<{
      collection: CollectionData;
      isOwned: boolean;
      ownerLoaded: boolean;
    }>
  >([]);

  const [ownershipLoading, setOwnershipLoading] = useState(true);

  // Prepare collection addresses for ownership query
  const collectionAddresses = useMemo(() => {
    return collections?.map((col) => col.collectionAddress) || [];
  }, [collections]);

  // Get collection owners once for tagging
  const { data: ownershipData } = trpc.collection.getMultipleCollectionOwners.useQuery(
    { collectionAddresses },
    {
      enabled: collectionAddresses.length > 0,
    },
  );

  // Create tagged collections with ownership info
  useEffect(() => {
    if (!collections) {
      setTaggedCollections([]);
      return;
    }

    // Create a map for quick lookup
    const ownershipMap: Record<string, boolean> = {};
    const loadedMap: Record<string, boolean> = {};

    if (address && ownershipData) {
      ownershipData.forEach((item) => {
        loadedMap[item.collectionAddress] = true;
        if (item.owner) {
          ownershipMap[item.collectionAddress] = item.owner.toLowerCase() === address.toLowerCase();
        }
      });
    }

    // Create tagged collections
    const tagged = collections.map((collection) => ({
      collection,
      isOwned: ownershipMap[collection.collectionAddress] || false,
      ownerLoaded: !!loadedMap[collection.collectionAddress],
    }));

    setTaggedCollections(tagged);
    setOwnershipLoading(false);
  }, [collections, address, ownershipData]);

  // Create a mapping of collection address to owner status (for backward compatibility)
  const collectionOwnership = useMemo(() => {
    const ownershipMap: Record<string, boolean> = {};

    taggedCollections.forEach((item) => {
      ownershipMap[item.collection.collectionAddress] = item.isOwned;
    });

    return ownershipMap;
  }, [taggedCollections]);

  // Filter collections based on filters using tagged collections
  const filteredTaggedCollections = useMemo(() => {
    // Return early with empty array if no tagged collections
    if (!taggedCollections.length) return [];

    // Track start time for performance debugging
    const startTime = performance.now();

    const result = taggedCollections.filter((taggedItem) => {
      const collection = taggedItem.collection;

      // Apply search filter
      const searchMatch =
        !activeFilters?.search ||
        collection.name?.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
        collection.collectionAddress.toLowerCase().includes(activeFilters.search.toLowerCase());

      // Apply owner filter
      let ownerMatch = true;
      if (activeFilters?.ownerFilter !== 'all') {
        // Use the pre-tagged ownership status
        ownerMatch =
          activeFilters?.ownerFilter === 'owned' ? taggedItem.isOwned : !taggedItem.isOwned;
      }

      return searchMatch && ownerMatch;
    });

    // Track end time for performance debugging
    const endTime = performance.now();
    console.log(`Filtering ${taggedCollections.length} collections took ${endTime - startTime}ms`);
    console.log('Active filters:', activeFilters);

    return result;
  }, [taggedCollections, activeFilters?.search, activeFilters?.ownerFilter]);

  // Extract just the collection data for the filtered collections
  const filteredCollections = useMemo(() => {
    return filteredTaggedCollections.map((item) => item.collection);
  }, [filteredTaggedCollections]);

  // Calculate pagination info
  const totalCollections = filteredCollections.length || 0;
  const totalPages = Math.ceil(totalCollections / ITEMS_PER_PAGE);

  // Get paginated tagged collections
  const paginatedTaggedCollections = useMemo(() => {
    if (!filteredTaggedCollections.length) return [];

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return filteredTaggedCollections.slice(startIndex, endIndex);
  }, [filteredTaggedCollections, page]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Enhanced loading skeleton
  const renderCollectionSkeleton = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
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
  };

  if (isLoading || isLoadingCollections) {
    return renderCollectionSkeleton();
  }

  // Show skeleton when filter is applied but ownership data is still loading
  if (
    ownershipLoading &&
    (activeFilters?.ownerFilter === 'owned' || activeFilters?.ownerFilter === 'not-owned')
  ) {
    return renderCollectionSkeleton();
  }

  if (error) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Error Loading Collections</h3>
        <p className="text-zinc-400 mb-6">
          {(error || allCollectionsError)?.message || 'Failed to fetch collections'}
        </p>
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

  if (!filteredCollections.length) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8 text-center">
        <div className="bg-[#0A0A0A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1f1f1f]">
          <ImagePlus className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Collections Found</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginatedTaggedCollections.map((taggedItem) => {
          const collection = taggedItem.collection;
          return (
            <CollectionCard
              key={collection.collectionAddress}
              role={role}
              collection={{
                id: collection.collectionAddress,
                address: collection.collectionAddress,
                name: collection.name || 'Unnamed Collection',
                description: collection.metadata?.description || 'No description available',
                imageUrl:
                  collection.imageUrl || '/assets/images/placeholders/image-placeholder.svg',
                itemCount: Number(collection.totalSupply) || 0,
                createdAt: new Date(Number(collection.createdAt) * 1000).toISOString(),
                symbol: collection.symbol || 'NFT',
              }}
              isOwner={taggedItem.isOwned}
              ownerLoaded={taggedItem.ownerLoaded}
            />
          );
        })}
      </div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <PaginationNav>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) handlePageChange(page - 1);
                }}
                className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {/* Generate page links */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageNum);
                  }}
                  isActive={pageNum === page}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) handlePageChange(page + 1);
                }}
                className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </PaginationNav>
      )}
    </div>
  );
}

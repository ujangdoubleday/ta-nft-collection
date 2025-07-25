'use client';

import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, AlertCircle, Bug } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useOwnerNFTs, useAllNFTs, useUserCollections } from './hooks';
import { NFTsGallery } from './NFTsGallery';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSearchParams, usePathname } from 'next/navigation';
import { NFTFilterPanel } from './FilterPanel';
import { NFTsHeader } from './NFTsHeader';
import { Suspense } from 'react';
import { trpc } from '@/lib/api/trpc/client';

interface NFTsContentProps {
  role?: 'admin' | 'user';
  showAll?: boolean;
}

export function NFTsContent({ role = 'user', showAll = false }: NFTsContentProps) {
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  // Add cached NFTs state to prevent empty state during refresh
  const [cachedNFTs, setCachedNFTs] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const utils = trpc.useContext();

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/nfts' : '/user/nfts';

  // Parse page number and filters from URL
  const page = Number(searchParams.get('page') || '1');
  const searchQuery = searchParams.get('search') || '';
  const collectionFilter = searchParams.get('collection') || '';
  const ITEMS_PER_PAGE = 12; // Increased from 9 to show more NFTs per page

  // Use appropriate hook based on role
  const {
    nfts: userNfts = [],
    isLoading: isLoadingUserNFTs,
    error: userNFTsError,
    refetch: refetchUserNFTs,
  } = useOwnerNFTs({ showAll });

  const {
    nfts: adminNfts = [],
    collections: adminCollections = [],
    isLoading: isLoadingAdminNFTs,
    error: adminNFTsError,
    refetch: refetchAdminNFTs,
    progress,
  } = useAllNFTs();

  // Fetch collections created by the user (only for user role)
  const {
    collections: userCollections = [],
    isLoading: isLoadingUserCollections,
    error: userCollectionsError,
  } = useUserCollections();

  // Determine which data set to use based on role
  const nfts = role === 'admin' ? adminNfts : userNfts;
  const isLoading = role === 'admin' ? isLoadingAdminNFTs : isLoadingUserNFTs;
  const error = role === 'admin' ? adminNFTsError : userNFTsError;
  const refetch = role === 'admin' ? refetchAdminNFTs : refetchUserNFTs;

  // Cache NFTs when they are loaded
  useEffect(() => {
    if (nfts && nfts.length > 0 && !isLoading) {
      setCachedNFTs(nfts);
    }
  }, [nfts, isLoading]);

  // Format collections for filter panel based on role
  const collectionOptions = useMemo(() => {
    if (role === 'admin') {
      return (adminCollections || []).map((collection) => ({
        address: collection.contractAddress,
        name: collection.name || collection.contractAddress.substring(0, 8),
      }));
    } else {
      // For user role, use collections created by the user
      return userCollections;
    }
  }, [role, adminCollections, userCollections]);

  // Use cached NFTs during refresh or when loading
  const effectiveNFTs = isRefreshing || isLoading ? cachedNFTs : nfts;

  // Verify NFT data is valid before filtering
  const validNFTs = useMemo(() => {
    if (!effectiveNFTs || effectiveNFTs.length === 0) return [];

    return effectiveNFTs.filter((nft) => {
      // Check for required properties
      const isValid =
        nft &&
        typeof nft === 'object' &&
        nft.tokenId !== undefined &&
        nft.contractAddress !== undefined;

      if (!isValid) {
        console.warn('Invalid NFT data found:', nft);
      }

      return isValid;
    });
  }, [effectiveNFTs]);

  // Filter NFTs based on search and collection filter
  const filteredNFTs = useMemo(() => {
    if (validNFTs.length === 0) {
      console.log('No valid NFTs to filter');
      return [];
    }

    const filtered = validNFTs.filter((nft) => {
      try {
        // Apply search filter
        const searchMatch =
          !searchQuery ||
          (nft.name && nft.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (nft.tokenId && nft.tokenId.toString().includes(searchQuery));

        // Apply collection filter
        const collectionMatch =
          !collectionFilter ||
          (nft.contractAddress &&
            nft.contractAddress.toLowerCase() === collectionFilter.toLowerCase());

        return searchMatch && collectionMatch;
      } catch (error) {
        console.error('Error filtering NFT:', error, nft);
        return false;
      }
    });

    return filtered;
  }, [validNFTs, searchQuery, collectionFilter]);

  // Paginate NFTs
  const paginatedNFTs = useMemo(() => {
    if (!filteredNFTs || filteredNFTs.length === 0) return [];

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const paginated = filteredNFTs.slice(startIndex, endIndex);
    return paginated;
  }, [filteredNFTs, page]);

  // Calculate total pages
  const totalNFTs = filteredNFTs.length;
  const totalPages = Math.ceil(totalNFTs / ITEMS_PER_PAGE);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle filter toggle
  const handleFilterToggle = (isOpen: boolean) => {
    setIsFilterPanelOpen(isOpen);
  };

  // Handle filter changes (for backward compatibility)
  const handleFilterChange = (filters: any) => {
    // We're using URL params, so no need to update state here
  };

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle refresh button click
  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // Invalidate and refetch NFTs data
      await Promise.all([
        utils.factoryConfig.getAllCollections.invalidate(),
        refetch(),
        // Call revalidate API with path parameter and page type
        fetch(`/api/revalidate?path=${basePath}&type=page`),
      ]);

      router.refresh();
    } catch (error) {
      console.error('Error refreshing NFTs:', error);
      toast.error('Failed to refresh NFTs. Please try again.');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  // Show loading state
  if (!mounted || (isLoading && !isRefreshing && cachedNFTs.length === 0)) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Skeleton className="h-7 sm:h-8 w-32 sm:w-40" />
          <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" />
        </div>
        <div className="h-px w-full bg-[#1f1f1f] mb-4 sm:mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden"
            >
              <Skeleton className="w-full aspect-square" />
              <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
                <Skeleton className="h-3 sm:h-4 w-3/4" />
                <Skeleton className="h-2 sm:h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show loading progress for admin view
  if (
    role === 'admin' &&
    progress &&
    progress.loaded < progress.total &&
    !isRefreshing &&
    cachedNFTs.length === 0
  ) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <NFTsHeader
          role={role}
          onFilterToggle={handleFilterToggle}
          onRefresh={handleRefresh}
          showAll={showAll}
          isFilterOpen={isFilterPanelOpen}
        />
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 sm:p-8 text-center">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Loading NFTs</h3>
          <p className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base">
            Loading collections: {progress.loaded} of {progress.total}
          </p>
          <div className="w-full h-1.5 sm:h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
            <div
              className="h-full bg-white"
              style={{
                width: `${(progress.loaded / progress.total) * 100}%`,
                transition: 'width 0.3s ease-in-out',
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !isRefreshing && cachedNFTs.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <NFTsHeader
          role={role}
          onFilterToggle={handleFilterToggle}
          onRefresh={handleRefresh}
          showAll={showAll}
          isFilterOpen={isFilterPanelOpen}
        />
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 sm:p-8 text-center">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-900/20 flex items-center justify-center mb-3 sm:mb-4">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Error Loading NFTs</h3>
          <p className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base">
            {error.message || 'Failed to fetch NFTs'}
          </p>
          <button
            onClick={() => handleRefresh()}
            className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-1.5 sm:py-2 px-3 sm:px-4 rounded-md transition-colors text-sm font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no NFTs found and not refreshing and no cached NFTs
  if (validNFTs.length === 0 && !isRefreshing && cachedNFTs.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <NFTsHeader
          role={role}
          onFilterToggle={handleFilterToggle}
          onRefresh={handleRefresh}
          showAll={showAll}
          isFilterOpen={isFilterPanelOpen}
        />
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 sm:p-8 text-center">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1f1f1f] flex items-center justify-center mb-3 sm:mb-4">
            <Bug className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No NFTs Found</h3>
          <p className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base">
            {role === 'admin'
              ? "There are no NFTs in the system yet. Collections may exist but don't have any NFTs minted."
              : "You don't own any NFTs yet. Try minting or purchasing some NFTs first."}
          </p>
        </div>
      </div>
    );
  }

  // Show filtered empty state if no NFTs match filters and not refreshing
  if (filteredNFTs.length === 0 && validNFTs.length > 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <NFTsHeader
          role={role}
          onFilterToggle={handleFilterToggle}
          onRefresh={handleRefresh}
          showAll={showAll}
          isFilterOpen={isFilterPanelOpen}
        />
        {isFilterPanelOpen && (
          <NFTFilterPanel
            isOpen={isFilterPanelOpen}
            collections={collectionOptions}
            onFilterChange={handleFilterChange}
            initialFilters={{ search: searchQuery, collectionFilter: collectionFilter }}
          />
        )}
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 sm:p-8 text-center">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1f1f1f] flex items-center justify-center mb-3 sm:mb-4">
            <Bug className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Matching NFTs</h3>
          <p className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base">
            No NFTs match your current filters. Try adjusting your search or filter criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <NFTsHeader
        role={role}
        onFilterToggle={handleFilterToggle}
        onRefresh={handleRefresh}
        showAll={showAll}
        isFilterOpen={isFilterPanelOpen}
      />

      {isFilterPanelOpen && (
        <NFTFilterPanel
          isOpen={isFilterPanelOpen}
          collections={collectionOptions}
          onFilterChange={handleFilterChange}
          initialFilters={{ search: searchQuery, collectionFilter: collectionFilter }}
        />
      )}

      <NFTsGallery
        nfts={paginatedNFTs}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        role={role}
      />
    </div>
  );
}

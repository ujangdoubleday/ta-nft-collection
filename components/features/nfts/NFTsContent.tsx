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

interface NFTsContentProps {
  role?: 'admin' | 'user';
}

export function NFTsContent({ role = 'user' }: NFTsContentProps) {
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  console.log(`NFTs Content - Rendering with role: ${role}`);

  // Parse page number and filters from URL
  const page = Number(searchParams.get('page') || '1');
  const searchQuery = searchParams.get('search') || '';
  const collectionFilter = searchParams.get('collection') || '';
  const ITEMS_PER_PAGE = 9;

  // Use appropriate hook based on role
  const {
    nfts: userNfts = [],
    isLoading: isLoadingUserNFTs,
    error: userNFTsError,
    refetch: refetchUserNFTs,
  } = useOwnerNFTs();

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

  // console.log(`NFTs Content - ${role} NFTs count:`, nfts?.length || 0);

  // Log sample of NFTs for debugging
  // useEffect(() => {
  //   if (role === 'admin' && adminNfts && adminNfts.length > 0) {
  //     console.log('Admin NFTs found. Sample of first NFT:', adminNfts[0]);
  //   } else if (role === 'admin') {
  //     console.log('No admin NFTs found yet.');
  //   }
  // }, [role, adminNfts]);

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

  // Verify NFT data is valid before filtering
  const validNFTs = useMemo(() => {
    if (!nfts || nfts.length === 0) return [];

    return nfts.filter((nft) => {
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
  }, [nfts]);

  // Filter NFTs based on search and collection filter
  const filteredNFTs = useMemo(() => {
    if (validNFTs.length === 0) {
      console.log('No valid NFTs to filter');
      return [];
    }

    // console.log(
    //   `Filtering ${validNFTs.length} NFTs with search: "${searchQuery}", collection: "${collectionFilter}"`,
    // );

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

    // console.log(`Filtered NFTs count: ${filtered.length}`);
    return filtered;
  }, [validNFTs, searchQuery, collectionFilter]);

  // Paginate NFTs
  const paginatedNFTs = useMemo(() => {
    if (!filteredNFTs || filteredNFTs.length === 0) return [];

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const paginated = filteredNFTs.slice(startIndex, endIndex);
    // console.log(
    //   `Paginated NFTs: ${paginated.length} (page ${page} of ${Math.ceil(filteredNFTs.length / ITEMS_PER_PAGE)})`,
    // );
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
    // console.log('Filters changed:', filters);
    // We're using URL params, so no need to update state here
  };

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
    // console.log('NFTs Content - Component mounted');
  }, []);

  // Handle refresh button click
  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    toast.info('Refreshing NFTs...');

    try {
      await refetch();
      router.refresh();
      toast.success('NFTs refreshed successfully!');
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
  if (!mounted || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="h-px w-full bg-[#1f1f1f] mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden"
            >
              <Skeleton className="w-full aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show loading progress for admin view
  if (role === 'admin' && progress && progress.loaded < progress.total) {
    return (
      <div className="space-y-6">
        <NFTsHeader role={role} onFilterToggle={handleFilterToggle} />
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Loading NFTs</h3>
          <p className="text-zinc-400 mb-6">
            Loading collections: {progress.loaded} of {progress.total}
          </p>
          <div className="w-full h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
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

  // Show error state if there was a problem loading NFTs
  if (error) {
    return (
      <div className="space-y-6">
        <NFTsHeader role={role} onFilterToggle={handleFilterToggle} />
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error Loading NFTs</h3>
          <p className="text-zinc-400 mb-6">
            {error.message || 'There was a problem loading NFTs. Please try again.'}
          </p>
          <button
            onClick={() => handleRefresh()}
            className="bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show debug button in development mode
  // const showDebugData = () => {
  //   console.log('Debug - Raw NFTs:', nfts);

  //   if (nfts && nfts.length > 0) {
  //     console.log('Debug - First NFT Structure:', nfts[0]);
  //     console.log('Debug - Simplified NFT:', simplifyNFTForLogging(nfts[0]));
  //   }

  //   console.log('Debug - NFT Keys:', nfts && nfts.length > 0 ? Object.keys(nfts[0]) : 'No NFTs');

  //   toast.info('Debug data logged to console. Check browser devtools.');
  // };

  return (
    <>
      <div className="animate-fade-in">
        <NFTsHeader role={role} onFilterToggle={handleFilterToggle} />

        <Suspense>
          <NFTFilterPanel
            isOpen={isFilterPanelOpen}
            role={role}
            onFilterChange={handleFilterChange}
            collections={collectionOptions}
          />
        </Suspense>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => handleRefresh()}
            disabled={isRefreshing}
            className={`bg-white text-black hover:bg-zinc-200 py-2 px-3 rounded-md transition-colors text-sm font-medium flex items-center gap-2 ${
              isRefreshing ? 'opacity-70' : ''
            }`}
            aria-label="Refresh NFTs"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* {process.env.NODE_ENV !== 'production' && (
          <button
            onClick={showDebugData}
            className="ml-2 bg-purple-600 text-white hover:bg-purple-700 py-2 px-3 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
            aria-label="Debug NFT Data"
          >
            <Bug className="h-4 w-4" />
            Debug
          </button>
        )} */}
        </div>

        <NFTsGallery
          nfts={paginatedNFTs}
          error={error}
          onRefresh={handleRefresh}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          role={role}
          totalCount={filteredNFTs.length}
        />
      </div>
    </>
  );
}

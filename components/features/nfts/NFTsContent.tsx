'use client';

import { useState, useEffect, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useOwnerNFTs } from './hooks';
import { NFTsGallery } from './NFTsGallery';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSearchParams, usePathname } from 'next/navigation';

export function NFTsContent() {
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Parse page number from URL or default to 1
  const page = Number(searchParams.get('page') || '1');
  const ITEMS_PER_PAGE = 9;

  // Fetch NFTs owned by the current user
  const { nfts, isLoading, error, refetch } = useOwnerNFTs();

  // Paginate NFTs
  const paginatedNFTs = useMemo(() => {
    if (!nfts) return [];

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return nfts.slice(startIndex, endIndex);
  }, [nfts, page]);

  // Calculate total pages
  const totalNFTs = nfts.length;
  const totalPages = Math.ceil(totalNFTs / ITEMS_PER_PAGE);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
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
        <Skeleton className="h-8 w-1/2 mb-2" />
        <div className="h-px w-full bg-[#1f1f1f] mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
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

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">My NFTs</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`bg-white text-black hover:bg-zinc-200 py-2 px-3 rounded-md transition-colors text-sm font-medium flex items-center gap-2 ${
              isRefreshing ? 'opacity-70' : ''
            }`}
            aria-label="Refresh NFTs"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
      </div>

      <NFTsGallery
        nfts={paginatedNFTs}
        error={error}
        onRefresh={handleRefresh}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}

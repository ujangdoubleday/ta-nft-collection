'use client';

import { NFTCard } from './NFTCard';
import { ImagePlus } from 'lucide-react';
import Link from 'next/link';
import {
  PaginationNav,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Updated interface to match what comes from the tRPC endpoint - made more flexible
interface NFT {
  id?: string;
  tokenId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  contractAddress: string;
  symbol?: string | null;
  tokenType?: string;
  metadata?: any;
  timeLastUpdated?: string;
  image?: { originalUrl?: string; cachedUrl?: string };
}

interface NFTsGalleryProps {
  nfts: NFT[];
  error?: any;
  onRefresh?: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  role?: 'admin' | 'user';
  totalCount?: number;
}

export function NFTsGallery({
  nfts,
  error,
  onRefresh,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  role = 'user',
  totalCount,
}: NFTsGalleryProps) {
  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin' : '/user';

  // Show error state
  if (error) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 sm:p-8 text-center">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Error Loading NFTs</h3>
        <p className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base">
          {error.message || 'Failed to fetch NFTs'}
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => onRefresh?.()}
            className="inline-flex items-center gap-2 bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-md transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no NFTs
  if (!nfts || nfts.length === 0) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 sm:p-8 text-center">
        <div className="bg-[#0A0A0A] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-[#1f1f1f]">
          <ImagePlus className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No NFTs Found</h3>
        <p className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base">
          {role === 'admin'
            ? 'No NFTs found in any collection.'
            : "You don't own any NFTs yet. Create or buy NFTs to see them here."}
        </p>
        <Link
          href={`${basePath}/collections`}
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-1.5 sm:py-2 px-3 sm:px-4 rounded-md transition-colors text-sm font-medium"
        >
          Browse Collections
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <p className="text-xs sm:text-sm text-zinc-400">
          {totalCount !== undefined
            ? `Showing ${nfts.length} of ${totalCount} NFTs`
            : `Showing ${nfts.length} NFTs`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {nfts.map((nft, index) => (
          <NFTCard key={`${nft.contractAddress}-${nft.tokenId || index}`} nft={nft} role={role} />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && onPageChange && (
        <PaginationNav>
          <PaginationContent className="overflow-x-auto py-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {/* Generate page links */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(pageNum);
                  }}
                  isActive={pageNum === currentPage}
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
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </PaginationNav>
      )}
    </div>
  );
}

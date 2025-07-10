'use client';

import { NFTCard } from './NFTCard';
import { ImagePlus } from 'lucide-react';
import Link from 'next/link';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Updated interface to match what comes from the tRPC endpoint
interface NFT {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  contractAddress: string;
  symbol?: string | null;
  tokenType?: string;
  metadata?: any;
  timeLastUpdated?: string;
}

interface NFTsGalleryProps {
  nfts: NFT[];
  error?: any;
  onRefresh?: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function NFTsGallery({
  nfts,
  error,
  onRefresh,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: NFTsGalleryProps) {
  // Show error state
  if (error) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Error Loading NFTs</h3>
        <p className="text-zinc-400 mb-6">{error.message || 'Failed to fetch NFTs'}</p>
        <div className="flex justify-center">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
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
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8 text-center">
        <div className="bg-[#0A0A0A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1f1f1f]">
          <ImagePlus className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No NFTs Found</h3>
        <p className="text-zinc-400 mb-6">
          You don&apos;t own any NFTs yet. Create or buy NFTs to see them here.
        </p>
        <Link
          href="/user/collections"
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
        >
          Browse Collections
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-zinc-400 text-sm">Showing {nfts.length} NFTs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {nfts.map((nft) => (
          <NFTCard key={`${nft.contractAddress}-${nft.tokenId}`} nft={nft} />
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && onPageChange && (
        <Pagination>
          <PaginationContent>
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
        </Pagination>
      )}
    </div>
  );
}

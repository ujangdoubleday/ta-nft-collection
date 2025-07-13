'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NFTCard } from './NFTCard';
import { ImagePlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/api/trpc/client';
import { CollectionItem } from '@/lib/blockchain/utils/nft';

// Define interface for the NFT from API
interface ApiNFT {
  tokenId: string;
  name?: string;
  description?: string;
  metadataUrl?: string;
  imageUrl?: string;
  contractAddress: string;
  ownerAddress?: string;
  metadata?: any;
  image?: {
    cachedUrl?: string | null;
    thumbnailUrl?: string | null;
    pngUrl?: string | null;
    originalUrl?: string | null;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Type guard to check if an NFT is from the API
function isApiNFT(nft: any): nft is ApiNFT {
  return (
    nft &&
    typeof nft === 'object' &&
    'tokenId' in nft &&
    'contractAddress' in nft &&
    (('imageUrl' in nft && typeof nft.imageUrl === 'string') ||
      ('image' in nft && typeof nft.image === 'object'))
  );
}

interface NFTGalleryProps {
  collectionAddress: string;
  nfts?: CollectionItem[];
  onRefresh?: () => void;
  role?: 'admin' | 'user';
  totalCount?: number;
}

export function NFTGallery({
  collectionAddress,
  nfts: propNfts,
  onRefresh,
  role = 'user',
  totalCount,
}: NFTGalleryProps) {
  const [mounted, setMounted] = useState(false);

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/user/collections';

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch NFTs using tRPC only if not provided via props
  const {
    data: fetchedNfts,
    isLoading,
    error,
    refetch,
  } = trpc.nft.getByCollectionAddress.useQuery(
    { contractAddress: collectionAddress },
    {
      enabled: !!collectionAddress && mounted && !propNfts,
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: true,
    },
  );

  // Handle refresh from parent component
  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      await refetch();
    }
  };

  // Use NFTs from props if available, otherwise use fetched NFTs
  const nfts = propNfts || fetchedNfts;

  // Show loading state
  if (!mounted || (isLoading && !propNfts)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden">
            <Skeleton className="w-full aspect-square" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error && !propNfts) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Error Loading NFTs</h3>
        <p className="text-zinc-400 mb-6">{error.message || 'Failed to fetch NFTs'}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleRefresh()}
            className="inline-flex items-center gap-2 bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
          >
            Try Again
          </button>
          <Link
            href={`${basePath}/${collectionAddress}/mint`}
            className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
          >
            <ImagePlus className="h-4 w-4" />
            Mint New NFT
          </Link>
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
        <h3 className="text-xl font-bold text-white mb-2">No NFTs Yet</h3>
        <p className="text-zinc-400 mb-6">This collection doesn&apos;t have any NFTs yet.</p>
        <Link
          href={`${basePath}/${collectionAddress}/mint`}
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
        >
          <ImagePlus className="h-4 w-4" />
          Mint Your First NFT
        </Link>
      </div>
    );
  }

  // Determine the count message
  const countMessage =
    totalCount !== undefined && totalCount !== nfts.length
      ? `Showing ${nfts.length} of ${totalCount} NFTs`
      : `Showing ${nfts.length} NFTs`;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-zinc-400 text-sm">{countMessage}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.map((nft) => {
          // Get appropriate properties based on NFT type
          const tokenId = nft.tokenId || ('id' in nft ? nft.id : '') || '';

          // Handle name based on NFT type
          let name = '';
          if (isApiNFT(nft) && nft.name) {
            name = nft.name;
          } else if ('name' in nft) {
            name = nft.name || '';
          }

          // Handle description
          let description = '';
          if (isApiNFT(nft) && nft.description) {
            description = nft.description;
          }

          // Handle image URL
          let imageUrl = '';
          if (isApiNFT(nft)) {
            if (nft.imageUrl) {
              imageUrl = nft.imageUrl;
            } else if (nft.image && typeof nft.image === 'object' && nft.image.originalUrl) {
              imageUrl = nft.image.originalUrl;
            }
          } else if (typeof nft.image === 'string') {
            imageUrl = nft.image;
          }

          // Handle owner
          const owner = isApiNFT(nft) && nft.ownerAddress ? nft.ownerAddress : '';

          // Handle creation date
          const createdAt = isApiNFT(nft) && nft.createdAt ? nft.createdAt : new Date();

          return (
            <NFTCard
              key={`${collectionAddress}-${tokenId}`}
              nft={{
                id: tokenId,
                tokenId: tokenId,
                name: name,
                description: description || '',
                imageUrl: imageUrl || '/assets/images/placeholders/image-placeholder.svg',
                owner: owner || '',
                creator: '',
                mintedAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
              }}
              collectionAddress={collectionAddress}
              role={role}
            />
          );
        })}
      </div>
    </div>
  );
}

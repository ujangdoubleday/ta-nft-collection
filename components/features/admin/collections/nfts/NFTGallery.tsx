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
  name: string;
  description: string;
  metadataUrl: string;
  imageUrl: string;
  contractAddress: string;
  ownerAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

// Type guard function to check if NFT is from API or CollectionItem
function isApiNFT(nft: ApiNFT | CollectionItem): nft is ApiNFT {
  return 'imageUrl' in nft && 'ownerAddress' in nft;
}

interface NFTGalleryProps {
  collectionAddress: string;
  nfts?: CollectionItem[];
  onRefresh?: () => void;
}

export function NFTGallery({ collectionAddress, nfts: propNfts, onRefresh }: NFTGalleryProps) {
  const [mounted, setMounted] = useState(false);

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
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] text-white py-2 px-4 rounded-md transition-colors text-sm font-medium"
          >
            Try Again
          </button>
          <Link
            href={`/user/collections/${collectionAddress}/mint`}
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
          href={`/user/collections/${collectionAddress}/mint`}
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
        >
          <ImagePlus className="h-4 w-4" />
          Mint Your First NFT
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-zinc-400 text-sm">Showing {nfts.length} NFTs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.map((nft) => {
          // Get appropriate properties based on NFT type
          const tokenId = isApiNFT(nft) ? nft.tokenId : nft.tokenId || nft.id || '';
          const name = isApiNFT(nft) ? nft.name : `NFT #${tokenId}`;
          const description = isApiNFT(nft) ? nft.description : '';
          const imageUrl = isApiNFT(nft) ? nft.imageUrl : nft.image || '';
          const owner = isApiNFT(nft) ? nft.ownerAddress : '';
          const createdAt = isApiNFT(nft) ? nft.createdAt : new Date();

          return (
            <NFTCard
              key={`${collectionAddress}-${tokenId}`}
              nft={{
                id: tokenId,
                tokenId: tokenId,
                name: name || `NFT #${tokenId}`,
                description: description || '',
                imageUrl: imageUrl || '/assets/images/placeholders/image-placeholder.svg',
                owner: owner || '',
                creator: '',
                mintedAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
              }}
              collectionAddress={collectionAddress}
            />
          );
        })}
      </div>
    </div>
  );
}

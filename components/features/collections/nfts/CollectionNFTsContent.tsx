'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ImagePlus, RefreshCw } from 'lucide-react';
import { NFTGallery } from './NFTGallery';
import { trpc } from '@/lib/api/trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useNFTsByContractAddress } from '@/components/features/collections/hooks';
import { useQuery } from '@tanstack/react-query';
import { formatIPFSUrl } from '@/lib/utils/helpers/url';
import { CollectionItem } from '@/lib/blockchain/utils/nft';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CollectionNFTsContentProps {
  address: string;
  role?: 'admin' | 'user';
}

export function CollectionNFTsContent({ address, role = 'user' }: CollectionNFTsContentProps) {
  const [mounted, setMounted] = useState(false);
  const [processingError, setProcessingError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Add cached NFTs state
  const [cachedNFTs, setCachedNFTs] = useState<any[]>([]);
  const router = useRouter();
  const utils = trpc.useContext();

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/user/collections';
  const nftsPath = `${basePath}/${address}/nfts`;

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch collection metadata URI and collection info from the server using tRPC
  const {
    data: contractData,
    isLoading: isLoadingContract,
    error: contractError,
  } = trpc.collection.getContractURI.useQuery(
    { contractAddress: address as `0x${string}` },
    { enabled: !!address },
  );

  // Extract contractURI and collectionInfo from the combined response
  const contractURI = contractData?.contractURI;
  const collectionInfo = contractData?.collectionInfo;

  // Fetch collection metadata from IPFS using tRPC
  const {
    data: metadataResult,
    isLoading: isLoadingMetadata,
    error: metadataError,
  } = trpc.collection.fetchProcessedMetadata.useQuery(
    { uri: contractURI as string },
    {
      enabled: !!contractURI,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  );

  // Extract metadata from the response
  const metadata = metadataResult?.metadata;

  // Fetch NFTs using the same hook as CollectionDetailWrapper
  const {
    nfts: blockchainNfts,
    isLoading: isLoadingNFTs,
    error: nftsError,
    isError: isNftsError,
    refetch: refetchNFTs,
  } = useNFTsByContractAddress(address);

  // Cache NFTs when they are loaded
  useEffect(() => {
    if (blockchainNfts && blockchainNfts.length > 0 && !isLoadingNFTs) {
      setCachedNFTs(blockchainNfts);
    }
  }, [blockchainNfts, isLoadingNFTs]);

  // Use cached NFTs during refresh
  const effectiveNFTs = isRefreshing ? cachedNFTs : blockchainNfts;

  // Transform blockchain NFTs to CollectionItem format
  const { data: processedNfts, isLoading: isProcessingNfts } = useQuery({
    queryKey: ['processed-blockchain-nfts', address, effectiveNFTs?.length],
    queryFn: async () => {
      if (!effectiveNFTs || effectiveNFTs.length === 0) return [];

      try {
        return Promise.all(
          effectiveNFTs.map(async (nft) => {
            try {
              // Format image URL if it's an IPFS URL
              const image = nft.imageUrl ? formatIPFSUrl(nft.imageUrl) : '';
              let processedImageUrl = image;

              // Return formatted collection item
              return {
                id: nft.tokenId,
                image: processedImageUrl,
                contractAddress: nft.contractAddress,
                tokenId: nft.tokenId,
                name: nft.name,
              } as CollectionItem;
            } catch (itemError) {
              console.error(`Error processing NFT ${nft.tokenId}:`, itemError);
              // Return a fallback item to prevent the entire collection from failing
              return {
                id: nft.tokenId,
                image: '',
                contractAddress: nft.contractAddress,
                tokenId: nft.tokenId,
              } as CollectionItem;
            }
          }),
        );
      } catch (error) {
        console.error('Error processing NFTs:', error);
        setProcessingError(
          error instanceof Error ? error : new Error('Unknown error processing NFTs'),
        );
        return [];
      }
    },
    enabled: !!effectiveNFTs && effectiveNFTs.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Create formatted collection data
  const collectionData = useMemo(() => {
    if (!metadata && !collectionInfo) return null;

    // Cast collectionInfo to an array type to access numeric indices
    const collectionInfoArray = collectionInfo as unknown as string[];

    return {
      id: address,
      name: metadata?.name || collectionInfoArray?.[0] || 'Unnamed Collection',
      description: metadata?.description || '',
      items: processedNfts || [],
    };
  }, [address, metadata, collectionInfo, processedNfts]);

  // Determine if we're still loading
  const isLoading =
    !mounted || isLoadingContract || isLoadingMetadata || isLoadingNFTs || isProcessingNfts;

  // Refresh function to update NFTs data
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // Invalidate and refetch NFTs data
      await Promise.all([
        utils.collection.getContractURI.invalidate({ contractAddress: address as `0x${string}` }),
        refetchNFTs(),
        // Call revalidate API with path parameter and page type
        fetch(`/api/revalidate?path=${nftsPath}&type=page`),
      ]);

      // Force client-side refresh
      router.refresh();
      toast.info('NFTs refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing NFTs:', error);
      toast.error('Failed to refresh NFTs. Please try again.');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000); // Add slight delay to show the refresh animation
    }
  }, [address, isRefreshing, router, utils.collection.getContractURI, refetchNFTs, nftsPath]);

  // Show loading state during SSR or while fetching data
  if (isLoading && !isRefreshing && cachedNFTs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-1/2 mb-2" />
        <div className="h-px w-full bg-[#1f1f1f] mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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

  // Show error state
  if (
    (contractError || metadataError || nftsError || isNftsError || processingError) &&
    !isRefreshing &&
    cachedNFTs.length === 0
  ) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">Collection Not Found</h2>
          <p className="text-zinc-400">
            {(contractError || metadataError || nftsError)?.message ||
              `The collection with address ${address} could not be found.`}
          </p>
        </div>
      </div>
    );
  }

  // Get collection name from metadata or fallback to contract name
  const collectionName = collectionData?.name || 'Unnamed Collection';

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">NFTs</h1>
            <p className="text-zinc-400">All NFTs in Collection: {collectionName}</p>
          </div>
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
        </div>

        <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
      </div>

      <NFTGallery
        collectionAddress={address}
        nfts={processedNfts || []}
        onRefresh={handleRefresh}
        role={role}
      />
    </>
  );
}

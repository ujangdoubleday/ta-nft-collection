'use client';

import { useState, useEffect } from 'react';
import { CollectionHeader } from './CollectionHeader';
import { CollectionActions } from './CollectionActions';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/api/trpc/client';
import { EnrichedCollectionInfo } from '@/lib/blockchain/utils/collection';
import { useCollectionContext } from '@/components/features/layout/user/UserLayout';

interface CollectionDetailContentProps {
  address: string;
  role?: 'admin' | 'user';
}

// Type for the collection data
interface CollectionData {
  collectionAddress: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  maxSupply: bigint;
  createdAt: bigint;
  contractURI: string;
  metadata: Record<string, any>;
  imageUrl: string;
}

export function CollectionDetailContent({ address, role = 'user' }: CollectionDetailContentProps) {
  const [mounted, setMounted] = useState(false);

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call the hook unconditionally
  const collectionContext = useCollectionContext();
  // Then conditionally use its value
  const isOwner = role === 'admin' ? false : collectionContext.isOwner;

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
  const isLoadingURI = isLoadingContract;
  const isLoadingInfo = isLoadingContract;
  const uriError = contractError;
  const infoError = contractError;

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
  const imageUrl = metadataResult?.imageUrl;

  // Prepare the collection data object to pass to child components
  const collectionData: CollectionData = {
    collectionAddress: address,
    name:
      Array.isArray(collectionInfo) && collectionInfo[0]
        ? String(collectionInfo[0])
        : metadata?.name || 'Unnamed Collection',
    symbol: Array.isArray(collectionInfo) && collectionInfo[1] ? String(collectionInfo[1]) : 'NFT',
    totalSupply:
      Array.isArray(collectionInfo) && collectionInfo[2]
        ? BigInt(String(collectionInfo[2]))
        : BigInt(0),
    maxSupply:
      Array.isArray(collectionInfo) && collectionInfo[3]
        ? BigInt(String(collectionInfo[3]))
        : BigInt(0),
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    contractURI: typeof contractURI === 'string' ? contractURI : '',
    metadata: metadata || {},
    imageUrl: imageUrl || '/assets/images/placeholders/placeholder_loading.gif',
  };

  // Handle loading state
  if (!mounted || isLoadingInfo || isLoadingURI || isLoadingMetadata) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
          <Skeleton className="h-8 w-1/4 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-6" />
          <div className="flex gap-4">
            <Skeleton className="h-32 w-32" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-5/12">
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div className="lg:w-7/12">
            <Skeleton className="h-6 w-40 mb-3" />
            <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state only after loading is complete
  if (infoError || (!isLoadingMetadata && !metadata)) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">Collection Not Found</h2>
          <p className="text-zinc-400">
            {infoError?.message || `The collection with address ${address} could not be found.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collection Header */}
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <CollectionHeader collection={collectionData as unknown as EnrichedCollectionInfo} />
      </div>

      {/* Stats and Actions in Side-by-Side Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Collection Actions - Right Side */}
        <div className="lg:w-full">
          <h2 className="text-md font-bold text-white mb-4">Collection Actions</h2>
          <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
            <CollectionActions
              collection={collectionData as unknown as EnrichedCollectionInfo}
              role={role}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

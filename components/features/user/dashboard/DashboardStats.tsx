'use client';

import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';
import { trpc } from '@/lib/api/trpc/client';
import { useUserCollections } from '@/components/features/nfts/hooks';

export function DashboardStats() {
  const { data: address } = useAddress();
  const [isLoading, setIsLoading] = useState(true);

  // Get collections created by the user
  const { collections: userCollections, isLoading: isLoadingUserCollections } =
    useUserCollections();

  // Get all collection addresses
  const { data: allCollectionAddresses } = trpc.factoryConfig.getAllCollections.useQuery();

  // Get NFTs owned by the user
  const { data: ownedNFTs } = trpc.nft.getByOwner.useQuery(
    {
      ownerAddress: address || '',
      contractAddresses: allCollectionAddresses || [],
    },
    { enabled: !!address && !!allCollectionAddresses && allCollectionAddresses.length > 0 },
  );

  // Get collections owned by the user
  const { data: ownedCollections } = trpc.collection.getOwnerCollections.useQuery(
    { ownerAddress: address || '' },
    { enabled: !!address },
  );

  // Get NFTs from user's collections (created NFTs)
  const { data: createdNFTs } = trpc.nft.getAllNFTs.useQuery(
    {
      contractAddresses: userCollections?.map((c) => c.address) || [],
      limit: 500,
    },
    {
      enabled: !!userCollections && userCollections.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );

  // Stats state
  const [stats, setStats] = useState({
    collectionsCreated: 0,
    nftsCreated: 0,
    collectionsOwned: 0,
    nftsOwned: 0,
  });

  useEffect(() => {
    // Update stats when data is available
    if (address) {
      const timer = setTimeout(() => {
        setStats({
          collectionsCreated: userCollections?.length || 0,
          nftsCreated: createdNFTs?.length || 0,
          collectionsOwned: ownedCollections?.length || 0,
          nftsOwned: ownedNFTs?.length || 0,
        });
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [address, userCollections, createdNFTs, ownedCollections, ownedNFTs]);

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Stats</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Collections Created"
          value={stats.collectionsCreated.toString()}
          isLoading={isLoading}
        />
        <StatCard title="NFTs Created" value={stats.nftsCreated.toString()} isLoading={isLoading} />
        <StatCard
          title="Collections Owned"
          value={stats.collectionsOwned.toString()}
          isLoading={isLoading}
        />
        <StatCard title="NFTs Owned" value={stats.nftsOwned.toString()} isLoading={isLoading} />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  isLoading?: boolean;
}

function StatCard({ title, value, isLoading = false }: StatCardProps) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-3 sm:p-4 shadow-sm">
      <h3 className="text-xs sm:text-sm font-medium text-gray-400">{title}</h3>
      {isLoading ? (
        <div className="h-6 sm:h-7 w-12 sm:w-16 bg-[#1f1f1f] rounded animate-pulse mt-1"></div>
      ) : (
        <p className="text-xl sm:text-2xl font-bold text-white mt-1">{value}</p>
      )}
    </div>
  );
}

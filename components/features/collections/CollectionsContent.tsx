'use client';

import { CollectionsList } from './CollectionsList';
import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';
import { useWallet } from '@/lib/hooks/wallet';
import { CollectionsHeader } from './CollectionsHeader';
import { FilterPanel, CollectionFilters } from './FilterPanel';
import { Suspense } from 'react';

interface CollectionsContentProps {
  role?: 'admin' | 'user';
}

export function CollectionsContent({ role = 'user' }: CollectionsContentProps) {
  const { data: address } = useAddress();
  const { isConnected, isAuthenticated, authenticate, connect } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  // No need to maintain state for filters as we use URL params now
  // Just keep filter panel visibility state

  // Determine the base path based on role
  const basePath = role === 'admin' ? '/admin/collections' : '/user/collections';

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleAuthenticate = async () => {
    try {
      await authenticate();
    } catch (error) {
      console.error('Failed to authenticate:', error);
    }
  };

  const handleFilterToggle = (isOpen: boolean) => {
    setIsFilterPanelOpen(isOpen);
  };

  // We keep this for backward compatibility, but it's not doing much
  const handleFilterChange = (newFilters: CollectionFilters) => {
    console.log('User filter changed via callback:', newFilters);
    // No need to update state as we use URL params
  };

  if (isLoading) {
    return (
      <div>
        {/* Skeleton for header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="h-7 sm:h-8 bg-[#1f1f1f] rounded w-36 sm:w-48 animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 sm:h-9 bg-[#1f1f1f] rounded w-28 sm:w-36 animate-pulse"></div>
              <div className="h-8 sm:h-9 bg-[#1f1f1f] rounded w-20 sm:w-24 animate-pulse"></div>
            </div>
          </div>
          <div className="h-px w-full bg-[#1f1f1f] mt-4 sm:mt-6"></div>
        </div>

        {/* Skeleton for collection cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg overflow-hidden shadow-sm p-3 sm:p-4"
            >
              <div className="flex gap-3 sm:gap-4">
                {/* Collection Image Skeleton - Left Side */}
                <div className="flex-shrink-0">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-[#1f1f1f] rounded-lg animate-pulse"></div>
                </div>

                {/* Collection Info Skeleton - Right Side */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="h-4 sm:h-5 bg-[#1f1f1f] rounded w-3/5 animate-pulse"></div>
                    <div className="h-4 sm:h-5 bg-[#1f1f1f] rounded w-1/5 animate-pulse"></div>
                  </div>
                  <div className="h-3 sm:h-4 bg-[#1f1f1f] rounded w-full animate-pulse mb-2"></div>
                  <div className="h-3 sm:h-4 bg-[#1f1f1f] rounded w-4/5 animate-pulse mb-2"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-2 sm:h-3 bg-[#1f1f1f] rounded w-1/4 animate-pulse"></div>
                    <div className="h-2 sm:h-3 bg-[#1f1f1f] rounded w-1/4 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">
          Connect Your Wallet
        </h2>
        <p className="text-zinc-400 text-center max-w-md mb-6 sm:mb-8 px-4 sm:px-0 text-sm sm:text-base">
          Please connect your wallet to view and manage your NFT collections.
        </p>
        <button
          onClick={() => handleConnect()}
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-1.5 sm:py-2 px-4 sm:px-6 rounded-md transition-colors font-medium text-sm sm:text-base"
        >
          Connect Wallet
        </button>
        <div className="h-px w-full max-w-md bg-[#1f1f1f] mt-6 sm:mt-8"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">
          Authenticate Your Wallet
        </h2>
        <p className="text-zinc-400 text-center max-w-md mb-6 sm:mb-8 px-4 sm:px-0 text-sm sm:text-base">
          Please sign a message to verify you are the owner of this wallet to view your collections.
        </p>
        <button
          onClick={() => handleAuthenticate()}
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-1.5 sm:py-2 px-4 sm:px-6 rounded-md transition-colors font-medium text-sm sm:text-base"
        >
          Sign Message
        </button>
        <div className="h-px w-full max-w-md bg-[#1f1f1f] mt-6 sm:mt-8"></div>
      </div>
    );
  }

  // Default empty filters object for backward compatibility
  const emptyFilters: CollectionFilters = {
    search: '',
    ownerFilter: 'all',
  };

  return (
    <div className="animate-fade-in">
      <CollectionsHeader role={role} onFilterToggle={handleFilterToggle} />
      <Suspense>
        <FilterPanel
          isOpen={isFilterPanelOpen}
          role={role}
          onFilterChange={handleFilterChange}
          initialFilters={emptyFilters}
        />
        <CollectionsList role={role} />
      </Suspense>
    </div>
  );
}

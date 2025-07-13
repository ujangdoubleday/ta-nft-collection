'use client';

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { trpc } from '@/lib/api/trpc/client';

export function FeesHeader() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const utils = trpc.useContext();

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // Invalidate tRPC queries for contract balance and fees
      await Promise.all([
        utils.factoryConfig.getContractBalance.invalidate(),
        utils.factoryConfig.getTotalFeesCollected.invalidate(),
        utils.factoryConfig.getCreationFee.invalidate(),
        // Call revalidate API for the fees page
        fetch('/api/revalidate?path=/admin/fees&type=page'),
      ]);

      // Refresh the page
      router.refresh();
      toast.success('Fee information refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing fees information:', error);
      toast.error('Failed to refresh. Please try again.');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000); // Add slight delay to show the refresh animation
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fee Management</h1>
          <p className="text-zinc-400">
            Configure creation fees for NFT collections and manage fee-related settings.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`bg-white text-black hover:bg-zinc-200 py-2 px-3 rounded-md transition-colors text-sm font-medium flex items-center gap-2 ${
            isRefreshing ? 'opacity-70' : ''
          }`}
          aria-label="Refresh fee information"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
    </div>
  );
}

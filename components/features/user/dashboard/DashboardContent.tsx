'use client';

import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { DashboardActions } from './DashboardActions';
import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';

export function DashboardContent() {
  const { data: address } = useAddress();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (!address && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">
          Connect Your Wallet
        </h2>
        <p className="text-zinc-400 text-center max-w-md mb-6 sm:mb-8 px-4 sm:px-0 text-sm sm:text-base">
          Please connect your wallet to view your dashboard and manage your NFT collections.
        </p>
        <div className="h-px w-full max-w-md bg-zinc-800"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-1 sm:px-0">
      <DashboardHeader />

      <div className="flex flex-col gap-4 sm:gap-6">
        <DashboardStats />
        <DashboardActions />
      </div>
    </div>
  );
}

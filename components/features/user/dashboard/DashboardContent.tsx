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
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-zinc-400 text-center max-w-md mb-8">
          Please connect your wallet to view your dashboard and manage your NFT collections.
        </p>
        <div className="h-px w-full max-w-md bg-zinc-800"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <DashboardHeader />

      <div className="flex flex-col gap-6">
        <DashboardStats />
        <DashboardActions />
      </div>
    </div>
  );
}

'use client';

import { UserDashboardHeader } from './UserDashboardHeader';
import { UserDashboardStats } from './UserDashboardStats';
import { UserDashboardActions } from './UserDashboardActions';
import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';

export function UserDashboardContent() {
  const { data: address } = useAddress();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
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
      <UserDashboardHeader />
      <UserDashboardStats />
      <UserDashboardActions />

      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 shadow-sm">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-zinc-700 animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-zinc-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-zinc-700 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400">No recent activity to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

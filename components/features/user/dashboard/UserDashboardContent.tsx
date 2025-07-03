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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Recent Activity - Left Side */}
        <div className="lg:w-[40%] order-2 lg:order-1 flex flex-col">
          <h2 className="text-base font-bold text-white mb-3">Recent Activity</h2>
          <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-5 shadow-sm flex-grow">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-[#1f1f1f] animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-[#1f1f1f] rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-[#1f1f1f] rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No recent activity to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats and Quick Actions - Right Side */}
        <div className="lg:w-[60%] order-1 lg:order-2 flex flex-col gap-6">
          {/* Stats Section */}
          <UserDashboardStats />

          {/* Quick Actions Section */}
          <UserDashboardActions />
        </div>
      </div>
    </div>
  );
}

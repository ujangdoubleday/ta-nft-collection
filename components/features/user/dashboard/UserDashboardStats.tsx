'use client';

import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';

export function UserDashboardStats() {
  const { data: address } = useAddress();
  const [isLoading, setIsLoading] = useState(true);

  // Placeholder stats - in a real application these would be fetched from an API
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalNFTs: 0,
    recentActivity: 0,
    createdAt: new Date().toLocaleDateString(),
  });

  useEffect(() => {
    // Simulate loading stats
    if (address) {
      const timer = setTimeout(() => {
        setStats({
          totalCollections: 3,
          totalNFTs: 12,
          recentActivity: 5,
          createdAt: new Date().toLocaleDateString(),
        });
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [address]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Collections"
        value={stats.totalCollections.toString()}
        isLoading={isLoading}
      />
      <StatCard title="Total NFTs" value={stats.totalNFTs.toString()} isLoading={isLoading} />
      <StatCard
        title="Recent Activity"
        value={stats.recentActivity.toString()}
        isLoading={isLoading}
      />
      <StatCard title="Member Since" value={stats.createdAt} isLoading={isLoading} />
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
    <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      {isLoading ? (
        <div className="h-7 w-16 bg-[#1f1f1f] rounded animate-pulse mt-1"></div>
      ) : (
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      )}
    </div>
  );
}

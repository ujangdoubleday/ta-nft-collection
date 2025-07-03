'use client';

import { UserCollectionsList } from './UserCollectionsList';
import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';

export function UserCollectionsContent() {
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
      <div className="flex flex-col items-center justify-center py-12 bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-zinc-400 text-center max-w-md mb-8">
          Please connect your wallet to view and manage your NFT collections.
        </p>
        <div className="h-px w-full max-w-md bg-[#1f1f1f]"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <UserCollectionsList />
    </div>
  );
}

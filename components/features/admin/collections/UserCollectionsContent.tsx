'use client';

import { UserCollectionsList } from './UserCollectionsList';
import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';
import { useWallet } from '@/lib/hooks/wallet';

export function UserCollectionsContent() {
  const { data: address } = useAddress();
  const { isConnected, isAuthenticated, authenticate, connect } = useWallet();
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8 animate-pulse">
        <div className="w-16 h-16 bg-[#1f1f1f] rounded-full mb-4"></div>
        <div className="h-6 bg-[#1f1f1f] rounded w-64 mb-4"></div>
        <div className="h-4 bg-[#1f1f1f] rounded w-80 mb-2"></div>
        <div className="h-4 bg-[#1f1f1f] rounded w-72 mb-8"></div>
        <div className="h-10 bg-[#1f1f1f] rounded w-48"></div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-zinc-400 text-center max-w-md mb-8">
          Please connect your wallet to view and manage your NFT collections.
        </p>
        <button
          onClick={handleConnect}
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-2 px-6 rounded-md transition-colors font-medium"
        >
          Connect Wallet
        </button>
        <div className="h-px w-full max-w-md bg-[#1f1f1f] mt-8"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Authenticate Your Wallet</h2>
        <p className="text-zinc-400 text-center max-w-md mb-8">
          Please sign a message to verify you are the owner of this wallet to view your collections.
        </p>
        <button
          onClick={handleAuthenticate}
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-2 px-6 rounded-md transition-colors font-medium"
        >
          Sign Message
        </button>
        <div className="h-px w-full max-w-md bg-[#1f1f1f] mt-8"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <UserCollectionsList />
    </div>
  );
}

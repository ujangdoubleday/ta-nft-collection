'use client';

import React, { useState, useEffect } from 'react';
import { EmergencyHeader } from './EmergencyHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';
import { EmergencyWithdraw } from './EmergencyWithdraw';
import { EmergencyPause } from './EmergencyPause';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';
import Spinner from '@/components/ui/spinner';

export function EmergencyContent() {
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { address } = useAccount();
  const { data: isOwner, isLoading: isCheckingOwner } = trpc.factoryConfig.isOwner.useQuery(
    { address: address || '' },
    { enabled: !!address },
  );

  // Get contract data from tRPC
  const { data: isPaused, isLoading: isLoadingPaused } = trpc.factoryConfig.isPaused.useQuery();
  const { data: contractBalance, isLoading: isLoadingBalance } =
    trpc.factoryConfig.getContractBalance.useQuery();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Skeleton component for loading state
  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Withdraw Skeleton */}
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
          <div className="h-5 bg-[#1f1f1f] rounded w-1/3 mb-3 animate-pulse"></div>
          <div className="bg-black/40 p-3 rounded-md border border-zinc-800 mb-3">
            <div className="h-4 bg-[#1f1f1f] rounded w-1/4 mb-2 animate-pulse"></div>
            <div className="h-6 bg-[#1f1f1f] rounded w-1/3 animate-pulse"></div>
          </div>
          <div className="h-10 bg-[#1f1f1f] rounded w-full mb-2 animate-pulse"></div>
          <div className="h-4 bg-[#1f1f1f] rounded w-3/4 animate-pulse"></div>
        </div>

        {/* Pause Skeleton */}
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
          <div className="h-5 bg-[#1f1f1f] rounded w-1/3 mb-3 animate-pulse"></div>
          <div className="bg-black/40 p-3 rounded-md border border-zinc-800 mb-3">
            <div className="h-4 bg-[#1f1f1f] rounded w-1/4 mb-2 animate-pulse"></div>
            <div className="h-6 bg-[#1f1f1f] rounded w-2/3 animate-pulse"></div>
          </div>
          <div className="h-10 bg-[#1f1f1f] rounded w-full mb-2 animate-pulse"></div>
          <div className="h-4 bg-[#1f1f1f] rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // Determine if we're still loading any data
  const isDataLoading = isCheckingOwner || isLoadingPaused || isLoadingBalance || isLoading;

  return (
    <div className="animate-fade-in">
      <EmergencyHeader />

      {isDataLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex flex-col gap-6 mt-8">
          {!isOwner && (
            <Alert className="bg-red-900/20 border border-red-900/30 text-red-400">
              <AlertDescription>
                You need to be the contract owner to access these functions.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emergency Withdraw Component */}
            <EmergencyWithdraw
              setError={setError}
              setSuccessMessage={setSuccessMessage}
              setTxHash={setTxHash}
              isOwner={!!isOwner}
              isLoading={isDataLoading}
              contractBalance={contractBalance || 0}
            />

            {/* Emergency Pause Component */}
            <EmergencyPause
              setError={setError}
              setSuccessMessage={setSuccessMessage}
              setTxHash={setTxHash}
              isOwner={!!isOwner}
              isLoading={isDataLoading}
              isPaused={!!isPaused}
            />
          </div>

          {/* Status Messages */}
          <div>
            {error && (
              <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-900/20 border border-green-900/30 text-green-400 px-4 py-3 rounded mb-4">
                {successMessage}
              </div>
            )}

            {/* Transaction Hash */}
            {txHash && (
              <Alert className="bg-black/40 border border-zinc-800">
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300 truncate">
                    Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    View on Sepolia <ExternalLink size={12} className="ml-1" />
                  </a>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

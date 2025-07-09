'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/api/trpc/client';
import { useTotalFeesCollected } from '@/lib/blockchain/hooks/useNFTFactoryConfig';

export function ContractBalance() {
  const [isLoading, setIsLoading] = useState(true);

  // Get contract balance from tRPC
  const { data: contractBalance, isLoading: isLoadingBalance } =
    trpc.factoryConfig.getContractBalance.useQuery();

  // Get total fees collected using tRPC
  const { data: totalFeesData, isLoading: isLoadingTotalFees } =
    trpc.factoryConfig.getTotalFeesCollected.useQuery();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-white mb-2">Contract Balance</h2>
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-xs text-zinc-400 mb-1">Available Balance</p>
          <div className=" p-3 rounded-md border border-zinc-800 mb-3">
            {isLoading || isLoadingBalance ? (
              <div className="h-6 bg-[#1f1f1f] rounded w-1/3 animate-pulse"></div>
            ) : (
              <p className="text-base font-medium text-white">{contractBalance} ETH</p>
            )}
          </div>
          <p className="text-xs text-zinc-400 mb-1">Total Collected</p>
          <div className=" p-3 rounded-md border border-zinc-800 mb-3">
            {isLoading || isLoadingTotalFees ? (
              <div className="h-6 bg-[#1f1f1f] rounded w-1/3 animate-pulse"></div>
            ) : (
              <p className="text-base font-medium text-white">{totalFeesData?.total || '0'} ETH</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

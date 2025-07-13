'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { useAccount } from 'wagmi';
import { useEmergencyWithdraw } from '@/lib/blockchain/hooks/useNFTFactoryWrite';
import { trpc } from '@/lib/api/trpc/client';

interface EmergencyWithdrawProps {
  setError: (error: string) => void;
  setSuccessMessage: (message: string) => void;
  setTxHash: (hash: string) => void;
  isOwner: boolean;
  isLoading: boolean;
  contractBalance: number;
}

export function EmergencyWithdraw({
  setError,
  setSuccessMessage,
  setTxHash,
  isOwner,
  isLoading,
  contractBalance,
}: EmergencyWithdrawProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { address } = useAccount();

  // Get tRPC utils for invalidating queries
  const utils = trpc.useContext();

  // Get contract functions
  const { emergencyWithdraw } = useEmergencyWithdraw();

  const handleEmergencyWithdraw = async () => {
    if (!isOwner) {
      setError('Only the contract owner can withdraw funds');
      return;
    }

    try {
      setIsWithdrawing(true);
      setError('');
      setSuccessMessage('');
      setTxHash('');

      // Call the actual contract function
      const result = await emergencyWithdraw(address as `0x${string}`);

      if (result.hash) {
        setTxHash(result.hash);
        setSuccessMessage('Funds withdrawn successfully');

        // Invalidate contract balance query
        utils.factoryConfig.getContractBalance.invalidate();

        // Revalidate the emergency page
        fetch('/api/revalidate?path=/admin/emergency&type=page').catch((err) =>
          console.error('Error revalidating emergency page:', err),
        );
      } else if (result.error) {
        setError(result.error.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw funds');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-white mb-2">Emergency Withdraw</h2>
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-xs text-zinc-400 mb-1">Contract Balance</p>
          <div className="p-3 rounded-md border border-zinc-800 mb-3">
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-6 bg-[#1f1f1f] rounded w-1/3 animate-pulse"></div>
                <div className="h-2 bg-transparent"></div>
              </div>
            ) : (
              <p className="text-base font-medium text-white">{contractBalance} ETH</p>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              <div className="h-10 bg-[#1f1f1f] rounded w-full animate-pulse"></div>
              <div className="h-4 bg-[#1f1f1f] rounded w-3/4 mt-2 animate-pulse opacity-50"></div>
            </div>
          ) : (
            <>
              <Button
                variant="destructive"
                size="lg"
                disabled={isLoading || isWithdrawing || !isOwner || contractBalance === 0}
                className="w-full"
                onClick={() => handleEmergencyWithdraw()}
              >
                {isWithdrawing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="md" color="white" />
                    <span>Withdrawing...</span>
                  </div>
                ) : (
                  'Emergency Withdraw All Funds'
                )}
              </Button>
              <p className="text-xs text-zinc-500 mt-2">
                This will withdraw all funds from the contract to the owner address.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

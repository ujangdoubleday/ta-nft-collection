'use client';

import React, { useState, useEffect } from 'react';
import { EmergencyHeader } from './EmergencyHeader';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { useNFTFactoryConfig } from '@/lib/blockchain/hooks/useNFTFactoryConfig';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';
import {
  useEmergencyWithdraw,
  usePauseContract,
  useUnpauseContract,
} from '@/lib/blockchain/hooks/useNFTFactoryWrite';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';

export function EmergencyContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();
  const { data: isOwner, isLoading: isCheckingOwner } = trpc.factoryConfig.isOwner.useQuery(
    { address: address || '' },
    { enabled: !!address },
  );

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isUnpausing, setIsUnpausing] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get contract functions
  const { emergencyWithdraw, isLoading: isEmergencyWithdrawLoading } = useEmergencyWithdraw();
  const { pauseContract, isLoading: isPauseLoading } = usePauseContract();
  const { unpauseContract, isLoading: isUnpauseLoading } = useUnpauseContract();

  // Mock data for demonstration - replace with actual contract calls
  const isPaused = false; // This should come from your contract
  const contractBalance: number = 0.5; // This should come from your contract

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

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
      } else if (result.error) {
        setError(result.error.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw funds');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleEmergencyPause = async () => {
    if (!isOwner) {
      setError('Only the contract owner can pause the contract');
      return;
    }

    try {
      setIsPausing(true);
      setError('');
      setSuccessMessage('');
      setTxHash('');

      // Call the actual contract function
      const result = await pauseContract();

      if (result.hash) {
        setTxHash(result.hash);
        setSuccessMessage('Contract paused successfully');
      } else if (result.error) {
        setError(result.error.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to pause contract');
    } finally {
      setIsPausing(false);
    }
  };

  const handleEmergencyUnpause = async () => {
    if (!isOwner) {
      setError('Only the contract owner can unpause the contract');
      return;
    }

    try {
      setIsUnpausing(true);
      setError('');
      setSuccessMessage('');
      setTxHash('');

      // Call the actual contract function
      const result = await unpauseContract();

      if (result.hash) {
        setTxHash(result.hash);
        setSuccessMessage('Contract unpaused successfully');
      } else if (result.error) {
        setError(result.error.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to unpause contract');
    } finally {
      setIsUnpausing(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <EmergencyHeader />

      <div className="flex flex-col gap-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Emergency Withdraw Section */}
          <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
            <h2 className="text-sm font-bold text-white mb-2">Emergency Withdraw</h2>
            <div className="bg-black/40 p-3 rounded-md border border-zinc-800 mb-3">
              <p className="text-xs text-zinc-400 mb-1">Contract Balance</p>
              {isLoading ? (
                <div className="h-6 bg-[#1f1f1f] rounded w-1/3 animate-pulse"></div>
              ) : (
                <p className="text-base font-medium text-white">{contractBalance} ETH</p>
              )}
            </div>

            <Button
              variant="destructive"
              disabled={isLoading || isWithdrawing || !isOwner || contractBalance === 0}
              className="w-full"
              onClick={handleEmergencyWithdraw}
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
          </div>

          {/* Emergency Pause Section */}
          <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
            <h2 className="text-sm font-bold text-white mb-2">Emergency Pause</h2>
            <div className="bg-black/40 p-3 rounded-md border border-zinc-800 mb-3">
              <p className="text-xs text-zinc-400 mb-1">Contract Status</p>
              {isLoading ? (
                <div className="h-5 bg-[#1f1f1f] rounded w-2/3 animate-pulse"></div>
              ) : (
                <p className={`font-medium ${isPaused ? 'text-red-400' : 'text-green-400'}`}>
                  {isPaused ? 'PAUSED' : 'ACTIVE'}
                </p>
              )}
            </div>

            {isPaused ? (
              <Button
                variant="outline"
                disabled={isLoading || isUnpausing || !isOwner}
                className="w-full"
                onClick={handleEmergencyUnpause}
              >
                {isUnpausing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="md" />
                    <span>Unpausing...</span>
                  </div>
                ) : (
                  'Unpause Contract'
                )}
              </Button>
            ) : (
              <Button
                variant="destructive"
                disabled={isLoading || isPausing || !isOwner}
                className="w-full"
                onClick={handleEmergencyPause}
              >
                {isPausing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="md" color="white" />
                    <span>Pausing...</span>
                  </div>
                ) : (
                  'Emergency Pause Contract'
                )}
              </Button>
            )}
            <p className="text-xs text-zinc-500 mt-2">
              {isPaused
                ? 'Unpausing will re-enable all contract functionality.'
                : 'Pausing will temporarily disable all contract functionality except withdrawals.'}
            </p>
          </div>
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
    </div>
  );
}

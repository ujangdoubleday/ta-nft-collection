'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { usePauseContract, useUnpauseContract } from '@/lib/blockchain/hooks/useNFTContractPause';
import { trpc } from '@/lib/api/trpc/client';

interface EmergencyPauseProps {
  setError: (error: string) => void;
  setSuccessMessage: (message: string) => void;
  setTxHash: (hash: string) => void;
  isOwner: boolean;
  isLoading: boolean;
  isPaused: boolean;
}

export function EmergencyPause({
  setError,
  setSuccessMessage,
  setTxHash,
  isOwner,
  isLoading,
  isPaused,
}: EmergencyPauseProps) {
  const [isPausing, setIsPausing] = useState(false);
  const [isUnpausing, setIsUnpausing] = useState(false);

  // Get contract functions
  const {
    pauseContract,
    isLoading: isPauseLoading,
    error: pauseError,
    transactionHash: pauseTxHash,
  } = usePauseContract();

  const {
    unpauseContract,
    isLoading: isUnpauseLoading,
    error: unpauseError,
    transactionHash: unpauseTxHash,
  } = useUnpauseContract();

  // Get tRPC utils for invalidating queries
  const utils = trpc.useContext();

  // Watch for transaction hash changes
  useEffect(() => {
    if (pauseTxHash && isPausing) {
      setTxHash(pauseTxHash);
      setSuccessMessage('Contract paused successfully');
      utils.factoryConfig.isPaused.invalidate();
      utils.factoryConfig.getContractBalance.invalidate();

      // Revalidate the emergency page
      fetch('/api/revalidate?path=/admin/emergency&type=page').catch((err) =>
        console.error('Error revalidating emergency page:', err),
      );

      setIsPausing(false);
    }
  }, [pauseTxHash, isPausing, setTxHash, setSuccessMessage, utils.factoryConfig]);

  useEffect(() => {
    if (unpauseTxHash && isUnpausing) {
      setTxHash(unpauseTxHash);
      setSuccessMessage('Contract unpaused successfully');
      utils.factoryConfig.isPaused.invalidate();
      utils.factoryConfig.getContractBalance.invalidate();

      // Revalidate the emergency page
      fetch('/api/revalidate?path=/admin/emergency&type=page').catch((err) =>
        console.error('Error revalidating emergency page:', err),
      );

      setIsUnpausing(false);
    }
  }, [unpauseTxHash, isUnpausing, setTxHash, setSuccessMessage, utils.factoryConfig]);

  // Watch for errors
  useEffect(() => {
    if (pauseError && isPausing) {
      setError(pauseError.message || 'Failed to pause contract');
      setIsPausing(false);
    }
  }, [pauseError, isPausing, setError]);

  useEffect(() => {
    if (unpauseError && isUnpausing) {
      setError(unpauseError.message || 'Failed to unpause contract');
      setIsUnpausing(false);
    }
  }, [unpauseError, isUnpausing, setError]);

  const handleEmergencyPause = async () => {
    if (!isOwner) {
      setError('Only the contract owner can pause the contract');
      return;
    }

    try {
      setIsPausing(true);

      // Don't clear messages until we have a result
      // setError('');
      // setSuccessMessage('');
      // setTxHash('');

      // Call the contract function
      const result = await pauseContract();

      if (result.error) {
        setError(result.error.message || 'Failed to pause contract');
        setIsPausing(false);
      }
      // Success case will be handled by the useEffect watching pauseTxHash
    } catch (err: any) {
      setError(err.message || 'Failed to pause contract');
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

      // Don't clear messages until we have a result
      // setError('');
      // setSuccessMessage('');
      // setTxHash('');

      // Call the contract function
      const result = await unpauseContract();

      if (result.error) {
        setError(result.error.message || 'Failed to unpause contract');
        setIsUnpausing(false);
      }
      // Success case will be handled by the useEffect watching unpauseTxHash
    } catch (err: any) {
      setError(err.message || 'Failed to unpause contract');
      setIsUnpausing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-white mb-2">Emergency Pause</h2>
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-xs text-zinc-400 mb-1">Contract Status</p>
          <div className="p-3 rounded-md border border-zinc-800 mb-3">
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-5 bg-[#1f1f1f] rounded w-2/3 animate-pulse"></div>
                <div className="h-2 bg-transparent"></div>
              </div>
            ) : (
              <p className={`font-medium ${isPaused ? 'text-red-400' : 'text-green-400'}`}>
                {isPaused ? 'PAUSED' : 'ACTIVE'}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              <div className="h-10 bg-[#1f1f1f] rounded w-full animate-pulse"></div>
              <div className="h-4 bg-[#1f1f1f] rounded w-3/4 mt-2 animate-pulse opacity-50"></div>
            </div>
          ) : (
            <>
              {isPaused ? (
                <Button
                  variant="outline"
                  size="lg"
                  disabled={isLoading || isUnpauseLoading || isUnpausing || !isOwner}
                  className="w-full"
                  onClick={() => handleEmergencyUnpause()}
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
                  size="lg"
                  disabled={isLoading || isPauseLoading || isPausing || !isOwner}
                  className="w-full"
                  onClick={() => handleEmergencyPause()}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

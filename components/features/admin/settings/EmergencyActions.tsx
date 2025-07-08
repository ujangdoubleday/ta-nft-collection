'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { useNFTFactoryConfig } from '@/lib/blockchain/hooks/useNFTFactoryConfig';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';

interface EmergencyActionsProps {
  isLoading: boolean;
}

export function EmergencyActions({ isLoading }: EmergencyActionsProps) {
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

  // Mock data for demonstration - replace with actual contract calls
  const isPaused = false; // This should come from your contract
  const contractBalance: number = 0.5; // This should come from your contract

  const handleEmergencyWithdraw = async () => {
    if (!isOwner) {
      setError('Only the contract owner can withdraw funds');
      return;
    }

    try {
      setIsWithdrawing(true);
      setError('');
      setSuccessMessage('');

      // Replace with actual contract call
      // const tx = await yourContractInstance.emergencyWithdraw();
      // await tx.wait();

      // Mock success for demonstration
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setTxHash('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      setSuccessMessage('Funds withdrawn successfully');
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

      // Replace with actual contract call
      // const tx = await yourContractInstance.pause();
      // await tx.wait();

      // Mock success for demonstration
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setTxHash('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890');
      setSuccessMessage('Contract paused successfully');
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

      // Replace with actual contract call
      // const tx = await yourContractInstance.unpause();
      // await tx.wait();

      // Mock success for demonstration
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setTxHash('0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456');
      setSuccessMessage('Contract unpaused successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to unpause contract');
    } finally {
      setIsUnpausing(false);
    }
  };

  return (
    <div>
      <h2 className="text-base font-bold text-white mb-3">Emergency Actions</h2>
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6 h-full">
        <div className="space-y-6">
          {/* Emergency Withdraw Section */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Emergency Withdraw</h3>
            <div className="bg-black/40 p-4 rounded-md border border-zinc-800 mb-4">
              <p className="text-sm text-zinc-400 mb-1">Contract Balance</p>
              {isLoading ? (
                <div className="h-7 bg-[#1f1f1f] rounded w-1/3 animate-pulse"></div>
              ) : (
                <p className="text-xl font-medium text-white">{contractBalance} ETH</p>
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

          {/* Divider */}
          <div className="h-px w-full bg-zinc-800"></div>

          {/* Emergency Pause Section */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Emergency Pause</h3>
            <div className="bg-black/40 p-4 rounded-md border border-zinc-800 mb-4">
              <p className="text-sm text-zinc-400 mb-1">Contract Status</p>
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

          {/* Status Messages */}
          {error && (
            <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-900/20 border border-green-900/30 text-green-400 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          {/* Transaction Hash */}
          {txHash && (
            <div className="bg-black/40 p-4 rounded-md border border-zinc-800">
              <p className="text-sm text-zinc-400 mb-1">Transaction</p>
              <p className="text-xs text-zinc-300 font-mono break-all">{txHash}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

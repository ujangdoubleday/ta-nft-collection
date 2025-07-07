'use client';

import { useState, useEffect } from 'react';
import { useNFTFactoryConfig } from '@/lib/blockchain/hooks/useNFTFactoryConfig';
import { LoadingSpinner } from '@/components/shared/loading/LoadingSpinner';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/atoms/button';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';

export function CreationFeeSettings() {
  const {
    creationFee,
    isLoadingFee,
    isUpdating,
    updateCreationFee,
    error: updateError,
    feeEvents,
    transactionHash,
  } = useNFTFactoryConfig();

  const { address } = useAccount();
  const { data: isOwner, isLoading: isCheckingOwner } = trpc.factoryConfig.isOwner.useQuery(
    { address: address || '' },
    { enabled: !!address },
  );

  const [newFee, setNewFee] = useState('0');
  const [error, setError] = useState('');
  const [showEvents, setShowEvents] = useState(false);

  // Update newFee when creationFee changes
  useEffect(() => {
    if (creationFee) {
      setNewFee(creationFee);
    }
  }, [creationFee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isOwner) {
      setError('Only the contract owner can update creation fee');
      return;
    }

    try {
      await updateCreationFee(newFee);
    } catch (err) {
      setError('Failed to update creation fee. Please try again.');
      console.error('Error setting fee:', err);
    }
  };

  return (
    <div>
      <h2 className="text-base font-bold text-white mb-3">NFT Creation Fee</h2>
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <div className="space-y-6">
          {/* Current Fee Display */}
          <div className="bg-black/40 p-4 rounded-md border border-zinc-800">
            <p className="text-sm text-zinc-400 mb-1">Current Fee</p>
            {isLoadingFee ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                <span className="text-zinc-400">Loading...</span>
              </div>
            ) : (
              <p className="text-xl font-medium text-white">{creationFee} ETH</p>
            )}
          </div>

          {/* Owner Status */}
          <div className="bg-black/40 p-4 rounded-md border border-zinc-800">
            <p className="text-sm text-zinc-400 mb-1">Owner Status</p>
            {isCheckingOwner ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                <span className="text-zinc-400">Checking...</span>
              </div>
            ) : (
              <p className={`font-medium ${isOwner ? 'text-green-400' : 'text-red-400'}`}>
                {isOwner ? 'You are the contract owner' : 'You are not the contract owner'}
              </p>
            )}
          </div>

          {/* Fee Update Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">New Creation Fee (ETH)</label>
              <input
                type="number"
                step="0.000000000000000001"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                className="w-full p-3 bg-black border border-zinc-800 rounded-md text-white"
                placeholder="Enter new fee in ETH"
                disabled={isUpdating || !isOwner}
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {updateError && (
              <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded">
                {updateError.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isUpdating || isLoadingFee || !isOwner}
              className="w-full"
            >
              {isUpdating ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner className="w-4 h-4" />
                  <span>Updating Fee...</span>
                </div>
              ) : (
                'Update Fee'
              )}
            </Button>
          </form>

          {/* Transaction Status */}
          {transactionHash && (
            <div className="bg-black/40 p-4 rounded-md border border-zinc-800">
              <p className="text-sm text-zinc-400 mb-1">Transaction</p>
              <p className="text-xs text-zinc-300 font-mono break-all">{transactionHash}</p>
            </div>
          )}

          {/* Fee Update Events */}
          <div>
            <Button
              variant="link"
              onClick={() => setShowEvents(!showEvents)}
              className="p-0 h-auto text-sm text-blue-400"
            >
              {showEvents ? 'Hide Fee Update History' : 'Show Fee Update History'}
            </Button>

            {showEvents && (
              <div className="mt-4 border border-zinc-800 rounded-md p-4 bg-black/40">
                <h3 className="font-medium text-white mb-3">Fee Update History</h3>
                {feeEvents.length > 0 ? (
                  <ul className="space-y-2 divide-y divide-zinc-800">
                    {feeEvents.map((event, index) => (
                      <li key={index} className="text-sm pt-2 first:pt-0">
                        <span className="text-zinc-400">Old Fee:</span>{' '}
                        <span className="text-white">{formatEther(BigInt(event.oldFee))} ETH</span>{' '}
                        <span className="text-zinc-500">→</span>{' '}
                        <span className="text-zinc-400">New Fee:</span>{' '}
                        <span className="text-white">{formatEther(BigInt(event.newFee))} ETH</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-400">No fee update events detected yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="text-sm text-zinc-500 pt-4 border-t border-zinc-800">
            <p>This fee will be charged for creating new NFT collections.</p>
            <p className="mt-2 text-red-400">
              Note: Only the contract owner can update the creation fee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

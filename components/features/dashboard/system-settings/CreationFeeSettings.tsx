'use client';

import { useState, useEffect } from 'react';
import { Win98Window } from '@/components/ui/organisms/Win98Window';
import { useNFTFactoryConfig } from '@/lib/blockchain/hooks/useNFTFactoryConfig';
import { LoadingSpinner } from '@/components/shared/loading/LoadingSpinner';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/atoms/button';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';

export const CreationFeeSettings = () => {
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
    <Win98Window
      title="Creation Fee Configuration"
      icon="/assets/icons/window/info.png"
      className="mb-4"
    >
      <div className="p-4">
        <h2 className="text-lg font-bold mb-3">NFT Creation Fee</h2>

        <div className="space-y-4">
          {/* Current Fee Display */}
          <div className="bg-[#c3c3c3] p-3 border border-[#424242]">
            <p className="font-bold">Current Fee:</p>
            {isLoadingFee ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                <span>Loading...</span>
              </div>
            ) : (
              <p className="text-xl">{creationFee} ETH</p>
            )}
          </div>

          {/* Owner Status */}
          <div className="bg-[#c3c3c3] p-3 border border-[#424242]">
            <p className="font-bold">Owner Status:</p>
            {isCheckingOwner ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                <span>Checking...</span>
              </div>
            ) : (
              <p className={isOwner ? 'text-green-600' : 'text-red-600'}>
                {isOwner ? 'You are the contract owner' : 'You are not the contract owner'}
              </p>
            )}
          </div>

          {/* Fee Update Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block mb-2">New Creation Fee (ETH)</label>
              <input
                type="number"
                step="0.000000000000000001"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                className="w-full p-2 border border-[#424242] bg-white"
                placeholder="Enter new fee in ETH"
                disabled={isUpdating || !isOwner}
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {updateError && <div className="text-red-500 text-sm">{updateError.message}</div>}

            <Button
              type="submit"
              disabled={isUpdating || isLoadingFee || !isOwner}
              className="w-full"
            >
              {isUpdating ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  <span>Updating Fee...</span>
                </div>
              ) : (
                'Update Fee'
              )}
            </Button>
          </form>

          {/* Transaction Status */}
          {transactionHash && (
            <div className="bg-[#c3c3c3] p-3 border border-[#424242]">
              <p className="font-bold">Transaction:</p>
              <p className="text-xs break-all">{transactionHash}</p>
            </div>
          )}

          {/* Fee Update Events */}
          <div className="mt-4">
            <Button
              variant="link"
              onClick={() => setShowEvents(!showEvents)}
              className="p-0 h-auto text-sm text-blue-600"
            >
              {showEvents ? 'Hide Fee Update History' : 'Show Fee Update History'}
            </Button>

            {showEvents && feeEvents.length > 0 && (
              <div className="mt-2 border border-[#424242] p-2 bg-white">
                <h3 className="font-bold mb-2">Fee Update History</h3>
                <ul className="space-y-2">
                  {feeEvents.map((event, index) => (
                    <li key={index} className="text-sm border-b border-gray-200 pb-1">
                      <span className="font-medium">Old Fee:</span>{' '}
                      {formatEther(BigInt(event.oldFee))} ETH →{' '}
                      <span className="font-medium">New Fee:</span>{' '}
                      {formatEther(BigInt(event.newFee))} ETH
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showEvents && feeEvents.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">No fee update events detected yet.</p>
            )}
          </div>

          {/* Help Text */}
          <div className="text-sm text-gray-600 mt-4">
            <p>This fee will be charged for creating new NFT collections.</p>
            <p>The fee is denominated in ETH.</p>
            <p className="mt-2 text-red-500">
              Note: Only the contract owner can update the creation fee.
            </p>
          </div>
        </div>
      </div>
    </Win98Window>
  );
};

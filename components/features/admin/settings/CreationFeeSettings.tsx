'use client';

import { useState, useEffect } from 'react';
import { useNFTFactoryConfig } from '@/lib/blockchain/hooks/useNFTFactoryConfig';
import Spinner from '@/components/ui/spinner';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CreationFeeSettingsProps {
  isLoading: boolean;
}

export function CreationFeeSettings({ isLoading: pageLoading }: CreationFeeSettingsProps) {
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
  const [dialogOpen, setDialogOpen] = useState(false);

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
      setDialogOpen(false);
    } catch (err) {
      setError('Failed to update creation fee. Please try again.');
      console.error('Error setting fee:', err);
    }
  };

  return (
    <div>
      <h2 className="text-base font-bold text-white mb-3">NFT Creation Fee</h2>
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6 h-full">
        <div className="space-y-6">
          {/* Current Fee Display */}
          <div className="bg-black/40 p-4 rounded-md border border-zinc-800">
            <p className="text-sm text-zinc-400 mb-1">Current Fee</p>
            {pageLoading || isLoadingFee ? (
              <div className="h-7 bg-[#1f1f1f] rounded w-1/3 animate-pulse"></div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="text-xl font-medium text-white">{creationFee} ETH</p>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={!isOwner}>
                      Edit Fee
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    title="Update Creation Fee"
                    className="bg-[#0A0A0A] border border-[#1f1f1f] text-white"
                  >
                    <DialogHeader>
                      <DialogDescription className="text-zinc-400">
                        Set a new fee for NFT collection creation.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="py-4">
                        <label className="block text-sm text-zinc-400 mb-2">
                          New Creation Fee (ETH)
                        </label>
                        <Input
                          type="number"
                          step="0.000000000000000001"
                          value={newFee}
                          onChange={(e) => setNewFee(e.target.value)}
                          className="bg-black border border-zinc-800 text-white"
                          placeholder="Enter new fee in ETH"
                          disabled={isUpdating}
                        />
                      </div>

                      {error && (
                        <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded mb-4">
                          {error}
                        </div>
                      )}

                      {updateError && (
                        <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded mb-4">
                          {updateError.message}
                        </div>
                      )}

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating ? (
                            <div className="flex items-center justify-center gap-2">
                              <Spinner size="md" color="black" />
                              <span>Updating...</span>
                            </div>
                          ) : (
                            'Update Fee'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* Owner Status */}
          <div className="bg-black/40 p-4 rounded-md border border-zinc-800">
            <p className="text-sm text-zinc-400 mb-1">Owner Status</p>
            {pageLoading || isCheckingOwner ? (
              <div className="h-5 bg-[#1f1f1f] rounded w-2/3 animate-pulse"></div>
            ) : (
              <p className={`font-medium ${isOwner ? 'text-green-400' : 'text-red-400'}`}>
                {isOwner ? 'You are the contract owner' : 'You are not the contract owner'}
              </p>
            )}
          </div>

          {/* Transaction Status */}
          {transactionHash && (
            <div className="bg-black/40 p-4 rounded-md border border-zinc-800">
              <p className="text-sm text-zinc-400 mb-1">Transaction</p>
              <p className="text-xs text-zinc-300 font-mono break-all">{transactionHash}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useSetCreationFee } from '@/lib/blockchain/hooks/useNFTFactoryWrite';
import { formatEther, parseEther } from 'viem';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';

export function NFTCreationFee() {
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();
  const utils = trpc.useContext();
  const { data: isOwner, isLoading: isCheckingOwner } = trpc.factoryConfig.isOwner.useQuery(
    { address: address || '' },
    { enabled: !!address },
  );

  // Get current creation fee
  const { data: creationFeeData, isLoading: isLoadingFee } =
    trpc.factoryConfig.getCreationFee.useQuery();

  // Update creation fee
  const { setCreationFee, isLoading: isUpdatingFee, error: feeError } = useSetCreationFee();
  const [newFee, setNewFee] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Monitor for errors
  useEffect(() => {
    if (feeError) {
      toast.error(feeError.message || 'Failed to update fee');
    }
  }, [feeError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOwner) {
      toast.error('Only the contract owner can update creation fee');
      return;
    }

    try {
      const result = await setCreationFee(parseEther(newFee));

      if (result.hash) {
        // Invalidate tRPC queries to refresh data
        utils.factoryConfig.getCreationFee.invalidate();

        // Revalidate the fees page
        fetch('/api/revalidate?path=/admin/fees&type=page').catch((err) =>
          console.error('Error revalidating fees page:', err),
        );

        toast.success('Fee updated successfully');
        setTimeout(() => setDialogOpen(false), 2000);
      } else if (result.error) {
        toast.error(result.error.message || 'Failed to update fee');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update creation fee. Please try again.');
      console.error('Error setting fee:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold text-white mb-2">NFT Creation Fee</p>
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-xs text-zinc-400 mb-1">Current Fee</p>
          <div className="p-3 rounded-md border border-zinc-800 mb-3">
            {isLoading || isLoadingFee ? (
              <div className="h-6 bg-[#1f1f1f] rounded w-1/3 animate-pulse"></div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="text-base font-medium text-white">
                  {creationFeeData?.fee || '0'} ETH
                </p>
              </div>
            )}
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-white text-black hover:text-black border-zinc-100 hover:bg-zinc-300 hover:border-zinc-50"
                disabled={!isOwner}
              >
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
                  <label className="block text-sm text-zinc-400 mb-2">New Creation Fee (ETH)</label>
                  <Input
                    type="number"
                    step="0.000000000000000001"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    className="bg-black border border-zinc-800 text-white"
                    placeholder="Enter new fee in ETH"
                    disabled={isUpdatingFee}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    className="hover:bg-zinc-800"
                    variant="ghost"
                    onClick={() => setDialogOpen(false)}
                    disabled={isUpdatingFee}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdatingFee}>
                    {isUpdatingFee ? (
                      <div className="flex items-center justify-center gap-2">
                        <Spinner size="sm" color="black" />
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
      </div>
    </div>
  );
}

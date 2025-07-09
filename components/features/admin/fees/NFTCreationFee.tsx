'use client';

import React, { useState, useEffect } from 'react';
import { useNFTFactoryConfig } from '@/lib/blockchain/hooks/useNFTFactoryConfig';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';
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

export function NFTCreationFee() {
  const [isLoading, setIsLoading] = useState(true);
  const {
    creationFee,
    isLoadingFee,
    isUpdating,
    updateCreationFee,
    error: updateError,
    transactionHash,
  } = useNFTFactoryConfig();

  const { address } = useAccount();
  const { data: isOwner, isLoading: isCheckingOwner } = trpc.factoryConfig.isOwner.useQuery(
    { address: address || '' },
    { enabled: !!address },
  );

  // Fee update
  const [newFee, setNewFee] = useState('0');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Update newFee when creationFee changes
  useEffect(() => {
    if (creationFee) {
      setNewFee(creationFee);
    }
  }, [creationFee]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!isOwner) {
      setError('Only the contract owner can update creation fee');
      return;
    }

    try {
      await updateCreationFee(newFee);
      setSuccessMessage('Fee updated successfully');
      setDialogOpen(false);
    } catch (err) {
      setError('Failed to update creation fee. Please try again.');
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
                <p className="text-base font-medium text-white">{creationFee} ETH</p>
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

                {successMessage && (
                  <div className="bg-green-900/20 border border-green-900/30 text-green-400 px-4 py-3 rounded mb-4">
                    {successMessage}
                  </div>
                )}

                {transactionHash && (
                  <Alert className="mb-4 bg-black/40 border border-zinc-800">
                    <AlertDescription className="flex items-center justify-between">
                      <span className="text-xs text-zinc-300 truncate">
                        Transaction: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                      </span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center"
                      >
                        View <ExternalLink size={12} className="ml-1" />
                      </a>
                    </AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    className="hover:bg-zinc-800"
                    variant="ghost"
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
      </div>
    </div>
  );
}

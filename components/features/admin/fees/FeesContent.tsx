'use client';

import React, { useState, useEffect } from 'react';
import { FeesHeader } from './FeesHeader';
import { useNFTFactoryConfig } from '@/lib/blockchain/hooks/useNFTFactoryConfig';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';
import { useWithdrawFees } from '@/lib/blockchain/hooks/useNFTFactoryWrite';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';
import { parseEther } from 'viem';
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

export function FeesContent() {
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

  // Contract balance (mock data - replace with actual data)
  const contractBalance = 0.5; // ETH
  const totalFeesCollected = 1.2; // ETH

  // Withdraw fees
  const { withdrawFees, isLoading: isWithdrawing } = useWithdrawFees();
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [withdrawTxHash, setWithdrawTxHash] = useState('');

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

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');
    setWithdrawTxHash('');

    if (!isOwner) {
      setWithdrawError('Only the contract owner can withdraw fees');
      return;
    }

    if (!withdrawAddress || !withdrawAddress.startsWith('0x') || withdrawAddress.length !== 42) {
      setWithdrawError('Please enter a valid Ethereum address');
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setWithdrawError('Please enter a valid amount');
      return;
    }

    try {
      const result = await withdrawFees(
        withdrawAddress as `0x${string}`,
        parseEther(withdrawAmount),
      );

      if (result.hash) {
        setWithdrawTxHash(result.hash);
        setWithdrawSuccess('Withdrawal initiated successfully');
        setWithdrawAddress('');
        setWithdrawAmount('');
        setTimeout(() => setWithdrawDialogOpen(false), 3000);
      } else if (result.error) {
        setWithdrawError(result.error.message);
      }
    } catch (err: any) {
      setWithdrawError(err.message || 'Failed to withdraw fees');
    }
  };

  return (
    <div className="animate-fade-in">
      <FeesHeader />

      <div className="flex flex-col gap-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Fee Display */}
          <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
            <h2 className="text-sm font-bold text-white mb-2">NFT Creation Fee</h2>
            <div className="bg-black/40 p-3 rounded-md border border-zinc-800 mb-3">
              <p className="text-xs text-zinc-400 mb-1">Current Fee</p>
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
                <Button variant="outline" size="sm" className="w-full" disabled={!isOwner}>
                  Edit Fee
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0A0A0A] border border-[#1f1f1f] text-white">
                <DialogHeader>
                  <DialogTitle>Update Creation Fee</DialogTitle>
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
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
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

          {/* Contract Balance */}
          <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
            <h2 className="text-sm font-bold text-white mb-2">Contract Balance</h2>
            <div className="bg-black/40 p-3 rounded-md border border-zinc-800 mb-3">
              <p className="text-xs text-zinc-400 mb-1">Available Balance</p>
              {isLoading ? (
                <div className="h-6 bg-[#1f1f1f] rounded w-1/3 animate-pulse"></div>
              ) : (
                <p className="text-base font-medium text-white">{contractBalance} ETH</p>
              )}
            </div>
            <div className="bg-black/40 p-3 rounded-md border border-zinc-800 mb-3">
              <p className="text-xs text-zinc-400 mb-1">Total Collected</p>
              {isLoading ? (
                <div className="h-6 bg-[#1f1f1f] rounded w-1/3 animate-pulse"></div>
              ) : (
                <p className="text-base font-medium text-white">{totalFeesCollected} ETH</p>
              )}
            </div>
          </div>

          {/* Withdraw Fees */}
          <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
            <h2 className="text-sm font-bold text-white mb-2">Withdraw Fees</h2>
            <div className="bg-black/40 p-3 rounded-md border border-zinc-800 mb-3">
              <p className="text-xs text-zinc-400 mb-1">Owner Status</p>
              {isLoading || isCheckingOwner ? (
                <div className="h-5 bg-[#1f1f1f] rounded w-2/3 animate-pulse"></div>
              ) : (
                <p className={`text-sm font-medium ${isOwner ? 'text-green-400' : 'text-red-400'}`}>
                  {isOwner ? 'You are the contract owner' : 'Not owner'}
                </p>
              )}
            </div>
            <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!isOwner || contractBalance <= 0}
                >
                  Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0A0A0A] border border-[#1f1f1f] text-white">
                <DialogHeader>
                  <DialogTitle>Withdraw Contract Funds</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Withdraw collected fees to a wallet address.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleWithdraw}>
                  <div className="py-4 space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Recipient Address</label>
                      <Input
                        value={withdrawAddress}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                        className="bg-black border border-zinc-800 text-white"
                        placeholder="0x..."
                        disabled={isWithdrawing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Amount (ETH)</label>
                      <Input
                        type="number"
                        step="0.000000000000000001"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-black border border-zinc-800 text-white"
                        placeholder="Enter amount in ETH"
                        disabled={isWithdrawing}
                        max={contractBalance}
                      />
                      <p className="text-xs text-zinc-500 mt-1">Max: {contractBalance} ETH</p>
                    </div>
                  </div>

                  {withdrawError && (
                    <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded mb-4">
                      {withdrawError}
                    </div>
                  )}

                  {withdrawSuccess && (
                    <div className="bg-green-900/20 border border-green-900/30 text-green-400 px-4 py-3 rounded mb-4">
                      {withdrawSuccess}
                    </div>
                  )}

                  {withdrawTxHash && (
                    <Alert className="mb-4 bg-black/40 border border-zinc-800">
                      <AlertDescription className="flex items-center justify-between">
                        <span className="text-xs text-zinc-300 truncate">
                          Transaction: {withdrawTxHash.slice(0, 10)}...{withdrawTxHash.slice(-8)}
                        </span>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${withdrawTxHash}`}
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
                      variant="outline"
                      onClick={() => setWithdrawDialogOpen(false)}
                      disabled={isWithdrawing}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isWithdrawing ||
                        !withdrawAddress ||
                        !withdrawAmount ||
                        parseFloat(withdrawAmount) <= 0
                      }
                    >
                      {isWithdrawing ? (
                        <div className="flex items-center justify-center gap-2">
                          <Spinner size="md" color="black" />
                          <span>Withdrawing...</span>
                        </div>
                      ) : (
                        'Withdraw'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

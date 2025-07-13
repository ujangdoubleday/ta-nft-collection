'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useWithdrawFees } from '@/lib/blockchain/hooks/useNFTFactoryWrite';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';
import { parseEther } from 'viem';
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

// Valid characters for Ethereum address (0-9, a-f, A-F)
const ETH_ADDRESS_REGEX = /^0x[0-9a-fA-F]*$/;
const ETH_ADDRESS_LENGTH = 42; // 0x + 40 hex characters

export function WithdrawFees() {
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();
  const utils = trpc.useContext();
  const { data: isOwner, isLoading: isCheckingOwner } = trpc.factoryConfig.isOwner.useQuery(
    { address: address || '' },
    { enabled: !!address },
  );

  // Get contract balance for max withdrawal amount
  const { data: contractBalance, isLoading: isLoadingBalance } =
    trpc.factoryConfig.getContractBalance.useQuery();

  // Withdraw fees
  const { withdrawFees, isLoading: isWithdrawing } = useWithdrawFees();
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawTxHash, setWithdrawTxHash] = useState('');
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Validate Ethereum address format
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Always allow empty input (for clearing)
    if (value === '') {
      setWithdrawAddress('');
      setAddressError('');
      return;
    }

    // Always ensure address starts with 0x
    if (!value.startsWith('0x')) {
      setAddressError('Address must start with 0x');
      return;
    }

    // Check if the address contains only valid hex characters
    if (!ETH_ADDRESS_REGEX.test(value)) {
      setAddressError('Address can only contain 0-9, a-f, A-F');
      return;
    }

    // Check address length
    if (value.length > ETH_ADDRESS_LENGTH) {
      setAddressError(`Address cannot exceed ${ETH_ADDRESS_LENGTH} characters`);
      return;
    }

    // Valid input
    setWithdrawAddress(value);
    setAddressError('');

    // Show warning if address is incomplete
    if (value.length < ETH_ADDRESS_LENGTH) {
      setAddressError(`Address should be ${ETH_ADDRESS_LENGTH} characters long`);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawTxHash('');

    if (!isOwner) {
      toast.error('Only the contract owner can withdraw fees');
      return;
    }

    if (!withdrawAddress || withdrawAddress.length !== ETH_ADDRESS_LENGTH) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const result = await withdrawFees(
        withdrawAddress as `0x${string}`,
        parseEther(withdrawAmount),
      );

      if (result.hash) {
        setWithdrawTxHash(result.hash);
        toast.success('Withdrawal initiated successfully');
        setWithdrawAddress('');
        setWithdrawAmount('');

        // Invalidate tRPC queries to refresh data
        utils.factoryConfig.getContractBalance.invalidate();
        utils.factoryConfig.getTotalFeesCollected.invalidate();

        // Revalidate the fees page
        fetch('/api/revalidate?path=/admin/fees&type=page').catch((err) =>
          console.error('Error revalidating fees page:', err),
        );

        setTimeout(() => setWithdrawDialogOpen(false), 2000);
      } else if (result.error) {
        toast.error(result.error.message || 'Failed to withdraw fees');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to withdraw fees');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-white mb-2">Withdraw Fees</h2>
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
          <p className="text-xs text-zinc-400 mb-1">Withdraw to another address</p>
          <div className="p-3"></div>
          <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-white text-black hover:text-black border-zinc-100 hover:bg-zinc-300 hover:border-zinc-50"
                disabled={!isOwner || (contractBalance !== undefined && contractBalance <= 0)}
              >
                Withdraw Funds
              </Button>
            </DialogTrigger>
            <DialogContent
              title="Withdraw Contract Funds"
              className="bg-[#0A0A0A] border border-[#1f1f1f] text-white"
            >
              <DialogHeader>
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
                      onChange={handleAddressChange}
                      className={`bg-black border ${addressError ? 'border-red-700' : 'border-zinc-800'} text-white`}
                      placeholder="0x..."
                      disabled={isWithdrawing}
                    />
                    {addressError && <p className="text-xs text-red-400 mt-1">{addressError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Amount (ETH)</label>
                    <div className="flex items-center gap-2">
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="hover:bg-zinc-800 text-xs h-9 px-2"
                        onClick={() =>
                          contractBalance !== undefined &&
                          setWithdrawAmount(contractBalance.toString())
                        }
                        disabled={
                          isWithdrawing || contractBalance === undefined || contractBalance <= 0
                        }
                      >
                        Max
                      </Button>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Max: {contractBalance} ETH</p>
                  </div>
                </div>

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
                    variant="ghost"
                    className="hover:bg-zinc-800"
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
                      withdrawAddress.length !== ETH_ADDRESS_LENGTH ||
                      !!addressError ||
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
  );
}

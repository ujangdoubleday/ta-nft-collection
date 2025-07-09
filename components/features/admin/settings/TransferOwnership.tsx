'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';
import { useTransferOwnership } from '@/lib/blockchain/hooks/useNFTFactoryWrite';
import { signOut } from 'next-auth/react';
import { useWallet } from '@/lib/hooks/wallet';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';

// Valid characters for Ethereum address (0-9, a-f, A-F)
const ETH_ADDRESS_REGEX = /^0x[0-9a-fA-F]*$/;
const ETH_ADDRESS_LENGTH = 42; // 0x + 40 hex characters

interface TransferOwnershipProps {
  isLoading: boolean;
}

export function TransferOwnership({ isLoading }: TransferOwnershipProps) {
  const { address } = useAccount();
  const { data: isOwner } = trpc.factoryConfig.isOwner.useQuery(
    { address: address || '' },
    { enabled: !!address },
  );
  const { disconnect } = useWallet();

  // Transfer ownership
  const {
    transferOwnership,
    isLoading: isTransferring,
    error: transferError,
  } = useTransferOwnership();
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferError_, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [transferTxHash, setTransferTxHash] = useState('');
  const [addressError, setAddressError] = useState('');

  // Validate Ethereum address format
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Always allow empty input (for clearing)
    if (value === '') {
      setNewOwnerAddress('');
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
    setNewOwnerAddress(value);
    setAddressError('');

    // Show warning if address is incomplete
    if (value.length < ETH_ADDRESS_LENGTH) {
      setAddressError(`Address should be ${ETH_ADDRESS_LENGTH} characters long`);
    }
  };

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess('');
    setTransferTxHash('');

    if (!isOwner) {
      setTransferError('Only the contract owner can transfer ownership');
      return;
    }

    if (!newOwnerAddress || newOwnerAddress.length !== ETH_ADDRESS_LENGTH) {
      setTransferError('Please enter a valid Ethereum address');
      return;
    }

    try {
      const result = await transferOwnership(newOwnerAddress as `0x${string}`);

      if (result.hash) {
        setTransferTxHash(result.hash);
        setTransferSuccess('Ownership transfer initiated successfully');
        setNewOwnerAddress('');
        setTimeout(() => setTransferDialogOpen(false), 3000);
        signOut({ callbackUrl: '/' });
        await disconnect();
      } else if (result.error) {
        setTransferError(result.error.message);
      }
    } catch (err: any) {
      setTransferError(err.message || 'Failed to transfer ownership');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-bold text-white mb-2">Transfer Ownership</h2>
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
        <p className="text-xs text-zinc-400">Transfer contract ownership to another address.</p>
        <div className="p-3"></div>

        <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg" disabled={!isOwner || isLoading}>
              Transfer Ownership
            </Button>
          </DialogTrigger>
          <DialogContent
            title="Transfer Contract Ownership"
            className="bg-[#0A0A0A] border border-[#1f1f1f] text-white"
          >
            <DialogHeader>
              <DialogDescription className="text-zinc-400">
                Enter the Ethereum address of the new owner.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleTransferOwnership}>
              <div className="py-4">
                <label className="block text-sm text-zinc-400 mb-2">New Owner Address</label>
                <Input
                  value={newOwnerAddress}
                  onChange={handleAddressChange}
                  className={`bg-black border ${addressError ? 'border-red-700' : 'border-zinc-800'} text-white`}
                  placeholder="0x..."
                  disabled={isTransferring}
                />
                {addressError && <p className="text-xs text-red-400 mt-1">{addressError}</p>}
              </div>

              {transferError_ && (
                <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded mb-4">
                  {transferError_}
                </div>
              )}

              {transferError && (
                <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded mb-4">
                  {transferError.message}
                </div>
              )}

              {transferSuccess && (
                <div className="bg-green-900/20 border border-green-900/30 text-green-400 px-4 py-3 rounded mb-4">
                  {transferSuccess}
                </div>
              )}

              {transferTxHash && (
                <Alert className="mb-4 bg-black/40 border border-zinc-800">
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-xs text-zinc-300 truncate">
                      Transaction: {transferTxHash.slice(0, 10)}...{transferTxHash.slice(-8)}
                    </span>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${transferTxHash}`}
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
                  onClick={() => setTransferDialogOpen(false)}
                  disabled={isTransferring}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isTransferring ||
                    !newOwnerAddress ||
                    newOwnerAddress.length !== ETH_ADDRESS_LENGTH ||
                    !!addressError
                  }
                >
                  {isTransferring ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner size="md" color="black" />
                      <span>Transferring...</span>
                    </div>
                  ) : (
                    'Transfer'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

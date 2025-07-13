'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { useAccount } from 'wagmi';
import { useTransferOwnership } from '@/lib/blockchain/hooks/useNFTCollectionWrite';
import { useCollectionOwner } from '@/lib/blockchain/hooks/useNFTCollection';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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

interface TransferCollectionOwnershipProps {
  collectionAddress: string;
  isLoading: boolean;
  onTransferComplete?: (hash: string) => void;
  role?: 'admin' | 'user';
}

export function TransferCollectionOwnership({
  collectionAddress,
  isLoading,
  onTransferComplete,
  role = 'user',
}: TransferCollectionOwnershipProps) {
  const router = useRouter();
  const { address } = useAccount();

  // Get current owner
  const { data: currentOwner, isLoading: isLoadingOwner } = useCollectionOwner(
    collectionAddress as `0x${string}`,
  );

  // Check if the connected wallet is the owner
  const isOwner =
    address &&
    currentOwner &&
    typeof currentOwner === 'string' &&
    address.toLowerCase() === currentOwner.toLowerCase();

  // Transfer ownership
  const {
    transferOwnership,
    isLoading: isTransferring,
    error: transferError,
  } = useTransferOwnership();

  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
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

    if (!isOwner) {
      toast.error('Only the collection owner can transfer ownership');
      return;
    }

    if (!newOwnerAddress || newOwnerAddress.length !== ETH_ADDRESS_LENGTH) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    try {
      const result = await transferOwnership(collectionAddress, newOwnerAddress);

      if (result.hash) {
        const hash = result.hash;
        setTransferTxHash(hash);
        toast.success('Ownership transfer initiated successfully');
        setNewOwnerAddress('');

        // Call the callback if provided
        if (onTransferComplete) {
          onTransferComplete(hash);
        }

        // Revalidate both admin and user collection paths
        fetch(`/api/revalidate?path=/admin/collections/${collectionAddress}&type=page`).catch(
          (err) => console.error('Error revalidating admin collection page:', err),
        );
        fetch(`/api/revalidate?path=/user/collections/${collectionAddress}&type=page`).catch(
          (err) => console.error('Error revalidating user collection page:', err),
        );

        // Close dialog and redirect after a brief delay
        setTimeout(() => {
          setTransferDialogOpen(false);
          // Redirect to the appropriate collection page based on role
          router.push(`/${role}/collections/${collectionAddress}`);
        }, 1500);
      } else if (result.error) {
        toast.error(result.error.message || 'Failed to transfer ownership');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to transfer ownership');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-bold text-white mb-2">Transfer Ownership</h2>
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
        <p className="text-xs text-zinc-400">Transfer collection ownership to another address.</p>
        <div className="p-3"></div>

        <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg" disabled={!isOwner || isLoading}>
              Transfer Ownership
            </Button>
          </DialogTrigger>
          <DialogContent
            title="Transfer Collection Ownership"
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

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { useAccount } from 'wagmi';
import { useRenounceOwnership } from '@/lib/blockchain/hooks/useNFTCollectionWrite';
import { useCollectionOwner } from '@/lib/blockchain/hooks/useNFTCollection';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';
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

interface RenounceCollectionOwnershipProps {
  collectionAddress: string;
  isLoading: boolean;
  onRenounceComplete?: (hash: string) => void;
  role?: 'admin' | 'user';
}

// Confirmation text that user needs to type
const CONFIRMATION_TEXT = 'Renounce My Ownership';

export function RenounceCollectionOwnership({
  collectionAddress,
  isLoading,
  onRenounceComplete,
  role = 'user',
}: RenounceCollectionOwnershipProps) {
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

  // Renounce ownership
  const {
    renounceOwnership,
    isLoading: isRenouncing,
    error: renounceError,
  } = useRenounceOwnership();

  const [renounceDialogOpen, setRenounceDialogOpen] = useState(false);
  const [renounceTxHash, setRenounceTxHash] = useState('');

  // Confirmation input
  const [confirmationText, setConfirmationText] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Check if confirmation text matches
  useEffect(() => {
    setIsConfirmed(confirmationText === CONFIRMATION_TEXT);
  }, [confirmationText]);

  const handleRenounceOwnership = async () => {
    if (!isOwner) {
      toast.error('Only the collection owner can renounce ownership');
      return;
    }

    if (!isConfirmed) {
      toast.error('Please type the confirmation text exactly');
      return;
    }

    try {
      const result = await renounceOwnership(collectionAddress);

      if (result.hash) {
        const hash = result.hash;
        setRenounceTxHash(hash);
        toast.success('Ownership renounced successfully');

        // Call the callback if provided
        if (onRenounceComplete) {
          onRenounceComplete(hash);
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
          setRenounceDialogOpen(false);
          // Redirect to the collections list page based on role
          router.push(`/${role}/collections/${collectionAddress}`);
        }, 1500);
      } else if (result.error) {
        toast.error(result.error.message || 'Failed to renounce ownership');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to renounce ownership');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-bold text-white mb-2">Renounce Ownership</h2>
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
        <p className="text-xs text-zinc-400">
          Permanently renounce collection ownership. This action is irreversible.
        </p>
        <div className="p-3"></div>

        <Dialog open={renounceDialogOpen} onOpenChange={setRenounceDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              disabled={!isOwner || isLoading}
            >
              Renounce Ownership
            </Button>
          </DialogTrigger>
          <DialogContent
            title="Renounce Collection Ownership"
            className="bg-[#0A0A0A] border border-[#1f1f1f] text-white"
          >
            <DialogHeader>
              <DialogDescription className="text-zinc-400">
                This action is irreversible. Are you sure?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded mb-4">
                <p className="font-medium">Warning: Permanent Action</p>
                <p className="mt-1 text-sm">
                  Renouncing ownership will permanently remove your ability to manage this
                  collection. There will be no way to regain ownership.
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-zinc-400 mb-2">
                  Type &quot;{CONFIRMATION_TEXT}&quot; to confirm
                </label>
                <Input
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="bg-black border border-zinc-800 text-white"
                  placeholder={CONFIRMATION_TEXT}
                  disabled={isRenouncing}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenounceDialogOpen(false)}
                disabled={isRenouncing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRenounceOwnership()}
                disabled={isRenouncing || !isConfirmed}
              >
                {isRenouncing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="md" color="white" />
                    <span>Renouncing...</span>
                  </div>
                ) : (
                  'Confirm'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

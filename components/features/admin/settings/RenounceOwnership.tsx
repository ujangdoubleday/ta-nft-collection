'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';
import { useRenounceOwnership } from '@/lib/blockchain/hooks/useNFTFactoryWrite';
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

interface RenounceOwnershipProps {
  isLoading: boolean;
}

// Confirmation text that user needs to type
const CONFIRMATION_TEXT = 'Renounce My Ownership';

export function RenounceOwnership({ isLoading }: RenounceOwnershipProps) {
  const { address } = useAccount();
  const { data: isOwner } = trpc.factoryConfig.isOwner.useQuery(
    { address: address || '' },
    { enabled: !!address },
  );

  // Renounce ownership
  const {
    renounceOwnership,
    isLoading: isRenouncing,
    error: renounceError,
  } = useRenounceOwnership();
  const [renounceDialogOpen, setRenounceDialogOpen] = useState(false);
  const [renounceError_, setRenounceError] = useState('');
  const [renounceSuccess, setRenounceSuccess] = useState('');
  const [renounceTxHash, setRenounceTxHash] = useState('');

  // Confirmation input
  const [confirmationText, setConfirmationText] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Check if confirmation text matches
  useEffect(() => {
    setIsConfirmed(confirmationText === CONFIRMATION_TEXT);
  }, [confirmationText]);

  const handleRenounceOwnership = async () => {
    setRenounceError('');
    setRenounceSuccess('');
    setRenounceTxHash('');

    if (!isOwner) {
      setRenounceError('Only the contract owner can renounce ownership');
      return;
    }

    if (!isConfirmed) {
      setRenounceError('Please type the confirmation text exactly');
      return;
    }

    try {
      const result = await renounceOwnership();

      if (result.hash) {
        setRenounceTxHash(result.hash);
        setRenounceSuccess('Ownership renounced successfully');
        setTimeout(() => setRenounceDialogOpen(false), 3000);
      } else if (result.error) {
        setRenounceError(result.error.message);
      }
    } catch (err: any) {
      setRenounceError(err.message || 'Failed to renounce ownership');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-bold text-white mb-2">Renounce Ownership</h2>
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
        <p className="text-xs text-zinc-400">
          Permanently renounce contract ownership. This action is irreversible.
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
            title="Renounce Contract Ownership"
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
                  Renouncing ownership will permanently remove your ability to manage this contract.
                  There will be no way to regain ownership.
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

            {renounceError_ && (
              <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded mb-4">
                {renounceError_}
              </div>
            )}

            {renounceError && (
              <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded mb-4">
                {renounceError.message}
              </div>
            )}

            {renounceSuccess && (
              <div className="bg-green-900/20 border border-green-900/30 text-green-400 px-4 py-3 rounded mb-4">
                {renounceSuccess}
              </div>
            )}

            {renounceTxHash && (
              <Alert className="mb-4 bg-black/40 border border-zinc-800">
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300 truncate">
                    Transaction: {renounceTxHash.slice(0, 10)}...{renounceTxHash.slice(-8)}
                  </span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${renounceTxHash}`}
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
                onClick={() => setRenounceDialogOpen(false)}
                disabled={isRenouncing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRenounceOwnership}
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

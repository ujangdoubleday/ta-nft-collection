'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { trpc } from '@/lib/api/trpc/client';
import { useAccount } from 'wagmi';
import {
  useTransferOwnership,
  useRenounceOwnership,
} from '@/lib/blockchain/hooks/useNFTFactoryWrite';
import { useFactoryOwner } from '@/lib/blockchain/hooks/useNFTFactoryRead';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';

interface OwnershipManagementProps {
  isLoading: boolean;
}

export function OwnershipManagement({ isLoading }: OwnershipManagementProps) {
  const { address } = useAccount();
  const { data: isOwner, isLoading: isCheckingOwner } = trpc.factoryConfig.isOwner.useQuery(
    { address: address || '' },
    { enabled: !!address },
  );

  // Get current owner
  const { data: currentOwner, isLoading: isLoadingOwner } = useFactoryOwner();

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

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess('');
    setTransferTxHash('');

    if (!isOwner) {
      setTransferError('Only the contract owner can transfer ownership');
      return;
    }

    if (!newOwnerAddress || !newOwnerAddress.startsWith('0x') || newOwnerAddress.length !== 42) {
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
      } else if (result.error) {
        setTransferError(result.error.message);
      }
    } catch (err: any) {
      setTransferError(err.message || 'Failed to transfer ownership');
    }
  };

  const handleRenounceOwnership = async () => {
    setRenounceError('');
    setRenounceSuccess('');
    setRenounceTxHash('');

    if (!isOwner) {
      setRenounceError('Only the contract owner can renounce ownership');
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Current Owner Section */}
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
        <h2 className="text-sm font-bold text-white mb-2">Current Ownership</h2>
        <div className="bg-black/40 p-3 rounded-md border border-zinc-800 mb-3">
          <p className="text-xs text-zinc-400 mb-1">Contract Owner</p>
          {isLoading || isLoadingOwner ? (
            <div className="h-6 bg-[#1f1f1f] rounded w-1/2 animate-pulse"></div>
          ) : (
            <p className="text-xs font-mono text-white break-all">
              {currentOwner && typeof currentOwner === 'string'
                ? `${currentOwner.slice(0, 10)}...${currentOwner.slice(-8)}`
                : 'No owner'}
            </p>
          )}
        </div>

        <div className="bg-black/40 p-3 rounded-md border border-zinc-800">
          <p className="text-xs text-zinc-400 mb-1">Your Status</p>
          {isLoading || isCheckingOwner ? (
            <div className="h-5 bg-[#1f1f1f] rounded w-2/3 animate-pulse"></div>
          ) : (
            <p className={`text-sm font-medium ${isOwner ? 'text-green-400' : 'text-red-400'}`}>
              {isOwner ? 'You are the owner' : 'Not owner'}
            </p>
          )}
        </div>
      </div>

      {/* Transfer Ownership Section */}
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
        <h2 className="text-sm font-bold text-white mb-2">Transfer Ownership</h2>
        <div className="bg-black/40 p-3 rounded-md border border-zinc-800 mb-3">
          <p className="text-xs text-zinc-400">Transfer contract ownership to another address.</p>
        </div>

        <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm" disabled={!isOwner || isLoading}>
              Transfer Ownership
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0A0A0A] border border-[#1f1f1f] text-white">
            <DialogHeader>
              <DialogTitle>Transfer Contract Ownership</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Enter the Ethereum address of the new owner.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleTransferOwnership}>
              <div className="py-4">
                <label className="block text-sm text-zinc-400 mb-2">New Owner Address</label>
                <Input
                  value={newOwnerAddress}
                  onChange={(e) => setNewOwnerAddress(e.target.value)}
                  className="bg-black border border-zinc-800 text-white"
                  placeholder="0x..."
                  disabled={isTransferring}
                />
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
                <Button type="submit" disabled={isTransferring || !newOwnerAddress}>
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

      {/* Renounce Ownership Section */}
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
        <h2 className="text-sm font-bold text-white mb-2">Renounce Ownership</h2>
        <div className="bg-black/40 p-3 rounded-md border border-zinc-800 mb-3">
          <p className="text-xs text-zinc-400">
            Permanently renounce contract ownership. This action is irreversible.
          </p>
        </div>

        <Dialog open={renounceDialogOpen} onOpenChange={setRenounceDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={!isOwner || isLoading}
            >
              Renounce Ownership
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0A0A0A] border border-[#1f1f1f] text-white">
            <DialogHeader>
              <DialogTitle>Renounce Contract Ownership</DialogTitle>
              <DialogDescription className="text-zinc-400">
                This action is irreversible. Are you sure?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded">
                <p className="font-medium">Warning: Permanent Action</p>
                <p className="mt-1 text-sm">
                  Renouncing ownership will permanently remove your ability to manage this contract.
                  There will be no way to regain ownership.
                </p>
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
                disabled={isRenouncing}
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

      {/* Transaction Status */}
      {(transferTxHash || renounceTxHash) && (
        <div className="md:col-span-3">
          {transferTxHash && (
            <Alert className="bg-black/40 border border-zinc-800 mb-2">
              <AlertDescription className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">
                  Transfer ownership transaction processed
                </span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${transferTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center"
                >
                  View on Sepolia <ExternalLink size={12} className="ml-1" />
                </a>
              </AlertDescription>
            </Alert>
          )}

          {renounceTxHash && (
            <Alert className="bg-black/40 border border-zinc-800">
              <AlertDescription className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">
                  Renounce ownership transaction processed
                </span>
                <a
                  href={`https://sepolia.etherscan.io/tx/${renounceTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center"
                >
                  View on Sepolia <ExternalLink size={12} className="ml-1" />
                </a>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

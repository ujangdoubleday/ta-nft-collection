'use client';

import React, { useState } from 'react';
import { useBlocklist } from '@/lib/blockchain/hooks';
import { useAdmin } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
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

interface BlocklistContentProps {
  isLoading: boolean;
}

export function BlocklistContent({ isLoading: pageLoading }: BlocklistContentProps) {
  const [newAddress, setNewAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { isAdmin, isContractOwner, contractOwner, isLoading: isLoadingAdmin } = useAdmin();
  const { blocklist, isLoadingBlocklist, isUpdating, addToBlocklist, removeFromBlocklist } =
    useBlocklist();

  // Only contract owner can manage blocklist
  const hasPermission = isContractOwner;

  const handleAddToBlocklist = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAddress) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    if (!newAddress.startsWith('0x') || newAddress.length !== 42) {
      setError('Invalid Ethereum address format');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(null);

      await addToBlocklist(newAddress);

      setSuccess(`Address ${newAddress} has been added to blocklist`);
      setNewAddress('');
      setDialogOpen(false);
    } catch (err) {
      console.error('Error adding to blocklist:', err);
      setError('Failed to add address to blocklist. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFromBlocklist = async (address: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(null);

      await removeFromBlocklist(address);

      setSuccess(`Address ${address} has been removed from blocklist`);
    } catch (err) {
      console.error('Error removing from blocklist:', err);
      setError('Failed to remove address from blocklist. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading =
    pageLoading || isLoadingBlocklist || isLoadingAdmin || isUpdating || isProcessing;

  if (isLoadingAdmin && !pageLoading) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <div className="flex justify-center items-center py-8">
          <Spinner />
          <span className="ml-2 text-zinc-400">Loading admin status...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin && !pageLoading) {
    return (
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded">
          <p>Access denied. You need to be an admin to view this page.</p>
        </div>
      </div>
    );
  }

  const readOnly = !hasPermission;

  return (
    <div>
      <h2 className="text-base font-bold text-white mb-3">Blocklisted Users</h2>
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        {!pageLoading && readOnly && (
          <div className="bg-yellow-900/20 border border-yellow-900/30 text-yellow-400 px-4 py-3 rounded mb-6">
            <p className="font-medium">Read-only mode</p>
            <p className="text-sm mt-1">
              You are not the contract owner. Only the contract owner can modify the blocklist.
            </p>
            {contractOwner && (
              <p className="text-sm mt-2">
                <strong>Contract Owner:</strong> <span className="font-mono">{contractOwner}</span>
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-900/30 text-green-400 px-4 py-3 rounded mb-6">
            <p>{success}</p>
          </div>
        )}

        <div className="mb-8 flex justify-between items-center">
          <h3 className="text-md font-medium text-white">Manage Blocklist</h3>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={readOnly || pageLoading}>Add to Blocklist</Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0A0A0A] border border-[#1f1f1f] text-white">
              <DialogHeader>
                <DialogTitle>Add Address to Blocklist</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Enter the Ethereum address you want to blocklist. This will prevent the address
                  from using the platform.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddToBlocklist}>
                <div className="py-4">
                  <label className="block text-sm text-zinc-400 mb-2">Ethereum Address</label>
                  <Input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter Ethereum address (0x...)"
                    className="bg-black border border-zinc-800 text-white"
                    disabled={isProcessing}
                  />
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-900/30 text-red-400 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isProcessing || !newAddress}>
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <Spinner size="md" color="black" />
                        <span>Adding...</span>
                      </div>
                    ) : (
                      'Add to Blocklist'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          {pageLoading || isLoadingBlocklist ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-zinc-800 rounded-md p-4">
                  <div className="h-5 bg-[#1f1f1f] rounded w-2/3 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : blocklist && blocklist.length > 0 ? (
            <div className="border border-zinc-800 rounded-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-black/40">
                  <tr>
                    <th className="py-3 px-4 text-left text-zinc-400 font-medium">Address</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {blocklist.map((address) => (
                    <tr key={address}>
                      <td className="py-3 px-4 font-mono text-sm text-zinc-300 break-all">
                        {address}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="destructive"
                          onClick={() => handleRemoveFromBlocklist(address)}
                          disabled={isLoading || readOnly}
                          size="sm"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-zinc-800 rounded-md p-6 text-center text-zinc-400">
              No addresses in blocklist
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

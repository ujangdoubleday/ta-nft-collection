'use client';

import React, { useState } from 'react';
import { useBlocklist } from '@/lib/blockchain/hooks';
import { useAdmin } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
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
import { useRouter } from 'next/navigation';

interface BlocklistContentProps {
  isLoading: boolean;
}

export function BlocklistContent({ isLoading: pageLoading }: BlocklistContentProps) {
  const router = useRouter();
  const [newAddress, setNewAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addressToRemove, setAddressToRemove] = useState<string | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const { isAdmin, isContractOwner, contractOwner, isLoading: isLoadingAdmin } = useAdmin();
  const { blocklist, isLoadingBlocklist, isUpdating, addToBlocklist, removeFromBlocklist } =
    useBlocklist();

  // Only contract owner can manage blocklist
  const hasPermission = isContractOwner;

  // Filter blocklist based on search term
  const filteredBlocklist =
    blocklist?.filter((address) => address.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  const handleAddToBlocklist = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAddress) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    if (!newAddress.startsWith('0x') || newAddress.length !== 42) {
      toast.error('Invalid Ethereum address format');
      return;
    }

    try {
      setIsProcessing(true);

      await addToBlocklist(newAddress);

      toast.success(`Address ${newAddress} has been added to blocklist`);
      setNewAddress('');
      setDialogOpen(false);

      // Revalidate the users page
      fetch('/api/revalidate?path=/admin/users&type=page').catch((err) =>
        console.error('Error revalidating users page:', err),
      );
    } catch (err) {
      console.error('Error adding to blocklist:', err);
      toast.error('Failed to add address to blocklist. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFromBlocklist = async (address: string) => {
    try {
      setIsProcessing(true);
      // Don't close the dialog immediately, wait until successful removal

      await removeFromBlocklist(address);

      toast.success(`Address ${address} has been removed from blocklist`);

      // Revalidate the users page
      fetch('/api/revalidate?path=/admin/users&type=page').catch((err) =>
        console.error('Error revalidating users page:', err),
      );

      // Only close the dialog after successful removal
      setRemoveDialogOpen(false);
    } catch (err) {
      console.error('Error removing from blocklist:', err);
      toast.error('Failed to remove address from blocklist. Please try again.');
    } finally {
      setIsProcessing(false);
      setAddressToRemove(null);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // Revalidate the users page
      await fetch('/api/revalidate?path=/admin/users&type=page');
      router.refresh();
      toast.success('Blocklist refreshed successfully');
    } catch (err) {
      console.error('Error refreshing blocklist:', err);
      toast.error('Failed to refresh blocklist. Please try again.');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  // Open remove dialog
  const openRemoveDialog = (address: string) => {
    setAddressToRemove(address);
    setRemoveDialogOpen(true);
  };

  const isLoading =
    pageLoading || isLoadingBlocklist || isLoadingAdmin || isUpdating || isProcessing;

  if (isLoadingAdmin && !pageLoading) {
    return (
      <div className="bg-black border border-zinc-800 rounded-lg p-6">
        <div className="flex justify-center items-center py-8">
          <Spinner />
          <span className="ml-2 text-white">Loading admin status...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin && !pageLoading) {
    return (
      <div className="bg-black border border-zinc-800 rounded-lg p-6">
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
      <div className="bg-black border border-zinc-800 rounded-lg p-6">
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

        <div className="mb-6 flex flex-col md:flex-row justify-between items-end md:items-end gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white text-black hover:bg-zinc-200 hover:text-black"
            >
              {isRefreshing ? (
                <RefreshCw size={16} className="animate-spin mr-2" />
              ) : (
                <RefreshCw size={16} className="mr-2" />
              )}
              Refresh
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={readOnly || pageLoading}
                  className="bg-white text-black hover:bg-zinc-200"
                >
                  Add to Blocklist
                </Button>
              </DialogTrigger>
              <DialogContent
                title="Add Address to Blocklist"
                className="bg-black border border-zinc-800 text-white"
              >
                <DialogHeader>
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

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={isProcessing}
                      className="border-zinc-700 text-white hover:bg-zinc-900"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing || !newAddress}
                      className="bg-white text-black hover:bg-zinc-200"
                    >
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
        </div>

        {/* Search input */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search addresses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black border border-zinc-800 text-white"
          />
        </div>

        <div>
          {pageLoading || isLoadingBlocklist ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-zinc-800 rounded-md p-4">
                  <div className="h-5 bg-zinc-900 rounded w-2/3 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : blocklist && blocklist.length > 0 ? (
            <div className="border border-zinc-800 rounded-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="py-3 px-4 text-left text-white font-medium">Address</th>
                    <th className="py-3 px-4 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredBlocklist.length > 0 ? (
                    filteredBlocklist.map((address) => (
                      <tr key={address} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-sm text-white break-all">
                          {address}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            onClick={() => openRemoveDialog(address)}
                            disabled={isLoading || readOnly}
                            size="sm"
                            className="hover:bg-zinc-800 p-2 h-8 w-8"
                          >
                            <Trash2 size={16} className="text-white" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-6 text-center text-zinc-400">
                        No matching addresses found
                      </td>
                    </tr>
                  )}
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

      {/* Remove confirmation dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent
          title="Remove from Blocklist"
          className="bg-black border border-zinc-800 text-white"
        >
          <DialogHeader>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to remove this address from the blocklist? This will allow the
              address to use the platform again.
            </DialogDescription>
          </DialogHeader>

          {addressToRemove && (
            <div className="py-4">
              <p className="text-sm text-zinc-400 mb-2">Address to remove:</p>
              <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-md font-mono text-white break-all">
                {addressToRemove}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
              disabled={isProcessing}
              className="border-zinc-700 text-white hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              onClick={() => addressToRemove && handleRemoveFromBlocklist(addressToRemove)}
              disabled={isProcessing || !addressToRemove}
              variant="destructive"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner size="md" color="white" />
                  <span>Removing...</span>
                </div>
              ) : (
                'Remove'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useBlocklist } from '@/lib/blockchain/hooks';
import { Win98Window } from '@/components/ui/organisms';
import { Button } from '@/components/ui/atoms';
import { useAdmin } from '@/lib/hooks';
import { LoadingSpinner } from '@/components/shared/loading';

export const BlocklistContent = () => {
  const [newAddress, setNewAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { isAdmin, isContractOwner, contractOwner, isLoading: isLoadingAdmin } = useAdmin();
  const { blocklist, isLoadingBlocklist, isUpdating, addToBlocklist, removeFromBlocklist } =
    useBlocklist();

  // Only contract owner can manage blocklist
  const hasPermission = isContractOwner;

  const handleAddToBlocklist = async () => {
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

  const isLoading = isLoadingBlocklist || isLoadingAdmin || isUpdating || isProcessing;

  if (isLoadingAdmin) {
    return (
      <Win98Window title="User Management">
        <div className="p-4 flex justify-center items-center">
          <LoadingSpinner />
          <span className="ml-2">Loading admin status...</span>
        </div>
      </Win98Window>
    );
  }

  if (!isAdmin) {
    return (
      <Win98Window title="User Management">
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Access denied. You need to be an admin to view this page.</p>
          </div>
        </div>
      </Win98Window>
    );
  }

  const readOnly = !hasPermission;

  return (
    <Win98Window title="User Management - Blocklist">
      <div className="p-4">
        <h2 className="text-xl mb-4">Manage Blocklisted Users</h2>

        {readOnly && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>
              <strong>Read-only mode:</strong> You are not the contract owner. Only the contract
              owner can modify the blocklist.
            </p>
            {contractOwner && (
              <p className="mt-2">
                <strong>Contract Owner:</strong> <span className="font-mono">{contractOwner}</span>
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>{success}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg mb-2">Add Address to Blocklist</h3>
          <div className="flex items-center">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter Ethereum address (0x...)"
              className="border p-2 mr-2 flex-grow"
              disabled={isLoading || readOnly}
            />
            <Button onClick={handleAddToBlocklist} disabled={isLoading || !newAddress || readOnly}>
              {isLoading ? 'Processing...' : 'Add to Blocklist'}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg mb-2">Current Blocklist</h3>
          {isLoadingBlocklist ? (
            <div className="flex items-center justify-center p-4">
              <LoadingSpinner />
              <span className="ml-2">Loading blocklist...</span>
            </div>
          ) : blocklist && blocklist.length > 0 ? (
            <div className="border border-gray-300">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Address</th>
                    <th className="py-2 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blocklist.map((address) => (
                    <tr key={address} className="border-t border-gray-300">
                      <td className="py-2 px-4 font-mono text-sm break-all">{address}</td>
                      <td className="py-2 px-4 text-right">
                        <Button
                          onClick={() => handleRemoveFromBlocklist(address)}
                          disabled={isLoading || readOnly}
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
            <div className="border border-gray-300 p-4 text-center">No addresses in blocklist</div>
          )}
        </div>
      </div>
    </Win98Window>
  );
};

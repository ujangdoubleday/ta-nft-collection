'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/api/trpc/client';

interface UsersTableProps {
  isLoading: boolean;
}

interface User {
  address: string;
  nftCount: number;
  collectionCount: number;
  lastActive: string;
}

export function UsersTable({ isLoading }: UsersTableProps) {
  // In a real app, you would fetch this data from your API/database
  const [users, setUsers] = useState<User[]>([]);

  // Mock data for demonstration purposes
  useEffect(() => {
    // This would be replaced with actual API call
    const mockUsers: User[] = [
      {
        address: '0x1234567890123456789012345678901234567890',
        nftCount: 12,
        collectionCount: 3,
        lastActive: '2023-08-15',
      },
      {
        address: '0x2345678901234567890123456789012345678901',
        nftCount: 5,
        collectionCount: 1,
        lastActive: '2023-08-10',
      },
      {
        address: '0x3456789012345678901234567890123456789012',
        nftCount: 28,
        collectionCount: 4,
        lastActive: '2023-08-18',
      },
      {
        address: '0x4567890123456789012345678901234567890123',
        nftCount: 0,
        collectionCount: 0,
        lastActive: '2023-07-22',
      },
      {
        address: '0x5678901234567890123456789012345678901234',
        nftCount: 7,
        collectionCount: 2,
        lastActive: '2023-08-05',
      },
    ];

    if (!isLoading) {
      setUsers(mockUsers);
    }
  }, [isLoading]);

  // Function to truncate Ethereum addresses for display
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div>
      <h2 className="text-base font-bold text-white mb-3">All Users</h2>
      <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-6">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-zinc-400">Showing all registered users</p>
          <Button variant="outline" size="sm">
            Export Users
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-zinc-800 rounded-md p-4">
                <div className="h-5 bg-[#1f1f1f] rounded w-1/4 animate-pulse mb-2"></div>
                <div className="h-4 bg-[#1f1f1f] rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-black/40">
                <tr>
                  <th className="py-3 px-4 text-left text-zinc-400 font-medium">Wallet Address</th>
                  <th className="py-3 px-4 text-center text-zinc-400 font-medium">NFTs</th>
                  <th className="py-3 px-4 text-center text-zinc-400 font-medium">Collections</th>
                  <th className="py-3 px-4 text-center text-zinc-400 font-medium">Last Active</th>
                  <th className="py-3 px-4 text-right text-zinc-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.address}>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3"></div>
                          <div>
                            <p className="font-mono text-sm text-white">
                              {truncateAddress(user.address)}
                            </p>
                            <p className="text-xs text-zinc-500">User</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-white">{user.nftCount}</td>
                      <td className="py-3 px-4 text-center text-white">{user.collectionCount}</td>
                      <td className="py-3 px-4 text-center text-white">{user.lastActive}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm" className="mr-2">
                          View
                        </Button>
                        <Button variant="destructive" size="sm">
                          Block
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

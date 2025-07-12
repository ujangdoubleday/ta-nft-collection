'use client';

import { useState, useEffect } from 'react';
import { useAddress } from '@/lib/hooks/use-address';
import { trpc } from '@/lib/api/trpc/client';
import { formatEther } from 'viem';
import { NFT_FACTORY_ADDRESS } from '@/lib/blockchain';
import { ExternalLink, Copy, Check } from 'lucide-react';

export function DashboardStats() {
  const { data: address } = useAddress();
  const [isLoading, setIsLoading] = useState(true);
  const [copiedFactory, setCopiedFactory] = useState(false);
  const [copiedOwner, setCopiedOwner] = useState(false);

  // Get contract data from tRPC
  const { data: isPaused } = trpc.factoryConfig.isPaused.useQuery();
  const { data: factoryStats } = trpc.factoryConfig.getFactoryStats.useQuery();
  const { data: blockedUsersCount } = trpc.blocklist.getBlocklistCount.useQuery();
  const { data: totalNFTsCount } = trpc.collection.getTotalNFTsCount.useQuery();
  const { data: factoryOwner } = trpc.factoryConfig.getFactoryOwner.useQuery();

  // Placeholder stats - in a real application these would be fetched from an API
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalNFTs: 0,
    totalUsers: 0,
    blockedUsers: 0,
    currentFee: '0',
    collectedFee: '0',
    factoryBalance: '0',
    factoryStatus: 'Active',
    factoryAddress: '',
    factoryOwner: '',
  });

  // Function to copy address to clipboard
  const copyFactoryAddress = async () => {
    if (navigator.clipboard && NFT_FACTORY_ADDRESS) {
      try {
        await navigator.clipboard.writeText(NFT_FACTORY_ADDRESS);
        setCopiedFactory(true);
        setTimeout(() => setCopiedFactory(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  // Function to copy owner address to clipboard
  const copyOwnerAddress = async () => {
    if (navigator.clipboard && factoryOwner) {
      try {
        await navigator.clipboard.writeText(factoryOwner);
        setCopiedOwner(true);
        setTimeout(() => setCopiedOwner(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  useEffect(() => {
    // Update stats when data is available
    if (address) {
      const timer = setTimeout(() => {
        // Format the values from blockchain data
        let formattedCurrentFee = '0';
        let formattedCollectedFee = '0';
        let formattedFactoryBalance = '0';

        try {
          if (factoryStats?.creationFee) {
            formattedCurrentFee = formatEther(factoryStats.creationFee);
          }
        } catch (error) {
          console.error('Error formatting currentFee:', error);
        }

        try {
          if (factoryStats?.collectedFee) {
            formattedCollectedFee = formatEther(factoryStats.collectedFee);
          }
        } catch (error) {
          console.error('Error formatting collectedFee:', error);
        }

        try {
          // Make sure to handle the case where factoryBalance is 0
          if (factoryStats?.factoryBalance !== undefined) {
            formattedFactoryBalance = formatEther(factoryStats.factoryBalance);
          }
        } catch (error) {
          console.error('Error formatting factoryBalance:', error);
        }

        setStats({
          totalCollections: factoryStats?.totalCollections || 0,
          totalNFTs: totalNFTsCount || 0,
          totalUsers: 8, // This would need to come from a user database
          blockedUsers: blockedUsersCount || 0,
          currentFee: formattedCurrentFee,
          collectedFee: formattedCollectedFee,
          factoryBalance: formattedFactoryBalance,
          factoryStatus: isPaused ? 'Paused' : 'Active',
          factoryAddress: NFT_FACTORY_ADDRESS || '0x1234...5678',
          factoryOwner: factoryOwner || '',
        });
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    address,
    factoryStats,
    isPaused,
    NFT_FACTORY_ADDRESS,
    blockedUsersCount,
    totalNFTsCount,
    factoryOwner,
  ]);

  // Generate block explorer URL
  const blockExplorerUrl = NFT_FACTORY_ADDRESS
    ? `https://sepolia.etherscan.io/address/${NFT_FACTORY_ADDRESS}`
    : '#';

  // Generate owner block explorer URL
  const ownerExplorerUrl = factoryOwner
    ? `https://sepolia.etherscan.io/address/${factoryOwner}`
    : '#';

  return (
    <div>
      <h2 className="text-mb font-bold text-white mb-3">Stats</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Collections"
          value={stats.totalCollections.toString()}
          isLoading={isLoading}
        />
        <StatCard title="Total NFTs" value={stats.totalNFTs.toString()} isLoading={isLoading} />
        <StatCard title="Current Fee" value={`${stats.currentFee} ETH`} isLoading={isLoading} />
        <StatCard title="Collected Fee" value={`${stats.collectedFee} ETH`} isLoading={isLoading} />
        <StatCard title="Total Users" value={stats.totalUsers.toString()} isLoading={isLoading} />
        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers.toString()}
          isLoading={isLoading}
        />
        <StatCard
          title="Factory Balance"
          value={`${stats.factoryBalance} ETH`}
          isLoading={isLoading}
        />
        <StatCard
          title="Factory Status"
          value={stats.factoryStatus}
          isLoading={isLoading}
          statusColor={stats.factoryStatus === 'Active' ? 'text-green-400' : 'text-red-400'}
        />
      </div>

      {/* Factory Address and Owner Section */}
      <div className="mt-6">
        <h2 className="text-mb font-bold text-white mb-3">Factory Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Factory Address */}
          <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 shadow-sm">
            <span className="text-gray-400 text-sm block mb-2">Factory Address</span>
            {isLoading ? (
              <div className="h-7 w-full bg-[#1f1f1f] rounded animate-pulse mt-1"></div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href={blockExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-mono text-sm hover:text-blue-400 transition-colors flex items-center gap-1 truncate"
                >
                  {stats.factoryAddress}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
                <button
                  onClick={copyFactoryAddress}
                  className="text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                  title="Copy address"
                >
                  {copiedFactory ? (
                    <Check className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Factory Owner */}
          <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 shadow-sm">
            <span className="text-gray-400 text-sm block mb-2">Factory Owner</span>
            {isLoading ? (
              <div className="h-7 w-full bg-[#1f1f1f] rounded animate-pulse mt-1"></div>
            ) : (
              <div className="flex items-center gap-2">
                {factoryOwner ? (
                  <a
                    href={ownerExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-mono text-sm hover:text-blue-400 transition-colors flex items-center gap-1 truncate"
                  >
                    {factoryOwner}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="text-gray-300 text-sm">Unknown owner</span>
                )}
                <button
                  onClick={copyOwnerAddress}
                  className="text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                  title="Copy address"
                  disabled={!factoryOwner}
                >
                  {copiedOwner ? (
                    <Check className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  isLoading?: boolean;
  statusColor?: string;
  className?: string;
  isAddress?: boolean;
}

function StatCard({
  title,
  value,
  isLoading = false,
  statusColor,
  className = '',
  isAddress = false,
}: StatCardProps) {
  return (
    <div className={`bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4 shadow-sm ${className}`}>
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      {isLoading ? (
        <div className="h-7 w-16 bg-[#1f1f1f] rounded animate-pulse mt-1"></div>
      ) : (
        <p
          className={`text-lg md:text-xl font-bold mt-1 ${statusColor || 'text-white'} ${isAddress ? 'truncate' : ''}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}

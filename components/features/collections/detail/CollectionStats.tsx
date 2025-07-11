'use client';

import { EnrichedCollectionInfo } from '@/lib/blockchain/utils/collection';

interface CollectionStatsProps {
  collection: EnrichedCollectionInfo;
}

export function CollectionStats({ collection }: CollectionStatsProps) {
  // Format total supply
  const totalSupply = collection?.totalSupply ? collection.totalSupply.toString() : '0';

  // Calculate minted NFTs - assuming this would be tracked elsewhere
  // For now, we'll just use 0 as a placeholder
  const mintedCount = '0';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-md p-3">
          <p className="text-gray-400 text-sm">Total Supply</p>
          <p className="text-white text-xl font-medium">{totalSupply}</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-md p-3">
          <p className="text-gray-400 text-sm">Minted</p>
          <p className="text-white text-xl font-medium">{mintedCount}</p>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#1f1f1f] rounded-md p-4">
        <p className="text-gray-400 text-sm mb-2">Recent Activity</p>
        <div className="text-center py-4">
          <p className="text-gray-400">No recent activity</p>
        </div>
      </div>
    </div>
  );
}

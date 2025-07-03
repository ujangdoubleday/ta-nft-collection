'use client';

import { BarChart3, Users, Zap } from 'lucide-react';

interface CollectionStatsProps {
  collection: {
    id: string;
    address: string;
    name: string;
    itemCount: number;
    // Additional fields that would be used in a real app
  };
}

export function CollectionStats({ collection }: CollectionStatsProps) {
  // In a real app, these would come from API calls or blockchain data
  const totalOwners = 12;
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#1f1f1f] p-2 rounded-full">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-zinc-400 text-sm">NFTs</span>
          </div>
          <p className="text-2xl font-bold text-white">{collection.itemCount}</p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1f1f1f] rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#1f1f1f] p-2 rounded-full">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-zinc-400 text-sm">Owners</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalOwners}</p>
        </div>
      </div>
    </>
  );
}

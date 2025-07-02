'use client';

import Link from 'next/link';
import { ImagePlus, Settings, ExternalLink } from 'lucide-react';

interface CollectionActionsProps {
  collection: {
    id: string;
    address: string;
    name: string;
  };
}

export function CollectionActions({ collection }: CollectionActionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Collection Actions</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href={`/my/collections/${collection.address}/nfts/mint`}
          className="bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors rounded-lg p-4 flex items-center gap-3"
        >
          <div className="bg-white p-2 rounded-full">
            <ImagePlus className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="font-medium text-white">Mint NFT</h3>
            <p className="text-zinc-400 text-sm">Create a new NFT in this collection</p>
          </div>
        </Link>

        <Link
          href={`/my/collections/${collection.address}/settings`}
          className="bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors rounded-lg p-4 flex items-center gap-3"
        >
          <div className="bg-white p-2 rounded-full">
            <Settings className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="font-medium text-white">Settings</h3>
            <p className="text-zinc-400 text-sm">Manage collection settings</p>
          </div>
        </Link>

        <Link
          href={`/collections/${collection.address}`}
          className="bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors rounded-lg p-4 flex items-center gap-3"
        >
          <div className="bg-white p-2 rounded-full">
            <ExternalLink className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="font-medium text-white">View Public Page</h3>
            <p className="text-zinc-400 text-sm">See how others view your collection</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

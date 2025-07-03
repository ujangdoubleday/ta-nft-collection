'use client';

import Link from 'next/link';
import { ImagePlus, Settings, Images } from 'lucide-react';

interface CollectionActionsProps {
  collection: {
    id: string;
    address: string;
    name: string;
  };
}

export function CollectionActions({ collection }: CollectionActionsProps) {
  return (
    <div className="flex gap-4 overflow-x-auto whitespace-nowrap">
      <Link
        href={`/my/collections/${collection.address}/nfts/mint`}
        className="w-60 bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-zinc-900 hover:border-zinc-600 transition-colors rounded-lg p-8 flex items-center gap-3"
      >
        <div className="bg-white p-2 rounded-full">
          <ImagePlus className="h-5 w-5 text-black" />
        </div>
        <div>
          <h3 className="font-medium text-white text-sm">Mint NFT</h3>
          <p className="text-zinc-400 text-xs">Create a new NFT</p>
        </div>
      </Link>

      <Link
        href={`/my/collections/${collection.address}/nfts`}
        className="w-60 bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-[#1f1f1f] hover:border-zinc-600 transition-colors rounded-lg p-4 flex items-center gap-3"
      >
        <div className="bg-white p-2 rounded-full">
          <Images className="h-5 w-5 text-black" />
        </div>
        <div>
          <h3 className="font-medium text-white text-sm">View NFTs</h3>
          <p className="text-zinc-400 text-xs">See all NFTs</p>
        </div>
      </Link>

      <Link
        href={`/my/collections/${collection.address}/settings`}
        className="w-60 bg-[#0A0A0A] border border-[#1f1f1f] hover:bg-zinc-900 hover:border-zinc-600 transition-colors rounded-lg p-4 flex items-center gap-3"
      >
        <div className="bg-white p-2 rounded-full">
          <Settings className="h-5 w-5 text-black" />
        </div>
        <div>
          <h3 className="font-medium text-white text-sm">Settings</h3>
          <p className="text-zinc-400 text-xs">Manage settings</p>
        </div>
      </Link>
    </div>
  );
}

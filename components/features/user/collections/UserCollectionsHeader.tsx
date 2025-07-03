'use client';

import Link from 'next/link';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { useAddress } from '@/lib/hooks/use-address';
import { shortenAddress } from '@/lib/utils/formatting';

export function UserCollectionsHeader() {
  const { data: address } = useAddress();

  return (
    <div className="mb-8">
      <div className="flex items-center mb-2">
        <Link
          href="/my"
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Collections</h1>
          <p className="text-zinc-400 mt-1">
            {address ? (
              <>
                Manage all NFT collections owned by{' '}
                <span className="font-medium">{shortenAddress(address)}</span>
              </>
            ) : (
              'Please connect your wallet to view your collections'
            )}
          </p>
        </div>

        <Link
          href="/my/collections/new"
          className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 py-2 px-4 rounded-md transition-colors text-sm font-medium"
        >
          <PlusCircle className="h-4 w-4" />
          Create Collection
        </Link>
      </div>

      <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
    </div>
  );
}

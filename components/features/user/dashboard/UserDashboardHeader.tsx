'use client';

import { useAddress } from '@/lib/hooks/use-address';
import { shortenAddress } from '@/lib/utils/formatting';
import Link from 'next/link';

export function UserDashboardHeader() {
  const { data: address } = useAddress();

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
          <p className="text-gray-400 mt-1">
            {address ? (
              <>
                Connected as <span className="font-medium">{shortenAddress(address)}</span>
              </>
            ) : (
              'Please connect your wallet to view your dashboard'
            )}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/my/collections"
            className="bg-[#0A0A0A] text-white hover:bg-zinc-900 py-2 px-4 rounded-md transition-colors text-sm font-medium border border-[#1f1f1f]"
          >
            My Collections
          </Link>
          <Link
            href="/my/profile"
            className="bg-[#0A0A0A] text-white border border-[#1f1f1f] hover:bg-zinc-900 py-2 px-4 rounded-md transition-colors text-sm font-medium"
          >
            Profile
          </Link>
        </div>
      </div>

      <div className="h-px w-full bg-[#1f1f1f] mt-6"></div>
    </div>
  );
}

'use client';

import { useAddress } from '@/lib/hooks/use-address';
import { shortenAddress } from '@/lib/utils/formatting';

export function DashboardHeader() {
  const { data: address } = useAddress();

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        </div>
      </div>

      <div className="h-px w-full bg-[#1f1f1f] mt-4 sm:mt-6"></div>
    </div>
  );
}

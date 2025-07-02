'use client';

import { LogOut } from 'lucide-react';
import { useAddress } from '@/lib/hooks/use-address';
import { shortenAddress } from '@/lib/utils/formatting';
import { useWallet } from '@/lib/hooks/wallet';
import { useRouter } from 'next/navigation';

export function UserWallet() {
  const { data: address } = useAddress();
  const { disconnect } = useWallet();
  const router = useRouter();

  const handleLogout = async () => {
    await disconnect();
    router.push('/');
  };

  return (
    <div className="flex items-center gap-2">
      <div className="bg-zinc-700 text-white px-3 py-1.5 text-sm rounded-md border border-zinc-600">
        {address ? shortenAddress(address) : '0x...'}
      </div>
      <button
        onClick={handleLogout}
        className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-700 transition-colors"
        title="Disconnect wallet"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

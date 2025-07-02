'use client';

import { LogOut } from 'lucide-react';
import { useAddress } from '@/lib/hooks/use-address';
import { shortenAddress } from '@/lib/utils/formatting';
import { useWallet } from '@/lib/hooks/wallet';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function UserWallet() {
  const { data: address } = useAddress();
  const { disconnect } = useWallet();
  const router = useRouter();

  const handleLogout = async () => {
    toast.info('Signing out...');
    await disconnect();
    toast.success('Signed out successfully');
    router.push('/');
  };

  return (
    <div className="flex items-center gap-2">
      <div className="bg-[hsla(var(--ds-background-200-value),var(--tw-bg-opacity,1))] text-white px-3 py-1.5 text-sm rounded-md border border-[#1f1f1f]">
        {address ? shortenAddress(address) : '0x...'}
      </div>
      <button
        onClick={handleLogout}
        className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-[#1f1f1f] transition-colors"
        title="Disconnect wallet"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

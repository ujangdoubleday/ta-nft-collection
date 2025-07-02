'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAddress } from '@/lib/hooks/use-address';
import { useWalletModal } from '@/components/features/wallet/components/useWalletModal';

interface UserAuthGuardProps {
  children: React.ReactNode;
}

export function UserAuthGuard({ children }: UserAuthGuardProps) {
  const { data: address, isLoading } = useAddress();
  const router = useRouter();
  const pathname = usePathname();
  const { openWalletModal } = useWalletModal();

  useEffect(() => {
    // Only redirect after we've checked for the address and not during SSR
    if (!isLoading && !address) {
      // Open wallet modal to allow the user to connect, and redirect back to current path
      openWalletModal(pathname);
    }
  }, [address, isLoading, router, openWalletModal, pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-zinc-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no address, don't render the children (will redirect in the effect)
  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-xl font-bold mb-2">Connect Wallet Required</h2>
        <p className="text-zinc-400 mb-4">You need to connect your wallet to access this page</p>
        <button
          onClick={() => openWalletModal(pathname)}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // User is authenticated, render the children
  return <>{children}</>;
}

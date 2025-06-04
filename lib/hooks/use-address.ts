'use client';

import { useWallet } from '@/lib/hooks/wallet';

/**
 * Hook to get the current wallet address
 * This is a simple wrapper around useWallet for components that only need the address
 */
export function useAddress() {
  const { address } = useWallet();

  return {
    data: address,
    isConnected: !!address,
  };
}

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { WagmiProvider as WagmiProviderBase } from 'wagmi';
import { config } from './config';

// Create a client outside of the component
const queryClient = new QueryClient();

interface WagmiProviderProps {
  children: ReactNode;
}

export function WagmiProvider({ children }: WagmiProviderProps) {
  // Use useState with null initial value to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Only show the app UI when it's mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a loading or empty state until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  return (
    <WagmiProviderBase config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProviderBase>
  );
}

import { WagmiProvider } from '@/lib/blockchain/wagmi';
import { AuthProvider } from '@/lib/auth/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <AuthProvider>{children}</AuthProvider>
    </WagmiProvider>
  );
}

import { ThemeProvider } from '@/components/theme-provider';
import { WagmiProvider } from '@/lib/blockchain/wagmi';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { TRPCProvider } from '@/components/core/providers';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <WagmiProvider>
        <TRPCProvider>
          <AuthProvider>{children}</AuthProvider>
        </TRPCProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

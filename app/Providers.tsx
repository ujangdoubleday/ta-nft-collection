import { ThemeProvider } from '@/components/theme-provider';
import { WagmiProvider } from '@/lib/blockchain/wagmi';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { TRPCProvider } from '@/components/core/providers';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <AuthProvider>
        <WagmiProvider>
          <TRPCProvider>
            {children}
            <Toaster />
          </TRPCProvider>
        </WagmiProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

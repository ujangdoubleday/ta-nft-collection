import { ThemeProvider } from '@/components/theme-provider';
import { WagmiProvider } from '@/lib/blockchain/wagmi';
import { AuthProvider } from '@/lib/auth/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <WagmiProvider>
        <AuthProvider>{children}</AuthProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

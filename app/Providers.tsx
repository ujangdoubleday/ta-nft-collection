import { WagmiProvider, TRPCProvider, AuthProvider, ThemeProvider } from '@/components/providers';
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

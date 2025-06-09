import { AppShell } from '@/components/features/layout';
import '@/styles/globals.css';
import { WagmiProvider } from '@/lib/blockchain/wagmi';
import { AuthProvider } from '@/lib/auth/AuthProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MyNFTs.exe: Digital Art Creator</title>
        <meta name="description" content="A retro-styled digital art creation platform" />
      </head>
      <body className="min-h-screen bg-[#008080] antialiased">
        <WagmiProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}

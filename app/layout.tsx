import { AppShell } from '@/components/features/layout';
import '@/styles/globals.css';
import { Providers } from './Providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MyNFTs.exe: Digital Art Creator</title>
        <meta name="description" content="A retro-styled digital art creation platform" />
      </head>
      <body className="min-h-screen bg-[#008080] antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

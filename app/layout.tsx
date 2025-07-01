import { AppShell } from '@/components/features/layout';
import '@/styles/globals.css';
import { Providers } from './Providers';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata = {
  title: 'MyNFTs.exe: Digital Art Creator',
  description: 'A retro-styled digital art creation platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <title>MyNFTs.exe: Digital Art Creator</title>
        <meta name="description" content="A retro-styled digital art creation platform" />
      </head>
      <body className="min-h-screen bg-[#000000] antialiased font-sans">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

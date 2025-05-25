import { AppShell } from '@/components/features/layout';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MyNFTs.exe: Digital Art Creator</title>
        <meta
          name="description"
          content="A retro-styled digital art creation platform"
        />
        <link
          rel="preload"
          href="/assets/fonts/ms-sans-serif.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[#008080] font-['MS_Sans_Serif'] antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

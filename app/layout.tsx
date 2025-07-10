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
  title: 'XYZ: Digital Art Creator',
  description: 'Create, Mint & Own Digital Masterpieces',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <title>XYZ: Digital Art Creator</title>
        <meta name="description" content="Create, Mint & Own Digital Masterpieces" />
      </head>
      <body className="min-h-screen bg-[#000000] antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

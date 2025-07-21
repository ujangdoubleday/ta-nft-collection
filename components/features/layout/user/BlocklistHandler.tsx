'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BlocklistHandlerProps {
  address: string;
}

export function BlocklistHandler({ address }: BlocklistHandlerProps) {
  const router = useRouter();
  const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const [countdown, setCountdown] = useState(9);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, formattedAddress]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white text-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      <div
        className={`w-full max-w-md sm:max-w-lg md:max-w-xl transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 tracking-tighter">
          403
        </h1>

        <p className="text-base sm:text-lg md:text-xl mb-2 italic">your address is blocklisted</p>

        <div className="mt-2 mb-6">
          <p className="hidden sm:block text-xs sm:text-sm text-zinc-500 break-all">{address}</p>
          <p className="block sm:hidden text-xs text-zinc-500">{formattedAddress}</p>
        </div>

        <div className="w-16 h-px bg-zinc-800 mx-auto my-4 sm:my-6"></div>

        <p className="mt-2 sm:mt-4 md:mt-6 text-xs sm:text-sm text-zinc-400">
          you&apos;ll be redirected in{' '}
          <span
            className={`font-mono font-medium inline-block transition-all duration-300 ${countdown <= 3 ? 'text-red-400' : ''}`}
          >
            {countdown}
          </span>{' '}
          seconds
        </p>

        <p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm text-zinc-400">
          or you can go back to{' '}
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-white transition-colors duration-200 font-medium"
          >
            Home.
          </Link>
        </p>
      </div>
    </div>
  );
}
